"use client";

// Updated styling - force rebuild
import Link from "next/link";
import { useEffect, useMemo, useState, useRef } from "react";
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

// Status Dropdown Component
function StatusDropdown({ lead, onUpdateStatus }: { lead: Lead; onUpdateStatus: (id: string, status: LeadStatus) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const statusOptions: LeadStatus[] = ["new", "contacted", "replied", "demo_booked", "closed"];
  const currentStatus = (lead.status as LeadStatus) || "new";

  const getStatusStyles = (status: LeadStatus) => {
    switch (status) {
      case 'new': return 'bg-gradient-to-r from-slate-600 to-slate-500 text-slate-100 shadow-lg';
      case 'contacted': return 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-yellow-100 shadow-lg';
      case 'replied': return 'bg-gradient-to-r from-green-600 to-green-500 text-green-100 shadow-lg';
      case 'demo_booked': return 'bg-gradient-to-r from-blue-600 to-blue-500 text-blue-100 shadow-lg';
      case 'closed': return 'bg-gradient-to-r from-gray-700 to-gray-600 text-gray-200 shadow-lg';
      default: return 'bg-gradient-to-r from-slate-600 to-slate-500 text-slate-100 shadow-lg';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:scale-105 hover:shadow-xl transition-all duration-300 transform ${getStatusStyles(currentStatus)}`}
      >
        {currentStatus.replace('_', ' ')}
        <svg className="ml-1 w-3 h-3 transition-transform duration-300" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-slate-800/95 backdrop-blur-sm border border-slate-600/50 rounded-lg shadow-2xl z-10 min-w-[140px] overflow-hidden">
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => {
                onUpdateStatus(lead.id, status);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-xs hover:bg-slate-700/80 transition-all duration-300 first:rounded-t-lg last:rounded-b-lg ${
                status === currentStatus ? 'bg-slate-700/80 text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
    <div className="px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-400 mt-1">Manage your leads and outreach</p>
          </div>
          <div className="md:ml-auto flex flex-wrap items-center gap-3">
            <input
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-64 bg-slate-800/50 border border-slate-600/50 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400/50 backdrop-blur-sm transition-all duration-300 hover:bg-slate-800/70"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as "date" | "status")}
              className="bg-slate-800/50 border border-slate-600/50 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400/50 backdrop-blur-sm transition-all duration-300 hover:bg-slate-800/70"
            >
              <option value="date">Sort by date</option>
              <option value="status">Sort by status</option>
            </select>
            <Link
              href="/add-lead"
              className="inline-flex items-center bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transform hover:scale-105"
            >
              Add Lead
            </Link>
            <button
              onClick={handleExport}
              className="inline-flex items-center bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
              disabled={loading || leads.length === 0}
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-sm rounded-xl p-6 border border-slate-600/30 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Leads</p>
                <p className="text-2xl font-bold text-white">{leads.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-sm rounded-xl p-6 border border-slate-600/30 shadow-xl hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300 transform hover:scale-105">
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
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-sm rounded-xl p-6 border border-slate-600/30 shadow-xl hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Closed This Month</p>
                <p className="text-2xl font-bold text-white">{leads.filter(l => l.status === 'closed').length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-sm rounded-xl border border-slate-600/30 overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-slate-600/30 flex items-center justify-between bg-gradient-to-r from-slate-700/30 to-slate-600/30">
            <h2 className="text-xl font-semibold text-white">Leads</h2>
            <span className="text-sm text-gray-400">{leads.length} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-600/30 bg-gradient-to-r from-slate-700/20 to-slate-600/20">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Business</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Notes</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-600/20">
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
                    <tr key={lead.id} className="hover:bg-slate-700/30 transition-all duration-300 group">
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
                        <StatusDropdown lead={lead} onUpdateStatus={updateStatus} />
                      </td>
                      <td className="px-6 py-4 w-64">
                        <textarea
                          defaultValue={lead.notes || ""}
                          onBlur={(e) => updateNotes(lead.id, e.target.value)}
                          className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400/50 backdrop-blur-sm transition-all duration-300 resize-none hover:bg-slate-700/70"
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
                            className="inline-flex items-center bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-blue-500/25 transform hover:scale-105"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => deleteLead(lead.id)}
                            className="inline-flex items-center bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-red-500/25 transform hover:scale-105"
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


