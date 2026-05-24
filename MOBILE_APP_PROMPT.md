# MoveMate — React Native Mobile App Implementation Prompt

Use this prompt as a complete briefing to build the MoveMate iOS + Android app. The backend already exists (NestJS + PostgreSQL + Socket.IO). This document describes the full spec: tech stack, folder structure, screen list, feature-by-feature implementation details, and native-specific requirements.

---

## Project Context

MoveMate is a ride-sharing app for India where:
- **Passengers** search trips, book seats, pay online, and track their ride in real-time
- **Drivers** create trips, upload verification documents, start trips via OTP, and chat with passengers during the ride
- **Admins** review driver documents and approve/reject verification requests

The backend API base URL is `http://<your-server>/api`. All endpoints are authenticated via JWT (Bearer token). WebSocket server is at `http://<your-server>` using Socket.IO.

---

## Tech Stack

| Layer | Package | Notes |
|---|---|---|
| Framework | `react-native` (bare workflow via Expo) | Use `npx create-expo-app movemate --template blank-typescript` |
| Navigation | `@react-navigation/native` + `@react-navigation/bottom-tabs` + `@react-navigation/stack` | Stack inside tabs |
| State | `zustand` | Same store shape as web — auth store + app store |
| Server state | `@tanstack/react-query` | Same query keys as web for consistency |
| HTTP | `axios` | Same interceptor pattern — attach Bearer token, auto-refresh on 401 |
| Forms | `react-hook-form` + `zod` | Same schemas as web |
| Maps | `react-native-maps` | Use OpenStreetMap tiles (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`) |
| Routing on map | OSRM public API (`https://router.project-osrm.org/route/v1/driving/`) | Free, no key needed |
| Real-time | `socket.io-client` | Same events as web |
| Location | `expo-location` | Foreground + background permission required |
| Camera / files | `expo-image-picker` + `expo-document-picker` | For document uploads |
| Payments | `react-native-razorpay` | Drop-in Razorpay checkout |
| Push notifications | `expo-notifications` + FCM (Android) + APNs (iOS) | Register device token on login |
| Storage | `expo-secure-store` | Store JWT tokens securely (replaces localStorage) |
| Styling | `StyleSheet` + `nativewind` (Tailwind for RN) | Mirror web color palette |
| Icons | `@expo/vector-icons` (Ionicons) | Mirror lucide-react icons |
| Animations | `react-native-reanimated` v3 | For bottom sheets, transitions |
| Bottom sheets | `@gorhom/bottom-sheet` | Chat panel, OTP entry, rating modal |

---

## Folder Structure

```
src/
├── app/                    # Root navigator + tab navigator
│   └── index.tsx
├── screens/
│   ├── auth/
│   │   ├── LoginScreen.tsx
│   │   └── VerifyOtpScreen.tsx
│   ├── dashboard/
│   │   └── DashboardScreen.tsx
│   ├── search/
│   │   └── SearchScreen.tsx
│   ├── trip/
│   │   ├── TripDetailScreen.tsx
│   │   └── CreateTripScreen.tsx
│   ├── bookings/
│   │   └── BookingsScreen.tsx
│   ├── my-trips/
│   │   └── MyTripsScreen.tsx
│   ├── tracking/
│   │   └── TrackingScreen.tsx
│   ├── profile/
│   │   └── ProfileScreen.tsx
│   ├── verification/
│   │   └── VerifyDriverScreen.tsx
│   └── admin/
│       └── AdminVerificationsScreen.tsx
├── components/
│   ├── layout/
│   │   └── BottomTabBar.tsx
│   ├── booking/
│   │   ├── BookingCard.tsx
│   │   └── PaymentSheet.tsx
│   ├── chat/
│   │   └── ChatWindow.tsx
│   ├── map/
│   │   └── TripMap.tsx
│   ├── rating/
│   │   └── RatingSheet.tsx
│   ├── verification/
│   │   └── VerificationGateSheet.tsx
│   └── common/
│       ├── Spinner.tsx
│       ├── StatusBadge.tsx
│       └── OtpInput.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useTrips.ts
│   ├── useBookings.ts
│   ├── useTracking.ts
│   ├── useDriverVerification.ts
│   ├── useVehicles.ts
│   ├── usePayment.ts
│   └── useRatings.ts
├── services/
│   ├── api.ts              # Axios instance + interceptors
│   ├── auth.service.ts
│   ├── trips.service.ts
│   ├── booking.service.ts
│   ├── payment.service.ts
│   ├── tracking.service.ts
│   ├── driver-verification.service.ts
│   └── rating.service.ts
├── store/
│   ├── auth.store.ts       # user, tokens, clearAuth
│   └── app.store.ts
├── constants/
│   ├── cities.ts           # Same city list as web (name, lat, lng)
│   └── index.ts            # API_URL, SOCKET_URL, ROUTES
└── types/
    ├── user.ts
    ├── trip.ts
    ├── booking.ts
    └── vehicle.ts
```

---

## Navigation Structure

```
RootNavigator (Stack)
├── Auth (Stack) — shown when not logged in
│   ├── LoginScreen
│   └── VerifyOtpScreen
└── Main (BottomTabs) — shown when logged in
    ├── Tab: Search       → SearchStack
    │   ├── SearchScreen
    │   └── TripDetailScreen
    ├── Tab: Create Trip  → CreateTripScreen (driver only, else show VerificationGateSheet)
    ├── Tab: My Trips     → MyTripsScreen (driver)
    ├── Tab: Bookings     → BookingsScreen (passenger)
    └── Tab: Profile      → ProfileStack
        ├── ProfileScreen
        └── VerifyDriverScreen

Modal screens (presented over tabs):
├── TrackingScreen        → full-screen, pushed from BookingCard or MyTrips
└── AdminVerificationsScreen → accessible from profile if isAdmin
```

---

## Screen-by-Screen Implementation

### LoginScreen
- Phone number input with `+91` prefix, numeric keyboard
- "Send OTP" button → `POST /auth/send-otp`
- Navigate to VerifyOtpScreen passing `phone` as param

### VerifyOtpScreen
- 6 individual single-digit inputs, auto-focus next on input, auto-submit on last digit
- Resend OTP with 30 s countdown
- On success: save `accessToken` + `refreshToken` to `expo-secure-store`, update Zustand auth store, navigate to Main tabs

### DashboardScreen
- Welcome card with user's first name
- Quick-action grid: Search Ride, Create Trip, My Trips, My Bookings, Get Verified
- `isAdmin` check — show "Admin Panel" card if true

### SearchScreen
- Source city picker (FlatList modal or ActionSheet)
- Destination city picker (same)
- Date picker (use `@react-native-community/datetimepicker`)
- "Search" button → `GET /trips/search?sourceName=&destinationName=&date=`
- Results as FlatList of `TripCard` components
- TripCard: driver name, source → destination, departure time, seats left, price/seat
- Tap card → navigate to TripDetailScreen

### TripDetailScreen
- Full trip info: driver photo (initials fallback), route, time, vehicle, available seats
- Price per seat prominently displayed
- "Book Seat" button → open PaymentSheet
- PaymentSheet (bottom sheet):
  - Seat count selector
  - Total price preview
  - "Pay with Razorpay" → `POST /payments/create-order` → open `RazorpayCheckout.open()` → `POST /payments/verify`
  - On success: show boarding OTP in a success modal

### BookingsScreen
- FlatList of user's bookings via `GET /bookings/my-bookings`
- BookingCard: trip route, date, driver name, status chip, payment badge
- Show boarding OTP when booking is CONFIRMED + PAID + trip not started
- "Track & Chat" button when trip is active — navigate to TrackingScreen
- "Rate Driver" button when trip COMPLETED + not yet rated → open RatingSheet
- RatingSheet (bottom sheet): 5-star tap selector, optional review input, submit → `POST /ratings`

### CreateTripScreen
- Check `verificationStatus !== 'VERIFIED'` → show VerificationGateSheet (navigate to VerifyDriverScreen)
- Vehicle picker (FlatList) or "Add Vehicle" form inline
- Source / destination city pickers
- Date + time pickers
- Seats and price inputs
- "Create Trip" → `POST /trips`

### MyTripsScreen
- FlatList of driver's trips via `GET /trips/my-trips`
- Status chip: PENDING / STARTED / COMPLETED / CANCELLED
- "Track & Start" button → navigate to TrackingScreen

### TrackingScreen
- Full-screen `react-native-maps` MapView with OSM tiles
- Show driver marker (car icon) and passenger marker (person icon)
- Draw OSRM polyline route between markers, update as driver moves (5 s debounce)
- Route adapts: before start → driver to pickup; after start → driver to destination
- Floating recenter button (bottom right) → `camera.animateToRegion` to user location
- **OTP flow (driver only)**:
  - Floating "Enter OTP" button (key icon) → bottom sheet with 4-digit input
  - Submit → `POST /trips/:id/start` with `{ otp }` → on success emit `trip:started` via socket
- **Chat** (bottom sheet, swipe up):
  - Message list (FlatList, inverted)
  - Text input + send button
  - Typing indicator — animated 3 dots
  - Badge on chat toggle button shows unread count
- After trip ends (socket `trip:ended` event):
  - Passenger sees RatingSheet automatically
  - Both users see "Trip Completed" banner

### VerifyDriverScreen
- Step sidebar (vertical) with checkmarks for completed steps
- Step content panel:
  - **SELFIE**: Camera launch via `expo-image-picker` → upload to `POST /driver-verification/upload`
  - **CAR_PHOTO**: Multi-image picker (up to 4), sequential upload, thumbnail grid
  - **RC_CARD**: Single image picker → upload
  - **DRIVING_LICENSE**: Single image picker → upload
  - **AADHAAR**: Numeric text input, 12 digits → `POST /driver-verification/aadhaar`
- Status banner at top: PENDING / UNDER_REVIEW / VERIFIED / REJECTED
- Show rejection reason if REJECTED
- "Submit for Verification" → `POST /driver-verification/submit` (locked until all steps complete)
- Progress bar at bottom

### ProfileScreen
- User's name and phone number
- "Driver Verification" row → VerifyDriverScreen
- "Admin Panel" row (visible if `isAdmin`) → AdminVerificationsScreen
- Logout button → clear SecureStore + Zustand + navigate to Auth

### AdminVerificationsScreen
- Filter chips: All / Under Review / Pending / Verified / Rejected
- FlatList of driver cards
- Each card: name, phone, Aadhaar last 4, status chip
- Approve button (green) + Reject button (red) in card header — always visible for non-verified drivers
- Expand card → image grid of uploaded documents (tap to open full-screen viewer)
- Reject bottom sheet: required reason textarea → `PATCH /driver-verification/admin/reject/:userId`

---

## Shared Logic — Reuse from Web

### API Service (`src/services/api.ts`)
```typescript
import axios from 'axios'
import * as SecureStore from 'expo-secure-store'

const api = axios.create({ baseURL: process.env.EXPO_PUBLIC_API_URL })

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    if (error.response?.status === 401) {
      const refresh = await SecureStore.getItemAsync('refreshToken')
      if (refresh) {
        const { data } = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/auth/refresh`, { refreshToken: refresh })
        await SecureStore.setItemAsync('accessToken', data.accessToken)
        error.config.headers.Authorization = `Bearer ${data.accessToken}`
        return api(error.config)
      }
    }
    return Promise.reject(error)
  }
)

export default api
```

### Socket Hook (`src/hooks/useTracking.ts`)
- Same events as web: `location:update`, `chat:message`, `trip:started`, `trip:ended`, `typing`
- Use `expo-location` `watchPositionAsync` instead of browser `navigator.geolocation`
- Emit `location:update` with `{ tripId, lat, lng, senderId }` every 3–5 s
- Background location requires `expo-location` background task + `expo-task-manager`

### Auth Store (`src/store/auth.store.ts`)
- Same Zustand shape as web
- `persist` middleware using `expo-secure-store` as the storage adapter

### City Constants (`src/constants/cities.ts`)
- Identical to web — copy the same array with `{ name, lat, lng }`

---

## Native-Specific Requirements

### Permissions (add to `app.json`)
```json
{
  "expo": {
    "plugins": [
      ["expo-location", {
        "locationAlwaysAndWhenInUsePermission": "MoveMate needs your location to show your position on the map during trips.",
        "locationAlwaysPermission": "MoveMate needs background location so the driver can be tracked during a trip."
      }],
      ["expo-notifications", {
        "icon": "./assets/notification-icon.png",
        "color": "#22c55e"
      }],
      ["expo-image-picker", {
        "photosPermission": "MoveMate needs photo access to upload your documents.",
        "cameraPermission": "MoveMate needs camera access for your selfie."
      }]
    ]
  }
}
```

### Push Notifications
- On login success: `expo-notifications.getExpoPushTokenAsync()` or `getFCMTokenAsync()`
- Register token via `PATCH /users/device-token` (add this endpoint to backend if missing)
- Handle foreground + background notification tap → deep link to correct screen

### Deep Linking
```json
{
  "expo": {
    "scheme": "movemate",
    "android": { "intentFilters": [{ "action": "VIEW", "data": [{ "scheme": "movemate" }] }] }
  }
}
```
Link map: `movemate://trip/:id`, `movemate://tracking/:tripId`, `movemate://bookings`

### Background Location (Android)
- Define task in `App.tsx` using `expo-task-manager`:
```typescript
TaskManager.defineTask('LOCATION_TASK', ({ data }) => {
  const { locations } = data
  socket.emit('location:update', { tripId, lat: locations[0].coords.latitude, lng: locations[0].coords.longitude, senderId: userId })
})
```

### Razorpay Integration
```typescript
import RazorpayCheckout from 'react-native-razorpay'

const options = {
  description: 'MoveMate trip booking',
  currency: 'INR',
  key: process.env.EXPO_PUBLIC_RAZORPAY_KEY,
  amount: order.amount,
  order_id: order.id,
  name: 'MoveMate',
  prefill: { contact: user.phone },
  theme: { color: '#22c55e' },
}
RazorpayCheckout.open(options)
  .then((data) => verifyPayment(data))
  .catch(() => showError('Payment cancelled'))
```

---

## Color Palette (mirror web exactly)

```
Primary green:     #22c55e  (green-500)
Dark green hover:  #16a34a  (green-600)
Light green bg:    #f0fdf4  (green-50)
Slate text:        #0f172a  (slate-900)
Muted text:        #64748b  (slate-500)
Border:            #e2e8f0  (slate-200)
Background:        #f8fafc  (slate-50)
White card:        #ffffff
Red error:         #ef4444  (red-500)
Amber warning:     #f59e0b  (amber-500)
Purple admin:      #a855f7  (purple-500)
```

---

## Environment Variables (`.env`)

```
EXPO_PUBLIC_API_URL=http://192.168.x.x:3000/api
EXPO_PUBLIC_SOCKET_URL=http://192.168.x.x:3000
EXPO_PUBLIC_RAZORPAY_KEY=rzp_test_xxxxxxxxxxxxxxxx
```

Use your local machine's LAN IP (not `localhost`) so the physical device can reach the backend.

---

## Build Order

1. Scaffold — `npx create-expo-app movemate --template blank-typescript`
2. Install all dependencies listed in Tech Stack table
3. Configure `app.json` — name, slug, scheme, permissions, plugins
4. Set up navigation skeleton (RootNavigator + tabs + auth stack)
5. Build API service + auth store + SecureStore persistence
6. Auth screens (Login → VerifyOtp → save tokens → navigate to Main)
7. Search + TripDetail + Payment (core passenger flow)
8. Bookings screen + BookingCard + RatingSheet
9. CreateTrip screen + vehicle management
10. MyTrips screen
11. TrackingScreen — map + location sharing + OSRM route + chat + OTP start
12. VerifyDriverScreen — document upload wizard
13. ProfileScreen + Admin screen
14. Push notifications — register token on login, handle taps
15. Background location task
16. Deep linking
17. Polish — loading skeletons, error states, empty states, pull-to-refresh on all lists

---

## Backend API Reference

All endpoints are identical to the web. Same NestJS backend, same JWT auth. Key endpoints:

| Method | Path | Used by |
|---|---|---|
| POST | `/auth/send-otp` | Login |
| POST | `/auth/verify-otp` | OTP verify |
| POST | `/auth/refresh` | Token refresh |
| GET | `/trips/search` | Search screen |
| GET | `/trips/:id` | Trip detail |
| POST | `/trips` | Create trip |
| GET | `/trips/my-trips` | My trips |
| POST | `/trips/:id/start` | OTP start trip |
| PATCH | `/trips/:id` | Update/end trip |
| GET | `/bookings/my-bookings` | Bookings screen |
| POST | `/payments/create-order` | Payment |
| POST | `/payments/verify` | Payment verify |
| GET | `/driver-verification/my-status` | Verification status |
| POST | `/driver-verification/upload` | Doc upload |
| POST | `/driver-verification/aadhaar` | Aadhaar save |
| POST | `/driver-verification/submit` | Submit for review |
| GET | `/driver-verification/admin/requests` | Admin list |
| PATCH | `/driver-verification/admin/approve/:id` | Admin approve |
| PATCH | `/driver-verification/admin/reject/:id` | Admin reject |
| POST | `/ratings` | Submit rating |

Socket events (Socket.IO):
- `join:trip` — join trip room
- `location:update` — emit/receive `{ tripId, lat, lng, senderId }`
- `chat:message` — emit/receive `{ tripId, senderId, senderName, message }`
- `typing` — emit/receive `{ tripId, senderId, senderName, isTyping }`
- `trip:started` — broadcast when driver starts
- `trip:ended` — broadcast when trip ends
