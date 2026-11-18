# SalonBook — Client (Next.js App Router)

Frontend web application for **SalonBook**, a role-based salon appointment booking platform styled in a sunlit French Maison terrace aesthetic with service search/filtering/sorting, Better Auth authentication, Stripe Checkout integration, and dedicated Customer & Admin dashboards.

## Important Features

- **Sunlit Maison Storefront**: Architectural three-column terrace hero with arched salon photography vista, featured active services, 7 salon categories, and a transparent 3-step booking ritual section.
- **Public Salon Discovery**: Home page with Featured Active Services (6+), 7 Salon Service Categories, and full Browse Services page supporting live search by service name, category filtering, and price sorting.
- **Protected Service Details & Conflict-Free Booking**: Dynamic `/services/[id]` route enforcing authentication, real-time booked-slot availability, predefined time slots, and customer-only booking.
- **Better Auth Authentication**: Email/Password registration (with password complexity checklist and ImgBB upload or URL avatar) + Google OAuth login + instant Navbar state updates and role-based redirects.
- **Customer Dashboard**: Overview metrics, My Appointments (cancel pending requests with confirmation dialog, view details, pay confirmed appointments via Stripe Checkout), and My Profile.
- **Admin Dashboard**: Studio Overview metrics, Manage Services (CRUD, ImgBB file upload, Active/Inactive toggles), Manage Appointments (Confirm Pending, Cancel Pending/Confirmed), Manage Customers (Block/Unblock), Read-Only Stripe Transactions log, and My Profile.
- **Responsive & Accessible UX**: Fully responsive across mobile, tablet, and desktop; meaningful loaders; custom error/404 screens; Sonner toast notifications (no `alert()`).

## Technology Stack

- Next.js 16 (App Router) & React 19
- TypeScript
- Tailwind CSS v4
- Motion (`motion/react`)
- Better Auth React Client (`better-auth/react`)
- Lucide React Icons & Sonner Toasts

## Installation Instructions

```bash
git clone <your-client-repo-url>
cd client
npm install
```

Create a `.env.local` file in `client/` based on `.env.example`.

## How to Run the Project Locally

```bash
# Start the Next.js development server on http://localhost:3000
npm run dev

# Build and run production bundle
npm run build
npm start
```

## Required Environment Variables

Configure these variable names in `.env.local` (never commit actual secrets):

- `NEXT_PUBLIC_API_URL` (URL of the running SalonBook Express server)
- `NEXT_PUBLIC_APP_URL` (Public URL of this Next.js frontend)

## Links

- **Live Website**: https://salon-book-client-umber.vercel.app
- **Client Repository**: https://github.com/IshmamHussain/SalonBook-Client
- **Server Repository**: https://github.com/IshmamHussain/SalonBook-Server
