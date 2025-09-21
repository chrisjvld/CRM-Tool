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
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="px-6 py-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Add Lead</h1>
          <p className="text-gray-400 mt-1">Create a new lead and start tracking outreach</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl border border-gray-700 p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">Name</label>
          <input name="name" required className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">Business</label>
          <input name="business" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">Instagram</label>
          <input name="instagram" placeholder="username" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
          <input name="email" type="email" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">Status</label>
          <select name="status" defaultValue="new" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="replied">Replied</option>
            <option value="demo_booked">Demo Booked</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2 text-gray-300">Notes</label>
          <textarea name="notes" className="w-full min-h-[120px] bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" placeholder="Add any additional notes..." />
        </div>
        {error && <p className="text-sm text-red-400 md:col-span-2">{error}</p>}
        <div className="md:col-span-2">
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Lead"}
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors border border-gray-600"
            >
              Cancel
            </Link>
          </div>
        </div>
        </form>
      </div>
    </div>
  );
}


