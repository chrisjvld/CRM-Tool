"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getSupabase } from "@/lib/supabaseClient";
import NavBar from "@/components/NavBar";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const supabase = getSupabase();
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/login?next=" + encodeURIComponent(pathname));
        return;
      }
      setChecking(false);
    }
    checkSession();
    const supabase = getSupabase();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/login");
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, [router, pathname]);

  if (checking) return null;

  return (
    <div className="min-h-screen bg-gray-900">
      <NavBar />
      <main>{children}</main>
    </div>
  );
}


