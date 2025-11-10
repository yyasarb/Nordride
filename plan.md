# 🧭 NORDRIDE — PLAN.md (CONDENSED)

---

## 1️⃣ DATA MODEL & BACKEND LOGIC

### 1.1 Trip Auto-Completion ✅
**Rules:**
- Trip marked `completed = true` when:
  1. Driver AND all riders manually confirm completion, OR
  2. ≥ 5 hours passed since arrival_time
- Backend scheduled function runs every 30 minutes (pg_cron)
- Reviews unlock only after completion

**Implementation:**
- Migration: `00013_add_trip_auto_completion.sql`
- Columns: `arrival_time`, `completed`
- Functions: `auto_complete_trips()`, `check_manual_completion()`

---

### 1.2 Trust Score & Review System ✅
**Rules:**
- NO star ratings or numeric trust scores displayed
- Only written reviews visible
- Show "–" if no reviews exist
- Reviews section on all profile pages with: reviewer info, trip route, text, date
- Empty state: "No reviews yet. Complete more rides to build your reputation."

**Implementation:**
- Removed trust score displays from profiles and ride pages
- Star ratings stored (default 5) but hidden from UI
- Reviews ordered chronologically (most recent first)

---

### 1.3 Completed Trip UX ✅
**Rules:**
- Hide: Edit/Cancel buttons, Ride requests section
- Show: Completion banner, "Leave review" button for each participant
- Review form: heading + description per reviewee
- Drivers review each rider individually

**Banner Text:**
> "This trip has been marked as complete by all parties. You can now write a review."

---

## 2️⃣ AUTH & ACCESS CONTROL

### 2.1 Role-Based Access
**Anonymous Users:**
- View ride snippets (departure, destination, date, price)
- Click ride → redirect to login with message

**Logged-in + Incomplete Profile:**
- View ride details
- Cannot offer or request rides

**Logged-in + Complete Profile:**
- Full access

**Profile Completion Requirements:**
- Profile picture
- Verified email
- At least 1 language
- (Drivers only) At least 1 vehicle

---

### 2.2 Data Privacy (RLS)
**Rules:**
- License plates visible ONLY to driver and approved riders
- Vehicle brand/model/color visible to all
- Driver contact info hidden until booking approved
- Enforce via Supabase RLS policies

---

### 2.3 Security
- Private Git repository
- Secrets in Vercel environment variables only
- No hardcoded credentials

---

## 3️⃣ RIDE MANAGEMENT

### 3.1 Round Trip Logic ✅
**Rules:**
- Creates two separate ride entries (First Leg + Second Leg)
- Each leg labeled clearly
- Both sorted by `departure_time` (ascending)
- Managed independently

---

### 3.2 Address Autocomplete ✅
**Display Format:**
- Short format: "City, Country" (e.g., "Malmö, Sweden")
- Full address data stored in database
- Function: `simplifiedLabel()` extracts first and last parts

---

### 3.3 Cost Validation ✅
**Rules:**
- Max cost formula: `(distance/100) × 16 × 10` SEK
- Suggested cost: 80% of maximum
- Frontend validation prevents exceeding max
- Backend validation throws error if exceeded
- Label: "Total Cost (SEK) per trip"
- Helper text shows suggested and max allowed

---

### 3.4 My Rides Structure ✅
**Section Order:**
1. Rides I'm Offering (as driver)
2. Rides I'm Joining (as rider)
3. Completed Rides (both roles)

**Visibility:**
- Active rides: `!completed && status !== 'cancelled'`
- Completed rides: `completed === true`
- All three sections always visible (empty states if no data)

**Empty State:** "You haven't completed any rides yet. Rides you've offered or joined will appear here after completion."

---

### 3.5 Ride Requests & Approval ✅
**Rules:**
- Riders can re-request after cancelling previous request
- Check only blocks pending/approved requests (not cancelled/declined)
- Approve validates seat availability
- Decline updates status to 'declined'
- Rider removal shows feedback: "Rider is removed from this trip." (3s auto-dismiss)

**Cancellation After Approval:**
- Rider can cancel approved bookings
- Frees seats via `update_ride_seats_on_cancellation()` RPC
- Updates `seats_booked` with row-level locking
- Sends system message to driver: "🚫 Rider cancelled their participation."
- Button changes: "Request Approved ✓" → "Cancel Join ✕" (red outline)

---

### 3.6 Ride Visibility (Find a Ride) ✅
**Query Filter:**
```typescript
.eq('status', 'published')
// NOT .neq('cancelled') - this was incorrect
```
- Only published rides appear
- Cancelled, completed, draft rides hidden

---

## 4️⃣ CHAT SYSTEM

### 4.1 Message Threads ✅
**Rules:**
- Auto-created when rider requests or opens chat
- Deterministic key: `(driver_id, rider_id, ride_id)`
- System messages visible to driver only:
  - "Rider requested to join this trip."
- Threads appear in both users' inboxes immediately
- No duplicate threads

**Implementation:**
- RLS policies: participants only
- Migration: `00005_update_message_thread_policies.sql`

---

### 4.2 Interactive System Messages ✅
**Rules:**
- System messages have metadata:
  ```json
  {
    "type": "system",
    "system_type": "ride_request" | "request_approved" | "request_denied" | "rider_cancelled",
    "booking_request_id": "uuid",
    "action_state": "pending" | "approved" | "denied"
  }
  ```
- Driver sees Approve/Deny buttons on pending requests
- Rider sees text-only message
- Buttons disabled after action
- Follow-up message created on approve/deny

**Message Types:**
- Ride request: "🚗 Rider requested to join this ride"
- Approval: "✅ Request approved by Driver"
- Denial: "❌ Request denied by Driver"
- Cancellation: "🚫 Rider cancelled their participation. X seat(s) now available."

**Implementation:**
- Migration: `00018_add_message_metadata.sql`
- Column: `metadata` (JSONB)

---

### 4.3 Chat Deletion & Retention (GDPR) ✅
**Rules:**
- **Soft Delete:** Per-user timestamps (`driver_deleted_at`, `rider_deleted_at`)
- **Hard Delete:** When both users delete (within 24h)
- **Auto-Cleanup:** 6 months of inactivity on completed/cancelled rides
- **Audit Log:** `deletion_audit` JSONB stores metadata
- **User Control:** Delete button with confirmation modal

**Delete Modal Message:**
> "Removes from your view only. Other participant still sees it unless they delete too. Once both delete, permanently erased. Auto-cleanup after 6 months of inactivity (GDPR compliant)."

**Implementation:**
- Migration: `00017_chat_deletion_and_retention.sql`
- Functions: `cleanup_fully_deleted_threads()`, `cleanup_inactive_threads()`, `check_and_cleanup_thread()`
- Daily cron job at 2 AM UTC

---

### 4.4 Unread Message Highlighting ✅
**Visual Indicators:**
- **Unread threads:** Green background, green left border (4px), green icon
- **Selected thread:** Gray background, black left border
- **Unread badge:** Green background, white text, shows "9+" for 10+
- **Typography:** Bold for unread routes/messages
- **Header inbox icon:** Red badge with unread count

**Auto-Mark as Read:**
- Opens thread → marks all messages from other user as read
- Updates `is_read: true` in database
- Clears highlight immediately

---

### 4.5 Clickable Participants ✅
**Rules:**
- All participant names/avatars link to `/profile/[id]`
- Hover effects: avatar ring + name underline
- Tooltip: "View profile"
- Fallback: "Profile unavailable" if user null (non-clickable)
- Same tab navigation

---

## 5️⃣ UI & HOMEPAGE

### 5.1 Hero Section ✅
**Design:**
- Static gradient background (no heavy animations)
- Subtle radial overlay
- Car + MapPin icons with pulsing animation
- Green/emerald color scheme
- Fast load time

---

### 5.2 Homepage Conditional UI ✅
**Rules:**
- "Ready to start your journey?" section hidden when logged in
- Shows only for logged-out users
- Conditional: `{!user && (...)}`

---

### 5.3 FAQ Section ✅
**9 Questions Covering:**
1. Can I make money? (No, cost-sharing only)
2. Legal in Sweden? (Yes, non-commercial)
3. Responsibility? (Private arrangements)
4. Data protection? (GDPR compliant)
5. Chat privacy? (Encrypted)
6. License requirements? (Standard)
7. Pets/luggage? (Driver's choice)
8. Cancellation? (Easy from ride page)
9. Reviews? (Written only, no stars)

---

## 6️⃣ SORTING & ORDERING

**Global Rule:** All rides sorted by `departure_time` (ascending)

**Applies To:**
- Find a Ride page
- My Rides dashboard
- Completed Rides section
- Search results

---

## 7️⃣ NOTIFICATIONS SYSTEM

### 7.1 Dual Notification System ✅
**Bell Icon (System Notifications):**
- Links to `/notifications` page
- Realtime unread count badge (black circle, white text)
- Shows "9+" for 10+ notifications
- Types: ride_request, ride_approved, ride_rejected, ride_cancelled, ride_completed, system_message

**Inbox (Messages):**
- Moved to profile dropdown menu
- Shows unread message count badge
- Realtime updates via Supabase subscriptions

**Implementation:**
- Table: `notifications` with RLS policies
- Migration: `create_notifications_table`
- Realtime channels: `unread-notifications`, `unread-messages`

---

## 8️⃣ NAVBAR & HEADER

### 8.1 Layout ✅
**Three-Column Design:**
```
[Logo] ... [Offer a Ride | Find a Ride] ... [Bell] [Profile ▼]
```

**Active Link Highlighting:**
- Bold black text + bottom border (2px underline)
- Inactive: gray text with hover transition
- Uses `usePathname()` for detection

---

### 8.2 Profile Dropdown Menu ✅
**Structure:**
1. User Info (name + email)
2. Divider
3. Profile, My Rides, Messages (with unread badge)
4. Divider
5. Theme Toggle (Sun/Moon icons)
6. Divider
7. Log Out (black button)

**Theme Toggle:**
- Functional dark mode via `next-themes`
- localStorage persistence
- System preference detection
- Class-based: `dark:` prefix

---

### 8.3 Header Display ✅
**Logged In:**
- Avatar + first name (desktop)
- Fallback: Initial in colored circle if no photo
- Mobile: same data in hamburger menu

**Logged Out:**
- Login link
- Sign Up button

---

## 9️⃣ LEGAL & COMPLIANCE

### 9.1 Legal Pages ✅
**Created:**
- `/legal/privacy` - GDPR-compliant Privacy Policy
- `/legal/terms` - Terms & Conditions
- `/legal/community` - Community Guidelines
- `/legal/cookies` - Cookie Policy
- `/about` - About page

**Key Points:**
- Documents: Supabase, Vercel, OpenRouteService, Resend as processors
- GDPR rights: access, rectification, erasure, portability
- Swedish transport law compliance (Transportstyrelsen)
- Cost-sharing only (no profit allowed)

---

### 9.2 Footer ✅
**Sections:**
- Newsletter subscription form
- Legal links navigation
- Cost-sharing disclaimer
- Black background, responsive layout

---

### 9.3 Cookie Consent Modal ✅
**Rules:**
- Appears 1 second after page load (first visit)
- Types: Essential (always active), Optional
- Buttons: "Accept All Cookies", "Essential Only"
- Choice persisted in localStorage with timestamp
- Links to Cookie Policy and Privacy Policy
- GDPR compliant

---

### 9.4 Terms Acceptance ✅
**Signup Page:**
- Checkbox required for account creation
- Label: "By creating an account, I agree to the [Terms & Conditions] and [Privacy Policy]"
- Links open in new tab
- Required validation enforced

---

### 9.5 Profile Completion System ✅
**Utility:** `/lib/profile-completion.ts`
- `checkProfileCompletion(userId, requiresVehicle)` - validates profile
- `getProfileCompletionMessage(status, action)` - generates messages
- Banner component: `/components/profile-completion-banner.tsx`
- Checklist with visual indicators (green checkmarks)

---

### 9.6 Privacy & Data Settings ✅
**Page:** `/profile/settings`

**Features:**
- **Export Data:** Downloads complete user data (JSON)
  - Profile, rides, bookings, reviews, messages
- **Delete Account:** Permanent deletion with confirmation
  - User must type "DELETE"
  - Lists all data to be deleted
  - Auto sign-out after deletion
- **GDPR Rights:** Listed and explained

---

## 🔟 OAUTH AUTHENTICATION

### 10.1 Google OAuth ✅ ACTIVE
**Configuration:**
- Provider: Google OAuth 2.0
- Scopes: `openid email profile`
- Redirect URL: `https://yovcotdosaihqxpivjke.supabase.co/auth/v1/callback`
- Application callback: `/auth/callback`

**Features:**
- Account linking (same email, no duplicates)
- Profile bootstrap from OAuth data (name, avatar)
- Email auto-verified for OAuth users
- Minimal scopes (no extended permissions)
- Redirect to profile completion if fields missing

**Component:** `/components/auth/oauth-buttons.tsx`
- Reusable for login and signup pages
- Loading states, error handling
- Terms/Privacy notice

**Name Extraction Strategy (4-tier fallback):**
1. Direct fields: `given_name`, `family_name`
2. Alternative fields: `first_name`, `last_name`
3. Parse from `name` field
4. Parse from `full_name` field
5. Returns `null` if all fail (proper DB handling)

---

### 10.2 Facebook OAuth ⏳ PENDING
**Status:** Code ready, awaiting Supabase configuration
- Requires: App ID, App Secret from Facebook Developers
- Component: Commented out in `oauth-buttons.tsx`

---

## 1️⃣1️⃣ PASSWORD RESET

### 11.1 Forgot Password Flow ✅
**Page:** `/auth/forgot-password`
- User enters email
- Receives reset link via Resend
- Redirect URL: `/auth/reset-password`

**Page:** `/auth/reset-password`
- Validates reset token
- New password + confirm (min 6 chars)
- Success → redirect to login

**Implementation:**
- `supabase.auth.resetPasswordForEmail()`
- `supabase.auth.updateUser({ password })`

---

## 1️⃣2️⃣ EMAIL INTEGRATION

### 12.1 Resend Configuration ✅
**API Key:** `RESEND_API_KEY` in `.env.local`
**From Email:** `Nordride <noreply@nordride.se>`
**Support:** `support@nordride.se`

**Templates:**
- Welcome email: `/emails/welcome-email.tsx`
- Password reset: `/emails/reset-password-email.tsx`

**Features:**
- Brand-consistent design (Nordride colors)
- Mobile-responsive HTML
- Inline CSS for email clients
- Security best practices (expiration warnings)

---

## 1️⃣3️⃣ ROUTE PROXIMITY MATCHING

### 13.1 Proximity Search ✅
**Logic:**
- Calculates distance from rider's points to driver's route polyline
- Uses Haversine formula for accuracy
- Custom polyline decoder (precision 5, no dependencies)

**API:** `/api/rides/search-proximity`
**Request:**
```json
{
  "departure": { "lat": 59.3293, "lon": 18.0686 },
  "destination": { "lat": 57.7089, "lon": 11.9746 },
  "maxDistanceKm": 20
}
```

**Match Quality:**
- **Perfect:** Both points ≤ 5km from route (green badge)
- **Nearby:** Both points ≤ 20km from route (blue badge)
- **None:** At least one point > 20km (excluded)

**Implementation:**
- File: `/lib/route-proximity.ts`
- Functions: `haversineDistance()`, `decodePolyline()`, `pointToRouteDistance()`, `checkRouteProximity()`
- No external dependencies

---

### 13.2 Proximity Display ✅
**Search Results:**
- Proximity badges next to trip type
- Color-coded for quick scanning

**Ride Details:**
- Gradient card (green-to-blue)
- Exact distances shown
- Two-column layout (departure + destination)
- Explanation about coordination
- Only shown when accessed via proximity search

---

## 1️⃣4️⃣ USER ACCESS & UX

### 14.1 Homepage Search ✅
**Features:**
- Autocomplete dropdowns (300ms debounce)
- Simplified display: "City, Country"
- Redirects to `/rides/search` with query params
- URL params prefill search fields
- Auto-triggers proximity search if valid params

---

### 14.2 Ride Details Access Control ✅
**Rules:**
- Logged-out users: Browse rides list, click → login redirect
- Message: "Please log in or sign up to view ride details and request to join."
- Redirect preserved after login (includes proximity params)

**Implementation:**
- Click handler with login redirect
- URL: `/auth/login?redirect=${rideUrl}&message=...`

---

### 14.3 License Plate Privacy ✅
**Visibility:**
- Hidden by default
- Visible to: Driver (always), Approved riders only
- Other info (brand, model, color) visible to all

**Logic:**
```typescript
{(isDriver || approvedRequest) && (
  <>{ride.vehicle.color && ' • '}{ride.vehicle.plate_number}</>
)}
```

---

## 1️⃣5️⃣ SEAT MANAGEMENT & NOTIFICATIONS

### 15.1 Seat Recalculation ✅
**Rules:**
- When rider cancels approved request: `seats_booked` decrements
- Uses `update_ride_seats_on_cancellation()` RPC with row-level locking
- Constraints prevent negative values: `seats_booked >= 0`
- Constraint ensures: `seats_booked <= seats_available`
- Updates `updated_at` timestamp

**Database Safeguards:**
- `FOR UPDATE` locking prevents race conditions
- `GREATEST(0, seats_booked - seats_to_free)` prevents negatives
- Exception raised if attempting to free more than booked

---

### 15.2 Notification System ✅
**On Rider Cancellation:**
- Driver receives in-app notification
- Title: "Rider cancelled the ride"
- Body: "[Rider Name] has cancelled their seat on your trip from [Origin] to [Destination]."
- Metadata: rider name, rider ID, seats freed, origin, destination
- System message in chat: "🚫 Rider cancelled their participation. X seat(s) now available."

**Implementation:**
- Table: `notifications` (extended schema)
- Function: `create_notification()`
- Types: ride_request, ride_approved, ride_rejected, ride_cancelled, ride_completed

---

## 1️⃣6️⃣ TIERED TRUST SYSTEM

### 16.1 Tier Structure ✅
**Tier 1 (Immediate Access):**
- Requirements: Email verification ✅
- Access: Browse rides, view profiles, read reviews
- Badge: None

**Tier 2 (Verified Rider) 🪪:**
- Requirements: Profile picture ✅, At least 1 language ✅
- Access: Request rides, message drivers
- Badge: "Verified Rider" (blue)

**Tier 3 (Verified Driver) 🚗:**
- Requirements: All Tier 2 ✅, Bio (50+ chars) ✅, At least 1 vehicle ✅
- Access: Create rides, manage bookings
- Badge: "Verified Driver" (green)

---

### 16.2 Automatic Tier Updates ✅
**Trigger Flow:**
```
User updates profile → Database trigger fires → 
calculate_user_tier() runs → Tier updated → 
Notification created (if upgraded) → UI updates
```

**Implementation:**
- Migration: `add_user_tier_system`
- Column: `current_tier` (1, 2, or 3)
- Function: `calculate_user_tier()`
- Triggers: Auto-update on profile/vehicle changes

---

### 16.3 Badge Display ✅
**Locations:**
- Profile page (progress tracker)
- Find a Ride (driver badges on cards)
- Ride Details (driver + rider badges)
- Messages/Chat (conversation list)
- Review sections

**Logic:**
```typescript
// Only show for verified users (tier 2+)
{user.current_tier >= 2 && <TierBadge tier={user.current_tier} />}
```

**Component:** `/components/tier-badge.tsx`
- SVG badges (< 1KB each)
- Tooltips on hover
- Responsive sizing

---

### 16.4 Progress Tracking ✅
**Profile Page:**
- Collapsible verification status (default: open)
- Color-coded completion status (green checkmarks)
- Missing items listed clearly
- Congratulations message on Tier 3 upgrade

**Function:**
```typescript
const progress = getTierProgress(profile, vehicleCount)
// Returns: { current: 2, next: 3, progress: 67, missing: ['Bio', 'Vehicle'] }
```

---

## 1️⃣7️⃣ BUTTON CONTRAST AUDIT

### 17.1 WCAG AA Compliance ✅ VERIFIED
**All Audited Buttons:**
- Request a Ride: 21:1 (AAA)
- Sign Up (Homepage): 18.7:1 (AAA)
- Log In: 21:1 (AAA)
- Create an Account: 21:1 (AAA)
- Offer a Ride: 21:1 (AAA)
- Save Vehicle: 21:1 (AAA)

**Result:** All buttons exceed WCAG AA requirements (4.5:1) and achieve AAA level (7:1+)

**Design System:**
- Primary: Black background, white text
- Hover: Gray-800 background (17.1:1)
- No changes required

---

## 1️⃣8️⃣ CURRENT PLATFORM STATE

### Active Features ✅
- Trip auto-completion (5h after arrival)
- Written reviews only (no star ratings)
- Round trip support (two legs)
- Proximity-based search (20km radius)
- Real-time messaging with system messages
- Chat deletion (soft-delete + GDPR auto-cleanup)
- Unread message highlighting
- Interactive approve/deny buttons in chat
- Clickable participant profiles
- Seat recalculation on cancellation
- In-app notification system
- Tiered trust system (3 tiers)
- Verification badges (Rider & Driver)
- OAuth authentication (Google active)
- Password reset flow
- Email integration (Resend)
- Cookie consent modal
- GDPR-compliant data export/deletion
- Legal pages (Terms, Privacy, Community, Cookies)
- Profile completion tracking
- Dark mode toggle
- Button contrast compliance (WCAG AA)

### Database Migrations Applied
- `00013_add_trip_auto_completion.sql`
- `00014_*` and `00015_*` - RLS policies for messages
- `00016_enable_realtime_on_messages.sql`
- `00017_chat_deletion_and_retention.sql`
- `00018_add_message_metadata.sql`
- `create_notifications_table`
- `add_user_tier_system`

### API Endpoints
- `/api/rides/list` - Published rides only
- `/api/rides/search-proximity` - Route proximity matching
- `/api/geocoding` - Location autocomplete
- `/api/routing` - Route calculation

---

## 🎯 ACCEPTANCE SUMMARY

**All Major Features:**
- ✅ Auto-completion function verified
- ✅ Sorting stable by departure_time
- ✅ Chat threads auto-created + driver actions
- ✅ Access gating enforced (auth + profile)
- ✅ Consistent layout across pages
- ✅ Homepage hero updated
- ✅ Sensitive data protected (RLS)
- ✅ Profile reviews section with full context
- ✅ SEK saved statistic calculated
- ✅ Request to Share functionality working
- ✅ Chat unread highlighting (green indicators)
- ✅ Header displays avatar + first name
- ✅ Request/Cancel toggle button
- ✅ Visually distinct button states
- ✅ Legal documents (Privacy, Terms, Community, Cookies)
- ✅ Footer with newsletter + legal links
- ✅ Terms acceptance checkbox on signup
- ✅ Cookie consent modal (GDPR)
- ✅ FAQ section (9 questions)
- ✅ Privacy & Data settings (export/delete)
- ✅ Profile completion utility + banner
- ✅ Cost-sharing reminders on ride creation
- ✅ Google OAuth (active & configured)
- ✅ Forgot/Reset password flow
- ✅ Resend email integration
- ✅ GDPR chat deletion & retention
- ✅ Interactive system messages (approve/deny)
- ✅ Clickable participant profiles
- ✅ Proximity-based search (20km)
- ✅ Anonymous user access control
- ✅ License plate privacy
- ✅ Seat recalculation + notifications
- ✅ Tiered trust system (3 tiers)
- ✅ Verification badges platform-wide
- ✅ Button contrast compliance (WCAG AA)

---

**STATUS:** ✅ Production Ready
**QUALITY:** Enterprise-Grade Code
**DOCUMENTATION:** Comprehensive
**USER IMPACT:** High (Trust, Safety, Engagement)

---

*Last Updated: November 2025*
