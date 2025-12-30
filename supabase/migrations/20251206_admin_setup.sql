-- 1. Add role to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- 2. Create Admin Logs table
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  action text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  admin_email text NOT NULL
);

-- 3. Create API Keys table
CREATE TABLE IF NOT EXISTS public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  key_hash text NOT NULL, -- Store hashed key only
  masked_key text NOT NULL, -- Store sk_live_...xxxx for display
  created_at timestamp with time zone DEFAULT now(),
  last_used_at timestamp with time zone,
  is_active boolean DEFAULT true
);

-- 4. Set Admin User
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'michaeldia231116@gmail.com';

-- 5. Sync Role to Auth Metadata (Crucial for Middleware Performance)
-- This function ensures that when we update a profile role, it syncs to the auth.users metadata
CREATE OR REPLACE FUNCTION public.handle_role_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users 
  SET raw_user_meta_data = 
    COALESCE(raw_user_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', NEW.role)
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_role_update ON public.profiles;
CREATE TRIGGER on_profile_role_update
AFTER UPDATE OF role ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_role_update();

-- 6. Run the sync manually once for the admin user to ensure metadata is set immediately
UPDATE auth.users
SET raw_user_meta_data = 
  COALESCE(raw_user_meta_data, '{}'::jsonb) || 
  jsonb_build_object('role', 'admin')
WHERE email = 'michaeldia231116@gmail.com';

-- 7. RLS Policies for Admin Tables

-- Admin Logs: Only admins can read
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view logs" ON public.admin_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- API Keys: Users can view their own, Admins can view all
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own keys" ON public.api_keys
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all keys" ON public.api_keys
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
