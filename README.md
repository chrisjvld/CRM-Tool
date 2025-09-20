This is a Next.js CRM starter using Supabase and TailwindCSS.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Environment variables

Create `.env.local` at project root with:

```
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
```

### Supabase SQL (run in SQL editor)

```sql
-- Enable pgcrypto for gen_random_uuid
create extension if not exists pgcrypto;

-- enum for lead status
create type lead_status as enum ('new','contacted','replied','demo_booked','closed');

-- leads table
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
```

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
