"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function AddLeadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    setLoading(true);
    setError(null);
    const supabase = getSupabase();
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be logged in to add a lead");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("leads").insert({
      user_id: user.id,
      name: formData.get("name") as string,
      business: (formData.get("business") as string) || null,
      instagram_handle: (formData.get("instagram") as string) || null,
      email: (formData.get("email") as string) || null,
      status: (formData.get("status") as string) || "new",
      notes: (formData.get("notes") as string) || null,
    });
    setLoading(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="px-6 py-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">Add Lead</h1>
          <p className="text-gray-400 mt-1">Create a new lead and start tracking outreach</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-sm rounded-xl border border-slate-600/30 p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 shadow-xl">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">Name</label>
          <input name="name" required className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400/50 backdrop-blur-sm transition-all duration-300 hover:bg-slate-700/70" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">Business</label>
          <input name="business" className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400/50 backdrop-blur-sm transition-all duration-300 hover:bg-slate-700/70" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">Instagram</label>
          <input name="instagram" placeholder="username" className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400/50 backdrop-blur-sm transition-all duration-300 hover:bg-slate-700/70" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
          <input name="email" type="email" className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400/50 backdrop-blur-sm transition-all duration-300 hover:bg-slate-700/70" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">Status</label>
          <select name="status" defaultValue="new" className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400/50 backdrop-blur-sm transition-all duration-300 hover:bg-slate-700/70">
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="replied">Replied</option>
            <option value="demo_booked">Demo Booked</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2 text-gray-300">Notes</label>
          <textarea name="notes" className="w-full min-h-[120px] bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400/50 backdrop-blur-sm transition-all duration-300 resize-none hover:bg-slate-700/70" placeholder="Add any additional notes..." />
        </div>
        {error && <p className="text-sm text-red-400 md:col-span-2">{error}</p>}
        <div className="md:col-span-2">
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium px-6 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
            >
              {loading ? "Saving..." : "Save Lead"}
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Cancel
            </Link>
          </div>
        </div>
        </form>
    </div>
  );
}


