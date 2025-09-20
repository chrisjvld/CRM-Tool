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

### Supabase Setup

1. **Authentication**: Enable email/password authentication in Supabase Auth settings
2. **Database**: Run the SQL schema (see below) in the Supabase SQL editor

### Database Schema

**Option 1: Quick Setup (Demo-friendly)**
Run the basic schema in `supabase-basic.sql` for a simple multi-user setup.

**Option 2: Full Multi-User Setup (Recommended)**
Run the complete schema in `supabase-schema.sql` for proper user isolation and data security.

The complete schema includes:
- User profiles linked to Supabase Auth
- User-isolated leads, reminders, and tags
- Automatic user profile creation on signup
- Row Level Security (RLS) policies
- Performance indexes

### Features

- **Authentication**: Sign up and sign in with email/password
- **Dashboard**: View, search, sort, and manage leads
- **Lead Management**: Add, edit, and update lead status and notes
- **Search**: Filter leads by name, business, email, or Instagram handle
- **Export**: Download leads as CSV
- **Protected Routes**: Authentication required for all CRM features

### Pages

- `/` - Redirects to login
- `/login` - Sign in page
- `/signup` - Create new account
- `/dashboard` - Main leads table with search and export
- `/add-lead` - Form to add new leads
- `/lead/[id]` - Detailed lead view and editing

### Tech Stack

- **Frontend**: Next.js 15, React, TailwindCSS
- **Backend**: Supabase (PostgreSQL + Auth + API)
- **Authentication**: Supabase Auth with email/password
- **Database**: PostgreSQL with Row Level Security
- **Performance**: Vercel Speed Insights

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.