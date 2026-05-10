# ParallelEvent™ — High-Performance Event Management

ParallelEvent™ is a sophisticated, multi-portal event management ecosystem designed for speed, security, and absolute control. Built with a minimalist "machined" aesthetic, it provides distinct, high-end interfaces for Admins, Companies, and Attendees.

## 🚀 Live Portals

| Portal | Role | Access Level | Primary Function |
|--------|------|--------------|------------------|
| **[Admin Portal](/admin/login)** | System Operator | Full CRUD Override | Oversight, User Management, Global Monitoring |
| **[Company Portal](/company/login)** | Event Organizer | Event CRUD | Creation, Management, Attendee Analytics |
| **[Attendee Portal](/attendee/login)** | Event Guest | Discovery & Booking | Registration, Personal Profile, Bookmarking |

---

## ✨ Core Features

### 🛠️ Admin Control Center
- **Global Oversight**: Delete events, companies, and users with a single click (Admin Bypass RLS).
- **Advanced Analytics**: Real-time registration trends and event status distribution using `Recharts`.
- **User Management**: Promote users to 'admin' or 'company' roles directly from the dashboard.
- **Audit Ready**: Every action is tracked and visible in the high-density data tables.

### 🏢 Company Dashboard
- **Event Lifecycle**: Create, edit, duplicate, and toggle event statuses (Active, Completed, Cancelled).
- **Attendee Management**: Real-time attendee lists with CSV export and the ability to "Kick" users.
- **Performance Insights**: Capacity utilization charts and registration frequency monitoring.
- **Organization Profile**: Manage company branding, website, and metadata.

### 📱 Attendee Experience
- **Discovery**: Sleek event browsing with date filters (Today, This Week, This Month).
- **Personalized Profile**: Update personal details and manage active registrations.
- **Bookmarking**: Favorite events with a heart toggle to save them for later.
- **Live Status**: Real-time capacity tracking ensures you never miss a spot.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router, Server Actions)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL with Row-Level Security)
- **Styling**: Vanilla CSS (Premium "Machined" Glassmorphism system)
- **Visualization**: [Recharts](https://recharts.org/) for high-density data displays
- **Icons**: [Lucide React](https://lucide.dev/) for crisp, minimalist iconography

---

## ⚙️ Setup & Installation

### 1. Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Initialization
Copy the contents of `supabase/migrations/00_init.sql` and run it in your **Supabase SQL Editor**. This will:
1. Create all necessary tables (`profiles`, `companies`, `events`, `registrations`, `favorites`).
2. Set up the `is_admin()` security function.
3. Configure Row-Level Security (RLS) policies.
4. Enable the auto-profile creation trigger.

### 3. Creating an Admin
After signing up a user through the portal, run this SQL in your Supabase dashboard to grant admin access:
```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

### 4. Local Development
```bash
npm install
npm run dev
```

---

## 🎨 Design Philosophy
ParallelEvent™ follows a **"Machined"** design system:
- **Glassmorphism**: Subtle blurs and translucent borders.
- **High Contrast**: Sleek dark mode with vibrant accent colors (Emerald, Azure, Rose).
- **Micro-animations**: Smooth transitions for a native-app feel.
- **Responsive**: Fully optimized for both desktop terminals and mobile devices.

---

© 2026 ParallelEvent™. Designed for the future of event management.
