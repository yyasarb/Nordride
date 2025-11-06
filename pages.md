# Nordride Application Pages Documentation

Complete reference guide for all pages in the Nordride ridesharing platform.

---

## 📊 Quick Reference Table

| Page | Route | Auth Required | Purpose | Main Forms |
|------|-------|---------------|---------|------------|
| Home | `/` | No | Landing page with CTAs | None |
| About | `/about` | No | Company info | None |
| Login | `/auth/login` | No | User authentication | Email, password |
| Signup | `/auth/signup` | No | Account creation | Name, email, password |
| Forgot Password | `/auth/forgot-password` | No | Reset initiation | Email |
| Reset Password | `/auth/reset-password` | No | Password change | New password |
| Messages | `/messages` | Yes | Ride coordination | Message input |
| Profile | `/profile` | Yes | Profile dashboard | Vehicle form |
| Public Profile | `/profile/[id]` | No | User portfolio | None |
| Edit Profile | `/profile/edit` | Yes | Profile updates | Photo, bio, languages |
| Settings | `/profile/settings` | Yes | Account management | Delete confirmation |
| Search Rides | `/rides/search` | No | Browse rides | Location search |
| Create Ride | `/rides/create` | Yes | Offer ride | Full ride details |
| My Rides | `/rides/my` | Yes | Ride dashboard | Approval/decline |
| Ride Details | `/rides/[id]` | Partial | View ride info | Booking requests |
| Edit Ride | `/rides/[id]/edit` | Yes | Modify ride | Same as create |
| Terms | `/legal/terms` | No | Legal terms | None |
| Privacy | `/legal/privacy` | No | GDPR policy | None |
| Community | `/legal/community` | No | Guidelines | None |
| Cookies | `/legal/cookies` | No | Cookie policy | None |

---

## 🏠 Homepage & Landing Pages

### `/` - Homepage
**File:** `app/page.tsx`
**Authentication:** Not required
**Purpose:** Main landing page showcasing Nordride's value proposition

**Key Features:**
- Hero section with animated call-to-action buttons
- Feature showcase: Community-driven, Eco-friendly, Safe & trusted
- Impact metrics: 12.4M rides shared, 98% satisfaction rate, CO2 savings
- Popular routes carousel (Stockholm to major cities)
- Comprehensive FAQ section (10 questions)
- Call-to-action banner for registration

**User Interactions:**
- "Find a ride" button → `/rides/search`
- "Offer a ride" button → `/rides/create`
- Popular route links → `/rides/search` with pre-filled locations
- Animated scroll effects and hover states

**Data Fetching:**
- Checks authentication status for conditional CTAs
- No server-side data fetching

---

### `/about` - About Nordride
**File:** `app/about/page.tsx`
**Authentication:** Not required
**Purpose:** Company mission, values, and operational transparency

**Content Sections:**
1. **Mission Statement**: Community-based cost-sharing platform for Nordic region
2. **Key Differentiators**:
   - Cost-sharing vs profit (80% max of legal rate)
   - Swedish-focused with Nordic expansion
   - Transparent pricing and operations
3. **How It Works**:
   - Step 1: Create or find a ride
   - Step 2: Connect through messaging
   - Step 3: Share the ride and costs
4. **Core Values**: Trust, Sustainability, Affordability, Safety, Respect
5. **Legal Compliance**: Transportstyrelsen compliant, non-commercial facilitator
6. **Contact Information**: Email, business details

**User Interactions:**
- Back button to homepage
- Navigation through header/footer

---

## 🔐 Authentication Pages

### `/auth/login` - Login
**File:** `app/auth/login/page.tsx`
**Authentication:** Not required
**Purpose:** User authentication into existing accounts

**Form Fields:**
- Email (required)
- Password (required)

**Key Features:**
- OAuth social login buttons (Google, Facebook, etc.)
- "Forgot password?" link → `/auth/forgot-password`
- "Sign up" link → `/auth/signup`
- Success message display (post-signup redirect)
- Auto-redirect for already logged-in users
- Session validation on mount

**API Calls:**
- `supabase.auth.signInWithPassword({ email, password })`
- Redirect to `/` on success or custom redirect from query param

**Error Handling:**
- Invalid credentials display
- Network error handling
- Field validation

---

### `/auth/signup` - Sign Up
**File:** `app/auth/signup/page.tsx`
**Authentication:** Not required
**Purpose:** New user registration and profile creation

**Form Fields:**
- First Name (required)
- Last Name (required)
- Email (required, validated)
- Password (required, min 6 characters)
- Confirm Password (required, must match)
- Terms & Privacy checkbox (required)

**Key Features:**
- OAuth social login options
- Password strength validation
- Password match validation
- Automatic profile initialization:
  - `trust_score`: 100
  - `rides_as_driver`: 0
  - `rides_as_rider`: 0
  - Email verification sent
- Links to Terms & Privacy policies
- Auto-redirect to login after successful signup

**API Calls:**
- `supabase.auth.signUp({ email, password })`
- `supabase.from('users').insert()` - Creates profile record

**Validation:**
- Email format check
- Password length (min 6 chars)
- Password confirmation match
- Terms acceptance required

---

### `/auth/forgot-password` - Forgot Password
**File:** `app/auth/forgot-password/page.tsx`
**Authentication:** Not required
**Purpose:** Password reset email initiation

**Form Fields:**
- Email (required)

**Key Features:**
- Success state display after email sent
- Back to login link
- Email validation
- Reset link delivery to user email

**API Calls:**
- `supabase.auth.resetPasswordForEmail(email, { redirectTo })`
- Sends email with link to `/auth/reset-password`

**User Flow:**
1. User enters email
2. Receives email with reset link
3. Clicks link → `/auth/reset-password` with token

---

### `/auth/reset-password` - Reset Password
**File:** `app/auth/reset-password/page.tsx`
**Authentication:** Required (valid reset token)
**Purpose:** Complete password reset process

**Form Fields:**
- New Password (required, min 6 characters)
- Confirm Password (required, must match)

**Key Features:**
- Session validation (must have valid reset session)
- Password strength validation
- Success state with auto-redirect to login
- Error handling for expired/invalid tokens

**API Calls:**
- `supabase.auth.updateUser({ password })`

**Validation:**
- Valid reset token in URL
- Password length check
- Password confirmation match

---

## 💬 Messaging & Communication

### `/messages` - Messages
**File:** `app/messages/page.tsx`
**Authentication:** Required → `/auth/login?redirect=/messages`
**Purpose:** Real-time messaging between drivers and riders

**Layout:**
- **Left Column**: Conversation list
- **Right Column**: Active message thread

**Key Features:**

**Conversation List:**
- Grouped by ride (origin → destination)
- Unread message badges (green with count)
- Last message preview
- Departure time display
- Driver label: "Driver: You" or driver name
- Delete conversation button (hover to show)

**Message Thread:**
- Ride header with route and date
- Participants section with role badges (Driver/Rider)
- "View ride" button → `/rides/[id]`
- Message history with timestamps
- System messages (blue background):
  - Ride requests
  - Approval/denial notifications
  - Rider cancellation notices
- Interactive action buttons (driver only):
  - Approve request (green)
  - Deny request (red)
- Real-time message delivery
- Message input with send button

**Forms:**
- Message input field (text)
- Enter to send functionality

**Data Fetching:**
- `supabase.from('message_threads').select()` - Fetch threads
  - Filters out soft-deleted threads (`driver_deleted_at`, `rider_deleted_at`)
  - Includes ride and participant data
- `supabase.from('messages').select()` - Fetch messages per thread
- Real-time subscriptions for new messages

**Special Features:**
- **Soft Delete System**:
  - Per-user deletion tracking
  - Thread hidden from deleting user's view
  - Hard delete when both parties delete (GDPR)
  - Auto-cleanup: 6-month inactivity deletion
- **System Messages**:
  - Ride request: "🚗 Rider requested to join this ride"
  - Approval: "✅ Request approved by Driver"
  - Denial: "❌ Request denied by Driver"
  - Cancellation: "🚫 Rider cancelled their participation"
- **Action Buttons**:
  - Only shown for pending requests
  - Disabled after action taken
  - Updates booking request status
  - Creates follow-up system message

**User Interactions:**
- Select conversation from list
- Send text messages
- Approve/deny ride requests (driver)
- Delete conversation with confirmation
- Mark messages as read automatically
- View ride details
- View participant profiles

---

## 👤 User Profile Pages

### `/profile` - Profile Dashboard
**File:** `app/profile/page.tsx`
**Authentication:** Required
**Purpose:** View and manage personal profile, vehicles, and statistics

**Key Sections:**

**1. Profile Header:**
- Avatar display
- Name with inline edit capability
- Review count and average rating
- Profile completion percentage (0-100%)
- Completion checklist:
  - ✅ Profile picture uploaded
  - ✅ Bio written
  - ✅ Languages added
  - ✅ Interests selected
  - ✅ Vehicle added

**2. Contact Information:**
- Email address
- Phone number (if provided)

**3. Bio Section:**
- User-written description
- Character limit: 500

**4. Languages:**
- Grid display of spoken languages
- Flags or language codes

**5. Interests:**
- Tag-style display
- Predefined options (Music, Podcasts, etc.)

**6. Vehicles Section:**
- List of user vehicles with:
  - Brand, Model
  - Color, Year
  - Plate number
  - Primary badge
  - Seats count
- **Add Vehicle Form**:
  - Brand (required)
  - Model (required)
  - Color (required)
  - Plate number (required)
  - Inline submission

**7. Statistics:**
- Rides as driver (count)
- Rides as rider (count)
- Total SEK saved

**8. Quick Actions:**
- "Offer a ride" button → `/rides/create`
- "Find a ride" button → `/rides/search`

**9. Reviews Section:**
- Reviewer info (avatar, name)
- Ride details (origin, destination, date)
- Review text
- Star rating
- Review date

**10. Public Profile Link:**
- Button to view as others see it → `/profile/[id]`

**Forms:**
- Add vehicle form (inline)
- Name edit (inline)

**Data Fetching:**
- `supabase.from('users').select()` - User profile
- `supabase.from('vehicles').select()` - User vehicles
- `supabase.from('reviews').select()` - User reviews
- `supabase.rpc('calculate_profile_completion')` - Completion %

**User Interactions:**
- Edit profile button → `/profile/edit`
- Settings button → `/profile/settings`
- Add vehicle inline
- Edit name inline
- View public profile
- Navigate to ride actions

---

### `/profile/[id]` - Public Profile
**File:** `app/profile/[id]/page.tsx`
**Authentication:** Not required
**Purpose:** View another user's public profile (read-only)

**Display Sections:**
- Profile picture and name
- Bio
- Review count and average rating
- Languages spoken
- Ride statistics (driver/rider counts)
- Vehicles with details
- Reviews from other users

**Data Fetching:**
- Server-side rendering
- `supabase.from('users').select()`
- `supabase.from('vehicles').select()`
- `supabase.from('reviews').select()`

**Privacy:**
- No contact information shown
- Only public profile data
- Reviews visible to all

**User Interactions:**
- View only (no edit capabilities)
- Click vehicle details
- Read reviews

---

### `/profile/edit` - Edit Profile
**File:** `app/profile/edit/page.tsx`
**Authentication:** Required
**Purpose:** Comprehensive profile editing interface

**Form Fields:**

**1. Profile Picture:**
- Upload button with camera icon
- Image compression (512x512 max, 70% quality)
- Automatic upload to Supabase storage
- Preview display

**2. Basic Information:**
- First Name (required)
- Last Name (required)

**3. About Me / Bio:**
- Textarea (500 character limit)
- Character counter
- Optional field

**4. Languages:**
- Searchable dropdown
- Multi-select capability
- 87+ languages supported
- Search filter functionality
- Count display

**5. Interests:**
- Multi-select button grid
- Predefined options:
  - Music
  - Podcasts
  - Audiobooks
  - Silence
  - Chatty
  - Pets
  - Smoking friendly
  - Child-friendly
  - Student
  - Professional
  - Nightlife
  - Sports

**Key Features:**
- Real-time character counting
- Image compression on upload
- Language search functionality
- Profile completion recalculation
- Cancel button → `/profile`
- Save button with validation

**API Calls:**
- `supabase.from('users').update()` - Save profile changes
- `supabase.storage.from('avatars').upload()` - Upload photo
- `supabase.rpc('calculate_profile_completion')` - Update completion

**Validation:**
- Required fields: First name, Last name
- Character limits enforced
- Image size/format validation

---

### `/profile/settings` - Account Settings
**File:** `app/profile/settings/page.tsx`
**Authentication:** Required
**Purpose:** Privacy, data management, and account control

**Tabs:**

**1. Privacy & Data:**
- **GDPR Rights Information:**
  - Right to access
  - Right to rectification
  - Right to erasure
  - Right to data portability
  - Right to object
  - Right to withdraw consent

- **Export Your Data:**
  - Downloads JSON file with:
    - Profile information
    - Rides (as driver and rider)
    - Booking requests
    - Reviews (given and received)
    - Messages
    - Vehicles
  - One-click export button

- **Delete Your Account:**
  - Permanent deletion warning
  - Type "DELETE" confirmation required
  - Cascading effects explained:
    - Rides cancelled
    - Bookings cancelled
    - Messages deleted
    - Reviews anonymized
    - Account permanently removed
  - Cannot be undone

**2. Profile Settings:**
- Link to profile edit page
- Quick access to profile management

**Data Fetching:**
- `supabase.from('users').select()` with joins:
  - Rides (as driver)
  - Booking requests (as rider)
  - Reviews (given and received)
  - Messages
  - Vehicles
- Comprehensive data export query

**API Calls:**
- `supabase.from('users').delete()` - Account deletion
- Cascading deletions handled by database

**User Interactions:**
- Export data (JSON download)
- Delete account (with confirmation)
- Navigate to profile edit

---

## 🚗 Ride Discovery & Management

### `/rides/search` - Search Rides
**File:** `app/rides/search/page.tsx`
**Authentication:** Not required
**Purpose:** Find and browse available rides

**Form Fields:**
- From location (autocomplete)
- To location (autocomplete)

**Key Features:**

**Location Autocomplete:**
- Powered by Nominatim geocoding API
- Dropdown with suggestions
- Simplified labels (city, country)
- GPS coordinates stored

**Route Calculation:**
- Distance in kilometers
- Estimated travel time
- Route polyline for mapping
- OpenRouteService API integration

**Ride Listings:**
- **Filters Applied:**
  - Excludes user's own rides
  - Only published/active rides
  - Sorted by departure time
- **Ride Cards Display:**
  - Origin and destination
  - Date and time
  - Available seats (with remaining count)
  - Total cost in SEK
  - Trip type badge:
    - One-Way
    - Round Trip
    - First Leg (outbound)
    - Second Leg (return)
  - Distance and estimated time
  - Click to view details

**Data Fetching:**
- `/api/geocoding` - Location lookups
- `/api/routing` - Route calculations
- `supabase.from('rides').select()`:
  - All rides
  - Filter out user's rides
  - Include driver info
  - Include booking status

**User Interactions:**
- Type and select locations
- Click "Search rides" button
- Click ride card → `/rides/[id]`
- Pre-populate search from homepage links

---

### `/rides/create` - Create Ride
**File:** `app/rides/create/page.tsx`
**Authentication:** Required
**Purpose:** Offer a new ride with complete details

**Profile Requirements Check:**
- ✅ Profile picture uploaded
- ✅ Bio written (min 50 chars)
- ✅ Languages added (min 1)
- ✅ Interests selected (min 1)
- ✅ Vehicle added (min 1)

**Form Fields:**

**1. Route Details:**
- Departure location (autocomplete, required)
- Arrival location (autocomplete, required)
- Distance calculation (automatic)
- Estimated time (automatic)

**2. Schedule:**
- Departure date (date picker, required)
- Departure time (30-min intervals, 00:00-23:30, required)

**3. Capacity & Pricing:**
- Available seats (1-8, required)
- Total cost in SEK (50 SEK increments, required)
  - Suggested cost: 80% of max legal rate
  - Max enforced: `(distance / 100) * 16 * 10` SEK
  - Info tooltip explaining calculation

**4. Vehicle Selection:**
- Dropdown of user's vehicles (required)
- "Add new vehicle" inline form:
  - Brand, Model
  - Color, Year
  - Plate number
  - Seats

**5. Round Trip:**
- Toggle switch
- **If enabled:**
  - Return date (required)
  - Return time (required)

**6. Trip Preferences:**
- Pets allowed: Yes / No / Maybe
- Smoking allowed: Yes / No
- Luggage options: Small / Carry-on / Large

**7. Special Requests / Notes:**
- Textarea (500 character limit)
- Optional field
- Character counter

**Key Features:**
- **Location Autocomplete**:
  - Real-time search
  - Simplified display
  - GPS coordinates stored
- **Route Calculation**:
  - Automatic on location selection
  - Distance and time display
  - Polyline generation for mapping
- **Price Suggestions**:
  - Based on distance
  - Max legal rate enforced
  - Manual override allowed (within limits)
- **Vehicle Management**:
  - Quick add vehicle inline
  - No need to leave page
- **Round Trip Support**:
  - Creates two ride records
  - Linked trips
  - Separate management

**API Calls:**
- `/api/geocoding` - Location validation
- `/api/routing` - Route calculation
- `supabase.from('users').select()` - Profile check
- `supabase.from('vehicles').select()` - User vehicles
- `supabase.from('vehicles').insert()` - Add vehicle inline
- `supabase.from('rides').insert()` - Create ride(s)

**Validation:**
- All required fields filled
- Profile completeness verified
- Vehicle selected
- Valid date/time (not in past)
- Reasonable pricing
- Valid route

**User Flow:**
1. Check profile requirements
2. Fill in ride details
3. Select/add vehicle
4. Configure preferences
5. Review and create
6. Redirect to ride details or My Rides

---

### `/rides/my` - My Rides Dashboard
**File:** `app/rides/my/page.tsx`
**Authentication:** Required → `/auth/login?redirect=/rides/my`
**Purpose:** Manage rides as driver and bookings as rider

**Statistics Cards:**
- **Rides Offered**: Count with "X upcoming" sublabel
- **Rides Joining**: Approved count with "X pending" sublabel
- **Seats Filled**: Total across all rides

**Section 1: Rides I'm Offering**

**Active Rides Display:**
- Route map (origin → destination)
- Departure date and time
- Seats filled / available
- Created date
- Total cost
- Status badge (published, cancelled, etc.)

**Action Buttons:**
- Edit ride → `/rides/[id]/edit`
- Cancel ride (with confirmation)
- View ride → `/rides/[id]`

**Approved Riders:**
- Avatar and name
- Profile link
- Seat count (if > 1)
- Displays below each ride

**Pending Requests:**
- Rider avatar and name
- Seat count requested
- View profile button
- Chat button → `/messages?ride=[id]`
- **Approve** button (green):
  - Checks seat availability
  - Updates booking status
  - Updates seats_booked count
- **Deny** button (red):
  - Updates booking status

**Section 2: Rides I'm Joining**

**Active Bookings Display:**
- Route information
- Departure date and time
- Seats requested
- Request status badge:
  - Pending (yellow)
  - Approved (green)
- Driver info (avatar, name)
- Total cost

**Action Buttons:**
- Open chat → `/messages?ride=[id]`
- View ride → `/rides/[id]`
- Cancel request (if pending)

**Section 3: Completed Rides**

**Archived Rides:**
- Read-only display
- Separated by role:
  - As Driver
  - As Rider
- Shows completion date
- Click to view details

**Data Fetching:**
- `supabase.from('rides').select()`:
  - User's rides as driver
  - Include booking requests
  - Include rider details
- `supabase.from('booking_requests').select()`:
  - User's bookings as rider
  - Include ride details
  - Include driver info

**Real-Time Updates:**
- Booking status changes reflected immediately
- Seat counts update on approval
- No manual refresh needed

**User Interactions:**
- Approve/decline ride requests
- Cancel offered rides
- Cancel booking requests
- Navigate to chat
- Edit ride details
- View completed rides

---

### `/rides/[id]` - Ride Details
**File:** `app/rides/[id]/page.tsx`
**Authentication:** Partial (required for booking/review)
**Purpose:** Complete ride information and booking management

**Key Sections:**

**1. Ride Header:**
- Route: Origin → Destination
- Date and time
- Distance and estimated duration
- Trip type badge (One-Way, Round Trip, etc.)

**2. Ride Information:**
- **Schedule:**
  - Departure date/time
  - Return date/time (if round trip)
- **Capacity:**
  - Available seats
  - Seats remaining
  - Seats booked
- **Pricing:**
  - Total cost in SEK
  - Cost per person (if split)
- **Trip Preferences:**
  - Pets allowed: Yes/No/Maybe
  - Smoking allowed: Yes/No
  - Luggage: Small/Carry-on/Large
- **Driver Notes:**
  - Special requests or information

**3. Driver Profile Card:**
- Avatar and name (profile link)
- Ride statistics:
  - Rides as driver
  - Rides as rider
  - Trust score (if visible)
- Languages spoken
- Reviews count and average rating

**4. Vehicle Information:**
- Brand, Model
- Color, Year
- Plate number
- Seats capacity
- Primary vehicle badge

**5. Booking Section (for riders):**
- **Request to Join Button:**
  - Disabled if ride full
  - Disabled if already requested
  - Shows status if approved/pending
- **Cancel Join Button** (if approved):
  - Frees up seats
  - Updates availability
  - Sends notification to driver
  - System message in chat
- **Cancel Request Button** (if pending)
- **Contact Driver Button** → `/messages?ride=[id]`

**6. Booking Requests (for driver):**
- List of pending requests
- Rider info (avatar, name, profile link)
- Seats requested
- Request date
- **Actions:**
  - View profile
  - Chat with rider
  - Approve (green button)
  - Decline (red button)

**7. Trip Completion (post-arrival):**
- **Conditions:**
  - After departure time + arrival time
  - Within 5 hours of arrival
- **Confirmation:**
  - Driver confirms completion
  - Riders confirm completion
  - Auto-complete after 5 hours if not confirmed
- **Status Tracking:**
  - Shows who has confirmed
  - Waiting indicators

**8. Reviews Section (post-completion):**
- **Leave a Review:**
  - Star rating (1-5)
  - Review text (500 char limit)
  - Character counter
  - Submit button
- **View Reviews:**
  - Existing reviews for this ride
  - Reviewer info
  - Rating and text
  - Review date

**Forms:**
- Ride request (seats selection)
- Review submission (rating + text)

**Data Fetching:**
- `supabase.from('rides').select()`:
  - Ride details
  - Driver info
  - Vehicle info
  - Booking requests
  - Reviews
- `/api/rides/[id]/mark-complete` - Trip completion

**API Calls:**
- `supabase.from('booking_requests').insert()` - Request ride
- `supabase.from('booking_requests').update()` - Cancel request
- `supabase.rpc('update_ride_seats_on_cancellation')` - Free seats
- `supabase.rpc('create_notification')` - Notify driver
- `supabase.from('messages').insert()` - System message
- `supabase.from('reviews').insert()` - Submit review

**Special Features:**
- **System Messages:**
  - Created when rider requests
  - Approval/denial notifications
  - Cancellation notices
- **Seat Management:**
  - Real-time availability updates
  - Automatic recalculation on cancel
  - Database-level locking prevents race conditions
- **Trip Completion:**
  - Multi-party confirmation
  - Auto-completion fallback
  - Unlocks review capability
- **Notifications:**
  - Driver notified of requests
  - Driver notified of cancellations
  - Riders notified of approvals/denials

**User Interactions:**
- Request to join ride
- Cancel booking (pending or approved)
- Contact driver
- View driver profile
- Approve/decline requests (driver)
- Confirm trip completion
- Submit review

---

### `/rides/[id]/edit` - Edit Ride
**File:** `app/rides/[id]/edit/page.tsx`
**Authentication:** Required (driver only)
**Purpose:** Modify existing ride details

**Authorization Checks:**
- User must be ride driver
- Cannot edit cancelled rides
- Profile must be complete
- Cannot reduce seats below booked count

**Form Fields:** (Same as Create Ride)
- Route details (departure, arrival)
- Date and time
- Seats available (min = current bookings)
- Price (with suggestions)
- Vehicle selection
- Round trip toggle
- Trip preferences
- Driver notes

**Key Differences from Create:**
- **Seat Validation:**
  - Cannot reduce below currently booked seats
  - Warning displayed if attempted
- **Existing Data:**
  - Form pre-populated with current values
  - Route calculation uses existing polyline
- **Update Logic:**
  - Preserves existing polyline if locations unchanged
  - Updates only modified fields

**API Calls:**
- `supabase.from('rides').select()` - Fetch current ride
- `/api/geocoding` - Location updates
- `/api/routing` - Route recalculation (if needed)
- `supabase.from('rides').update()` - Save changes

**Validation:**
- All Create Ride validations apply
- Additional: Seat count >= booked seats
- Cannot edit past rides

**User Flow:**
1. Load existing ride data
2. Modify desired fields
3. Validate changes
4. Save updates
5. Redirect to ride details

---

## ⚖️ Legal & Compliance Pages

### `/legal/terms` - Terms & Conditions
**File:** `app/legal/terms/page.tsx`
**Authentication:** Not required
**Purpose:** Legal terms governing platform use

**Key Content:**

**1. Introduction:**
- Nordride as facilitator, not transport provider
- Users accept terms by using service

**2. What Nordride Is:**
- Facilitator of cost-sharing arrangements
- Not a transport company
- Not liable for rides or drivers

**3. Cost-Sharing Only:**
- No profit allowed
- Maximum pricing enforced: `(distance / 100) * 16 * 10` SEK
- Compliance with Swedish regulations

**4. User Responsibilities:**
- **All Users:**
  - Accurate information
  - Respectful communication
  - Compliance with laws
- **Drivers:**
  - Valid license and insurance
  - Safe vehicle
  - Legal cost-sharing only
- **Riders:**
  - On-time arrival
  - Reasonable behavior
  - Agreed payment

**5. Use at Your Own Risk:**
- Disclaimer of liability
- Users assume all risks
- No warranties provided

**6. Prohibited Activities:**
- Commercial use
- False information
- Harassment
- Illegal activities
- Price manipulation

**7. Content and Reviews:**
- User content ownership
- Platform review rights
- Removal authority

**8. Account Termination:**
- Suspension/termination conditions
- Violation consequences

**9. Limitation of Liability:**
- No liability for:
  - Accidents or injuries
  - Property damage
  - User disputes
  - Service interruptions
- Maximum liability: Amount paid in last 12 months

**10. Compliance with Swedish Law:**
- Transportstyrelsen regulations
- Non-commercial nature enforcement
- User responsibility for compliance

**11. Changes to Terms:**
- Right to modify
- Notice of changes
- Continued use = acceptance

**12. Governing Law:**
- Swedish law governs
- Swedish courts jurisdiction

**13. Contact:**
- support@nordride.com

---

### `/legal/privacy` - Privacy Policy
**File:** `app/legal/privacy/page.tsx`
**Authentication:** Not required
**Purpose:** GDPR-compliant data handling policy

**Key Sections:**

**1. Information Collection:**
- **Account Data:** Email, name, phone
- **Profile Data:** Bio, languages, interests, photo
- **Ride Data:** Routes, times, preferences, pricing
- **Messages:** Chat content (no analysis/profiling)
- **Reviews:** Ratings and comments
- **Usage Data:** Access logs, IP addresses

**2. How We Use Information:**
- Facilitate ride matching
- Process bookings and payments
- Safety and fraud prevention
- Platform improvements
- Legal compliance

**3. Data Sharing:**
- **Supabase:** Database hosting (EU data centers)
- **Vercel:** Application hosting
- **OpenRouteService:** Route calculations
- **Resend:** Email notifications
- **No selling of data**
- **Only essential sharing**

**4. GDPR Rights:**
- **Right to Access:** Request data copy
- **Right to Rectification:** Correct inaccurate data
- **Right to Erasure:** Delete account and data
- **Right to Data Portability:** Export data (JSON)
- **Right to Object:** Object to processing
- **Right to Withdraw Consent:** Opt-out anytime

**5. Data Retention:**
- **Active Accounts:** Retained while active
- **Messages:**
  - Auto-delete after 6 months of inactivity
  - Immediate soft-delete on user deletion
- **Deleted Accounts:** 30-day grace period
- **Ride History:** 12 months after completion
- **Reviews:** Indefinite (anonymized if account deleted)
- **Safety Logs:** 3 years (legal requirement)

**6. Security:**
- Encryption in transit (HTTPS/TLS)
- Encryption at rest
- Supabase authentication
- RLS policies
- Regular security audits

**7. Children's Privacy:**
- 18+ only
- No knowingly collecting minor data

**8. Changes to Policy:**
- Update notification process
- Effective date disclosure

**9. Contact:**
- privacy@nordride.com
- Data protection inquiries

**GDPR Highlights:**
- Transparent data usage
- User control over data
- Automatic deletion policies
- Export capabilities
- EU data residency

---

### `/legal/community` - Community Guidelines
**File:** `app/legal/community/page.tsx`
**Authentication:** Not required
**Purpose:** Behavioral expectations and community standards

**Guidelines:**

**1. Be Respectful and Kind:**
- Treat everyone with courtesy
- No harassment or discrimination
- No hate speech
- Respect privacy

**2. Be Reliable:**
- Arrive on time
- Cancel with reasonable notice (4+ hours)
- Honor commitments
- Update availability promptly

**3. Drive and Ride Safely:**
- **Drivers:**
  - Follow traffic laws
  - Maintain safe vehicle
  - No distracted driving
  - Valid license and insurance
- **Riders:**
  - Wear seatbelt
  - Don't distract driver
  - Follow driver's rules

**4. Honest Pricing:**
- Cost-sharing only (no profit)
- Transparent pricing
- No hidden fees
- Respect maximum pricing

**5. Communicate Clearly:**
- Confirm meeting points
- Discuss trip preferences
- Update on delays
- Use messaging system

**6. Reviews and Feedback:**
- Honest and fair reviews
- Constructive feedback
- No retaliatory reviews
- Report inappropriate reviews

**7. Privacy and Personal Information:**
- Don't share others' information
- Respect boundaries
- Use in-app communication
- No external contact sharing

**8. Report Problems:**
- Use report button
- Contact: support@nordride.com
- Emergency: 911 (police/ambulance)
- Safety concerns prioritized

**9. Consequences:**
- **First Violation:** Warning
- **Repeat Violations:** Suspension
- **Serious Violations:** Termination
- **Illegal Activity:** Legal action

---

### `/legal/cookies` - Cookie Policy
**File:** `app/legal/cookies/page.tsx`
**Authentication:** Not required
**Purpose:** Cookie usage transparency and user control

**Content:**

**1. What Are Cookies:**
- Definition and purpose
- Types (session, persistent)

**2. How We Use Cookies:**

**Essential Cookies** (Always Active):
- Authentication sessions
- Security tokens
- User preferences
- Form data persistence

**Functional Cookies** (Optional):
- UI preferences
- Language selection
- Recently viewed
- Search history

**Analytics Cookies** (Optional):
- Usage statistics
- Performance metrics
- Error tracking
- No personal identification

**3. Third-Party Cookies:**
- **Vercel:** Performance monitoring
- **OpenRouteService:** Map functionality
- Links to third-party policies

**4. Your Cookie Choices:**
- Consent banner on first visit
- Change preferences anytime
- Settings page access
- Browser controls

**5. Browser Management:**
- **Chrome:** Settings → Privacy → Cookies
- **Firefox:** Settings → Privacy → Cookies
- **Safari:** Preferences → Privacy
- **Edge:** Settings → Privacy → Cookies

**6. GDPR Compliance:**
- Explicit consent required (non-essential)
- Easy opt-out
- Consent withdrawal anytime
- ePrivacy Directive compliant

**7. Changes to Policy:**
- Update notification
- Effective date

**8. Contact:**
- privacy@nordride.com

---

## 📋 Summary Statistics

- **Total Pages:** 20
- **Authentication Required:** 9 pages
- **Public Pages:** 11 pages
- **Form-Heavy Pages:** 6 pages
- **Dashboard Pages:** 3 pages
- **Legal Pages:** 4 pages

---

## 🔗 Page Navigation Flow

```
/ (Home)
├── /auth/login
│   ├── /auth/signup
│   └── /auth/forgot-password
│       └── /auth/reset-password
├── /rides/search
│   └── /rides/[id]
│       ├── /rides/[id]/edit
│       └── /messages
├── /rides/create
│   └── /rides/[id]
├── /rides/my
│   ├── /rides/[id]
│   ├── /rides/[id]/edit
│   └── /messages
├── /profile
│   ├── /profile/edit
│   ├── /profile/settings
│   └── /profile/[id]
├── /messages
│   └── /rides/[id]
└── /about

Legal Pages:
├── /legal/terms
├── /legal/privacy
├── /legal/community
└── /legal/cookies
```

---

## 🎯 Key Features by Page

| Feature | Pages |
|---------|-------|
| Real-time Updates | Messages, My Rides, Ride Details |
| Location Autocomplete | Search, Create, Edit Ride |
| Image Upload | Edit Profile |
| Data Export | Settings |
| Social Login | Login, Signup |
| Reviews | Profile, Ride Details |
| Notifications | Ride Details (driver cancellations) |
| Trip Completion | Ride Details |
| Soft Delete | Messages |
| GDPR Compliance | Settings, Privacy Policy |

---

**Document Version:** 1.0
**Last Updated:** 2025-01-06
**Maintained By:** Nordride Development Team