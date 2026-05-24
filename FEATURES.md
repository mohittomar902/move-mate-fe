# MoveMate Frontend — Feature Documentation

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| State | Zustand (auth + app store) |
| Server state | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Maps | Leaflet + OpenStreetMap (free, no API key) |
| Routing | OSRM (free open-source routing engine) |
| Real-time | Socket.IO client |
| HTTP | Axios |
| Build | Next.js webpack with custom chunk splitting |

---

## Implemented Features

### Authentication
- Phone number login (OTP-based, no password)
- OTP verification screen with auto-focus inputs
- JWT access + refresh token storage (localStorage + cookie)
- Auth middleware — protects all `/dashboard`, `/tracking`, `/admin` routes
- Persistent login via Zustand hydration from localStorage

### Dashboard
- Landing dashboard page with quick-action cards
- Sticky navbar with active route highlighting
- Mobile bottom navigation bar
- User profile page (view phone, name)
- Responsive layout — works on mobile and desktop

### Trip Search & Booking
- Search trips by source city, destination city, and date
- Trip detail page (`/trip/[id]`) — shows driver info, seats, price, departure time
- Book a seat with Razorpay payment integration
- Payment modal with order creation → Razorpay checkout → verify flow
- Boarding OTP generated on successful payment — shown to passenger

### My Bookings
- List all bookings with status chips (Confirmed / Cancelled / Completed)
- Payment status badge (Paid / Pending)
- "Track & Chat" button visible when booking is active and trip is not completed
- "Trip completed ✓" badge after trip ends
- "Rate Your Driver" button after trip completes — one-time per booking
- Star rating modal (1–5 stars + optional review text)

### Create Trip (Driver)
- Verification gate — unverified drivers see a modal and are redirected to verify
- Add / select vehicle (type, model, number plate, seat capacity)
- Select source and destination from preset city list
- Set departure date, time, available seats, price per seat
- City coordinates auto-resolved from constants (no geocoding API needed)

### My Trips (Driver)
- List driver's own trips with status
- "Track & Start" link to tracking page (trip can only start via OTP, not direct button)

### Real-time Tracking
- Live map with OpenStreetMap tiles — no API token required
- Driver and passenger both see each other's location in real-time
- OSRM road route drawn on map — updates as driver moves (debounced 5 s)
- Route adapts to trip phase:
  - Before start: driver → passenger pickup point
  - After start: driver → destination
- OTP start flow: driver enters passenger's 4-digit OTP to start trip
- Recenter button — snaps map back to user's current location
- In-app chat between driver and passenger (Socket.IO)
- Typing indicator (animated dots, 3 s auto-clear)
- Chat UI: bottom sheet on mobile, side panel on desktop
- Auto location sharing starts when socket connects
- Rating popup shown to passenger automatically after trip ends

### Driver Verification (5-step wizard)
- Status banner at top — PENDING / UNDER REVIEW / VERIFIED / REJECTED with rejection reason
- 3-dot progress timeline
- Step 1 — Selfie upload
- Step 2 — Car photos (1–4 photos, multi-select, sequential upload)
- Step 3 — RC Card upload
- Step 4 — Driving License upload
- Step 5 — Aadhaar number (12-digit text input, not a file)
- Progress bar showing completed steps
- "Verified" full-screen success state
- "Submit for Verification" locked until all steps complete

### Admin Panel
- Route guard — shows "Access Denied" to non-admins
- **Driver Verifications** (`/admin/verifications`)
  - Filter tabs: All / Under Review / Pending / Verified / Rejected with live counts
  - Driver cards with name, phone, Aadhaar last 4 digits, status chip
  - Approve / Reject buttons visible directly in card header (no expand required)
  - Expand card to view uploaded document thumbnails (hover to view full size)
  - Reject modal with required reason field → stored as `rejectionReason`

### Build & Performance
- `mapbox-gl` removed (was unused, saved ~2 MB)
- `optimizePackageImports` for `lucide-react` and `framer-motion` — tree-shaken to used exports only
- Custom webpack `splitChunks`:
  - `framework` — React core in its own long-cache chunk
  - `maps` — Leaflet loaded only on map pages
  - `realtime` — Socket.IO loaded only on tracking pages
  - `lib` — shared node_modules chunk
- `moduleIds: 'deterministic'` — stable hashes across builds for better CDN caching
- Bundle analyzer — run `npm run analyze` to open interactive treemap

---

## Planned Features

### Passenger
- [ ] **Push notifications** — booking confirmed, trip starting soon, OTP reminder
- [ ] **Trip history** — paginated past trips with filter by date/status
- [ ] **Saved addresses** — home, work shortcuts on search screen
- [ ] **Favourite routes** — one-tap re-search for frequent routes
- [ ] **In-app wallet** — balance top-up, use wallet for payments, refund on cancellation
- [ ] **Cancellation flow** — cancel booking with reason, auto-refund trigger
- [ ] **Driver profile page** — view driver's rating, total trips, verification badge
- [ ] **SOS button** — on tracking screen, shares live location with emergency contact

### Driver
- [ ] **Earnings dashboard** — trip-wise breakdown, daily/weekly/monthly totals
- [ ] **Trip cancellation by driver** — with reason; auto-notifies passengers
- [ ] **Recurring trip** — create a trip that repeats on selected days
- [ ] **Seat management** — block specific seats, set luggage-only seats
- [ ] **Parcel delivery mode** — attach a parcel to a trip, track delivery separately
- [ ] **Driver stats** — rating average, acceptance rate, total distance driven

### Admin Panel
- [ ] **Stats dashboard** — total users, trips, revenue, active trips (live counters)
- [ ] **User management** — list all users, search, ban/unban with reason, revoke admin
- [ ] **Trip management** — list all trips, force-cancel, view bookings per trip
- [ ] **Revenue reports** — payment totals, payout breakdowns, export to CSV
- [ ] **Audit log** — every admin action logged with timestamp and actor
- [ ] **Notification broadcast** — send push/SMS to all users or a segment

### Platform
- [ ] **Dark mode** — system-preference aware toggle
- [ ] **Multilingual support** — Hindi + English (i18n via `next-intl`)
- [ ] **PWA** — installable on Android/iOS, offline-capable home screen
- [ ] **Email / WhatsApp OTP fallback** — for users without SMS access
- [ ] **Rate limiting on OTP** — prevent abuse, lock after N failed attempts
- [ ] **End-to-end encryption for chat** — messages encrypted before leaving the device
- [ ] **Accessibility audit** — WCAG 2.1 AA compliance, keyboard navigation, screen reader labels

---

## Route Map

```
/                          → Landing page
/login                     → Phone number entry
/verify-otp                → OTP verification

/dashboard                 → Home dashboard
/dashboard/search          → Search trips
/dashboard/create-trip     → Create a trip (driver, verified only)
/dashboard/my-trips        → Driver's trips
/dashboard/bookings        → Passenger's bookings
/dashboard/verify-driver   → Driver verification wizard
/profile                   → User profile

/trip/[id]                 → Trip detail + book seat
/tracking/[tripId]         → Live map + chat

/admin                     → Admin home (redirect)
/admin/verifications       → Driver document review
/admin/users               → (planned) User management
/admin/trips               → (planned) Trip management
/admin/reports             → (planned) Revenue reports

/about                     → About page
/contact                   → Contact page
/privacy-policy            → Privacy policy
/terms                     → Terms of service
```
