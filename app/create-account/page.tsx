"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreateAccountPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login?view=signup");
  }, [router]);

  return null;
}
