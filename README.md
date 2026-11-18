# SalonBook — Client (Next.js App Router)

Frontend web application for **SalonBook**, a role-based salon appointment booking platform styled in a sunlit French Maison terrace aesthetic with an interactive Three.js 3D botanical elixir flacon, service search/filtering/sorting, Better Auth authentication, Stripe Checkout integration, and dedicated Customer & Admin dashboards.

## Important Features

- **Sunlit Maison Storefront & Interactive 3D Flacon**: Architectural three-column terrace hero with arched salon photography vista and an interactive Three.js PBR crystal & gilt-bronze elixir flacon with `prefers-reduced-motion` and WebGL fallback support.
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
- Three.js, React Three Fiber (`@react-three/fiber`), `@react-three/drei`
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

- **Live Website**: `<add-live-client-url-after-deployment>`
- **Client Repository**: `<add-client-github-repo-url>`
- **Server Repository**: `<add-server-github-repo-url>`
