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
    <div className="px-4 md:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CRM Dashboard</h1>
          <p className="text-sm text-gray-500">Manage your leads and outreach.</p>
        </div>
        <div className="md:ml-auto flex flex-wrap items-center gap-2">
          <input
            placeholder="Search name, business, email, IG handle"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-72 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "date" | "status")}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Sort by date</option>
            <option value="status">Sort by status</option>
          </select>
          <Link
            href="/add-lead"
            className="inline-flex items-center rounded-md bg-blue-600 text-white px-3 py-2 text-sm font-medium hover:bg-blue-700"
          >
            Add Lead
          </Link>
          <button
            onClick={handleExport}
            className="inline-flex items-center rounded-md bg-gray-800 text-white px-3 py-2 text-sm font-medium hover:bg-black disabled:opacity-60"
            disabled={loading || leads.length === 0}
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-base font-semibold">Leads</h2>
          <span className="text-xs text-gray-500">{leads.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-[11px] uppercase tracking-wide text-gray-500">
                <th className="p-3">Name</th>
                <th className="p-3">Business</th>
                <th className="p-3">Instagram</th>
                <th className="p-3">Email</th>
                <th className="p-3">Status</th>
                <th className="p-3">Notes</th>
                <th className="p-3 whitespace-nowrap">Date</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="p-6 text-sm text-gray-500" colSpan={8}>Loading...</td>
                </tr>
              ) : sortedLeads.length === 0 ? (
                <tr>
                  <td className="p-6 text-sm text-gray-500" colSpan={8}>No leads</td>
                </tr>
              ) : (
                sortedLeads.map((lead) => (
                  <tr key={lead.id} className="border-t hover:bg-gray-50 align-top">
                    <td className="p-3 font-medium">
                      <Link href={`/lead/${lead.id}`} className="text-blue-600 hover:underline">
                        {lead.name || "(no name)"}
                      </Link>
                    </td>
                    <td className="p-3">{lead.business || "—"}</td>
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
                    <td className="p-3">{lead.email || "—"}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${statusStyles[(lead.status as LeadStatus) || "new"]}`}>
                          {(lead.status as LeadStatus) || "new"}
                        </span>
                        <select
                          value={(lead.status as LeadStatus) || "new"}
                          onChange={(e) => updateStatus(lead.id, e.target.value as LeadStatus)}
                          className="rounded-md border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {(["new", "contacted", "replied", "demo_booked", "closed"] as LeadStatus[]).map((s) => (
                            <option key={s} value={s}>
                              {s.replace("_", " ")}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="p-3 w-[380px]">
                      <textarea
                        defaultValue={lead.notes || ""}
                        onBlur={(e) => updateNotes(lead.id, e.target.value)}
                        className="w-full min-h-[72px] rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Add notes"
                      />
                    </td>
                    <td className="p-3 whitespace-nowrap text-gray-600">{lead.date_added ? new Date(lead.date_added).toLocaleDateString() : ""}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/lead/${lead.id}`}
                          className="inline-flex items-center rounded-md bg-indigo-600 text-white px-2.5 py-1.5 text-xs font-medium hover:bg-indigo-700"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => deleteLead(lead.id)}
                          className="inline-flex items-center rounded-md bg-red-600 text-white px-2.5 py-1.5 text-xs font-medium hover:bg-red-700"
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
  );
}


