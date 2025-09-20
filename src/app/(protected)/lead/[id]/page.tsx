"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSupabase } from "@/lib/supabaseClient";
import type { Lead, LeadStatus } from "@/types/leads";

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

  if (!lead) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Lead Details</h1>
      <div className="bg-white border rounded p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            value={lead.name || ""}
            onChange={(e) => setLead({ ...(lead as Lead), name: e.target.value })}
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Business</label>
          <input
            value={lead.business || ""}
            onChange={(e) => setLead({ ...(lead as Lead), business: e.target.value })}
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Instagram</label>
          <input
            value={lead.instagram_handle || ""}
            onChange={(e) => setLead({ ...(lead as Lead), instagram_handle: e.target.value })}
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={lead.email || ""}
            onChange={(e) => setLead({ ...(lead as Lead), email: e.target.value })}
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={(lead.status as LeadStatus) || "new"}
            onChange={(e) => setLead({ ...(lead as Lead), status: e.target.value as LeadStatus })}
            className="w-full rounded border border-gray-300 px-3 py-2"
          >
            {(["new", "contacted", "replied", "demo_booked", "closed"] as LeadStatus[]).map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            value={lead.notes || ""}
            onChange={(e) => setLead({ ...(lead as Lead), notes: e.target.value })}
            className="w-full min-h-[140px] rounded border border-gray-300 px-3 py-2"
          />
        </div>
        <div className="md:col-span-2">
          <button
            onClick={save}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}


