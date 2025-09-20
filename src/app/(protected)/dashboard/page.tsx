"use client";

// Updated styling - force rebuild
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import type { Lead, LeadStatus } from "@/types/leads";
import { useExportCsv } from "@/hooks/useExportCsv";

const statusOrder: Record<LeadStatus, number> = {
  new: 0,
  contacted: 1,
  replied: 2,
  demo_booked: 3,
  closed: 4,
};

const statusStyles: Record<LeadStatus, string> = {
  new: "bg-gray-100 text-gray-700 ring-gray-200",
  contacted: "bg-yellow-100 text-yellow-700 ring-yellow-200",
  replied: "bg-green-100 text-green-700 ring-green-200",
  demo_booked: "bg-blue-100 text-blue-700 ring-blue-200",
  closed: "bg-zinc-200 text-zinc-700 ring-zinc-300",
};

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"date" | "status">("date");
  const exportCsv = useExportCsv();

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

  async function deleteLead(id: string) {
    const confirmed = window.confirm("Delete this lead? This cannot be undone.");
    if (!confirmed) return;
    const supabase = getSupabase();
    await supabase.from("leads").delete().eq("id", id);
    setLeads((prev) => prev.filter((l) => l.id !== id));
  }

  function handleExport() {
    const rows = leads.map((l) => ({
      name: l.name || "",
      business: l.business || "",
      instagram_handle: l.instagram_handle || "",
      email: l.email || "",
      status: l.status || "",
      notes: l.notes || "",
      date_added: l.date_added || "",
    }));
    exportCsv(rows, {
      filename: "leads.csv",
      headers: [
        "name",
        "business",
        "instagram_handle",
        "email",
        "status",
        "notes",
        "date_added",
      ],
    });
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold">Dashboard</h1>
            <p className="text-gray-400 mt-1">Manage your leads and outreach</p>
          </div>
          <div className="md:ml-auto flex flex-wrap items-center gap-3">
            <input
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-64 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as "date" | "status")}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Sort by date</option>
              <option value="status">Sort by status</option>
            </select>
            <Link
              href="/add-lead"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Add Lead
            </Link>
            <button
              onClick={handleExport}
              className="inline-flex items-center bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              disabled={loading || leads.length === 0}
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Leads</p>
                <p className="text-2xl font-bold text-white">{leads.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">New This Week</p>
                <p className="text-2xl font-bold text-white">{leads.filter(l => {
                  const date = new Date(l.date_added || '');
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return date > weekAgo;
                }).length}</p>
              </div>
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Closed This Month</p>
                <p className="text-2xl font-bold text-white">{leads.filter(l => l.status === 'closed').length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Leads</h2>
            <span className="text-sm text-gray-400">{leads.length} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Business</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Notes</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {loading ? (
                  <tr>
                    <td className="px-6 py-8 text-center text-gray-400" colSpan={7}>Loading...</td>
                  </tr>
                ) : sortedLeads.length === 0 ? (
                  <tr>
                    <td className="px-6 py-8 text-center text-gray-400" colSpan={7}>No leads found</td>
                  </tr>
                ) : (
                  sortedLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/lead/${lead.id}`} className="font-medium text-white hover:text-blue-400 transition-colors">
                          {lead.name || "(no name)"}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{lead.business || "—"}</td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {lead.email && (
                            <div className="text-sm text-gray-300">{lead.email}</div>
                          )}
                          {lead.instagram_handle && (
                            <a
                              href={`https://instagram.com/${lead.instagram_handle?.replace(/^@/, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              @{lead.instagram_handle?.replace(/^@/, "")}
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            lead.status === 'new' ? 'bg-gray-600 text-gray-200' :
                            lead.status === 'contacted' ? 'bg-yellow-600 text-yellow-100' :
                            lead.status === 'replied' ? 'bg-green-600 text-green-100' :
                            lead.status === 'demo_booked' ? 'bg-blue-600 text-blue-100' :
                            'bg-gray-700 text-gray-300'
                          }`}>
                            {(lead.status || 'new').replace('_', ' ')}
                          </span>
                          <select
                            value={(lead.status as LeadStatus) || "new"}
                            onChange={(e) => updateStatus(lead.id, e.target.value as LeadStatus)}
                            className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            {(["new", "contacted", "replied", "demo_booked", "closed"] as LeadStatus[]).map((s) => (
                              <option key={s} value={s}>
                                {s.replace("_", " ")}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4 w-64">
                        <textarea
                          defaultValue={lead.notes || ""}
                          onBlur={(e) => updateNotes(lead.id, e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                          placeholder="Add notes..."
                          rows={2}
                        />
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {lead.date_added ? new Date(lead.date_added).toLocaleDateString() : ""}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/lead/${lead.id}`}
                            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => deleteLead(lead.id)}
                            className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


