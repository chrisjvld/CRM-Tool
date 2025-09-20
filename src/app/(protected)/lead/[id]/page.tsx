"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSupabase } from "@/lib/supabaseClient";
import type { Lead, LeadStatus } from "@/types/leads";
import Link from "next/link";

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>();
  const [lead, setLead] = useState<Lead | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = getSupabase();
      const { data } = await supabase.from("leads").select("*").eq("id", params.id).single();
      setLead((data as unknown as Lead) || null);
    }
    if (params?.id) load();
  }, [params?.id]);

  async function save() {
    if (!lead) return;
    setSaving(true);
    const supabase = getSupabase();
    await supabase
      .from("leads")
      .update({
        name: lead.name,
        business: lead.business,
        instagram_handle: lead.instagram_handle,
        email: lead.email,
        status: lead.status,
        notes: lead.notes,
      })
      .eq("id", lead.id);
    setSaving(false);
  }

  if (!lead) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="px-6 py-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Lead Details</h1>
          <p className="text-gray-400 mt-1">View and edit lead information</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">Name</label>
          <input
            value={lead.name || ""}
            onChange={(e) => setLead({ ...(lead as Lead), name: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">Business</label>
          <input
            value={lead.business || ""}
            onChange={(e) => setLead({ ...(lead as Lead), business: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">Instagram</label>
          <input
            value={lead.instagram_handle || ""}
            onChange={(e) => setLead({ ...(lead as Lead), instagram_handle: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
          <input
            type="email"
            value={lead.email || ""}
            onChange={(e) => setLead({ ...(lead as Lead), email: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">Status</label>
          <select
            value={(lead.status as LeadStatus) || "new"}
            onChange={(e) => setLead({ ...(lead as Lead), status: e.target.value as LeadStatus })}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {(["new", "contacted", "replied", "demo_booked", "closed"] as LeadStatus[]).map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2 text-gray-300">Notes</label>
          <textarea
            value={lead.notes || ""}
            onChange={(e) => setLead({ ...(lead as Lead), notes: e.target.value })}
            className="w-full min-h-[140px] bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
        <div className="md:col-span-2">
          <div className="flex gap-4">
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors border border-gray-600"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}


