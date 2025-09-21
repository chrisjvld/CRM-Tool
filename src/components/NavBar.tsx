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
    <header className="bg-gradient-to-r from-slate-800/90 to-gray-800/90 backdrop-blur-sm border-b border-slate-600/30 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-6">
        <Link href="/dashboard" className="text-xl font-bold text-white bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent hover:from-blue-300 hover:to-cyan-300 transition-all duration-300">
          CRM
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/dashboard" className="text-gray-300 hover:text-white transition-all duration-300 hover:bg-white/10 px-3 py-2 rounded-lg">Dashboard</Link>
          <Link href="/add-lead" className="text-gray-300 hover:text-white transition-all duration-300 hover:bg-white/10 px-3 py-2 rounded-lg">Add Lead</Link>
        </nav>
        <div className="ml-auto">
          <button 
            onClick={handleLogout} 
            className="text-sm text-gray-300 hover:text-white transition-all duration-300 hover:bg-red-500/20 px-3 py-2 rounded-lg border border-transparent hover:border-red-500/30"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}


