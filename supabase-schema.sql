-- Enable UUID generation
create extension if not exists pgcrypto;

-- Users table (extends Supabase auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- enum for lead status
create type lead_status as enum ('new','contacted','replied','demo_booked','closed');

-- leads table
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
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
  user_id uuid not null references public.users(id) on delete cascade,
  lead_id uuid not null references leads(id) on delete cascade,
  reminder_date timestamp not null,
  reminder_text text
);

-- Tags and many-to-many join between leads and tags
create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  color text,
  created_at timestamp default now(),
  unique(user_id, name)
);

create table if not exists lead_tags (
  lead_id uuid not null references leads(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  added_at timestamp not null default now(),
  primary key (lead_id, tag_id)
);

-- Indexes for performance
create index if not exists leads_user_id_idx on leads(user_id);
create index if not exists leads_status_idx on leads(status);
create index if not exists leads_date_added_idx on leads(date_added);
create index if not exists reminders_user_id_idx on reminders(user_id);
create index if not exists reminders_reminder_date_idx on reminders(reminder_date);
create index if not exists tags_user_id_idx on tags(user_id);
create index if not exists tags_name_idx on tags(name);
create index if not exists lead_tags_tag_id_idx on lead_tags(tag_id);
create index if not exists lead_tags_lead_id_idx on lead_tags(lead_id);

-- Row Level Security
alter table public.users enable row level security;
alter table leads enable row level security;
alter table reminders enable row level security;
alter table tags enable row level security;
alter table lead_tags enable row level security;

-- RLS Policies: Users can only access their own data
create policy "users read own" on public.users for select using (auth.uid() = id);
create policy "users update own" on public.users for update using (auth.uid() = id);

create policy "leads read own" on leads for select using (auth.uid() = user_id);
create policy "leads insert own" on leads for insert with check (auth.uid() = user_id);
create policy "leads update own" on leads for update using (auth.uid() = user_id);
create policy "leads delete own" on leads for delete using (auth.uid() = user_id);

create policy "reminders read own" on reminders for select using (auth.uid() = user_id);
create policy "reminders insert own" on reminders for insert with check (auth.uid() = user_id);
create policy "reminders update own" on reminders for update using (auth.uid() = user_id);
create policy "reminders delete own" on reminders for delete using (auth.uid() = user_id);

create policy "tags read own" on tags for select using (auth.uid() = user_id);
create policy "tags insert own" on tags for insert with check (auth.uid() = user_id);
create policy "tags update own" on tags for update using (auth.uid() = user_id);
create policy "tags delete own" on tags for delete using (auth.uid() = user_id);

create policy "lead_tags read own" on lead_tags for select 
  using (exists (select 1 from leads where leads.id = lead_tags.lead_id and leads.user_id = auth.uid()));
create policy "lead_tags insert own" on lead_tags for insert 
  with check (exists (select 1 from leads where leads.id = lead_tags.lead_id and leads.user_id = auth.uid()));
create policy "lead_tags delete own" on lead_tags for delete 
  using (exists (select 1 from leads where leads.id = lead_tags.lead_id and leads.user_id = auth.uid()));

-- Function to automatically create user profile when auth user is created
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create user profile on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- View of reminders in the next 14 days
create or replace view upcoming_reminders as
select r.*, l.name as lead_name, l.business, l.email, l.instagram_handle
from reminders r
join leads l on l.id = r.lead_id
where r.reminder_date between now() and now() + interval '14 days'
  and r.user_id = auth.uid()
order by r.reminder_date asc;
