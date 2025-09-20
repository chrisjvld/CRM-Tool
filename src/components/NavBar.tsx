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
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-6">
        <Link href="/dashboard" className="text-xl font-bold text-white">CRM</Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">Dashboard</Link>
          <Link href="/add-lead" className="text-gray-300 hover:text-white transition-colors">Add Lead</Link>
        </nav>
        <div className="ml-auto">
          <button onClick={handleLogout} className="text-sm text-gray-300 hover:text-white transition-colors">Log out</button>
        </div>
      </div>
    </header>
  );
}


