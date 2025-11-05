# 🧭 NORDRIDE — PLAN.md

---

## 1️⃣ DATA MODEL & BACKEND LOGIC

### 1.1 Trip Auto-Completion Logic (Backend Trigger) ✅ COMPLETED

The example trip between **Boden → Luleå** already exists and, by the time the backend function is deployed, more than 5 hours will have passed since its recorded arrival time.
The auto-completion function must therefore **evaluate every trip's status on a recurring basis** and update it automatically once the completion conditions are met.

**Completion Rules**

A trip becomes `completed = true` when **any** of the following conditions are satisfied:

1. The **driver** and **all riders** have manually marked the trip as completed.
2. **≥ 5 hours** have passed since the recorded arrival time.

**Implementation Logic (Supabase Function or Trigger)**

- The backend should periodically run a **scheduled function** (every 30–60 min) to:
  1. Identify trips whose `arrival_time + 5h < now()` and `completed = false`.
  2. Automatically set `completed = true`.
  3. Move those trips into the **Completed Rides** section for both driver and riders.
- Manual completions by both parties also trigger the same state update instantly.
- Once a trip's `completed = true`, related reviews become **visible** to all participants.

**Acceptance**
- Backend function updates overdue trips automatically without manual action.
- Manual or auto completion both mark trip = completed.
- Completed trips immediately appear under "Completed Rides."
- Reviews unlock only after trip completion.

**Implementation Details:**
- Created migration `00013_add_trip_auto_completion.sql`
- Added `arrival_time` and `completed` columns to rides table
- Created `auto_complete_trips()` function to handle automatic completion
- Created `check_manual_completion()` trigger function for manual completions
- Enabled pg_cron extension and scheduled job to run every 30 minutes
- Reviews automatically become visible when trip is marked as completed

---

### 1.2 Trust Score Display ✅ COMPLETED
- Show dash "–" if trust score = 0 or undefined.
- Display numeric score only once a review exists.

**Acceptance**
- 0 → "–"
- ≥ 1 review → numeric value.

**Implementation Details:**
- Updated `/app/profile/[id]/page.tsx` to show "–" when trustScore is 0 or averageRating is null
- Updated `/app/rides/[id]/page.tsx` to show "–" when driver trust_score is 0 or null
- Trust scores now only display numeric values when there are actual reviews

---

### 1.3 Rider Removal Feedback ✅ COMPLETED
- When a driver removes a rider, display:
  "**Rider is removed from this trip.**"
- Auto-dismiss after 3 seconds.

**Acceptance**
- Message displays once and disappears after 3 s.

**Implementation Details:**
- Already implemented in `/app/rides/[id]/page.tsx` line 499
- Feedback message shows: "Rider is removed from this trip."
- Auto-dismisses after 3 seconds via useEffect hook (lines 202-210)

---

## 2️⃣ AUTH & ACCESS CONTROL / PRIVACY

### 2.1 Role-Based Access Logic
- **Anonymous users**  
  - Can view **ride snippets** only (departure, destination, date, price).  
  - Clicking a ride redirects to a **Login / Sign-Up** page explaining that full details require authentication.
- **Logged-in users with incomplete profiles**  
  - Can view ride details.  
  - Cannot offer or request rides until profile completion.
- **Logged-in + profile-complete users**  
  - Full access to create, request, and chat.

**Profile Completion Includes**
- Profile picture  
- Verified email  
- At least one language  
- (Drivers) At least one vehicle

**Acceptance**
- Anonymous → list only + login prompt.  
- Logged-in incomplete → details only (no actions).  
- Logged-in complete → full functionality.

---

### 2.2 Restricted Data Access & RLS
- Driver-sensitive fields (name, photo, vehicle plate) visible only to authenticated and profile-complete users.  
- Enforce via Supabase RLS policies.

**Acceptance**
- Unauthorized users cannot access sensitive fields.  
- RLS active and verified.

---

### 2.3 Codebase Security
- Private Git repository.  
- Secrets stored only in Vercel environment variables.  
- No hardcoded credentials.

**Acceptance**
- Repo = private.  
- Env vars configured.  
- No exposed keys.

---

## 3️⃣ RIDE MANAGEMENT (FRONTEND + LOGIC)

### 3.1 Ride Details Page Cleanup
- Remove text:  
  “This is your ride. Riders can request to join from this page.”  
- Remove stray `\n+` characters.

**Acceptance**
- Neither appears on any ride page.

---

### 3.2 Ride Requests — Approve / Decline Consistency
- Add **Approve** button on Ride Details page.  
- Add **Decline** button for each pending request in “My Rides.”  
- Both buttons must behave identically and update status instantly.

**Acceptance**
- Buttons visible and functional on both pages.

---

### 3.3 Round Trip Logic (Unified)
- Round trips display as **two separate legs**:  
  - **First Leg** → original departure to destination.  
  - **Second Leg** → return trip.  
- When a driver updates a ride (one-way → round-trip or vice versa),  
  - The list updates in real time (or after refresh).  
  - Each leg is clearly labeled “First Leg” / “Second Leg.”  
- All rides (sorted and re-sorted after edits) by **departure time** (ascending).

**Acceptance**
- Both legs display clearly labeled.  
- Edited rides reflect immediately.  
- Sorting by departure time only.

---

### 3.4 My Rides Structure
- Sections order:  
  1. Rides I’m Offering  
  2. Rides I’m Joining  
  3. Completed Rides  
- Completed rides auto-move after backend completion trigger runs.  
- Replace “NordRide User” with actual rider name and avatar.

**Acceptance**
- Section order consistent.  
- Rider info displays accurately.  
- Completed rides auto-appear after trigger.

---

### 3.5 Layout Consistency
- Apply uniform **width, padding, and font sizes** across all pages:  
  - Find a Ride  
  - Offer a Ride  
  - My Rides  

**Acceptance**
- All three pages share consistent layout metrics and typography.

---

## 4️⃣ CHAT SYSTEM (REALTIME SUPABASE)

### 4.1 Auto-Created Chat Threads + Driver Controls
- Create deterministic chat thread `(driver_id, rider_id, ride_id)` when:  
  - A **ride request** is sent, or  
  - A **driver or rider** opens chat from an existing request.  
- Rider must first **request to share the ride** before messaging the driver.  
- Insert a **system message** visible to the driver only:  
  “Rider requested to join this trip.”  
- In that same chat thread view (for driver only), display quick action buttons:  
  - **Approve Request**  
  - **Decline Request**  
- Prevent duplicate threads via deterministic keys.  
- Threads appear immediately in both users’ inboxes.

**Acceptance**
- Threads auto-created and visible.  
- System message and Approve/Decline shortcuts visible only to driver.  
- No duplicate threads.

---

### 4.2 Live Messaging and Indicators
- Realtime messaging via Supabase.  
- Supports text, timestamps, read/unread, typing indicator, presence, and in-app notifications.  
- Offline-safe: failed messages show error state, resend on reconnect.

**Acceptance**
- Live sync working.  
- Typing and read status functional.  
- Notifications accurate.  
- Failed messages recover on reconnect.

---

### 4.3 Access Control for Chat
- Only driver and rider participants can see or send messages.  
- Authenticated access required.  
- All content private.

**Acceptance**
- Thread visible only to participants.  
- Access enforced via auth.

---

## 5️⃣ UI & HOMEPAGE

### 5.1 Hero Section Redesign
- Remove animated gradient `div`.  
- Replace with a **modern static image** (optimized, on-brand).  
- Responsive layout with no visual lag or large payloads.

**Acceptance**
- Animation removed.  
- Static image fits NordRide style and loads fast.

---

### 5.2 Homepage Highlights & Metrics
- Maintain unified visual language (color palette, typography, animation timing).  
- Use approved text and metric layout.

**Acceptance**
- Highlights match design guidelines and load smoothly.

---

### 5.3 Homepage Conditional UI
- Remove “Ready to start your journey? / Get Started for Free” section when user is logged in.

**Acceptance**
- Logged-out → section visible.  
- Logged-in → section hidden.

---

## 6️⃣ ORDER & SORTING RULES
- All rides sorted by **departure time (ascending)** across every view (Find a Ride, My Rides, Completed).  
- Sorting auto-updates when a ride is edited or departure time changes.

**Acceptance**
- Consistent sorting by departure time.

---

## 7️⃣ SYSTEM DEPENDENCY SUMMARY

| Module | Depends On | Enables |
|:--|:--|:--|
| Data Logic (1) | Supabase schema & functions | Trip states and reviews |
| Auth & RLS (2) | Supabase Auth + profile fields | Secure access & gating |
| Ride Management (3) | Auth + Data Logic | Ride creation / approval flows |
| Chat System (4) | Auth + Ride Requests | Driver–Rider messaging |
| UI / Homepage (5) | Auth state + design system | Visual consistency |

---

## 8️⃣ GLOBAL ACCEPTANCE SUMMARY

- Auto-completion function verified (backend).  
- Sorting stable by departure time.  
- Chat threads auto-created + driver actions available.  
- Access gating enforced via auth and profile rules.  
- Consistent layout and UI across pages.  
- Homepage hero updated and conditional sections functional.  
- Sensitive data protected via RLS.
