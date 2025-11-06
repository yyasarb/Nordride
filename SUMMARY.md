# 🚗 NORDRIDE — Product Summary

**Version:** 1.0
**Last Updated:** January 2025
**Target Market:** Sweden & Nordic Countries

---

## 📋 Executive Overview

**Nordride** is a free, community-driven ride-sharing platform designed for sustainable travel across the Nordic countries, with a primary focus on Sweden. Unlike commercial ride-sharing services, Nordride operates on a **cost-sharing model** where drivers and riders split travel expenses without profit-making, ensuring compliance with Swedish transport regulations (Transportstyrelsen).

The platform emphasizes:
- **Zero commissions** — completely free for all users
- **Environmental sustainability** — reducing CO₂ emissions through shared rides
- **Community trust** — verified profiles, written reviews, and transparent pricing
- **Legal compliance** — GDPR-compliant, adheres to Swedish transport laws
- **Safety** — encrypted messaging, verified users, community guidelines

---

## 🎯 Core Value Proposition

### For Riders
- **Save Money**: Split travel costs instead of paying full fare
- **Eco-Friendly**: Reduce carbon footprint by sharing rides
- **Build Connections**: Meet fellow travelers and build community
- **Flexible Travel**: Find rides for popular routes across Sweden and Nordics
- **Safe Experience**: Verified drivers, reviews, and in-app messaging

### For Drivers
- **Share Costs**: Offset fuel and toll expenses (no profit-making)
- **Help Community**: Assist fellow travelers while reducing environmental impact
- **Meet People**: Connect with interesting passengers
- **Easy Coordination**: Manage ride requests, communicate, and track bookings
- **Flexible Scheduling**: Offer rides on your own schedule

---

## 🚀 Key Features & Functionality

### 1. User Authentication & Profiles

#### Account Management
- **Sign Up**: Email-based registration with password
- **Email Verification**: Required for full platform access
- **Profile Completion Requirements**:
  - Profile picture (mandatory)
  - Verified email (mandatory)
  - At least one language (mandatory)
  - Vehicle information for drivers (mandatory to offer rides)
- **Profile Information**:
  - First name, last name, bio
  - Profile picture upload (compressed and optimized)
  - Languages spoken (comprehensive list of 70+ languages)
  - Interests (Music, Sports, Travel, Food, etc.)
  - Vehicle details (brand, model, color, plate number, year)
  - Join date and ride statistics

#### Privacy & Data Settings
- **Data Export**: Download complete user data in JSON format
  - Profile information
  - All rides offered
  - All booking requests
  - Reviews received and given
  - Message history
- **Account Deletion**: Permanent deletion with safety confirmation
  - User must type "DELETE" to confirm
  - All data permanently removed
  - Automatic sign-out after deletion
- **GDPR Rights**: Full documentation of user rights
  - Access personal data
  - Rectify inaccurate data
  - Request erasure
  - Data portability
  - Object to processing
  - Withdraw consent

#### Profile Display
- **Statistics Shown**:
  - Total rides completed (as driver)
  - Total rides joined (as rider)
  - SEK saved through ride-sharing
  - Review count
- **Reviews Section**: All written reviews with reviewer info, trip routes, and dates
- **Empty States**: Friendly messages when no data available

---

### 2. Ride Creation & Management

#### Offering a Ride

**Step 1: Route Planning**
- **Origin & Destination**: Autocomplete address search
  - Powered by OpenRouteService geocoding API
  - Displays simplified format (City, Country)
  - Full address data stored for backend routing
- **Route Calculation**: Automatic distance and duration estimation
  - Real-time routing via OpenRouteService
  - Distance displayed in kilometers
  - Duration displayed in hours and minutes
  - Route polyline for map visualization

**Step 2: Schedule**
- **Departure Date**: Calendar picker (no past dates allowed)
- **Departure Time**: 30-minute intervals (00:00 - 23:30)
- **Round Trip Option**:
  - Checkbox to enable return trip
  - Separate return date and time selection
  - Creates two separate ride entries (First Leg & Second Leg)

**Step 3: Vehicle Selection**
- **Choose from Existing Vehicles**: Dropdown with all user vehicles
- **Add New Vehicle** (inline form):
  - Brand (required)
  - Model (optional)
  - Color (optional)
  - Plate number (required)
  - Year (optional)
  - Number of seats (1-8)
- **Primary Vehicle**: Automatic selection of primary vehicle

**Step 4: Capacity & Pricing**
- **Available Seats**: Select 1-8 seats for passengers
- **Total Cost (SEK) per trip**:
  - **Formula**: Maximum cost = (distance/100) × 16 × 10
  - **Suggested Cost**: 80% of maximum (auto-calculated)
  - **Validation**: Cannot exceed maximum based on distance
  - **Cost-Sharing Reminder**: Prominent blue info box explaining no-profit policy
  - **Helper Text**: Shows suggested and maximum allowed costs
  - Auto-caps input if user tries to exceed maximum

**Step 5: Trip Preferences**
- **Pets Allowed**: Toggle (yes/no)
- **Smoking Allowed**: Toggle (yes/no)
- **Luggage Options**: Multi-select checkboxes
  - Small bag
  - Medium suitcase
  - Large suitcase
  - Backpack
  - Ski equipment
  - Bike
  - Other

**Step 6: Special Requests**
- Free-text field for additional information
- Examples: "Pick-up at train station", "Flexible departure time", etc.

**Validation & Safety**
- Profile completion check (must have vehicle, verified email, profile picture, language)
- Cost validation against distance-based maximum
- Past date prevention
- Real-time feedback messages (success/error)

#### Editing a Ride
- All fields editable except ride ID
- Updates reflect immediately in search results
- Notifications sent to riders if significant changes
- Cannot edit if ride has approved riders (safety measure)

#### Canceling a Ride
- **Driver Cancellation**:
  - Updates status to 'cancelled'
  - Notifies all riders with pending/approved requests
  - Ride removed from search results
  - Appears in "My Rides" with cancelled status
- **Rider Cancellation**:
  - Updates booking request to 'cancelled'
  - Frees up seat for other riders
  - Can re-request after cancellation

---

### 3. Finding & Booking Rides

#### Search Functionality
- **Search Inputs**:
  - Origin (autocomplete)
  - Destination (autocomplete)
  - Date (calendar picker)
- **Search Results Display**:
  - Route (origin → destination)
  - Departure date and time
  - Duration (e.g., "2 h 30 min")
  - Distance (e.g., "180 km")
  - Available seats (e.g., "3 seats")
  - Price per seat (in SEK)
  - Driver information (name, photo, review count)
  - Trip preferences (pets, smoking, luggage icons)
- **Sorting**: By departure time (ascending)
- **Filtering**: Active rides only (not cancelled or completed)

#### Ride Details Page
- **Full Ride Information**:
  - Complete route with polyline map
  - Departure and arrival locations
  - Date and time
  - Duration and distance
  - Price breakdown
  - Available seats count
  - Vehicle details (brand, model, color, plate)
  - Trip preferences (pets, smoking, luggage)
  - Special requests from driver
- **Driver Profile Card**:
  - Name, photo
  - Review count
  - Bio
  - Languages spoken
  - Member since date
- **Action Buttons**:
  - **"Request to Join"**: For available rides
  - **"Cancel Request"**: For pending requests (red outline)
  - **"Request Approved ✓"**: For approved requests (green, disabled)
  - **"Ride Full"**: When no seats available (gray, disabled)
  - **"Ride Cancelled"**: When driver cancelled (gray, disabled)

#### Request to Join Process
1. User clicks "Request to Join"
2. System validates:
   - User is logged in
   - Profile is complete (picture, email, language)
   - User is not the driver
   - Ride has available seats
   - No existing pending/approved request
3. Creates booking request with status 'pending'
4. Creates/finds message thread for driver-rider communication
5. Sends automatic notification to driver via in-app message
6. Shows success message to rider
7. Button changes to "Cancel Request"

#### Canceling a Request
1. User clicks "Cancel Request"
2. Updates booking request status to 'cancelled'
3. Frees up seat for other riders
4. Button reverts to "Request to Join"
5. User can re-request if desired

---

### 4. Ride Request Management (Driver View)

#### Pending Requests
- **Location**: Ride details page and "My Rides" dashboard
- **Display Information**:
  - Rider name and photo
  - Request timestamp
  - Rider profile (languages, review count, bio)
- **Actions**:
  - **Approve**: Confirms rider, decrements available seats
  - **Decline**: Rejects request, keeps seat available
  - **Open Chat**: Communicates with rider before deciding

#### Approve Request
1. Driver clicks "Approve"
2. System validates seat availability
3. Updates booking request status to 'approved'
4. Decrements available seats count
5. Sends notification to rider
6. Rider sees "Request Approved ✓" on ride details
7. Approved rider appears in "Riders Joining This Trip" section

#### Decline Request
1. Driver clicks "Decline"
2. Updates booking request status to 'declined'
3. Request removed from pending list
4. Rider notified (can request other rides)

#### Managing Approved Riders
- **View Approved Riders**: List shows name, photo, request date
- **Remove Rider**:
  - Updates status to 'declined'
  - Frees up seat
  - Shows feedback: "Rider is removed from this trip." (3-second auto-dismiss)
  - Rider receives notification

---

### 5. My Rides Dashboard

#### Three Main Sections

**1. Rides I'm Offering (Driver View)**
- **Active Rides**:
  - Route, date, time
  - Available seats / Total seats
  - Price per seat
  - Pending requests count (if any)
  - Approved riders list
  - Edit and Cancel buttons
- **Actions**:
  - View ride details
  - Edit ride information
  - Cancel ride
  - Approve/decline requests
  - Remove approved riders
  - Open chat with riders
  - Mark trip as complete (manual)
- **Empty State**: "You haven't offered any rides yet."

**2. Rides I'm Joining (Rider View)**
- **Pending Requests**:
  - Route, date, time
  - Request status: "Pending approval"
  - Driver name and photo
  - Price information
  - Cancel request option
- **Approved Bookings**:
  - Route, date, time
  - Confirmation: "Approved"
  - Driver contact information
  - Open chat option
  - View ride details
  - Cancel booking option
- **Empty State**: "You haven't requested any rides yet."

**3. Completed Rides (Both Views)**
- **Displayed After**:
  - Auto-completion: 5 hours after scheduled arrival time
  - Manual completion: Both driver and all riders mark as complete
- **Shows**:
  - Route and date
  - Trip participants (driver + all approved riders)
  - "Write Review" or "Edit Review" buttons for each participant
- **Empty State**: "You haven't completed any rides yet."

---

### 6. Trip Completion & Reviews

#### Auto-Completion Logic
- **Backend Trigger**: Runs every 30 minutes (pg_cron)
- **Conditions**: Trip marked complete when:
  - ≥ 5 hours passed since arrival time, OR
  - Driver AND all riders manually marked complete
- **Effects**:
  - Trip moves to "Completed Rides" section
  - Reviews become available to write
  - Edit/Cancel buttons removed
  - "Trip completed" banner shows on ride details page

#### Manual Completion
- **Option**: "Mark trip as complete" button on ride details
- **Available**: After scheduled arrival time
- **Trigger Function**: Checks if all participants marked complete
- **Instant Effect**: If everyone marked complete, trip status changes immediately

#### Review System
- **No Star Ratings**: Text-only reviews for authentic feedback
- **Who Can Review**:
  - Drivers can review each approved rider
  - Riders can review the driver
- **Review Process**:
  1. Select reviewee from list ("Leave review" button)
  2. Write review text (free-form)
  3. Submit review
  4. Option to edit later
- **Review Display**:
  - Shown on user profile pages
  - Includes reviewer name, photo, trip route, date
  - Chronological order (most recent first)
- **Privacy**: Reviews visible to all users viewing profile
- **Empty State**: "No reviews yet. Complete more rides to build your reputation."

#### Completed Trip Display
- **Banner**: "This trip has been marked as complete by all parties. You can now write a review."
- **Hidden Elements**:
  - Edit trip button
  - Cancel trip button
  - Ride requests section (all riders already approved)
- **Review Section**:
  - List of all trip participants
  - "Leave review" button for unreviewed participants
  - "Edit review" button for already reviewed participants
  - Review form with heading and description fields
  - Back button to return to participant list

---

### 7. Real-Time Messaging System

#### Chat Features
- **Access**: Click "Open chat" on ride details or from inbox
- **Thread Creation**: Automatic when rider requests or messages driver
- **Participants**: Driver and rider only (private)
- **End-to-End Flow**:
  - Rider requests ride → thread created
  - Message thread appears in both users' inboxes
  - Real-time sync via Supabase Realtime

#### Inbox (Messages Page)
- **Thread List** (Left Sidebar):
  - Route (origin → destination)
  - Departure date and time
  - Last message preview
  - Unread message count badge (green)
  - Visual indicators:
    - **Unread threads**: Green background, green left border, green icon
    - **Selected thread**: Gray background, black left border
    - **Normal threads**: White background
- **Conversation View** (Right Panel):
  - Full message history
  - Sender names and avatars
  - Message timestamps
  - Text input for new messages
  - Send button
- **Real-Time Updates**:
  - Messages appear instantly via Supabase subscriptions
  - Unread count updates live
  - Thread list refreshes automatically

#### Unread Message Handling
- **Visual Highlighting**:
  - Green background on threads with unread messages
  - Green badge showing unread count
  - Bold text for route and last message
  - Green MapPin icon
- **Mark as Read**: Automatic when thread opened
  - Updates all messages from other user to `is_read: true`
  - Clears unread badge
  - Removes green highlighting
  - Updates immediately in local state

#### Header Inbox Indicator
- **Inbox Icon**: Bell icon with notification badge
- **Badge Display**:
  - Shows total unread message count
  - Red background, white text
  - Shows "9+" for 10 or more unread messages
  - Real-time updates via Supabase subscription
  - Badge hidden when no unread messages

#### Message Thread Access Control
- **RLS Policies**:
  - Only driver and rider can view thread
  - Only driver and rider can send messages
  - Riders can view messages even after cancellation (read-only)
  - Riders can only send if they have active (pending/approved) request
- **Thread Persistence**:
  - Threads remain accessible after ride completion
  - Historical messages preserved
  - Useful for reviews and follow-up communication

---

### 8. Header Navigation & User Interface

#### Desktop Header
- **Left Side**:
  - **Nordride Logo**: Links to homepage
- **Center**:
  - **Find a Ride**: Link to search page
  - **Offer a Ride**: Link to create ride page
  - **My Rides**: Link to user's ride dashboard
- **Right Side** (Logged In):
  - **Inbox Icon**: Bell with red notification badge (unread count)
  - **User Avatar + First Name**:
    - Shows profile picture if available
    - Shows first letter in colored circle if no picture
    - Displays first name next to avatar
    - Links to profile page
- **Right Side** (Logged Out):
  - **Login**: Link to login page
  - **Sign Up**: Button to signup page

#### Mobile Header
- **Hamburger Menu**: Expands to show all navigation
- **Logo**: Centered
- **Same functionality** as desktop in menu drawer

#### Footer
- **Newsletter Section**:
  - Email input field
  - Subscribe button
  - Success/loading states
  - Disclaimer: "Receive premium updates and exclusive offers"
- **Legal Links**:
  - About
  - Terms & Conditions
  - Privacy Policy
  - Cookie Policy
  - Community Guidelines
- **Copyright**: "© 2025 Nordride. All rights reserved."
- **Disclaimer**: "Nordride is a community-based carpooling platform for sharing travel costs — not for making profit."

---

### 9. Homepage

#### Hero Section
- **Headline**: "Share the ride, share the planet"
- **Tagline**: "Join Sweden's community-driven ride-sharing platform. Connect with travelers, split costs, and reduce your carbon footprint."
- **Badge**: "100% Free • No Commissions"
- **Call-to-Action Buttons**:
  - "Find a ride" (primary, black)
  - "Offer a ride" (secondary, outline)
- **Visual**: Animated car and map pins with pulsing dots

#### Features Section
- **Community-driven**: No corporate middleman, built for the Nordic community
- **Eco-friendly**: Reduce CO₂ emissions by sharing rides
- **Safe & trusted**: Verified profiles, reviews, secure messaging

#### Impact Metrics
- **12.4M Rides shared**: Emphasizing community growth
- **98% Riders arrive with a smile**: High satisfaction rate
- **1 day Stockholm's air saved**: Environmental impact

#### Popular Routes
- Stockholm → Gothenburg
- Stockholm → Malmö
- Stockholm → Uppsala
- Gothenburg → Malmö
- Malmö → Copenhagen
- Uppsala → Linköping
- Clickable cards linking to pre-filled search

#### FAQ Section (9 Questions)
1. **Can I make money on Nordride?**
   No, profit is not allowed. Only cost-sharing is permitted.
2. **Is Nordride legal in Sweden?**
   Yes, as long as rides are cost-shared and non-commercial.
3. **Who's responsible if something goes wrong?**
   Rides are private arrangements. Nordride is a connection platform.
4. **How is my data protected?**
   GDPR-compliant. View, export, or delete data anytime.
5. **Can anyone see my chats?**
   No, chats are encrypted and visible only to participants.
6. **Do I need a special license to drive?**
   Standard driver's license required. Must be insured.
7. **Can I bring my dog or luggage?**
   Depends on driver's preferences. Filter by "pets allowed" or luggage options.
8. **What if I need to cancel?**
   Easy cancellation from ride page. Give notice when possible.
9. **How do reviews work?**
   Written reviews only (no stars). Visible on profiles after trip completion.

#### CTA Section (Logged Out Only)
- **Headline**: "Ready to start your journey?"
- **Subtext**: "Join thousands already sharing rides and reducing their carbon footprint"
- **Button**: "Get started for free"

---

### 10. Legal & Compliance Framework

#### Cookie Consent Modal
- **Appears**: On first visit after 1-second delay
- **Cookie Types**:
  - **Essential** (always active): Authentication, security, session management
  - **Optional**: Analytics, functional cookies
- **Options**:
  - "Accept All Cookies" (black button)
  - "Essential Only" (outline button)
- **Links**: Cookie Policy, Privacy Policy
- **Storage**: Choice saved in localStorage with timestamp
- **GDPR Compliance**: Explicit consent required for non-essential cookies

#### Terms Acceptance (Signup)
- **Checkbox**: Required to create account
- **Label**: "By creating an account, I agree to the [Terms & Conditions] and [Privacy Policy]"
- **Links**: Open Terms and Privacy pages in new tabs
- **Validation**: Cannot submit form without checking

#### Privacy Policy Page
- **GDPR Compliance**: Full documentation of data practices
- **Data Processors**: Supabase, Vercel, OpenRouteService, Resend
- **User Rights**: Access, rectification, erasure, portability, objection
- **Data Retention**: Policies for account data, messages, reviews
- **Security Measures**: Encryption, secure authentication
- **Contact**: privacy@nordride.com

#### Terms & Conditions Page
- **Platform Role**: Nordride as facilitator, not transport provider
- **Cost-Sharing Only**: No profit-making allowed
- **User Responsibilities**:
  - Drivers: Safe driving, vehicle maintenance, insurance
  - Riders: Respectful behavior, payment of agreed cost
- **Disclaimers**: "Use at your own risk"
- **Governing Law**: Swedish law, compliance with Transportstyrelsen
- **Dispute Resolution**: Recommendations for mediation

#### Community Guidelines Page
- **Be Respectful and Kind**: Courtesy, clear communication
- **Be Reliable**: Show up on time, cancel early if needed
- **Drive and Ride Safely**:
  - Drivers: Safe driving, clean vehicle, no substances
  - Riders: Wear seatbelt, respect vehicle, don't distract driver
- **Honest Pricing**: Only charge for fuel and tolls
- **Communicate Clearly**: Confirm details, discuss preferences
- **Reviews and Feedback**: Honest, constructive reviews
- **Privacy**: Don't share personal information without permission
- **Report Problems**: Report button, support email, emergency contacts
- **Consequences**: Warnings, suspension, termination for violations

#### Cookie Policy Page
- **What Are Cookies**: Explanation of cookies and their purpose
- **Cookie Types**:
  - Essential (authentication, security, session)
  - Functional (preferences, forms, UI)
  - Analytics (usage patterns, performance)
- **Third-Party Cookies**: Vercel, OpenRouteService
- **User Choices**:
  - Cookie consent banner
  - Update preferences anytime
  - Browser settings
- **Browser Management**: Links to Chrome, Firefox, Safari, Edge guides
- **Compliance**: GDPR, Swedish Electronic Communications Act, ePrivacy

#### About Page
- **Mission**: Community-driven, sustainable travel
- **Values**: Free platform, environmental focus, safety
- **How It Works**: 3 steps (offer/find, connect, travel)
- **Legal Compliance**: Swedish transport law adherence
- **Contact**: support@nordride.com

---

## 🔧 Technical Implementation

### Frontend Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with shadcn/ui base
- **State Management**: Zustand for auth state
- **Icons**: Lucide React
- **Fonts**: DM Sans (body), Space Grotesk (display)

### Backend Stack
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (email/password)
- **Real-Time**: Supabase Realtime (messages, notifications)
- **Storage**: Supabase Storage (profile pictures, vehicle images)
- **Functions**: Supabase Edge Functions (trip completion, notifications)
- **Scheduled Jobs**: pg_cron (auto-completion every 30 minutes)

### External APIs
- **Geocoding**: OpenRouteService API (address autocomplete)
- **Routing**: OpenRouteService API (distance, duration, polyline)
- **Maps**: OpenRouteService tiles (visual route display)
- **Email**: Resend API (email verification, notifications)

### Security & Compliance
- **RLS Policies**: Row-level security on all database tables
- **Authentication**: Secure session management via Supabase
- **Data Encryption**: Messages encrypted in transit and at rest
- **GDPR Compliance**: Data export, deletion, user rights documentation
- **Environment Variables**: All secrets stored in Vercel env vars
- **Private Repository**: Code not publicly accessible

### Database Schema

#### Core Tables
- **users**: Profile data, languages, interests
- **vehicles**: User vehicles (brand, model, color, plate, seats)
- **rides**: All ride listings (origin, destination, date, time, price, etc.)
- **booking_requests**: Ride requests (rider_id, ride_id, status)
- **reviews**: Written reviews (reviewer_id, reviewee_id, ride_id, text)
- **message_threads**: Chat threads (driver_id, rider_id, ride_id)
- **messages**: Individual messages (thread_id, sender_id, content, is_read)

#### Key Fields
- **rides.completed**: Boolean for trip completion status
- **rides.arrival_time**: Calculated for auto-completion
- **booking_requests.status**: 'pending', 'approved', 'declined', 'cancelled'
- **messages.is_read**: Boolean for unread tracking
- **users.email_confirmed_at**: Email verification timestamp

### Performance Optimizations
- **Image Compression**: Profile pictures compressed to 512×512, quality 0.7
- **Static Generation**: Legal pages pre-rendered at build time
- **Code Splitting**: Automatic Next.js code splitting
- **Lazy Loading**: Components loaded on demand
- **Route Caching**: API responses cached where appropriate
- **Real-Time Subscriptions**: Efficient Supabase channels

---

## 📊 User Statistics & Metrics

### Profile Statistics
- **Rides Completed** (as driver): Count of completed trips offered
- **Rides Joined** (as rider): Count of completed trips as passenger
- **SEK Saved**: Total savings from ride-sharing
  - Formula per trip: `total_cost - (total_cost / (filled_seats + 1))`
  - Aggregated across all completed trips
- **Reviews Count**: Total written reviews received
- **Member Since**: Account creation date

### Platform Metrics (Homepage)
- **12.4M Rides shared**: Total platform rides
- **98% Satisfaction**: Riders arrive happy
- **1 Day Air Quality**: CO₂ reduction equivalent

---

## 🎨 Design System

### Color Palette
- **Primary Black**: `#000000` (buttons, headers, emphasis)
- **Green/Emerald**: `#10b981`, `#059669` (success, eco-friendly theme)
- **Gray Scale**: `#f9fafb`, `#e5e7eb`, `#6b7280`, `#374151`
- **Status Colors**:
  - Blue: Information, messages
  - Amber: Warnings, incomplete profiles
  - Red: Errors, cancellations, delete actions
  - Green: Success, approvals, unread messages

### Typography
- **Display Font**: Space Grotesk (headings, large text)
- **Body Font**: DM Sans (paragraphs, UI text)
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Component Patterns
- **Cards**: White background, 2px border, rounded corners, hover shadows
- **Buttons**:
  - Primary: Black background, white text, rounded-full
  - Secondary: Outline with 2px border, rounded-full
  - Destructive: Red background/border, white text
  - Success: Green background, white text
- **Inputs**: 2px border, rounded-xl, focus ring
- **Badges**: Small rounded pills for status indicators
- **Modals**: Card-based with backdrop, slide-up animation

---

## 🔐 Privacy & Security Features

### Data Protection
- **Encryption**: All data encrypted in transit (HTTPS) and at rest
- **Access Control**: RLS policies ensure users only see permitted data
- **Authentication**: Secure session management, email verification required
- **Password Security**: Bcrypt hashing, minimum 6 characters
- **Session Expiry**: Automatic logout after period of inactivity

### GDPR Compliance
- **Right to Access**: Users can view all their data
- **Right to Rectification**: Edit profile anytime
- **Right to Erasure**: Delete account permanently
- **Right to Portability**: Export data in JSON format
- **Right to Object**: Opt out of optional cookies
- **Consent Management**: Explicit consent for cookies, terms, privacy

### User Safety
- **Profile Verification**: Email verification required
- **Review System**: Transparent feedback, no anonymous reviews
- **Reporting Mechanism**: Report users for violations
- **Community Guidelines**: Clear behavior expectations
- **Message Privacy**: Only participants can see conversations
- **No Phone Numbers**: Communication through platform only (until approved)

---

## 🌍 Supported Routes & Markets

### Primary Market
- **Sweden**: All cities and towns
  - Stockholm
  - Gothenburg
  - Malmö
  - Uppsala
  - Linköping
  - Helsingborg
  - Lund
  - And more...

### Cross-Border Routes
- **Sweden ↔ Norway**: Oslo, Bergen
- **Sweden ↔ Denmark**: Copenhagen
- **Sweden ↔ Finland**: Helsinki (ferry routes)

### Popular Routes Highlighted
- Stockholm → Gothenburg (470 km)
- Stockholm → Malmö (610 km)
- Stockholm → Uppsala (70 km)
- Gothenburg → Malmö (280 km)
- Malmö → Copenhagen (30 km)
- Uppsala → Linköping (150 km)

---

## 📱 Responsive Design

### Desktop (≥1024px)
- Multi-column layouts
- Side-by-side ride search and results
- Horizontal navigation header
- Split-screen messaging (threads + conversation)

### Tablet (768px - 1023px)
- Adaptive layouts
- Stacked components where needed
- Responsive grid systems
- Collapsible navigation

### Mobile (≤767px)
- Single-column layouts
- Hamburger menu navigation
- Full-screen messaging views
- Touch-optimized buttons and inputs
- Scrollable ride lists

---

## 🚦 User Journey Examples

### New User Journey (Rider)
1. **Visit Homepage** → See value proposition
2. **Click "Find a ride"** → Redirected to signup (anonymous users)
3. **Sign Up** → Email, password, accept terms
4. **Verify Email** → Click link in email
5. **Complete Profile** → Add picture, languages
6. **Search Rides** → Enter origin, destination, date
7. **View Ride Details** → See driver info, price, vehicle
8. **Request to Join** → Send request to driver
9. **Driver Approves** → Receive notification
10. **Open Chat** → Communicate about pickup details
11. **Complete Trip** → After 5 hours or manual marking
12. **Write Review** → Leave feedback for driver

### Existing User Journey (Driver)
1. **Login** → Email and password
2. **Click "Offer a Ride"** → Navigate to create page
3. **Enter Route** → Autocomplete origin and destination
4. **Set Schedule** → Date and time
5. **Select Vehicle** → Choose from list
6. **Set Price** → Follow suggested cost (80% of max)
7. **Add Preferences** → Pets, smoking, luggage
8. **Publish Ride** → Submit form
9. **Receive Requests** → Notifications for new riders
10. **Review Profiles** → Check rider languages, reviews
11. **Approve Rider** → Confirm booking
12. **Chat with Rider** → Coordinate pickup location
13. **Complete Trip** → Drive and mark as complete
14. **Leave Review** → Write feedback for rider

---

## 🎯 Business Model & Compliance

### Revenue Model
- **100% Free Platform**: No commissions, fees, or subscription costs
- **Cost-Sharing Only**: Drivers split fuel and toll costs with riders
- **No Profit-Making**: Platform enforces Swedish transport regulations
- **Future Monetization** (potential):
  - Premium features (e.g., priority listings)
  - Partnership with eco-brands
  - Carbon offset programs
  - Community events

### Legal Compliance

#### Swedish Transport Regulations (Transportstyrelsen)
- **Non-Commercial Transport**: Cost-sharing without profit
- **No Taxi License Required**: As long as no profit is made
- **Driver Responsibility**: Personal insurance and license
- **Passenger Rights**: Private arrangement between users

#### GDPR (Data Protection)
- **Data Controllers**: Nordride AB
- **Data Processors**: Supabase, Vercel, OpenRouteService, Resend
- **Legal Basis**: User consent, contract performance
- **Data Retention**: Active accounts + 30 days after deletion
- **User Rights**: Full documentation and tools provided

#### ePrivacy Directive
- **Cookie Consent**: Explicit consent required
- **Essential Cookies**: Always allowed
- **Optional Cookies**: Require consent
- **Transparency**: Full cookie policy disclosure

---

## 🆘 Support & Community

### Help Resources
- **FAQ Section**: 9 common questions on homepage
- **Legal Documents**: Comprehensive Terms, Privacy, Community pages
- **Email Support**: support@nordride.com
- **Community Guidelines**: Clear behavior expectations

### Reporting & Safety
- **Report User**: Button on profiles and ride pages
- **Report Content**: Flag inappropriate messages or reviews
- **Support Email**: support@nordride.com for issues
- **Emergency**: Recommendations to contact local authorities first

### Account Issues
- **Forgot Password**: Reset link via email
- **Email Verification**: Resend verification email option
- **Profile Completion**: Banner shows missing fields with checklist
- **Account Deletion**: Full instructions in settings

---

## 🚀 Future Enhancements (Roadmap Ideas)

### Planned Features
- **Anonymous User Ride Snippets**: Show limited info to logged-out users
- **Enhanced RLS Policies**: Hide driver details from incomplete profiles
- **Mobile App**: Native iOS and Android applications
- **Payment Integration**: Optional Swish integration for convenience
- **Insurance Partners**: Ride-specific insurance options
- **Carbon Tracking**: Detailed CO₂ savings per user
- **Recurring Rides**: Weekly commute schedules
- **Group Rides**: Multiple riders booking together
- **Verification Badges**: ID-verified, long-time member badges
- **Language Filters**: Search by driver languages
- **Advanced Search**: Filters for pets, smoking, luggage
- **In-App Navigation**: Turn-by-turn directions
- **Push Notifications**: Real-time ride requests and messages
- **Social Features**: Friend connections, trusted circles
- **Gamification**: Eco-warrior badges, ride milestones

### Technical Improvements
- **Progressive Web App (PWA)**: Offline capabilities
- **Performance Monitoring**: Analytics and error tracking
- **A/B Testing**: Optimize conversion funnels
- **Multi-Language Support**: Swedish, English, Norwegian, Danish
- **Accessibility**: WCAG 2.1 AA compliance
- **SEO Optimization**: Improved search engine visibility

---

## 📞 Contact Information

### Support
- **Email**: support@nordride.com
- **Privacy Inquiries**: privacy@nordride.com
- **Community Issues**: community@nordride.com

### Company
- **Name**: Nordride AB
- **Country**: Sweden
- **Website**: https://nordride.se

---

## 📄 Conclusion

Nordride is a comprehensive, legally compliant, and user-friendly ride-sharing platform designed specifically for the Nordic market. With a focus on sustainability, community trust, and Swedish transport law compliance, it provides a free alternative to commercial ride-sharing services.

The platform offers complete functionality for drivers and riders including ride creation, booking, real-time messaging, reviews, and GDPR-compliant data management. Built with modern web technologies and a mobile-first approach, Nordride is ready for launch and scale across Sweden and the Nordic region.

**Key Differentiators:**
- 100% free (no commissions)
- GDPR-compliant with full data transparency
- Cost-sharing model (legal in Sweden)
- Real-time messaging and notifications
- Written reviews (no misleading star ratings)
- Comprehensive safety and community guidelines
- Environmental impact focus

The platform is production-ready, with all major features implemented, tested, and documented.

---

**Document Version:** 1.0
**Last Updated:** January 2025
**Next Review:** March 2025
