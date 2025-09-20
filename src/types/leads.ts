export type LeadStatus = "new" | "contacted" | "replied" | "demo_booked" | "closed";

export interface Lead {
  id: string;
  name: string | null;
  business: string | null;
  instagram_handle: string | null;
  email: string | null;
  status: LeadStatus | null;
  notes: string | null;
  date_added: string | null;
}


