-- Enable pgcrypto for gen_random_uuid
create extension if not exists pgcrypto;

-- enum for lead status
create type lead_status as enum ('new','contacted','replied','demo_booked','closed');

-- leads table (simple multi-user setup)
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text,
  business text,
  instagram_handle text,
  email text,
  status lead_status not null default 'new',
  notes text,
  date_added timestamp default now()
);

-- Optional reminders table
create table if not exists reminders (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  reminder_date timestamp not null,
  reminder_text text
);

-- Row Level Security
alter table leads enable row level security;
alter table reminders enable row level security;

-- Policies: demo-friendly (any authenticated user can read/write)
create policy "leads read" on leads for select to authenticated using (true);
create policy "leads insert" on leads for insert to authenticated with check (true);
create policy "leads update" on leads for update to authenticated using (true);
create policy "leads delete" on leads for delete to authenticated using (true);

create policy "reminders read" on reminders for select to authenticated using (true);
create policy "reminders insert" on reminders for insert to authenticated with check (true);
create policy "reminders update" on reminders for update to authenticated using (true);
create policy "reminders delete" on reminders for delete to authenticated using (true);
