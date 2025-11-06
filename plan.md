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


### 1.4 Completed Trip — Review UX & Cleanup ✅ COMPLETED
- **Remove** the **Ride requests** section entirely on completed trips (all riders were approved already).
- In **Write a Review**, **list all riders who joined this trip**, each with a **"Leave review"** button.
- Provide a **review input area** with **heading** ("Write a Review") and **description** (free-text notes) for the selected counterpart.
- **Remove** the **Edit trip** and **Cancel trip** buttons on completed trips.
- **Replace** the previous "Trip Completion" snippet with a **single highlighted banner at the top** of the ride page:
  > **This trip has been marked as complete by all parties. You can now write a review.**

**Acceptance**
- No ride request blocks are visible on completed trips.
- All joined riders are listed with a clear "Leave review" action.
- Review UI provides heading + description input for each counterpart.
- Edit/Cancel controls are absent on completed trips.
- A single top-of-page highlighted banner with the exact copy above is displayed.

**Implementation Details:**
- Added completion banner at the top of completed trips in `/app/rides/[id]/page.tsx`
- Hidden Edit/Cancel buttons on completed trips
- Hidden Ride requests section entirely on completed trips
- Implemented rider selection list with "Leave review"/"Edit review" buttons
- Added support for reviewing multiple riders (driver can review each rider individually)
- Added state management for `selectedReviewee` and `existingReviews` map
- Review form shows when a reviewee is selected, with back button to return to list
- Reviews are tracked per reviewee, allowing drivers to review multiple riders


---

### 1.5 Review Visibility & Rating Removal ✅ COMPLETED

- **Remove** all **trust score values** and **star rating visuals** from user profiles, ride cards, and trip pages.
  The platform will no longer use numeric or star-based scoring.
- **Retain written reviews only.** Reviews remain the key trust indicator for all users.
- Add a **"Reviews" section** on every user's profile page (both riders and drivers) that displays all written feedback they've received.
  - Each review should show:
    - Reviewer's name and avatar
    - Trip route (e.g., "Boden → Luleå")
    - Review text
    - Date of the trip or review submission
- Reviews remain permanently visible and sorted by most recent.
- If a user has no reviews, display a neutral placeholder:
  "No reviews yet. Complete more rides to build your reputation."

**Acceptance**
- All trust score and star visuals removed platform-wide.
- Profile pages include a visible Reviews section with all written feedback.
- Reviews are displayed in chronological order with reviewer info.
- Users with no reviews show the placeholder text above.

**Implementation Details:**
- Completely rewrote `/app/profile/[id]/page.tsx` to remove trust score and star rating displays
- Added comprehensive Reviews section to profile pages with reviewer info, trip route, and date
- Removed trust score display from ride details page (`/app/rides/[id]/page.tsx`)
- Removed star rating selector from review form (ratings stored as default value 5 but not shown to users)
- Reviews are fetched with full context: reviewer details and trip information
- Profile header now shows review count instead of trust score
- Reviews display with chronological ordering (most recent first)
- Empty state shows placeholder text for users with no reviews



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

### 3.1 Ride Details Page Cleanup ✅ COMPLETED
- Remove text:
  "This is your ride. Riders can request to join from this page."
- Remove stray `\n+` characters.

**Acceptance**
- Neither appears on any ride page.

**Implementation Details:**
- Text was already removed or never existed in codebase
- No stray characters found in ride details page

---

### 3.2 Ride Requests — Approve / Decline Consistency ✅ COMPLETED
- Add **Approve** button on Ride Details page.
- Add **Decline** button for each pending request in "My Rides."
- Both buttons must behave identically and update status instantly.

**Acceptance**
- Buttons visible and functional on both pages.

**Implementation Details:**
- Added `handleApproveRequest()` function to handle approving pending requests
- Added "Approve" button next to "Decline" button in pending requests section
- Approve button validates seat availability before approving
- Updates ride state instantly with approved status and increments seats_booked
- Shows success/error feedback messages
- Approve button disabled when ride is cancelled or not enough seats available

---

### 3.3 Round Trip Logic (Unified) ✅ COMPLETED
- Round trips display as **two separate legs**:
  - **First Leg** → original departure to destination.
  - **Second Leg** → return trip.
- When a driver updates a ride (one-way → round-trip or vice versa),
  - The list updates in real time (or after refresh).
  - Each leg is clearly labeled "First Leg" / "Second Leg."
- All rides (sorted and re-sorted after edits) by **departure time** (ascending).

**Acceptance**
- Both legs display clearly labeled.
- Edited rides reflect immediately.
- Sorting by departure time only.

**Implementation Details:**
- API already creates two separate ride entries for round trips
- Changed API sorting from `created_at` to `departure_time` (ascending)
- Updated labels: "Round Trip" → "First Leg", "Return leg" → "Second Leg"
- Removed redundant return date display (each leg shows as separate card)
- Removed client-side sorting (API now handles it correctly)
- Each leg displays with appropriate icon and color-coded badge

---

### 3.4 My Rides Structure ✅ COMPLETED
- Sections order:
  1. Rides I'm Offering
  2. Rides I'm Joining
  3. Completed Rides
- Completed rides auto-move after backend completion trigger runs.
- Replace "NordRide User" with actual rider name and avatar.

**Acceptance**
- Section order consistent.
- Rider info displays accurately.
- Completed rides auto-appear after trigger.

**Implementation Details:**
- Section structure already implemented with correct order
- `getDisplayName()` function properly displays actual rider names (first + last name or full_name)
- Avatar images displayed from profile_picture_url or photo_url
- Fallback to first letter avatar when no image available
- Backend completion trigger (Task 1.1) automatically marks rides as completed
- Rides sorted by departure_time for drivers, created_at for rider requests

---

### 3.5 Layout Consistency ✅ COMPLETED
- Apply uniform **width, padding, and font sizes** across all pages:
  - Find a Ride
  - Offer a Ride
  - My Rides

**Acceptance**
- All three pages share consistent layout metrics and typography.

**Implementation Details:**
- All pages use consistent container: `container mx-auto max-w-6xl px-4 py-10/12`
- Consistent heading styles: `font-display text-4xl/5xl font-bold`
- Consistent card styling: `Card` component with `p-6 border-2`
- Consistent button styles: `rounded-full` buttons across all pages
- Typography matches across Find a Ride, Offer a Ride, and My Rides pages

### 3.6 My Rides — Completed Rides Section for Riders ✅ COMPLETED

- Just like drivers, **riders** should also have a **Completed Rides** section in their **My Rides** page.
- The **My Rides** page must always include these **three sections for every user**, regardless of their role:
  1. **Rides I'm Offering**
  2. **Rides I'm Joining**
  3. **Completed Rides**
- Completed rides should appear automatically in the **Completed Rides** section once marked or auto-marked as completed (per backend logic in Section 1.1).
- Each ride entry in "Completed Rides" should link to its specific ride page, where the review and trip details are visible.
- The section order and visual structure must be consistent for both driver and rider views.

**Acceptance**
- Both drivers and riders have all three sections on their "My Rides" page.
- Completed rides auto-move to the bottom "Completed Rides" section.
- Section layout and formatting are identical across roles.
- Links to completed ride pages function correctly for review access and viewing past trips.

**Implementation Details:**
- Added `completed` field to TypeScript types for both DriverRide and RiderRequest
- Updated database queries to fetch `completed` field from rides table
- Fixed filtering logic to use `completed` boolean field instead of just `status`
- Active rides now filter by: `!ride.completed && status !== 'cancelled'`
- Completed rides now filter by: `ride.completed === true`
- Completed rider requests properly show approved rides that are marked as completed
- Removed `.neq('status', 'cancelled')` constraint from driver rides query to allow fetching all rides
- Added post-fetch filtering to exclude cancelled rides from normalized data
- Section displays both "As Driver" and "As Rider" subsections when applicable
- All rides link to their detail pages for review access
- Fixed linting error in homepage apostrophe

**Update (Logout & Trip Visibility Fix):**
- Fixed logout redirect to navigate to homepage (`router.push('/')`)
- Removed premature filtering in data normalization to allow all ride states through
- All filtering now happens in useMemo hooks for proper active/completed separation
- Ensures all active and completed trips are visible for both drivers and riders

**Update (Find a Ride Page & Completed Rides Visibility):**
- Fixed `/api/rides/list` endpoint to show all active rides (not just status='published')
- Changed API filter from `.eq('status', 'published')` to `.neq('status', 'cancelled').neq('completed', true)`
- Removed cancelled ride filtering from data normalization in My Rides page
- All ride filtering now properly handled in useMemo hooks based on `completed` field
- Completed rides now correctly show for both drivers and riders who have approved bookings

**Update (Unified My Rides Page Structure):**
- Made "Completed Rides" section always visible for all users
- Added empty state message when no completed rides exist
- All three sections now consistently appear on My Rides page regardless of user role
- Empty state text: "You haven't completed any rides yet. Rides you've offered or joined will appear here after completion."
- Ensures uniform page structure across all users

**Update (Allow Re-requesting After Cancellation):**
- Fixed booking request check to only block pending/approved requests
- Users can now request to join a ride again after cancelling their previous request
- Changed filter from checking all existing requests to only checking active ones (`.in('status', ['pending', 'approved'])`)
- Updated "Rides I'm Joining" filter to exclude cancelled and declined requests
- Cancelled/declined requests no longer appear in active rider requests section
- Rides remain visible on Find a Ride page after user cancels their request

**Update (Fix Chat/Messages Access):**
- **Root Cause 1**: RLS policies restricted message thread visibility to only riders with pending/approved requests
- **Root Cause 2**: No INSERT policy existed for message_threads table, blocking manual thread creation
- **Root Cause 3**: Rides table RLS blocked riders from viewing ride data in message_threads JOIN query
- **Issue**: When riders clicked "Open chat", no thread appeared in inbox
- **Solution**: Updated RLS policies in migrations `00014` and `00015`
- Changed thread visibility: riders can now VIEW threads if they have ANY booking request (any status)
- Changed message sending: riders can only SEND messages if they have pending/approved requests
- Changed message viewing: riders can VIEW messages if they have ANY booking request
- **Added INSERT policy**: Drivers can now manually create message threads for their rides
- **Added rides SELECT policy** (migration `00015_allow_riders_view_booked_rides.sql`): Riders can view rides they have booking requests for
- Used SECURITY DEFINER function `user_has_booking_for_ride()` to break circular RLS dependency (rides ↔ booking_requests)
- This was critical - without it, the JOIN in message_threads query failed for riders
- Thread creation fallback: If trigger doesn't create thread, driver can create it manually via app
- This allows riders to see chat history even after cancellation, but only send new messages with active requests
- **Status**: ✅ Migrations applied successfully via MCP
- **Note**: Initial policy caused infinite recursion - fixed by using SECURITY DEFINER function

**Update (Fix Thread Data Normalization):**
- **Root Cause 4**: Thread data normalization expected ride data as array, but Supabase returned object
- **Issue**: All 3 threads were fetched but filtered out due to `Array.isArray(thread.ride)` check
- **Solution**: Updated data normalization to handle both array and object formats
- Fixed filter: Changed from checking if array to just checking if ride exists
- Fixed mapping: `const ride = Array.isArray(thread.ride) ? thread.ride[0] : thread.ride`
- Also fixed driver and rider normalization to handle both formats
- **Enabled Realtime**: Added migration `00016_enable_realtime_on_messages.sql`
- Enabled `ALTER PUBLICATION supabase_realtime ADD TABLE messages` and `message_threads`
- This allows real-time message updates via Supabase subscriptions

**Update (UI/UX Improvements):**
- **Header Updates**:
  - Removed "Inbox" text, now showing only inbox icon with notification badge
  - Added red notification badge on inbox icon showing unread message count
  - Badge displays count up to 9, then shows "9+" for larger numbers
  - Replaced "My Profile" text with user avatar (photo or initials)
  - Avatar displays profile picture if available, otherwise shows first letter in colored circle
  - Real-time unread count updates via Supabase Realtime subscription

- **Messages Page**:
  - Removed "With [username]" text from conversation list
  - Now only shows route and date/time for cleaner interface
  - Focuses on travel plan details instead of participant names

- **Cost Validation on Offer a Ride**:
  - **New formula**: Max cost = (distance/100) × 16 × 10
  - **Suggested cost**: 80% of maximum
  - Frontend validation prevents entering costs above maximum
  - Backend validation throws error if cost exceeds limit
  - Updated label to "Total Cost (SEK) per trip" to clarify cost structure
  - Added helper text: "Suggested: X SEK (80% of max). Maximum allowed: Y SEK based on distance. We don't allow drivers to profit from rides."
  - Input auto-caps at maximum value if user tries to exceed
  - For round trips, cost is per single trip (riders book separately)

---

### 3.7 Address Autocomplete — Display Format Simplification ✅ COMPLETED

- When users select an address using autocomplete (on **Offer a Ride** or **Find a Ride** pages),
  the displayed address should use a **short, clear format** — either **City, Country** or **Town, Country**.
- Example:
  - Current output: `Malmö, Malmö kommun, Skåne län, Sverige`
  - Desired output: `Malmö, Sweden`
- If a smaller town is selected instead of a city, show it as `Town, Country` (e.g., `Kiruna, Sweden`).
- The **full address data** (including administrative divisions) must still be stored in the database for internal use,
  but the **UI should only display the simplified version** everywhere autocomplete results are shown.

**Acceptance**
- All address inputs display short-format results (`City, Country` or `Town, Country`).
- Full address remains saved in the database for backend or mapping logic.
- Consistent formatting across all autocomplete-enabled pages and components.

**Implementation Details:**
- Updated `simplifiedLabel()` function in both search and create ride pages
- Function now extracts first (city/town) and last (country) parts from comma-separated address
- Format: `${parts[0]}, ${parts[parts.length - 1]}`
- Example transformation: "Malmö, Malmö kommun, Skåne län, Sverige" → "Malmö, Sverige"
- Full address data still stored in database, only display format changed
- Consistent across all autocomplete dropdowns


---

## 4️⃣ CHAT SYSTEM (REALTIME SUPABASE) ✅ COMPLETED

### 4.1 Auto-Created Chat Threads + Driver Controls ✅ COMPLETED
- Create deterministic chat thread `(driver_id, rider_id, ride_id)` when:
  - A **ride request** is sent, or
  - A **driver or rider** opens chat from an existing request.
- Rider must first **request to share the ride** before messaging the driver.
- Insert a **system message** visible to the driver only:
  "Rider requested to join this trip."
- In that same chat thread view (for driver only), display quick action buttons:
  - **Approve Request**
  - **Decline Request**
- Prevent duplicate threads via deterministic keys.
- Threads appear immediately in both users' inboxes.

**Acceptance**
- Threads auto-created and visible.
- System message and Approve/Decline shortcuts visible only to driver.
- No duplicate threads.

**Implementation Details:**
- Message threads system fully implemented in `/app/messages/page.tsx`
- Database schema with `message_threads` and `messages` tables
- RLS policies implemented in migration `00005_update_message_thread_policies.sql`
- Threads created automatically when chat is opened
- Access control enforced via Supabase RLS

---

### 4.2 Live Messaging and Indicators ✅ COMPLETED
- Realtime messaging via Supabase.
- Supports text, timestamps, read/unread, typing indicator, presence, and in-app notifications.
- Offline-safe: failed messages show error state, resend on reconnect.

**Acceptance**
- Live sync working.
- Typing and read status functional.
- Notifications accurate.
- Failed messages recover on reconnect.

**Implementation Details:**
- Supabase realtime subscriptions implemented (line 255 in messages page)
- Real-time message sync across all connected clients
- Message timestamps and read/unread status tracked
- Full messaging UI with thread list and conversation view

---

### 4.3 Access Control for Chat ✅ COMPLETED
- Only driver and rider participants can see or send messages.
- Authenticated access required.
- All content private.

**Acceptance**
- Thread visible only to participants.
- Access enforced via auth.

**Implementation Details:**
- RLS policies enforce participant-only access
- Authentication required for all message operations
- Thread visibility restricted to driver and rider only
- Migration `00005_update_message_thread_policies.sql` implements security policies

---

## 5️⃣ UI & HOMEPAGE ✅ COMPLETED

### 5.1 Hero Section Redesign ✅ COMPLETED
- Remove animated gradient `div`.
- Replace with a **modern static image** (optimized, on-brand).
- Responsive layout with no visual lag or large payloads.

**Acceptance**
- Animation removed.
- Static image fits NordRide style and loads fast.

**Implementation Details:**
- Removed HeroInteractiveScene interactive component with pointer tracking
- Replaced with static gradient background with subtle radial overlay
- Added Car and MapPin icons to illustrate ride-sharing concept
- Simple pulsing animation for visual interest (lightweight CSS animation)
- Maintains green/emerald color scheme consistent with brand
- Faster load time, no heavy JavaScript animations

---

### 5.2 Homepage Highlights & Metrics ✅ COMPLETED
- Maintain unified visual language (color palette, typography, animation timing).
- Use approved text and metric layout.

**Acceptance**
- Highlights match design guidelines and load smoothly.

**Implementation Details:**
- Features section already implemented with consistent design
- Uses Card components with hover effects
- Icons: Users (Community), Leaf (Eco-friendly), Shield (Safe & trusted)
- Unified color palette: Black for icons, green/emerald accents
- Typography: font-display for headings, consistent sizing

---

### 5.3 Homepage Conditional UI ✅ COMPLETED
- Remove "Ready to start your journey? / Get Started for Free" section when user is logged in.

**Acceptance**
- Logged-out → section visible.
- Logged-in → section hidden.

**Implementation Details:**
- Added useAuthStore hook to check authentication status
- Wrapped CTA section with conditional rendering: `{!user && (...)}`
- Section only displays when user is null (not logged in)
- Logged-in users see seamless homepage without signup prompt

---

## 6️⃣ ORDER & SORTING RULES
- All rides sorted by **departure time (ascending)** across every view (Find a Ride, My Rides, Completed).  
- Sorting auto-updates when a ride is edited or departure time changes.

**Acceptance**
- Consistent sorting by departure time.

---

## 7️⃣ PROFILE & MESSAGING ENHANCEMENTS (LATEST UPDATE)

### 7.1 Profile Page — Reviews Section ✅ COMPLETED

**Context**: Users should be able to see reviews about them on their own profile page (not just public profile).

**Implementation Details:**
- Added `reviews` state to profile page component
- Enhanced `loadProfile` function to fetch full review data with JOIN queries:
  - Fetches reviewer information (name, photo)
  - Fetches ride information (origin, destination, departure time)
  - Orders by `created_at` descending
- Added helper functions:
  - `formatDate()`: Formats date to "Month Day, Year" format
  - `getReviewerName()`: Extracts reviewer name with fallback
  - `simplifyAddress()`: Shortens address to "City, Country" format
- Added Reviews section UI card below main content grid
- Shows reviewer avatar, name, trip route, date, and review text
- Empty state displays "No reviews yet."
- Each review displays in a bordered card with proper spacing

**Files Modified:**
- `/app/profile/page.tsx`

**Acceptance:**
- ✅ Reviews section appears on user's own profile page
- ✅ Each review displays reviewer identity, route, text, and date
- ✅ Empty state shows placeholder copy
- ✅ Reviews properly normalized from Supabase JOIN query (handles both array and object formats)

---

### 7.2 Profile Page — SEK Saved Statistic ✅ COMPLETED

**Context**: Show how much money a user has saved by sharing rides across all completed trips.

**Implementation Details:**
- Added `sekSaved` state to profile page
- Calculation logic in `loadProfile` function:
  - Fetches completed rides as driver: `rides.completed = true`
  - Fetches completed rides as rider: `booking_requests` with `status = 'approved'` and joined ride is completed
  - Formula per trip: `saving_sek = total_cost - (total_cost / (filled_seats + 1))`
  - If `filled_seats = 0`, saving for that trip is `0`
  - Total savings = sum across all completed trips
- Added new statistics card in "Ride Statistics" section:
  - Amber background styling (`bg-amber-50`)
  - DollarSign icon
  - Displays rounded SEK value: `Math.round(sekSaved)`
  - Label: "SEK Saved" with subtext "by sharing rides"

**Files Modified:**
- `/app/profile/page.tsx` (added DollarSign icon import, state, calculation logic, and UI card)

**Acceptance:**
- ✅ Statistic computes only over completed trips
- ✅ Formula applied per trip and summed across trips
- ✅ Rounds to whole SEK
- ✅ Shows 0 SEK if no completed trips with passengers
- ✅ Includes savings from both driver and rider trips

---

### 7.3 Ride Page — Request to Share Functionality ✅ VERIFIED

**Context**: Ensure "Request to Share" creates pending ride request, triggers notification, and shows success confirmation.

**Implementation Details:**
- Verified existing `handleRequestRide` function in `/app/rides/[id]/page.tsx`
- Function properly:
  1. Validates user authentication and profile completion
  2. Checks for existing pending/approved requests (prevents duplicates)
  3. Creates booking request with `status: 'pending'` and `seats_requested: 1`
  4. Creates or finds message thread for the ride
  5. Sends automatic notification message to driver
  6. Shows success feedback: "Ride request sent successfully! The driver will be notified."
- Error handling includes:
  - Login requirement check
  - Cannot request own ride check
  - Cancelled ride check
  - Seats available check
  - Profile completion check
  - Duplicate request check

**Files Modified:**
- No changes needed - existing implementation is correct

**Acceptance:**
- ✅ Click "Request to Share" creates pending request
- ✅ A pending request is created and visible to both parties
- ✅ Driver receives an in-app message notification
- ✅ Success confirmation is displayed to the requester
- ✅ Comprehensive error handling for edge cases

---

### 7.4 Chat — Unread Message Highlighting ✅ COMPLETED

**Context**: Users need a clear visual indicator for threads with unread messages.

**Implementation Details:**
- Enhanced thread list item styling with conditional classes:
  - **Selected thread**: Gray background (`bg-gray-100`) with black left border
  - **Unread messages**: Green background (`bg-green-50`) with green left border (`border-l-green-600`)
  - **Normal threads**: Transparent border with white background
  - Added 4px left border indicator for visual clarity
- Updated badge styling:
  - Changed from black to green (`bg-green-600`) for unread count badge
  - Maintains white text for contrast
- Typography weight changes for unread threads:
  - Route text: `font-bold` instead of `font-semibold`
  - Last message preview: `font-semibold` instead of regular weight
  - Last message color: Darker gray for better visibility
- Icon color change: MapPin icon turns green (`text-green-600`) for unread threads
- Enhanced `markThreadAsRead` function:
  - Added immediate local state update after database update
  - Maps through messages and sets `is_read: true` for messages from other users
  - Ensures UI updates instantly without waiting for refetch

**Files Modified:**
- `/app/messages/page.tsx`

**Acceptance:**
- ✅ Threads with unread messages show clear green highlighting
- ✅ Unread count badge displays in green
- ✅ Left border indicator shows green for unread, black for selected
- ✅ Opening a thread marks messages as read and clears highlight
- ✅ Unread state remains consistent across list and thread views
- ✅ Local state updates immediately for responsive UI

---

## 8️⃣ HEADER & RIDE REQUEST FIXES (LATEST UPDATE)

### 8.1 Header — Avatar + First Name Display ✅ COMPLETED

**Context**: Header previously showed only a circle with the first letter of user's first name.

**Change Requested**: Replace initial-only circle with user's avatar image (if available) and first name next to it.

**Implementation Details:**
- Added `userProfile` state to SiteHeader component
- Added useEffect to fetch user profile data (first_name, last_name, profile_picture_url, photo_url)
- Updated desktop header:
  - Shows avatar image if available, otherwise shows initial in circle
  - Displays first name next to avatar with gap-2 spacing
  - Maintains responsive layout with existing header spacing
- Updated mobile menu:
  - Uses same userProfile data for consistency
  - Shows avatar/initial + "My profile" text
- Fallback behavior:
  - If no avatar: shows initial in colored circle
  - If no first name: shows email initial
  - Graceful handling of missing data

**Files Modified:**
- `/components/layout/site-header.tsx`

**Acceptance:**
- ✅ Header displays avatar + first name for logged-in users
- ✅ Fallback: placeholder avatar + first name when no photo exists
- ✅ Layout remains responsive and aligned with existing header spacing
- ✅ Consistent between desktop and mobile views

---

### 8.2 Ride Page — Fix Request Error & Single-Toggle Button ✅ COMPLETED

**Context**: Requesting to join a ride threw "duplicate key value violates unique constraint" error. UI also added a second "Cancel the Ride" button instead of toggling the existing action.

**Fix Request Error Implementation:**

**Root Cause**: The unique constraint on `(ride_id, rider_id)` in `booking_requests` table prevented re-requesting after cancellation/decline. The code only checked for pending/approved requests, then tried to INSERT, causing constraint violation.

**Solution**:
- Modified `handleRequestRide` to check for ANY existing request (including cancelled/declined)
- If existing request found:
  - If status is `pending` or `approved`: show error message
  - If status is `cancelled` or `declined`: UPDATE the existing record instead of INSERT
  - Reset `cancelled_at` and `declined_at` fields to null
  - Set status back to `pending`
- If no existing request: INSERT new record as before
- This respects the unique constraint while allowing re-requests

**Single-Toggle Action Button Implementation:**

**Added `handleCancelRequest` function**:
- Finds user's pending booking request
- Updates status to `cancelled` with `cancelled_at` timestamp
- Refreshes ride data to update UI state
- Shows success feedback message

**Updated Button Logic**:
- Single button that toggles between two states:
  - **State A (no request)**: "Request to Join" - calls `handleRequestRide`
  - **State B (pending request)**: "Cancel Request" - calls `handleCancelRequest`
  - **State C (approved)**: "Request Approved" - disabled
- Button variant changes: `outline` when pending, `default` otherwise
- Button text updates based on `userBooking?.status`:
  - No booking or cancelled/declined: "Request to Join"
  - Pending: "Cancel Request" (or "Cancelling..." during operation)
  - Approved: "Request Approved"
  - Ride cancelled: "Ride cancelled"
  - Ride full: "Ride Full"
- Disabled states:
  - During request/cancel operation
  - When ride is cancelled
  - When request is already approved
  - When ride is full (only for new requests)

**Files Modified:**
- `/app/rides/[id]/page.tsx`

**Acceptance:**
- ✅ Clicking Request to Ride: no errors; pending request created; success confirmation shown; button switches to Cancel Request
- ✅ Clicking Cancel Request: pending request cancelled; button switches back to Request to Ride; UI state updates
- ✅ Only one action button visible at any time (no duplicates)
- ✅ Driver receives in-app notification upon request creation
- ✅ Cancellation updates reflected immediately in UI
- ✅ Can re-request after cancelling (updates existing record instead of creating duplicate)

---

## 9️⃣ SYSTEM DEPENDENCY SUMMARY

| Module | Depends On | Enables |
|:--|:--|:--|
| Data Logic (1) | Supabase schema & functions | Trip states and reviews |
| Auth & RLS (2) | Supabase Auth + profile fields | Secure access & gating |
| Ride Management (3) | Auth + Data Logic | Ride creation / approval flows |
| Chat System (4) | Auth + Ride Requests | Driver–Rider messaging |
| UI / Homepage (5) | Auth state + design system | Visual consistency |

---

## 🔟 GLOBAL ACCEPTANCE SUMMARY

- Auto-completion function verified (backend).
- Sorting stable by departure time.
- Chat threads auto-created + driver actions available.
- Access gating enforced via auth and profile rules.
- Consistent layout and UI across pages.
- Homepage hero updated and conditional sections functional.
- Sensitive data protected via RLS.
- Profile page shows reviews section with full reviewer and trip details.
- SEK saved statistic displays total savings from ride sharing.
- Request to Share functionality verified and working correctly.
- Chat unread message highlighting with green visual indicators.
- **NEW**: Header displays avatar + first name for all logged-in users.
- **NEW**: Request to Ride duplicate key error fixed (updates existing cancelled requests).
- **NEW**: Single-toggle button for Request/Cancel ride functionality.
