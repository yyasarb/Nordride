# NordRide Homepage Implementation Guide

**Purpose:** Complete visual and technical specifications for the NordRide homepage that embodies the brand strategy: *"Good company makes every journey better."*

**Strategic Foundation:** This page transforms ride-sharing from transactional convenience into an opportunity for genuine human connection within Swedish cultural context—addressing loneliness through structured, purposeful travel companionship.

---

## Page Structure Overview

The homepage follows a strategic narrative arc:
1. **Hero** – Emotional hook: connection over efficiency
2. **Features** – Rational validation: why NordRide is different
3. **Impact** – Social proof through metrics
4. **Popular Routes** – Immediate action opportunities
5. **FAQ** – Address concerns, build trust
6. **Final CTA** – Low-friction conversion

---

## Section 1: Hero Section

### Visual Description

**Layout:** Full-width section with warm cream background (#F4EFE6). Two-column layout on desktop (content left, illustration right), single column on mobile (content first).

**Background Treatment:**
- Base color: Warm Cream (#F4EFE6)
- Subtle organic shapes floating in background:
  - 3-4 abstract blob shapes in very light Sage (15% opacity)
  - Positioned asymmetrically for visual interest
  - Sizes vary: one large (400px), two medium (250px), one small (150px)
  - Soft blur effect (20px)
  - No hard edges—all shapes have smooth, flowing curves

**Content Column (Left):**

**Badge Element:**
- Text: "100% Free • No Commissions"
- Style: Pill-shaped badge with Terracotta background (#E76F51)
- Text: White, DM Sans Semi-Bold, 14px
- Padding: 8px 20px
- Position: Above headline, left-aligned

**Headline:**
- Text: "Good company makes every journey better"
- Typography: DM Serif Display, 72px on desktop, 48px on mobile
- Color: Charcoal (#2C2C2C)
- Line height: 1.1 (tight, elegant)
- Letter spacing: -0.02em (slightly condensed)
- Max-width: 600px
- Margin bottom: 24px

**Subheadline:**
- Text: "Find rides across Sweden. Share costs, stories, and maybe a coffee stop. Real people, real conversations, real connections."
- Typography: DM Sans Regular, 20px on desktop, 18px on mobile
- Color: Charcoal (#2C2C2C) at 80% opacity
- Line height: 1.6 (readable, breathing room)
- Max-width: 540px
- Margin bottom: 40px

**Call-to-Action Buttons:**
- Two buttons side-by-side (horizontal layout)
- Spacing between: 16px gap

**Primary Button:**
- Text: "Find your ride"
- Background: Terracotta (#E76F51)
- Text color: White
- Font: DM Sans Semi-Bold, 16px
- Padding: 16px 40px
- Border-radius: 28px (pill shape)
- Hover state: Lift 2px, add shadow (0 8px 24px rgba(231, 111, 81, 0.25)), darken background to #D85A3A
- Transition: all 0.3s ease
- Links to: `/rides/search`

**Secondary Button:**
- Text: "Offer a ride"
- Background: Transparent
- Border: 2px solid Deep Sage (#5F7161)
- Text color: Deep Sage (#5F7161)
- Font: DM Sans Semi-Bold, 16px
- Padding: 14px 38px (2px less to account for border)
- Border-radius: 28px (pill shape)
- Hover state: Background fills with Deep Sage, text becomes white, lift 2px, add shadow (0 8px 24px rgba(95, 113, 97, 0.2))
- Transition: all 0.3s ease
- Links to: `/rides/create`

**Illustration Column (Right):**

**Visual Prompt for AI Image Generation:**

"Create a warm, inviting illustration in a modern editorial style showing two people sharing a comfortable car ride through Swedish countryside. The scene should feel intimate and friendly—not corporate or overly polished.

**Composition:**
- Interior view from slightly behind and to the side, showing driver and passenger in profile
- Both figures are having a genuine conversation, natural body language
- Visible through windshield: soft rolling Swedish landscape with pine trees and open sky
- Dashboard visible, showing a phone mounted with a navigation app

**Color Palette:**
- Warm cream tones (#F4EFE6) as base
- Terracotta accents (#E76F51) in clothing or interior details
- Sage green (#5F7161) in landscape and clothing
- Soft white highlights (#FAFAF8)
- Charcoal (#2C2C2C) for details and definition
- Sky in soft blue-gray tones

**Style:**
- Illustration style: modern, slightly abstract with geometric simplification
- Texture: subtle grain and hand-drawn quality (not flat vector)
- Organic shapes with soft edges
- Warm, inviting lighting suggesting late afternoon
- No harsh lines or corporate feel
- Emotionally warm but visually sophisticated

**Mood:**
Connection, comfort, Nordic calm, shared experience, trustworthy companionship

**Technical specs:**
- Dimensions: 800px × 600px
- Format: SVG or high-resolution PNG
- Transparent or warm cream background
- Optimized for web (under 200KB)"

**Animation (Optional Enhancement):**
- Illustration fades in with slight upward movement (20px) on page load
- Delay: 0.3s after content appears
- Duration: 0.8s
- Easing: cubic-bezier(0.4, 0, 0.2, 1)

---

## Section 2: Features Section

### Visual Description

**Layout:** Full-width section with soft white background (#FAFAF8). Content centered with max-width 1280px. Three-column grid on desktop, two-column on tablet, single column on mobile.

**Section Title:**
- Text: "Why travelers choose NordRide"
- Typography: DM Serif Display, 48px on desktop, 36px on mobile
- Color: Charcoal (#2C2C2C)
- Text alignment: Center
- Margin bottom: 64px
- Position: Above feature cards

**Feature Cards Layout:**
- Grid: 3 columns on desktop (≥1024px), 2 columns on tablet (768-1023px), 1 column on mobile (<768px)
- Gap between cards: 32px
- Each card: White background, 2px border in Light Gray (#E8E6E0), border-radius 20px
- Card padding: 40px
- Hover state: Border color changes to Terracotta (#E76F51), card lifts 2px with shadow (0 8px 24px rgba(0, 0, 0, 0.06))
- Transition: all 0.3s ease

---

### Feature Card 1: Community-Driven

**Icon Visual Prompt:**

"Create a simple, warm icon representing community and connection. Style: outlined icon with 2px stroke weight in Terracotta (#E76F51).

**Composition:**
- Three abstract human figures in a circle formation, suggesting togetherness
- Figures simplified to head + shoulders silhouettes
- Connected by gentle curved lines or overlapping forms
- Circular composition (fits within 64px × 64px space)
- Modern, friendly, not corporate

**Style:**
- Outlined icon, not filled
- Stroke weight: 2px
- Color: Terracotta (#E76F51)
- Rounded corners on all strokes
- Organic, hand-drawn quality
- Transparent background

**Technical specs:**
- SVG format
- 64px × 64px artboard
- Single color (Terracotta)
- Optimized for web"

**Card Content:**
- Icon: 64px × 64px, centered above text
- Margin bottom: 24px

**Headline:**
- Text: "Built by travelers, for travelers"
- Typography: DM Sans Bold, 24px
- Color: Charcoal (#2C2C2C)
- Margin bottom: 12px

**Body Text:**
- Text: "No corporate middleman. Just real people sharing journeys across Sweden and beyond. Every ride strengthens our community."
- Typography: DM Sans Regular, 16px
- Color: Charcoal (#2C2C2C) at 70% opacity
- Line height: 1.6

---

### Feature Card 2: Connection Over Efficiency

**Icon Visual Prompt:**

"Create a simple, warm icon representing human connection and conversation. Style: outlined icon with 2px stroke weight in Sage (#5F7161).

**Composition:**
- Two speech bubbles overlapping or interweaving
- Inside one bubble: small heart symbol
- Curved, friendly shapes (not rigid rectangles)
- Suggests dialogue and emotional connection
- Fits within 64px × 64px space

**Style:**
- Outlined icon, not filled
- Stroke weight: 2px
- Color: Deep Sage (#5F7161)
- Rounded corners on all strokes
- Organic, warm quality
- Transparent background

**Technical specs:**
- SVG format
- 64px × 64px artboard
- Single color (Deep Sage)
- Optimized for web"

**Card Content:**
- Icon: 64px × 64px, centered above text
- Margin bottom: 24px

**Headline:**
- Text: "Share more than just the ride"
- Typography: DM Sans Bold, 24px
- Color: Charcoal (#2C2C2C)
- Margin bottom: 12px

**Body Text:**
- Text: "Every journey is a chance for good conversation. Meet fellow travelers, share stories, maybe find a friend. Connection makes the kilometers disappear."
- Typography: DM Sans Regular, 16px
- Color: Charcoal (#2C2C2C) at 70% opacity
- Line height: 1.6

---

### Feature Card 3: Safe & Trusted

**Icon Visual Prompt:**

"Create a simple, trustworthy icon representing safety and verification. Style: outlined icon with 2px stroke weight in Terracotta (#E76F51).

**Composition:**
- Shield shape with checkmark inside
- Or: user profile silhouette with verification badge star
- Clean, professional but warm
- Suggests security and trust
- Fits within 64px × 64px space

**Style:**
- Outlined icon, not filled
- Stroke weight: 2px
- Color: Terracotta (#E76F51)
- Rounded corners on all strokes
- Confident, reliable feel
- Transparent background

**Technical specs:**
- SVG format
- 64px × 64px artboard
- Single color (Terracotta)
- Optimized for web"

**Card Content:**
- Icon: 64px × 64px, centered above text
- Margin bottom: 24px

**Headline:**
- Text: "Verified profiles, real reviews"
- Typography: DM Sans Bold, 24px
- Color: Charcoal (#2C2C2C)
- Margin bottom: 12px

**Body Text:**
- Text: "Email verification, transparent reviews, and secure messaging. Travel with people who are exactly who they say they are. Trust built through transparency."
- Typography: DM Sans Regular, 16px
- Color: Charcoal (#2C2C2C) at 70% opacity
- Line height: 1.6

---

## Section 3: Impact Metrics

### Visual Description

**Layout:** Full-width section with warm cream background (#F4EFE6). Content centered with max-width 1200px. Three-column grid on desktop, single column on mobile (stacked).

**Section Title:**
- Text: "Built on connections, measured in smiles"
- Typography: DM Serif Display, 48px on desktop, 36px on mobile
- Color: Charcoal (#2C2C2C)
- Text alignment: Center
- Margin bottom: 56px

**Metric Cards Layout:**
- Grid: 3 equal columns on desktop (≥768px), single column on mobile (<768px)
- Gap between cards: 40px
- Each metric: Centered alignment
- No background or borders—content floats on cream background

---

### Metric 1: Rides Shared

**Large Number:**
- Text: "12.4M"
- Typography: DM Serif Display, 64px on desktop, 48px on mobile
- Color: Terracotta (#E76F51)
- Font weight: Bold
- Margin bottom: 8px

**Label:**
- Text: "Rides shared"
- Typography: DM Sans Medium, 20px
- Color: Charcoal (#2C2C2C)
- Margin bottom: 8px

**Description:**
- Text: "Every journey builds our community stronger"
- Typography: DM Sans Regular, 16px
- Color: Charcoal (#2C2C2C) at 70% opacity
- Max-width: 280px (centered)

**Icon Decoration (Optional):**
- Small decorative element above number
- Organic shape in Terracotta at 20% opacity
- 120px × 60px blob shape
- Positioned behind number (z-index layering)

---

### Metric 2: Satisfaction Rate

**Large Number:**
- Text: "98%"
- Typography: DM Serif Display, 64px on desktop, 48px on mobile
- Color: Deep Sage (#5F7161)
- Font weight: Bold
- Margin bottom: 8px

**Label:**
- Text: "Arrive with a smile"
- Typography: DM Sans Medium, 20px
- Color: Charcoal (#2C2C2C)
- Margin bottom: 8px

**Description:**
- Text: "Shared rides create shared joy"
- Typography: DM Sans Regular, 16px
- Color: Charcoal (#2C2C2C) at 70% opacity
- Max-width: 280px (centered)

**Icon Decoration (Optional):**
- Small decorative element above number
- Organic shape in Sage at 20% opacity
- 120px × 60px blob shape
- Positioned behind number (z-index layering)

---

### Metric 3: Environmental Impact

**Large Number:**
- Text: "2.8M kg"
- Typography: DM Serif Display, 64px on desktop, 48px on mobile
- Color: Terracotta (#E76F51)
- Font weight: Bold
- Margin bottom: 8px

**Label:**
- Text: "CO₂ saved together"
- Typography: DM Sans Medium, 20px
- Color: Charcoal (#2C2C2C)
- Margin bottom: 8px

**Description:**
- Text: "Good for people, good for planet"
- Typography: DM Sans Regular, 16px
- Color: Charcoal (#2C2C2C) at 70% opacity
- Max-width: 280px (centered)

**Icon Decoration (Optional):**
- Small decorative element above number
- Organic shape in Terracotta at 20% opacity
- 120px × 60px blob shape
- Positioned behind number (z-index layering)

---

## Section 4: Popular Routes

### Visual Description

**Layout:** Full-width section with soft white background (#FAFAF8). Content centered with max-width 1280px.

**Section Header:**

**Title:**
- Text: "Start your next journey"
- Typography: DM Serif Display, 48px on desktop, 36px on mobile
- Color: Charcoal (#2C2C2C)
- Text alignment: Center
- Margin bottom: 16px

**Subtitle:**
- Text: "Popular routes travelers are sharing right now"
- Typography: DM Sans Regular, 18px
- Color: Charcoal (#2C2C2C) at 70% opacity
- Text alignment: Center
- Margin bottom: 56px

**Route Cards Layout:**
- Grid: 3 columns on desktop (≥1024px), 2 columns on tablet (768-1023px), 1 column on mobile (<768px)
- Gap: 24px between cards
- Each card is clickable (links to `/rides/search` with pre-filled locations)

---

### Route Card Design (Repeated Pattern)

**Card Structure:**
- Background: White (#FFFFFF)
- Border: 2px solid Light Gray (#E8E6E0)
- Border-radius: 16px
- Padding: 32px
- Hover state: Border changes to Terracotta (#E76F51), lift 2px, shadow (0 8px 24px rgba(0, 0, 0, 0.06))
- Cursor: pointer
- Transition: all 0.3s ease

**Route Icon Visual:**
- Small map pin icon at top left
- Color: Deep Sage (#5F7161)
- Size: 24px × 24px
- Margin bottom: 16px

**Route Display:**
- Text: "Stockholm → Gothenburg"
- Typography: DM Sans Bold, 22px
- Color: Charcoal (#2C2C2C)
- Margin bottom: 8px
- Arrow symbol: → (unicode) in Terracotta color (#E76F51)

**Distance:**
- Text: "470 km"
- Typography: DM Sans Regular, 16px
- Color: Charcoal (#2C2C2C) at 60% opacity
- Margin bottom: 16px

**Availability Badge:**
- Text: "12 rides available" (dynamic number)
- Background: Light Sage background at 15% opacity
- Text color: Deep Sage (#5F7161)
- Font: DM Sans Medium, 14px
- Padding: 6px 12px
- Border-radius: 8px
- Display: inline-block

**Arrow Indicator:**
- Position: Bottom right corner of card
- Icon: Right arrow (→) in circle
- Color: Terracotta (#E76F51)
- Size: 32px × 32px circle
- Background: Terracotta at 10% opacity
- Hover state: Background opacity increases to 100%, arrow color becomes white

---

### Popular Routes List (6 Routes)

1. **Stockholm → Gothenburg** (470 km)
2. **Stockholm → Malmö** (610 km)
3. **Stockholm → Uppsala** (70 km)
4. **Gothenburg → Malmö** (280 km)
5. **Malmö → Copenhagen** (30 km)
6. **Uppsala → Linköping** (150 km)

Each follows identical card design pattern with route-specific details.

---

## Section 5: FAQ Section

### Visual Description

**Layout:** Full-width section with warm cream background (#F4EFE6). Content centered with max-width 900px. Accordion-style expandable questions.

**Section Title:**
- Text: "Questions? We've got answers"
- Typography: DM Serif Display, 48px on desktop, 36px on mobile
- Color: Charcoal (#2C2C2C)
- Text alignment: Center
- Margin bottom: 56px

**FAQ Accordion Design:**

Each question is an expandable accordion item.

**Question Button (Collapsed State):**
- Full width horizontal button
- Background: White (#FFFFFF)
- Border: 2px solid Light Gray (#E8E6E0)
- Border-radius: 12px
- Padding: 24px 28px
- Margin bottom: 12px
- Text alignment: Left
- Display: flex (justify-content: space-between, align-items: center)
- Cursor: pointer

**Question Text:**
- Typography: DM Sans Semi-Bold, 18px
- Color: Charcoal (#2C2C2C)

**Expand Icon:**
- Position: Right side of button
- Icon: Plus symbol (+) or chevron down (▼)
- Color: Terracotta (#E76F51)
- Size: 24px × 24px
- Transition: rotate 180deg when expanded

**Hover State:**
- Border color changes to Terracotta (#E76F51)
- Background remains white
- Transition: all 0.3s ease

**Expanded State:**
- Border color: Terracotta (#E76F51)
- Icon rotates 180deg (becomes minus or chevron up)
- Answer panel slides down smoothly

**Answer Panel:**
- Background: White (continuation of question button)
- Padding: 0 28px 24px 28px (top padding 0 because connected to question)
- Border-radius: 0 0 12px 12px (only bottom corners rounded)
- Border: 2px solid Terracotta (#E76F51) on left, right, and bottom
- Border-top: none (connected to question)

**Answer Text:**
- Typography: DM Sans Regular, 16px
- Color: Charcoal (#2C2C2C) at 80% opacity
- Line height: 1.6
- Max-width: 100%

---

### FAQ Questions & Answers

**Question 1:**
"What makes NordRide different from other platforms?"

**Answer:**
"We're built for connection, not just transportation. NordRide prioritizes the human side of travel—shared conversations, cultural exchange, and genuine companionship. We're a community platform, not a corporate service, with 100% free membership and no commissions. Every ride makes our Swedish travel community stronger."

---

**Question 2:**
"Is this legal in Sweden?"

**Answer:**
"Absolutely. Cost-sharing rides (samåkning) is legal in Sweden as long as you're genuinely sharing travel costs, not making profit. NordRide ensures pricing stays within legal limits—we cap costs at 80% of the maximum legal rate calculated by distance. You're simply splitting expenses with fellow travelers."

---

**Question 3:**
"How does pricing work?"

**Answer:**
"Drivers set prices based on actual costs: fuel, wear, tolls, and parking. Our system suggests fair prices (80% of legal maximum) and prevents overcharging. For passengers, you see the total cost upfront—no hidden fees, no commissions, no surprises. Just honest cost-sharing."

---

**Question 4:**
"Who can see my profile and messages?"

**Answer:**
"Your profile is visible to other verified NordRide members. Private messages are encrypted and only visible to you and the person you're chatting with. We never share your data with third parties. You control your information and can delete your account anytime—full GDPR compliance."

---

**Question 5:**
"What if I need to cancel?"

**Answer:**
"Life happens. Drivers can cancel rides anytime (though frequent cancellations affect your rating). Passengers can cancel approved bookings—the seat becomes available again immediately. Communication is key: let your travel companions know as early as possible through our messaging system."

---

**Question 6:**
"How do I know who I'm riding with?"

**Answer:**
"Every member verifies their email. You can see profiles with photos, languages spoken, ride history, and reviews from other travelers. Read what others say about potential travel companions. Our review system is transparent and honest—building trust through community feedback."

---

**Question 7:**
"What about safety?"

**Answer:**
"Your safety matters. We require email verification, transparent profiles, and authentic reviews. All messages stay within our platform until you approve a ride. Report any concerning behavior immediately—we take violations seriously and act quickly. Trust your instincts, read reviews, and communicate clearly."

---

**Question 8:**
"Can I bring luggage or pets?"

**Answer:**
"Each driver sets their own preferences. When creating a ride, drivers specify luggage allowance (small, carry-on, or large bags) and whether pets are welcome (yes, no, or maybe). Filter search results to find rides that match your needs. Always confirm details through messaging before departure."

---

**Question 9:**
"What happens after the ride?"

**Answer:**
"After arrival, both driver and passengers confirm trip completion in the system. Then you can leave honest reviews about your experience. Reviews help build community trust and guide other travelers. Share what made the journey memorable—the conversation, the playlist, the coffee stops."

---

## Section 6: Final CTA Banner

### Visual Description

**Layout:** Full-width section with gradient background. Content centered with max-width 800px. Vertically centered content (padding 80px vertical).

**Background:**
- Gradient: Linear gradient from Terracotta (#E76F51) to Deep Sage (#5F7161)
- Direction: 135deg (diagonal top-left to bottom-right)
- Subtle texture overlay (optional): Fine grain at 5% opacity for warmth

**Headline:**
- Text: "Your next journey starts here"
- Typography: DM Serif Display, 56px on desktop, 40px on mobile
- Color: White (#FFFFFF)
- Text alignment: Center
- Margin bottom: 20px
- Line height: 1.2

**Subheadline:**
- Text: "Join thousands of travelers sharing costs, stories, and Sweden's roads"
- Typography: DM Sans Regular, 20px
- Color: White (#FFFFFF) at 90% opacity
- Text alignment: Center
- Max-width: 600px (centered)
- Margin bottom: 40px
- Line height: 1.5

**CTA Buttons:**
- Two buttons centered horizontally
- Layout: Horizontal with 16px gap on desktop, stacked with 12px gap on mobile

**Primary Button (Inverted):**
- Text: "Find a ride"
- Background: White (#FFFFFF)
- Text color: Terracotta (#E76F51)
- Font: DM Sans Semi-Bold, 16px
- Padding: 16px 40px
- Border-radius: 28px
- Hover state: Background lifts 2px, shadow (0 8px 24px rgba(255, 255, 255, 0.3)), slight scale (1.02)
- Transition: all 0.3s ease
- Links to: `/rides/search`

**Secondary Button (Ghost):**
- Text: "Learn more"
- Background: Transparent
- Border: 2px solid White (#FFFFFF) at 80% opacity
- Text color: White (#FFFFFF)
- Font: DM Sans Semi-Bold, 16px
- Padding: 14px 38px
- Border-radius: 28px
- Hover state: Background becomes white at 20% opacity, border 100% opacity, lift 2px
- Transition: all 0.3s ease
- Links to: `/about`

---

## Interactive Elements & Animations

### Scroll Animations

**Fade-In on Scroll (Apply to all major sections):**
- Trigger: When section enters viewport (Intersection Observer API)
- Animation: Opacity 0 → 1, translateY(30px) → translateY(0)
- Duration: 0.8s
- Easing: cubic-bezier(0.4, 0, 0.2, 1)
- Delay: Stagger child elements by 0.1s

**Elements to Animate:**
- Hero content (headline, buttons)
- Feature cards (stagger each card)
- Impact metrics (stagger each metric)
- Popular route cards (stagger each card)
- FAQ items (stagger by 0.05s)
- Final CTA section

---

### Hover Interactions

**All Interactive Cards:**
- Transform: translateY(-2px) on hover
- Box-shadow: Increase intensity
- Border color: Change to brand color
- Transition: all 0.3s ease
- Cursor: pointer

**All Buttons:**
- Transform: translateY(-2px) on hover
- Box-shadow: Add on hover
- Background: Darken or lighten as specified
- Transition: all 0.3s ease
- Cursor: pointer

**Links:**
- Text decoration: Underline on hover
- Color: Change to Terracotta (#E76F51)
- Transition: color 0.2s ease

---

### Custom Cursor Trail (Desktop Only)

**Implementation:**
- 8-10 circular dots following cursor
- Color: Terracotta (#E76F51)
- Opacity: Fades along trail (1.0 → 0.2)
- Size: 8px diameter per dot
- Position: Each dot follows previous with easing (0.35)
- Frame rate: 60fps animation loop
- GPU acceleration: Use translate3d for performance
- Disable on: Mobile devices, tablets, touch interfaces
- Z-index: Above content but below modals/overlays

---

## Responsive Breakpoints

**Desktop (≥1024px):**
- Hero: Two columns (50/50)
- Features: Three columns
- Metrics: Three columns
- Routes: Three columns
- FAQ: Single column (max-width 900px)
- Font sizes: As specified above

**Tablet (768px - 1023px):**
- Hero: Two columns (60/40, adjust illustration size)
- Features: Two columns
- Metrics: Three columns
- Routes: Two columns
- FAQ: Single column (max-width 900px)
- Font sizes: Reduce by 10-15%

**Mobile (<768px):**
- Hero: Single column (content first, illustration smaller or hidden)
- Features: Single column
- Metrics: Single column (stacked)
- Routes: Single column
- FAQ: Single column (full width)
- Font sizes: As specified in mobile sizes above
- Padding: Reduce section padding by 30-40%
- Button layout: Stack vertically instead of horizontal

---

## Accessibility Requirements

**Color Contrast:**
- All text meets WCAG 2.1 AA standards (4.5:1 minimum for body, 3:1 for large text)
- Interactive elements have clear focus states
- Links distinguishable from body text

**Keyboard Navigation:**
- All interactive elements accessible via Tab key
- Focus indicators visible (2px Terracotta outline)
- Skip navigation link at top for screen readers
- Logical tab order (top to bottom, left to right)

**Screen Readers:**
- All icons have `aria-label` attributes
- FAQ accordion uses proper ARIA attributes:
  - `aria-expanded="true/false"` on buttons
  - `aria-controls="answer-id"` linking to answer panel
  - `role="region"` on answer panels
- Images have descriptive `alt` text
- Decorative images use `alt=""` to hide from screen readers

**Motion:**
- Respect `prefers-reduced-motion` media query
- If enabled, disable all animations and transitions
- Cursor trail disabled for reduced motion users

---

## Performance Optimization

**Images:**
- Illustrations: Prefer SVG format for scalability and small file size
- Icons: SVG only, inline or sprite sheet
- Background shapes: CSS or SVG (no raster images)
- Optimize all images: WebP format with PNG fallback
- Lazy loading: Use `loading="lazy"` for below-fold images

**CSS:**
- Critical CSS inlined in `<head>`
- Non-critical CSS loaded asynchronously
- CSS custom properties for all brand colors and spacing
- Minimize use of external fonts (DM Sans and DM Serif Display only)

**JavaScript:**
- Defer non-critical scripts
- Use Intersection Observer for scroll animations (efficient)
- Cursor trail: RequestAnimationFrame for smooth 60fps
- FAQ accordion: CSS-only if possible, minimal JS

**Loading Strategy:**
- Hero section: Priority load (above fold)
- Features & Metrics: Load on scroll or immediately
- Routes & FAQ: Can lazy load if performance issues
- Final CTA: Lazy load acceptable

---

## Technical Notes for Implementation

**Component Architecture:**
This page should be built with reusable components:
- `<Hero />` - Hero section with props for title, subtitle, buttons
- `<FeatureCard />` - Reusable feature card with icon, title, body
- `<MetricCard />` - Metric display with number, label, description
- `<RouteCard />` - Popular route card with route data
- `<FAQItem />` - Accordion item for questions
- `<CTABanner />` - Final call-to-action section

**Data Structure:**
Hard-coded content for now. Future enhancement: Pull popular routes from database with live ride counts.

**CSS Integration:**
- Link to `nordride-brand-system.css` (main brand CSS)
- Link to `homepage-styles.css` (page-specific styles)
- Both files use prefixed classes (`.hero-nordride`, `.card-nordride`, etc.)
- No conflicts with existing Tailwind classes

**Framework Notes:**
- Built in Next.js 14 with App Router
- Server components where possible for performance
- Client components only where interactivity required (FAQ accordion, animations, cursor trail)
- Uses TypeScript for type safety
- Integrates with existing Supabase auth (check user state for button links)

---

## Quality Checklist

Before considering homepage complete, verify:

**Visual Quality:**
- [ ] All colors match brand guidelines exactly
- [ ] Typography uses correct fonts, sizes, and weights
- [ ] Spacing follows consistent scale
- [ ] Illustrations are warm, inviting, and on-brand
- [ ] Icons are simple, clear, and consistent style
- [ ] No visual bugs on any screen size
- [ ] Smooth transitions and animations
- [ ] Hover states work on all interactive elements

**Technical Quality:**
- [ ] Semantic HTML (proper heading hierarchy)
- [ ] Accessible (WCAG 2.1 AA compliant)
- [ ] Fast loading (Lighthouse score >90)
- [ ] Responsive on all breakpoints
- [ ] Cross-browser compatible
- [ ] No console errors
- [ ] Links all work correctly
- [ ] Forms validate properly (if any)

**Content Quality:**
- [ ] Spelling and grammar perfect
- [ ] Tone matches brand voice (warm, trustworthy, friendly)
- [ ] CTAs are clear and compelling
- [ ] FAQ answers are comprehensive
- [ ] All claims are accurate
- [ ] Legal compliance (cost-sharing limits, GDPR)

**Strategic Alignment:**
- [ ] Emphasizes connection over efficiency
- [ ] Addresses Swedish cultural context
- [ ] Differentiates from corporate platforms
- [ ] Builds trust through transparency
- [ ] Converts visitors to users

---

## Success Metrics

After launch, track:
- Homepage bounce rate (target: <40%)
- Time on page (target: >90 seconds)
- CTA click-through rates (target: >15% on hero buttons)
- Scroll depth (target: >70% reach FAQ section)
- Mobile vs desktop engagement
- Popular route card clicks
- FAQ open rates (which questions most clicked)

---

**End of Implementation Guide**

This document contains all information needed to build the NordRide homepage pixel-perfect and on-brand. Every design decision serves the strategic goal: transform ride-sharing into an opportunity for human connection within Swedish cultural context.