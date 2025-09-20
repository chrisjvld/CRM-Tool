"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabaseClient";

export default function NavBar() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <header className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link href="/dashboard" className="font-semibold">CRM</Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/dashboard" className="hover:underline">Dashboard</Link>
          <Link href="/add-lead" className="hover:underline">Add Lead</Link>
        </nav>
        <div className="ml-auto">
          <button onClick={handleLogout} className="text-sm text-gray-700 hover:text-black">Log out</button>
        </div>
      </div>
    </header>
  );
}


