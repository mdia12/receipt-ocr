import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// ALLOWED MIME TYPES
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp'
];

interface DriveToken {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  root_folder_id?: string | null;
}

/**
 * Refreshes the Google OAuth access token if needed.
 */
async function getValidAccessToken(userId: string): Promise<string> {
  // 1. Get token from DB
  const { data: tokenData, error } = await supabaseAdmin
    .from('google_drive_tokens')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !tokenData) {
    throw new Error(`No Google Drive token found for user ${userId}`);
  }

  const now = new Date();
  const expiresAt = new Date(tokenData.expires_at);

  // If token is valid (with 5 min buffer), return it
  if (expiresAt.getTime() - now.getTime() > 5 * 60 * 1000) {
    return tokenData.access_token;
  }

  console.log(`[Drive] Refreshing token for user ${userId}`);

  // 2. Refresh token
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID!,
      client_secret: GOOGLE_CLIENT_SECRET!,
      refresh_token: tokenData.refresh_token,
      grant_type: 'refresh_token',
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('[Drive] Failed to refresh token:', data);
    throw new Error('Failed to refresh Google Drive token');
  }

  // 3. Update DB
  const newExpiresAt = new Date(now.getTime() + data.expires_in * 1000);
  
  await supabaseAdmin
    .from('google_drive_tokens')
    .update({
      access_token: data.access_token,
      expires_at: newExpiresAt.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  return data.access_token;
}

/**
 * 1. Get or Create Root Folder "NovaReceipt"
 */
async function getOrCreateRootFolder(accessToken: string, userId: string): Promise<string> {
  // Check cache in DB first
  const { data: tokenData } = await supabaseAdmin
    .from('google_drive_tokens')
    .select('root_folder_id')
    .eq('user_id', userId)
    .single();

  if (tokenData?.root_folder_id) {
    // Verify it still exists (optional, but good for robustness)
    const checkRes = await fetch(`https://www.googleapis.com/drive/v3/files/${tokenData.root_folder_id}?fields=id,trashed`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    if (checkRes.ok) {
      const meta = await checkRes.json();
      if (!meta.trashed) return tokenData.root_folder_id;
    }
    // If 404 or trashed, continue to create new one
  }

  // Search for existing folder
  const q = "mimeType='application/vnd.google-apps.folder' and name='NovaReceipt' and trashed=false";
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  
  const searchData = await searchRes.json();
  
  if (searchData.files && searchData.files.length > 0) {
    const folderId = searchData.files[0].id;
    // Update cache
    await supabaseAdmin.from('google_drive_tokens').update({ root_folder_id: folderId }).eq('user_id', userId);
    return folderId;
  }

  // Create new folder
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'NovaReceipt',
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });

  const createData = await createRes.json();
  if (!createData.id) throw new Error('Failed to create root folder');

  // Update cache
  await supabaseAdmin.from('google_drive_tokens').update({ root_folder_id: createData.id }).eq('user_id', userId);
  
  return createData.id;
}

/**
 * 2. Get or Create Month Folder "YYYY-MM"
 */
async function getOrCreateMonthFolder(accessToken: string, rootFolderId: string, month: string): Promise<string> {
  const q = `mimeType='application/vnd.google-apps.folder' and name='${month}' and '${rootFolderId}' in parents and trashed=false`;
  
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  
  const searchData = await searchRes.json();
  
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Create
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: month,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [rootFolderId],
    }),
  });

  const createData = await createRes.json();
  if (!createData.id) throw new Error(`Failed to create month folder ${month}`);
  
  return createData.id;
}

/**
 * 3. Upload Receipt File
 */
async function uploadReceiptFileToDrive(
  accessToken: string, 
  folderId: string, 
  fileName: string, 
  mimeType: string, 
  fileBuffer: Buffer
): Promise<{ fileId: string; webViewLink: string }> {
  
  const metadata = {
    name: fileName,
    parents: [folderId],
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelim = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n` +
    'Content-Transfer-Encoding: base64\r\n' +
    '\r\n' +
    fileBuffer.toString('base64') +
    closeDelim;

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  const data = await res.json();
  
  if (!res.ok) {
    console.error('[Drive] Upload failed:', data);
    throw new Error('Drive upload failed');
  }

  return {
    fileId: data.id,
    webViewLink: data.webViewLink,
  };
}

/**
 * Main Orchestrator
 */
export async function ensureDriveFoldersAndUpload(receipt: any, fileBuffer: Buffer, mimeType: string) {
  try {
    console.log(`[Drive] Starting upload process for receipt ${receipt.id}`);

    // --- NEW: MIME TYPE VALIDATION ---
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
        console.warn(`[Drive] Skipped upload: Unsupported MIME type ${mimeType}`);
        await supabaseAdmin.from('receipts').update({ 
            drive_status: 'failed',
            drive_error: 'UNSUPPORTED_FILE_TYPE'
        }).eq('id', receipt.id);
        return { success: false, reason: 'unsupported_file_type' };
    }
    
    // 0. Check if user has Drive connected
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('google_drive_tokens')
      .select('access_token')
      .eq('user_id', receipt.user_id)
      .single();

    if (tokenError || !tokenData) {
        console.log(`[Drive] User ${receipt.user_id} not connected to Drive. Skipping.`);
        await supabaseAdmin.from('receipts').update({ drive_status: 'skipped' }).eq('id', receipt.id);
        return { success: false, reason: 'not_connected' };
    }

    // Update status to uploading
    await supabaseAdmin.from('receipts').update({ drive_status: 'uploading', drive_error: null }).eq('id', receipt.id);

    // 1. Auth
    const accessToken = await getValidAccessToken(receipt.user_id);
    
    // 2. Root Folder
    const rootId = await getOrCreateRootFolder(accessToken, receipt.user_id);
    
    // 3. Month Folder
    const date = receipt.date || new Date().toISOString().split('T')[0];
    const month = date.slice(0, 7); // YYYY-MM
    const monthId = await getOrCreateMonthFolder(accessToken, rootId, month);
    
    // 4. Prepare Filename
    // Format: YYYY-MM-DD_Merchant_AmountCurrency_ID.ext
    const safeMerchant = (receipt.merchant || 'Unknown').replace(/[^a-z0-9]/gi, '_').substring(0, 30);
    const amountStr = receipt.amount ? `${receipt.amount.toFixed(2)}${receipt.currency || 'EUR'}` : 'NoAmount';
    
    // Fallback extension logic
    let ext = 'bin';
    if (mimeType === 'application/pdf') ext = 'pdf';
    else if (mimeType === 'image/png') ext = 'png';
    else if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') ext = 'jpg';
    else if (mimeType === 'image/webp') ext = 'webp';

    const fileName = `${date}_${safeMerchant}_${amountStr}_${receipt.id.slice(0,8)}.${ext}`;

    // 5. Upload
    const { fileId, webViewLink } = await uploadReceiptFileToDrive(accessToken, monthId, fileName, mimeType, fileBuffer);
    
    console.log(`[Drive] Upload success: ${fileId}`);

    // 6. Update Supabase
    await supabaseAdmin.from('receipts').update({
      drive_status: 'uploaded',
      drive_file_id: fileId,
      drive_web_view_link: webViewLink,
      uploaded_to_drive_at: new Date().toISOString(),
      drive_error: null
    }).eq('id', receipt.id);

    // 7. Cleanup Storage (Optional - check policy first)
    // await supabaseAdmin.storage.from('receipts_raw').remove([receipt.file_path]);

    return { success: true, fileId, webViewLink };

  } catch (error: any) {
    console.error(`[Drive] Error processing receipt ${receipt.id}:`, error);
    
    await supabaseAdmin.from('receipts').update({ 
        drive_status: 'failed',
        drive_error: error.message || 'Unknown error'
    }).eq('id', receipt.id);

    return { success: false, error };
  }
}
