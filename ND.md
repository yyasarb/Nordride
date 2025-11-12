# NORDRIDE - COMPREHENSIVE FEATURE SUMMARY

## **GLOBAL LAYOUT & NAVIGATION**

### **Site Header** (`components/layout/site-header.tsx`)
**Desktop Navigation:**
- **Logo**: Left-aligned, clickable (routes to `/`)
- **Center Nav Links**:
  - "Offer a Ride" → `/rides/create`
  - "Find a Ride" → `/rides/search`
- **Right Section** (when logged in):
  - **User Search Bar**: Search for users by name/username (80px width)
  - **Notification Bell Icon**: Dropdown with notifications, shows red badge for unread
  - **Friend Request Icon**: Dropdown with incoming friend requests, shows badge for pending
  - **Profile Dropdown**:
    - Shows user avatar (or initials if no photo)
    - Red badge shows unread message count
    - Dropdown contains:
      - User info (name, @username, email)
      - "Profile" → `/profile`
      - "My Trips" → `/rides/my`
      - "Messages" → `/messages` (shows unread badge)
      - Theme Toggle (light/dark mode)
      - "Log Out" button (black background)

**Desktop Navigation** (when not logged in):
- "Sign up" link → `/auth/signup`
- "Log in" button → `/auth/login`

**Mobile Navigation:**
- Hamburger menu (top-left)
- Logo (centered)
- Slide-down menu contains same items as desktop

### **Site Footer** (`components/layout/site-footer.tsx`)
**4 Columns:**
1. **Company**: About, How it works, Blog
2. **Rides**: Find a ride, Offer a ride, Popular routes
3. **Support**: Help center, Carpooling Guide → `/guide`, Contact us, Safety
4. **Legal**: Terms → `/legal/terms`, Privacy → `/legal/privacy`, Cookies → `/legal/cookies`

**Bottom Bar**: Copyright + social media icons (Facebook, Twitter, Instagram)

---

## **1. HOMEPAGE** (`/` - `app/page.tsx`)

### **Hero Section:**
- Large heading: "Share rides, reduce emissions, build community"
- Subheading: Platform description
- **Interactive Map Component**: Shows Sweden with animated route lines
- **Search Form** (center of page):
  - **"From" Input**: Autocomplete for origin address
    - Dropdown with top 5 location suggestions
    - Keyboard navigation (Arrow Up/Down, Enter, Escape)
    - Shows shortened address (city, state)
  - **"To" Input**: Autocomplete for destination address (same features)
  - **"Search Rides" Button** → Redirects to `/rides/search?from=...&to=...`

### **Features Section:**
- 4 feature cards:
  1. **Cost Sharing**: Split travel costs fairly
  2. **Eco-Friendly**: Reduce carbon footprint
  3. **Build Community**: Meet like-minded travelers
  4. **Trusted Network**: Verified profiles and reviews

### **CTA Buttons:**
- "Find a Ride" → `/rides/search`
- "Offer a Ride" → `/rides/create`

---

## **2. AUTHENTICATION PAGES**

### **A. Login Page** (`/auth/login`)
**Elements:**
- Heading: "Welcome back"
- Email input field
- Password input field
- "Forgot password?" link → `/auth/forgot-password`
- **OAuth Buttons**: "Continue with Google" / "Continue with Facebook"
- "Log in" button
- Success/error messages (green/red banners)
- "Don't have an account? Sign up" link → `/auth/signup`

**After Login:**
- Redirects to original intended page or `/`

---

### **B. Sign Up Page** (`/auth/signup`)
**Fields:**
- First Name
- Last Name
- Email
- Password (min 6 characters)
- Confirm Password
- **Terms Checkbox**: "I agree to Terms & Conditions and Privacy Policy"

**OAuth Buttons**: Google/Facebook signup

**After Signup:**
- Auto-generates username (firstnamelastname + digits if taken)
- Creates user profile in database
- Redirects to `/auth/login` with success message

---

### **C. Forgot Password Page** (`/auth/forgot-password`)
- Email input
- "Send reset link" button
- Success state: "Check your email" confirmation
- "Back to login" link

---

### **D. Reset Password Page** (`/auth/reset-password`)
- New Password field (min 6 characters)
- Confirm Password field
- "Reset password" button
- Success: redirects to login with message

---

## **3. RIDES SECTION**

### **A. Search Rides Page** (`/rides/search`)

**Search Form:**
- **From** input (autocomplete, keyboard nav)
- **To** input (autocomplete, keyboard nav)
- **Date** picker (optional)
- **Passengers** dropdown (1-7 seats)
- **"Search Rides" Button**

**Results Section:**
- Shows rides matching origin/destination proximity
- Each ride card displays:
  - **Route**: Origin → Destination with dot/arrow icons
  - **Departure Time**: Formatted date/time
  - **Available Seats**: X/Y seats
  - **Price**: Total cost in SEK
  - **Driver Info**: Avatar, name, verification badge
  - **Match Quality Badge**: "Perfect Match" (green) / "Nearby Match" (yellow)
  - **Proximity Info**: "Departure: X km away, Destination: Y km away"
  - **"View Details" Button** → `/rides/[id]`

**Filters** (if implemented):
- Departure time range
- Max price
- Preferences (pets, smoking, luggage)

**Empty State:**
- "No rides found" message
- Suggestion to create a ride alert

---

### **B. Create Ride Page** (`/rides/create`)

**Step-by-Step Form:**

**1. Route Details:**
- **Origin** input (autocomplete with suggestions)
- **Destination** input (autocomplete)
- **Route Description** (optional text area)

**2. Date & Time:**
- **Departure Date** picker
- **Departure Time** picker
- **Round Trip Toggle**: If enabled, shows return date/time fields
- **Estimated Arrival Time** (auto-calculated or manual)

**3. Vehicle Selection:**
- Dropdown of user's vehicles (brand, model, color, plate)
- "Add new vehicle" button

**4. Pricing:**
- **Suggested Total Cost**: Auto-calculated based on route distance
- **Manual Price Override**: Optional input
- Formula displayed: (distance × SEK/km rate) + tolls

**5. Seat & Passenger Preferences:**
- **Seats Available** (1-7)
- **Pets Allowed**: Checkbox
- **Smoking Allowed**: Checkbox
- **Female Only**: Checkbox
- **Eating Allowed**: Checkbox
- **Luggage Capacity**: Multi-select (small bag, medium bag, large suitcase)
- **Talkativeness Level**: Radio buttons (Silent / Low / Medium / High)
- **Payment Method**: Swish / Cash / Both

**6. Spotify Integration** (if connected):
- Shows connected playlist
- Option to create collaborative playlist for ride

**Buttons:**
- "Create Ride" (black button)
- Success → redirects to `/rides/my` with success message

---

### **C. My Rides Page** (`/rides/my`)

**Statistics Cards** (top row):
1. **Rides Offered**: Total count + "X upcoming"
2. **Rides Joining**: Approved rides + "X pending"
3. **Seats Filled**: Total across all rides

**Section 1: Rides I'm Offering**

Each ride card shows:
- **Route**: Origin → Destination with visual connector
- **Departure Time** badge
- **Seats Filled**: X/Y badge
- **Created Date** badge
- **Status Badge**: Published/Cancelled/Completed (color-coded)
- **Total Cost**: SEK amount
- **Action Buttons**:
  - "Edit Ride" → `/rides/[id]/edit`
  - "Cancel" button (with confirmation)
  - "View Ride" → `/rides/[id]`

**Approved Riders List:**
- Shows avatar, name, seats requested
- Link to rider profile

**Pending Requests Section** (if any):
- Shows pending rider with avatar, name, seats
- Buttons:
  - "View Profile" → `/profile/[id]`
  - "Chat" → `/messages?ride=[id]`
  - "Approve" button (green)

---

**Section 2: Rides I'm Joining**

Each ride shows:
- Route with origin/destination
- Departure time
- Seats requested badge
- **Status Badge**: Pending (amber) / Approved (green)
- **Driver Info**: Avatar, name
- **"Open Chat" link** → `/messages?ride=[id]`

---

**Section 3: Completed Rides**

**As Driver:**
- Past rides with completion badge (green)
- Clickable → `/rides/[id]`

**As Rider:**
- Past rides joined as passenger
- Clickable → `/rides/[id]`

---

### **D. Ride Detail Page** (`/rides/[id]`)

**Top Section:**
- **Route Map**: Origin → Destination with distance
- **Departure/Arrival Times**: Full date/time
- **Match Quality Badge** (if from search)
- **Proximity Info**: "Your departure is X km away" (if applicable)

**Ride Information Card:**
- Total cost: SEK
- Available seats: X/Y
- **Driver Section**:
  - Avatar, name, verification badge
  - Trust score (if applicable)
  - Total rides as driver
  - Languages spoken
  - **"View Profile" button** → `/profile/[driver_id]`
  - **"Send Friend Request" button** (if not friends)

**Vehicle Information:**
- Brand, Model, Color
- Plate Number (last 3 digits shown)

**Preferences & Rules:**
- Icons for: Pets Allowed, Smoking, Female Only, Eating, Luggage, Talkativeness
- Payment method (Swish/Cash icons)

**Spotify Playlist Widget** (if driver connected):
- Shows playlist cover, name
- "Open in Spotify" button
- "Add to Collaborative Playlist" (if enabled)

**Action Buttons:**

**For Non-Drivers:**
- **"Request to Join" Button** → Opens modal:
  - Select number of seats
  - Optional message to driver
  - "Send Request" button
- After requesting → Shows "Request Pending" badge

**For Drivers:**
- **"Edit Ride" button** → `/rides/[id]/edit`
- **"Cancel Ride" button** → Confirmation modal

**Booking Requests Section** (driver view):
- List of pending/approved riders
- Each shows: avatar, name, seats requested, request date
- Actions: "Approve" / "Decline" buttons

**Share Ride Button**: Copy link or share via social media

**Report Ride Button**: Opens report modal (inappropriate content, scam, safety concern)

**Post-Ride Features** (after completion):
- **Mark as Complete** button (driver)
- **Leave Review** section: Rating (stars) + text review
- Shows existing reviews

---

### **E. Edit Ride Page** (`/rides/[id]/edit`)
- Same form as Create Ride
- Pre-filled with existing ride data
- **"Update Ride" button**
- **Note**: Cannot change origin/destination after booking requests approved

---

## **4. PROFILE SECTION**

### **A. My Profile Page** (`/profile`)

**Header Section:**
- **Cover Photo** (if uploaded)
- **Profile Picture** (circular, center)
- **Full Name**
- **@username** (gray text below name)
- **Verification Badge** (if tier ≥ 1)
- **"Edit Profile" Button** → `/profile/edit`
- **"Settings" Button** → `/profile/settings`

**Profile Completion Banner** (if < 100%):
- Progress bar showing completion percentage
- List of missing items: "Add bio", "Upload photo", "Add languages", etc.
- "Complete Profile" button → `/profile/edit`

**Statistics Row:**
1. **Tier Progress**: Current tier + progress to next tier
2. **Rides as Driver**: Count
3. **Rides as Passenger**: Count
4. **Reviews**: Average rating (stars) + count

**About Section:**
- Bio text
- Languages spoken (badges)
- Interests (badges)
- Member since date

**Vehicles Section:**
- List of user's vehicles
- Each shows: Brand, Model, Color, Plate
- "Add Vehicle" button (if none)

**My Friends Section:**
- Shows first 12 friends (grid layout)
- Each friend card:
  - Avatar (48px circular)
  - Full name
  - @username
  - Verification badge
  - Clickable → `/profile/[friend_id]`
- **Empty State**: "No friends added yet" with Users icon
- **"View All" Link** → `/profile/friends` (if >12 friends)

**Recent Rides Section** (if any):
- Last 3 rides offered or joined
- Each shows: route, date, status

---

### **B. Public Profile Page** (`/profile/[id]`)
Similar to My Profile, but:
- **No "Edit Profile" button**
- **Friend Request Button**:
  - If not friends: "Send Friend Request"
  - If request sent: "Request Pending"
  - If friends: "Unfriend" (with confirmation)
- **"Send Message" Button** → `/messages?user=[id]`
- **"Block User" Button** (in dropdown menu)
- Shows mutual friends count
- Public info only (no private details)

---

### **C. Edit Profile Page** (`/profile/edit`)

**Profile Photo Section:**
- Current photo display
- **"Upload Photo" button** (file picker)
- **"Remove Photo" button**

**Basic Information:**
- **First Name** (required)
- **Last Name** (required)
- **Username** (required, 2-30 characters):
  - Real-time validation (500ms debounce)
  - Visual feedback:
    - Green border + checkmark = available
    - Red border + X = taken/invalid
    - Gray border = unchanged
  - Inline messages: "Username is available!" / "Already taken" / "Invalid format"
  - **Rate Limit**: Can change once per 7 days
  - **Format**: Lowercase alphanumeric, dots, underscores only
- **Bio** (text area, 500 chars max)

**Languages:**
- Multi-select dropdown
- Shows selected languages as removable badges
- Options: Swedish, English, Norwegian, Danish, Finnish, German, etc.

**Interests:**
- Multi-select dropdown
- Shows selected interests as badges
- Options: Travel, Music, Sports, Reading, Hiking, Photography, etc.

**Social Links:**
- **Facebook Profile URL** (optional)
- **Instagram Profile URL** (optional)

**Spotify Integration:**
- **"Connect Spotify" button** (if not connected)
- Shows connected account info
- **"Disconnect Spotify" button** (if connected)
- Option to set default playlist for rides

**Buttons:**
- **"Save Changes"** (black button)
  - Disabled if username invalid/taken
  - Shows validation errors if any
- **"Cancel"** → Returns to `/profile`

**Success/Error Messages:**
- Green banner: "Profile updated successfully!"
- Red banner: Error messages with specific issues

---

### **D. Friends Page** (`/profile/friends`)

**3 Tabs:**

**1. Requests Tab** (shows badge count if >0):
- **Incoming Friend Requests**:
  - Each shows: avatar, name, verification badge, request message, requested date
  - Buttons: **"Accept"** (green) / **"Decline"** (red)
  - After action → shows success message, refreshes list

**2. My Friends Tab:**
- **Search Bar**: "Search friends..." (filters by name)
- **Friends List** (alphabetical by last name):
  - Each friend card:
    - Avatar (circular)
    - Full name
    - @username
    - Verification badge
    - **"View Profile" button** → `/profile/[id]`
    - **"Message" button** → `/messages?user=[id]`
    - **"More" dropdown**:
      - "View Mutual Friends" → Opens modal with list
      - "Unfriend" → Confirmation modal
      - "Block" → Confirmation modal
- **Empty State**: "Start building your travel network!"

**3. Sent Tab:**
- **Pending Sent Requests**:
  - Shows avatar, name, sent date
  - **"Cancel Request" button**
- **Empty State**: "No pending sent requests"

---

### **E. Profile Settings Page** (`/profile/settings`)

**2 Main Tabs:**

**1. Privacy & Data Tab:**

**Export Your Data:**
- Description: "Download a copy of all your data"
- Includes: Profile, rides, bookings, reviews, messages
- **"Export Data" Button** → Downloads JSON file

**Delete Your Account:**
- Red warning card
- Description: "Permanently delete your account and all data"
- **Initial Button**: "Delete Account" (red outline)
- **Expanded Confirmation**:
  - Shows what will be deleted (bullet list)
  - **Text Input**: User must type "DELETE" to confirm
  - **"Confirm Delete" Button** (red) - enabled only if "DELETE" typed
  - **"Cancel" Button**
- After deletion → Signs out, redirects to homepage

**Your Privacy Rights (GDPR):**
- Information card listing rights:
  - Access your data
  - Rectify inaccurate data
  - Request erasure
  - Export data (portability)
  - Object to processing
  - Withdraw consent
- Link to Privacy Policy

**2. Profile Settings Tab:**
- Description: "Edit your profile information, languages, interests, vehicles"
- **"Go to Profile Edit" Button** → `/profile/edit`

**Success/Error Messages:**
- Green: "Data exported successfully!"
- Red: "Failed to delete account. Please contact support."

---

### **F. Profile Alerts Page** (`/profile/alerts`)

**Page Header:**
- Title: "Ride Alerts"
- Description: "Get notified when rides match your saved routes"
- Active alerts count: "X/10 active alerts"
- **"Create Alert" Button** (disabled if 10 alerts exist)

**Active Alerts Section:**
- Each alert card shows:
  - **Alert Name** (optional, user-defined)
  - **Departure Address** (green pin icon)
  - **Destination Address** (red pin icon)
  - **Proximity**: "Within X km of route"
  - **Action Buttons**:
    - Bell icon (toggle enabled/disabled)
    - Edit icon → Opens edit modal
    - Trash icon → Confirmation dialog

**Disabled Alerts Section** (if any):
- Same layout as active, grayed out opacity

**Create/Edit Alert Modal:**
- **Alert Name** (optional): Text input
- **From** (departure): Autocomplete with suggestions (disabled when editing)
- **To** (destination): Autocomplete with suggestions (disabled when editing)
- **Proximity Slider**: 1-50 km range
- Info box: "You'll be notified when rides match within X km"
- **Buttons**:
  - "Create Alert" / "Update Alert"
  - "Cancel"

**Note**: Cannot change route locations when editing, only name and proximity

**Empty State:**
- Bell icon (large)
- "No alerts yet"
- "Create your first alert" description
- "Create Alert" button

---

## **5. MESSAGES PAGE** (`/messages`)

**Layout: 2-Column Split**

**Left Column: Conversations List**
- Header: "Conversations"
- Each thread shows:
  - **Route**: Origin → Destination (truncated)
  - **Departure Time**: Formatted date/time
  - **Driver Name**: "Driver: [Name]" (with verification badge)
  - **Last Message Preview**: First 2 lines of last message
  - **Unread Badge**: Green badge with count (if unread user messages)
  - **Delete Button**: Trash icon (hover to show)
- **Active Thread**: Gray background, black left border
- **Unread Thread**: Green background, green left border

**Delete Conversation Confirmation:**
- Modal explains soft-delete behavior
- Warning: "Other user will still see it unless they delete too"
- Info: "Once both delete, permanently erased"
- GDPR note: "Auto-deleted after 6 months inactivity"
- Buttons: "Cancel" / "Delete Conversation" (red)

**Right Column: Chat Interface**

**Chat Header:**
- **Ride Details**: Origin → Destination, departure time
- **"View Ride" Button** → `/rides/[id]`
- **Participants**: Shows driver (if rider) or all approved riders (if driver)
  - Each participant: avatar + name, clickable → `/profile/[id]`

**Message Area:**
- Scrollable message list
- **Own Messages**: Right-aligned, black background, white text
- **Other Messages**: Left-aligned, gray background, black text
- **System Messages** (centered, blue background):
  - Ride request notifications
  - Approval/denial notifications
  - **Action Buttons** (for driver on pending requests):
    - "Approve Request" (green)
    - "Deny Request" (red outline)
  - Shows action state after completion: "Approved" / "Denied" badge

**Message Input:**
- Text input field: "Type your message..."
- **Send Button** (right-aligned, blue)
- **Enter Key**: Sends message

**Empty State** (no threads):
- "You have no conversations yet"
- Buttons:
  - "Find a Ride" → `/rides/search`
  - "Offer a Ride" → `/rides/create`

---

## **6. NOTIFICATIONS PAGE** (`/notifications`)

**Header:**
- Title: "Notifications"
- Unread count: "You have X unread notifications"
- **"Mark All as Read" Button** (if unread >0)

**Notification List:**
- Each notification card:
  - **Icon** (left): Type-specific icon (CheckCircle/XCircle/Bell/MessageSquare)
  - **Title**: Bold text
  - **Body**: Description text
  - **Timestamp**: "X minutes/hours/days ago"
  - **Unread Indicator**: Red dot (right side)
  - **Background**: Blue tint if unread, white if read
  - **Clickable** (if has ride_id): Goes to `/rides/[id]`

**Notification Types:**
- Ride request received
- Request approved
- Request denied
- Ride cancelled
- Ride completed
- Review received
- Friend request received

**Empty State:**
- Bell icon (gray, large)
- "No notifications yet"

---

## **7. LEGAL PAGES**

### **A. Terms & Conditions** (`/legal/terms`)
- Full legal terms document
- Sections: Acceptance, Account Registration, Ride Sharing, Payments, Liability, etc.
- "Back to Home" link

### **B. Privacy Policy** (`/legal/privacy`)
- GDPR-compliant privacy policy
- Sections: Data Collection, Usage, Sharing, Cookies, User Rights, etc.
- "Back to Home" link

### **C. Cookie Policy** (`/legal/cookies`)
- Cookie usage explanation
- Types of cookies used
- How to manage cookies
- "Back to Home" link

### **D. Community Guidelines** (`/legal/community`)
- Expected behavior
- Prohibited actions
- Reporting process
- Consequences of violations

---

## **8. ABOUT & GUIDE PAGES**

### **A. About Page** (`/about`)

**Sections:**
1. **Our Mission**
2. **What Makes Nordride Different**: 4 key differentiators
3. **How It Works**: 3-step process cards
4. **Our Values**: Trust, Sustainability, Affordability, Safety, Respect
5. **Legal & Compliance**: Explanation of facilitator role
6. **Contact Us**: Email addresses and company info

**"Back to Home" link**

---

### **B. Carpooling Guide Page** (`/guide`)

**Community Values Box** (blue):
- Platform ethos and guidelines

**For Drivers Section:**
- 6 Guideline Cards:
  1. Be Punctual
  2. Keep Vehicle Clean & Safe
  3. Accurate Trip Details
  4. Fair Cost Sharing
  5. Communicate Clearly
  6. Be Respectful & Friendly

**For Riders Section:**
- 6 Guideline Cards:
  1. Be On Time
  2. Respect Car & Driver
  3. Pay as Agreed
  4. Follow House Rules
  5. Communicate Proactively
  6. Safety First

**Consequences Box** (red):
- No-shows/late: 3-week suspension
- Harassment: Permanent ban
- Late cancellations: Warnings
- Scamming: Permanent ban + legal action

**FAQ Section:**
- 5 common questions with answers

**CTA Section** (gradient background):
- "Ready to Start Carpooling?"
- Buttons: "Find a Ride" / "Offer a Ride"

---

## **9. ADMIN PANEL** (`/admin/**`)

**Access**: Admin users only (role-based)

### **Admin Dashboard** (`/admin`)
**Statistics Cards:**
- Total Users
- Total Rides
- Active Rides
- Pending Reports

**Quick Actions:**
- View Users
- View Rides
- View Reports
- View Reviews

---

### **User Management** (`/admin/users`)
**Search Bar**: Search by name, email, username
**User Table** columns:
- Avatar
- Name (@username)
- Email
- Verification Tier
- Trust Score
- Total Rides
- Status (Active/Suspended/Banned)
- Actions:
  - "View Profile" → `/admin/users/[id]`
  - "Suspend User" (temp ban)
  - "Ban User" (permanent)
  - "Reset Password"

**Filters**: By tier, status, join date

---

### **User Detail Page** (`/admin/users/[id]`)
**User Information:**
- Full profile data
- Account creation date
- Last login
- Email verification status
- Phone verification status

**Actions:**
- Edit profile details
- Change tier
- Adjust trust score
- View all rides (as driver/rider)
- View all reviews
- View reports filed by/against user
- Suspend/Ban/Restore account

**Activity Log:**
- Recent logins
- Profile changes
- Ride creations
- Booking activity

---

### **Rides Management** (`/admin/rides`)
**Ride Table** columns:
- Ride ID
- Driver (name + link to profile)
- Route (origin → destination)
- Departure Date/Time
- Seats (filled/available)
- Status
- Created Date
- Actions:
  - "View Details" → `/rides/[id]`
  - "Cancel Ride"
  - "Flag as Suspicious"

**Filters**: By status, date range, driver

---

### **Reports Management** (`/admin/reports`)
**Reports Table** columns:
- Report ID
- Reporter (user)
- Reported Item (ride/user/message)
- Reason
- Status (Pending/Reviewed/Resolved/Dismissed)
- Created Date
- Actions:
  - "View Details"
  - "Mark Resolved"
  - "Dismiss"
  - "Take Action" (suspend user, delete ride, etc.)

**Report Details Modal:**
- Full description
- Screenshots (if provided)
- Context (ride details, user profiles)
- Admin notes
- Actions taken

---

### **Reviews Management** (`/admin/reviews`)
**Reviews Table** columns:
- Reviewer
- Reviewee
- Ride ID
- Rating (stars)
- Text
- Created Date
- Actions:
  - "View Full Review"
  - "Flag as Inappropriate"
  - "Delete Review"

**Filters**: By rating, flagged status, date

---

### **Activity Log** (`/admin/activity`)
**System-wide Activity Stream:**
- User registrations
- Ride creations
- Bookings made
- Reviews submitted
- Reports filed
- Admin actions taken

**Filters**: By activity type, date range, user

---

## **10. KEY FEATURES & FUNCTIONALITY**

### **A. Username System**
**Auto-Assignment:**
- New users get auto-generated username from first + last name
- If taken, appends numbers (e.g., johndoe123)
- Falls back to `user[uuid]` if name too short

**Edit Restrictions:**
- 2-30 characters
- Lowercase only
- Alphanumeric + dots + underscores
- Must start/end with alphanumeric character
- **Rate Limit**: Once per 7 days
- Reserved words blocked (admin, support, nordride, etc.)

**Real-Time Validation:**
- 500ms debounce on typing
- Checks: format → reserved → availability
- Visual feedback: green border (available) / red (taken/invalid)
- Shows status icons and inline messages

---

### **B. Friends System**
**Friendship Flow:**
1. User A sends friend request to User B
2. Optional message included
3. User B receives notification
4. User B accepts/declines
5. If accepted: bidirectional friendship created

**Features:**
- View mutual friends
- Unfriend (confirmation required)
- Block user (prevents all interaction)
- Friend request dropdown in header (shows badge for pending)
- Friends visible on profile (max 12, "View All" for more)

---

### **C. Verification & Tier System**
**Tiers:**
- **Tier 0**: New user (no badge)
- **Tier 1**: Verified email + phone (silver badge)
- **Tier 2**: 5+ completed rides + positive reviews (gold badge)
- **Tier 3**: 20+ completed rides + excellent reviews (platinum badge)

**Tier Progress Component:**
- Shows current tier
- Progress bar to next tier
- Requirements list

**Benefits by Tier:**
- Higher visibility in search results
- Priority in booking approvals
- Unlock features (collaborative playlists, etc.)

---

### **D. Spotify Integration**
**Features:**
- Connect Spotify account (OAuth)
- Set default playlist for rides
- Create collaborative playlists for specific rides
- Riders can add songs before/during trip
- Playlist widget on ride detail page

**Ride Creation:**
- Toggle "Create collaborative playlist"
- Auto-creates Spotify playlist named "[Origin] → [Destination] - [Date]"
- Adds driver as owner, riders as collaborators

---

### **E. Ride Alerts System**
**Create Alert:**
- Specify departure location
- Specify destination location
- Set proximity radius (1-50 km)
- Optional alert name

**Notifications:**
- User receives notification when new ride published matching criteria
- Both origin AND destination must be within proximity
- Email + in-app notification

**Limits:**
- Max 10 alerts per user
- Can enable/disable without deleting
- Edit: Can change name and proximity, but not locations

---

### **F. Real-Time Features**
**Powered by Supabase Realtime:**
- New messages appear instantly
- Friend requests show immediately
- Notifications push in real-time
- Ride booking requests update live

**Unread Counts:**
- Messages: Red badge on profile dropdown + Messages link
- Notifications: Red badge on bell icon
- Friend Requests: Badge on friend icon

---

### **G. Geocoding & Routing**
**Address Autocomplete:**
- Powered by Nominatim (OpenStreetMap)
- Debounced search (250-300ms)
- Shows top 5 suggestions
- Displays full address + simplified version
- Stores lat/lon for proximity calculations

**Route Distance Calculation:**
- Uses OpenRouteService API
- Calculates driving distance
- Estimates duration
- Auto-suggests price based on distance

**Proximity Matching:**
- Compares origin lat/lon to rider's search origin
- Compares destination lat/lon to rider's search destination
- Classifies as "Perfect Match" (<5km) or "Nearby Match" (<20km)

---

### **H. Review System**
**After Ride Completion:**
- Driver can mark ride as complete
- Riders can mark ride as complete (majority vote)
- **Post-Ride Modal** appears 5 seconds after completion
- Users can review each other (driver ↔ rider, rider ↔ rider)

**Review Form:**
- **Rating**: 1-5 stars (required)
- **Text Review**: Optional, 500 chars max
- **Select Reviewee**: Dropdown (driver or specific rider)

**Review Display:**
- Shows on user profile
- Average rating displayed
- Most recent reviews shown
- **Cannot edit/delete** after submission (admin can)

---

### **I. Trust Score System**
**Calculation Factors:**
- Email verification: +10
- Phone verification: +15
- Profile completion: +20
- Positive reviews: +5 each
- Negative reviews: -10 each
- No-shows: -15 each
- On-time arrivals: +3 each

**Starting Score**: 100

**Impacts:**
- Shown on profile
- Affects search ranking
- Used for automated moderation decisions

---

### **J. Payment Handling**
**Cost Calculation:**
- Distance (km) × Rate per km (e.g., 3 SEK/km)
- Add tolls/parking if applicable
- Driver sets final price (suggested auto-calculated)

**Payment Methods:**
- **Swish**: Swedish mobile payment
- **Cash**: Physical currency
- **Both**: Driver accepts either

**Payment Flow:**
1. Driver sets price when creating ride
2. Rider sees price before booking
3. Payment happens **after ride completion**
4. No escrow or platform processing (peer-to-peer)

**Note**: Platform is cost-sharing facilitator, not payment processor

---

### **K. Reporting & Safety**
**Report Types:**
- Inappropriate content
- Scam/fraud
- Safety concern
- Harassment
- Other (with description)

**Report Flow:**
1. User clicks "Report" button (on ride/profile/message)
2. Selects reason from dropdown
3. Provides details (text area)
4. Optional: Upload screenshot
5. Submits → Goes to admin queue

**Safety Features:**
- Block user (prevents all future interaction)
- Emergency "Drop me off" suggestion in guide
- Profile verification badges
- Review system transparency
- Trust score visibility

---

### **L. Data Export & GDPR Compliance**
**Export Your Data:**
- Downloads JSON file with:
  - Profile information
  - All rides offered
  - All ride requests
  - All reviews (given and received)
  - All messages sent

**Delete Account:**
- Soft delete initially (30-day grace period)
- Hard delete after 30 days
- Cascade deletes:
  - Rides cancelled
  - Messages anonymized
  - Reviews retained but user marked as "[Deleted User]"

**Data Retention:**
- Active accounts: Indefinite
- Deleted accounts: 30 days
- Inactive messages: Auto-delete after 6 months (GDPR)

---

## **11. VISUAL DESIGN SYSTEM**

**Colors:**
- **Primary Black**: Buttons, headers, active states
- **Gray Scale**: Backgrounds, borders, text hierarchy
- **Green**: Success, available, active rides
- **Red**: Errors, warnings, delete actions
- **Blue**: Info, system messages, links
- **Amber**: Pending, warnings

**Typography:**
- **Display Font**: DM Serif Display (headings)
- **Body Font**: DM Sans (all other text)

**Components:**
- **Cards**: White background, 2px border, rounded corners
- **Buttons**: Rounded-full, black/white/outline variants
- **Input Fields**: 2px border, rounded-xl, focus ring
- **Badges**: Rounded-full, small text, color-coded
- **Icons**: Lucide React library

**Layout:**
- Max width: 7xl (1280px) for most pages
- Responsive breakpoints: sm, md, lg, xl
- Padding: 4-6 on mobile, 6-8 on desktop
- Spacing: 4, 6, 8, 12 (Tailwind scale)

---

## **SUMMARY**

This comprehensive document covers **every page**, **every button**, **every link**, and **every feature** in the Nordride carpooling platform. The application is a full-featured ride-sharing system with:

- **31 pages** (including auth, rides, profile, admin, legal)
- **User authentication** with OAuth and email/password
- **Advanced ride search** with proximity matching and real-time autocomplete
- **Complete messaging system** with ride-based threads
- **Friends & social networking** features
- **Profile management** with verification tiers and trust scores
- **Spotify integration** for collaborative playlists
- **Real-time notifications** for all user actions
- **Admin panel** for moderation and management
- **GDPR-compliant** data export and account deletion
- **Comprehensive safety** features and reporting system

The platform is built with **Next.js 14**, **Supabase (PostgreSQL + Realtime)**, **TypeScript**, **Tailwind CSS**, and follows modern web development best practices with server-side rendering, real-time subscriptions, and responsive mobile-first design.
