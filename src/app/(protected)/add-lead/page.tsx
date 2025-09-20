"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabaseClient";

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
    const { error: insertError } = await supabase.from("leads").insert({
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
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Add Lead</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded border p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input name="name" required className="w-full rounded border border-gray-300 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Business</label>
          <input name="business" className="w-full rounded border border-gray-300 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Instagram</label>
          <input name="instagram" placeholder="username" className="w-full rounded border border-gray-300 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input name="email" type="email" className="w-full rounded border border-gray-300 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select name="status" defaultValue="new" className="w-full rounded border border-gray-300 px-3 py-2">
            <option value="new">new</option>
            <option value="contacted">contacted</option>
            <option value="replied">replied</option>
            <option value="demo_booked">demo_booked</option>
            <option value="closed">closed</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea name="notes" className="w-full min-h-[100px] rounded border border-gray-300 px-3 py-2" />
        </div>
        {error && <p className="text-sm text-red-600 md:col-span-2">{error}</p>}
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save lead"}
          </button>
        </div>
      </form>
    </div>
  );
}


