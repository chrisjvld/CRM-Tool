"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import type { Lead, LeadStatus } from "@/types/leads";

const statusOrder: Record<LeadStatus, number> = {
  new: 0,
  contacted: 1,
  replied: 2,
  demo_booked: 3,
  closed: 4,
};

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"date" | "status">("date");

  useEffect(() => {
    async function fetchLeads() {
      setLoading(true);
      const supabase = getSupabase();
      let query = supabase.from("leads").select("*");
      if (search.trim()) {
        const s = `%${search.trim()}%`;
        query = query.or(
          `name.ilike.${s},business.ilike.${s},email.ilike.${s},instagram_handle.ilike.${s}`
        );
      }
      if (sort === "date") {
        query = query.order("date_added", { ascending: false });
      } else {
        // We'll sort by status on the client for custom order
      }
      const { data } = await query;
      setLeads((data as unknown as Lead[]) || []);
      setLoading(false);
    }
    fetchLeads();
  }, [search, sort]);

  const sortedLeads = useMemo(() => {
    if (sort === "status") {
      return [...leads].sort((a, b) => {
        const av = a.status ? statusOrder[a.status as LeadStatus] : 999;
        const bv = b.status ? statusOrder[b.status as LeadStatus] : 999;
        return av - bv;
      });
    }
    return leads;
  }, [leads, sort]);

  async function updateStatus(id: string, status: LeadStatus) {
    const supabase = getSupabase();
    await supabase.from("leads").update({ status }).eq("id", id);
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  }

  async function updateNotes(id: string, notes: string) {
    const supabase = getSupabase();
    await supabase.from("leads").update({ notes }).eq("id", id);
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, notes } : l)));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <h1 className="text-2xl font-semibold">Leads</h1>
        <div className="sm:ml-auto flex gap-2">
          <input
            placeholder="Search name, business, email, IG handle"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72 rounded border border-gray-300 px-3 py-2"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "date" | "status")}
            className="rounded border border-gray-300 px-3 py-2"
          >
            <option value="date">Sort by date</option>
            <option value="status">Sort by status</option>
          </select>
        </div>
      </div>

      <div className="overflow-auto rounded border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Business</th>
              <th className="p-3">Instagram</th>
              <th className="p-3">Email</th>
              <th className="p-3">Status</th>
              <th className="p-3">Notes</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-4" colSpan={7}>Loading...</td>
              </tr>
            ) : sortedLeads.length === 0 ? (
              <tr>
                <td className="p-4" colSpan={7}>No leads</td>
              </tr>
            ) : (
              sortedLeads.map((lead) => (
                <tr key={lead.id} className="border-t align-top">
                  <td className="p-3">
                    <Link href={`/lead/${lead.id}`} className="text-blue-600 hover:underline">
                      {lead.name || "(no name)"}
                    </Link>
                  </td>
                  <td className="p-3">{lead.business}</td>
                  <td className="p-3">
                    {lead.instagram_handle ? (
                      <a
                        href={`https://instagram.com/${lead.instagram_handle?.replace(/^@/, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        @{lead.instagram_handle?.replace(/^@/, "")}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="p-3">{lead.email}</td>
                  <td className="p-3">
                    <select
                      value={(lead.status as LeadStatus) || "new"}
                      onChange={(e) => updateStatus(lead.id, e.target.value as LeadStatus)}
                      className="rounded border border-gray-300 px-2 py-1"
                    >
                      {(["new", "contacted", "replied", "demo_booked", "closed"] as LeadStatus[]).map((s) => (
                        <option key={s} value={s}>
                          {s.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 w-[320px]">
                    <textarea
                      defaultValue={lead.notes || ""}
                      onBlur={(e) => updateNotes(lead.id, e.target.value)}
                      className="w-full min-h-[60px] rounded border border-gray-300 px-2 py-1"
                      placeholder="Add notes"
                    />
                  </td>
                  <td className="p-3 whitespace-nowrap">{lead.date_added ? new Date(lead.date_added).toLocaleDateString() : ""}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


