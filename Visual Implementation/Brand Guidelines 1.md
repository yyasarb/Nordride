# Nordride Brand Guidelines & Visual Identity System

**Version:** 2.0 - Dark Mode Edition  
**Last Updated:** November 2025  
**Status:** Production Ready

---

## Table of Contents

1. [Brand Foundation](#brand-foundation)
2. [Strategic Positioning](#strategic-positioning)
3. [Color System](#color-system)
4. [Dark Mode Color System](#dark-mode-color-system) 🌙 **NEW**
5. [Typography](#typography)
6. [Visual Language](#visual-language)
7. [Component Library](#component-library)
8. [Layout System](#layout-system)
9. [Interaction Design](#interaction-design)
10. [Dark Mode Toggle Component](#dark-mode-toggle-component) 🌙 **NEW**
11. [Implementation Guide](#implementation-guide)
12. [Accessibility Standards](#accessibility-standards)
13. [Brand Voice & Messaging](#brand-voice--messaging)

---

## Brand Foundation

### Brand North Star

**"Good company makes every journey better"**

Nordride creates pleasant companionship and cost savings by connecting travelers across Swedenâ€”turning drive time into an opportunity for connection, not just transportation.

### Brand Positioning Statement

> Nordride makes travel across Sweden more enjoyable and affordable by connecting travelers who share the roadâ€”and maybe a few stories along the way.

**Primary Benefit:** Pleasant companionship + cost savings  
**Secondary Benefit:** Environmental impact  
**Emotional Territory:** Friendly anticipation, easy connection, quiet pride

### Brand Personality

Nordride is **the aesthetically-minded reliable friend** who:
- Makes complex things feel simple and beautiful
- You trust completely because they've never let you down
- Has impeccable taste but zero pretension
- Makes you feel cooler/smarter just by association

**Personality Attributes:**
- **Warm** (not cold or corporate)
- **Clear** (not vague or overly clever)
- **Encouraging** (not pushy or salesy)
- **Human** (not robotic or formal)
- **Refined** (not casual or sloppy)

### Core Values

1. **Connection** - Creating structured opportunities for meaningful human interaction
2. **Ease** - Making ride-sharing effortless and delightful
3. **Trust** - Building confidence through transparency and reliability
4. **Sustainability** - Reducing environmental impact through shared travel
5. **Community** - Fostering a sense of belonging among Swedish travelers

### Emotional Hierarchy

**PRIMARY:** Effortless delight in every journey  
*("This is fun, easy, and just works")*

**SECONDARY:** Quiet pride in people & planet  
*("Oh, and I'm traveling with good humans while doing good")*

---

## Strategic Positioning

### Target Audience

**Demographics:**
- Age: 28-50 years old
- Location: Sweden (Stockholm, Gothenburg, MalmÃ¶, Uppsala, and beyond)
- Income: Middle class, budget-conscious
- Values: Sustainability, community, practicality

**Psychographics:**
- Want to travel economically over longer distances
- Desire social connection but lack structured opportunities
- Appreciate good design and seamless experiences
- Value environmental responsibility without preachiness
- Prefer authentic interactions over forced networking

**User Mindset:**

*Swedish Cultural Context:*
- High individualism but also isolation
- Cultural reserve makes spontaneous connection difficult
- Desire for meaningful interaction within safe, structured contexts
- "Fika culture"â€”connection happens around shared activities

*What Nordride Provides:*
- **Low-risk social interaction** with a clear purpose (the trip)
- **Natural ice-breakers** built into the journey
- **Defined boundaries** (trip has an end time)
- **Shared experience** (literally going in the same direction)

### Competitive Differentiation

**What Makes Nordride Different:**

| Aspect | Competitors | Nordride |
|--------|-------------|----------|
| Primary Focus | Transportation | Connection + Transportation |
| Pricing | Commercial rates | Cost-sharing only (no profit) |
| Experience | Transactional | Human-centered |
| Design | Functional | Delightfully refined |
| Brand Tone | Corporate/Practical | Warm sophistication |

### Brand Promise

*"Every journey is better with good companyâ€”and Nordride makes finding that company effortless."*

---

### Dark Mode System

Nordride supports a **complete dark mode** that maintains brand personality while reducing eye strain in low-light environments.

#### Activation

Dark mode is controlled by a toggle in the navigation bar. The toggle adds a `.dark` class to the `<html>` or `<body>` element, triggering CSS variable overrides.

```html
<!-- Light mode (default) -->
<html>

<!-- Dark mode (activated) -->
<html class="dark">
```

#### Dark Mode Color Palette

**Foundation Colors (Inverted):**

| Light Mode | Dark Mode | Purpose |
|------------|-----------|---------|
| Warm Cream `#F4EFE6` | Dark Charcoal `#1A1A1A` | Primary background |
| Soft White `#FAFAF8` | Dark Gray `#242424` | Cards, elevated surfaces |
| Charcoal `#2C2C2C` | Light Gray `#E8E8E8` | Text |

**Brand Colors (Adjusted for visibility):**

| Light Mode | Dark Mode | Adjustment |
|------------|-----------|------------|
| Terracotta `#E76F51` | Lighter Terracotta `#F4846F` | +15% brightness |
| Deep Sage `#5F7161` | Lighter Sage `#7A9281` | +20% brightness |
| Mustard `#F4A261` | Lighter Mustard `#F6B479` | +10% brightness |

**Why Adjust?**
- Dark backgrounds reduce color vibrancy
- Slightly lighter brand colors maintain visual weight
- Ensures sufficient contrast for accessibility

**Neutrals (Adjusted):**

| Light Mode | Dark Mode |
|------------|-----------|
| Slate Gray `#6B7280` | Light Slate `#A0A0A0` |
| Mid Gray `#9CA3AF` | Mid Dark `#6B6B6B` |
| Light Gray `#E5E7EB` | Border Gray `#3A3A3A` |

#### Implementation

The CSS system uses CSS custom properties that automatically update when `.dark` class is present:

```css
:root {
  --color-warm-cream: #F4EFE6;
  --color-charcoal: #2C2C2C;
}

.dark {
  --color-warm-cream: #1A1A1A;
  --color-charcoal: #E8E8E8;
}

/* Components automatically adapt */
.hero-nordride {
  background-color: var(--color-warm-cream);
  color: var(--color-charcoal);
}
```

#### Dark Mode Toggle Component

**Location:** Navigation bar (top right, near user avatar)

**Visual Specs:**
- Width: 56px
- Height: 28px
- Border-radius: Full (pill shape)
- Slider: 20px circle that slides left/right
- Icons: Sun (light mode), Moon (dark mode)

**States:**

*Light Mode (Default):*
- Background: Light Gray `#E5E7EB`
- Slider position: Left
- Icon: Sun (yellow/gold)

*Dark Mode (Active):*
- Background: Terracotta `#F4846F`
- Slider position: Right
- Icon: Moon (light gray)
- Slider moves 28px to the right

**Interaction:**
- Click to toggle
- Smooth transition (300ms)
- Saves preference to localStorage
- Persists across sessions

#### Dark Mode Best Practices

**DO:**
- Test all components in both modes
- Maintain contrast ratios (4.5:1 minimum)
- Adjust illustrations if needed (lighter outlines in dark mode)
- Use slightly lighter accent colors
- Reduce shadow intensity (darker shadows, higher opacity)

**DON'T:**
- Use pure black `#000000` (too harsh)
- Use pure white `#FFFFFF` for text (too bright, eye strain)
- Invert images/photos automatically (looks unnatural)
- Forget to adjust focus states for visibility

#### Testing Checklist

- [ ] All text remains readable (contrast check)
- [ ] Brand colors maintain personality
- [ ] Shadows are visible but subtle
- [ ] Focus states clearly visible
- [ ] Images/illustrations work in both modes
- [ ] Form inputs clearly defined
- [ ] Hover states maintain clarity
- [ ] Organic shapes visible but not overwhelming

---

## Color System

### Color Philosophy

Nordride's color palette embodies **warm sophistication**â€”earthy, natural tones that feel grounded and trustworthy, with playful accent colors that add energy and delight. The palette moves away from stark corporate aesthetics (black + green) toward a more human, inviting system.

### Foundation Colors

These are your primary canvas colorsâ€”use for 60-70% of all layouts.

#### Warm Cream
**Hex:** `#F4EFE6`  
**Usage:** Primary background, hero sections, main canvas  
**Feel:** Inviting, natural, not sterile

```css
background-color: #F4EFE6;
```

**Where to Use:**
- Homepage hero background
- Section backgrounds (alternating with Soft White)
- Empty states
- Large content areas

**Don't Use For:**
- Text (too low contrast)
- Small UI elements that need definition

---

#### Soft White
**Hex:** `#FAFAF8`  
**Usage:** Cards, elevated surfaces, input fields, secondary backgrounds  
**Feel:** Clean, refined, breathing room

```css
background-color: #FAFAF8;
```

**Where to Use:**
- Card backgrounds
- Form input fields
- Modal/dialog backgrounds
- Alternating sections with Warm Cream

---

#### Charcoal
**Hex:** `#2C2C2C`  
**Usage:** Headlines, primary text, high-emphasis content  
**Feel:** Professional, readable, sophisticated (not harsh like pure black)

```css
color: #2C2C2C;
```

**Where to Use:**
- All body text
- Headlines
- Button text (on light backgrounds)
- Icons

**Never Use:**
- Pure black (#000000) â€” always use Charcoal instead

---

### Brand Colors

These are your action and trust colorsâ€”use strategically for maximum impact.

#### Terracotta
**Hex:** `#E76F51`  
**Hover State:** `#D65A3D`  
**Light Version:** `rgba(231, 111, 81, 0.1)`  
**Usage:** Primary CTAs, links, energy moments, active states  
**Feel:** Warm, confident, action-oriented

```css
/* Primary CTA */
background-color: #E76F51;

/* Hover state */
background-color: #D65A3D;

/* Light background for info boxes */
background-color: rgba(231, 111, 81, 0.1);
```

**Where to Use:**
- "Find your ride" button
- Primary navigation links (active state)
- Important alerts/notifications
- Cursor trail dots
- Price highlights

**Usage Rules:**
- **Maximum impact** - use sparingly (5-10% of screen)
- Never use for large text blocks (readability)
- Always ensure sufficient contrast with background
- Pair with white text for buttons

---

#### Deep Sage
**Hex:** `#5F7161`  
**Hover State:** `#4F5F51`  
**Usage:** Secondary actions, trust indicators, eco-messaging  
**Feel:** Grounded, reliable, natural

```css
/* Secondary button */
border: 2px solid #5F7161;
color: #5F7161;

/* Hover fill */
background-color: #5F7161;
```

**Where to Use:**
- "Offer a ride" button (secondary CTA)
- Success states
- Eco-impact messaging
- Trust badges

---

#### Mustard
**Hex:** `#F4A261`  
**Usage:** Badges, highlights, accents, notifications  
**Feel:** Energetic, warm, approachable

```css
/* Badge background */
background-color: #F4A261;
```

**Where to Use:**
- Status badges ("New", "Popular")
- Highlighted information
- Notification dots
- Icon accents

---

### Playful Accents

Use in illustrations and decorative elements onlyâ€”not for UI components.

#### Lavender
**Hex:** `#A895D8`  
**Usage:** Organic shape decorations, illustration accents  
**Opacity:** 15-30% when used as background shapes

#### Coral
**Hex:** `#F28482`  
**Usage:** Illustration fills, celebration moments, success animations

#### Sky Blue
**Hex:** `#A8DADC`  
**Usage:** Info states, occasional UI accents, system messages

**Usage Rules for Accents:**
- Never use for buttons or primary UI
- Always at reduced opacity for background shapes
- Use in hand-drawn illustrations for visual interest
- Scatter sparingly (3-5 shapes per screen maximum)

---

### Neutral Scale

Your text hierarchy and subtle UI elements.

#### Slate Gray
**Hex:** `#6B7280`  
**Usage:** Body text, secondary information, icons

#### Mid Gray
**Hex:** `#9CA3AF`  
**Usage:** Placeholder text, disabled states, very low-emphasis content

#### Light Gray
**Hex:** `#E5E7EB`  
**Usage:** Borders, dividers, subtle backgrounds, disabled button backgrounds

---

### Semantic Colors

System feedback colors that map to your existing backend implementation.

#### Success
**Hex:** `#6B8E7F`  
**Usage:** Success messages, approvals, completed states

#### Warning
**Hex:** `#E8A87C`  
**Usage:** Alerts, cautions, pending actions

#### Error
**Hex:** `#C55A3E`  
**Usage:** Error messages, cancellations, destructive actions

#### Info
**Hex:** `#7A9299`  
**Usage:** Neutral information, helpful tips

---

### Color Combinations

#### High Contrast Pairings (Accessibility Approved)

```css
/* Primary CTA */
background: #E76F51; /* Terracotta */
color: #FFFFFF; /* White text */

/* Secondary CTA */
background: #FAFAF8; /* Soft White */
border: 2px solid #5F7161; /* Sage */
color: #5F7161;

/* Card on cream background */
background: #FAFAF8; /* Soft White */
border: 2px solid #E5E7EB; /* Light Gray */
```

#### Color Ratios (Per Screen)

- **60%** - Foundation (Warm Cream / Soft White)
- **30%** - Neutrals (Charcoal, Slate Gray, Light Gray)
- **10%** - Brand Colors (Terracotta, Sage, Mustard)
- **<5%** - Playful Accents (Lavender, Coral, Sky Blue)

---

## Dark Mode Color System

### Philosophy

Nordride's dark mode is not simply an inverted light theme—it's a carefully crafted experience that maintains brand warmth and personality while reducing eye strain in low-light environments.

**Core Principles:**

1. **Warm Dark Foundations** - We avoid pure black (#000000) in favor of warm dark charcoals that feel inviting rather than stark
2. **Maintained Brand Recognition** - Brand colors are slightly brightened for dark backgrounds while remaining instantly recognizable
3. **Reduced Contrast** - Lower contrast ratios prevent eye fatigue during extended use
4. **Consistent Hierarchy** - Visual hierarchy remains clear through careful opacity and saturation adjustments
5. **Accessibility First** - All color combinations maintain WCAG 2.1 AA contrast standards

---

### Dark Mode Foundation Colors

The base layer that defines dark mode surfaces and text.

#### Deep Warm Charcoal
**Hex:** `#1A1614`  
**Usage:** Primary background, replaces Warm Cream  
**RGB:** 26, 22, 20  
**Why Warm:** Subtle brown undertones maintain brand warmth

```css
background-color: #1A1614;
```

**Use For:**
- Body background
- Main content areas
- Page containers

---

#### Elevated Dark Surface
**Hex:** `#242220`  
**Usage:** Cards, modals, elevated components  
**RGB:** 36, 34, 32  
**Contrast:** Slightly lighter than Deep Warm Charcoal

```css
background-color: #242220;
```

**Use For:**
- Card backgrounds
- Navigation bars
- Modal overlays
- Dropdown menus
- Elevated panels

---

#### Soft Cream Text
**Hex:** `#F4EFE6`  
**Usage:** Primary text color (inverted from light mode)  
**RGB:** 244, 239, 230  
**Readability:** Excellent on dark backgrounds

```css
color: #F4EFE6;
```

**Use For:**
- Body text
- Headlines
- Primary content
- Button text (on dark buttons)

---

### Dark Mode Brand Colors

Brand colors optimized for dark backgrounds.

#### Terracotta (Brightened)
**Light Mode:** `#E76F51`  
**Dark Mode:** `#F4846F`  
**Adjustment:** +5% lightness for visibility

**Hover State:** `#F59984`

```css
/* Primary CTA in dark mode */
background-color: #F4846F;
color: #1A1614; /* Dark text on bright button */
```

**Use For:**
- Primary buttons
- Primary CTAs
- Active states
- Links (optional)
- Important highlights

---

#### Deep Sage (Adjusted)
**Light Mode:** `#5F7161`  
**Dark Mode:** `#7A9281`  
**Adjustment:** Desaturated slightly, increased lightness

**Hover State:** `#8BA592`

```css
/* Secondary actions in dark mode */
border: 2px solid #7A9281;
color: #7A9281;
```

**Use For:**
- Secondary buttons
- Outline buttons
- Trust indicators
- Eco-messaging
- Subtle accents

---

#### Mustard (Warmed)
**Light Mode:** `#F4A261`  
**Dark Mode:** `#F6B479`  
**Adjustment:** Slightly warmer tone

```css
/* Badges and highlights in dark mode */
background-color: rgba(246, 180, 121, 0.2);
color: #F6B479;
```

**Use For:**
- Badge backgrounds
- Highlight text
- Special offers
- Attention grabbers

---

### Dark Mode Playful Accents

Illustration and decorative colors for dark mode.

#### Lavender (Brightened)
**Hex:** `#B8A8E0`  
**Usage:** Organic shapes, illustration fills  
**Opacity:** 8-15% for backgrounds

#### Coral (Lightened)
**Hex:** `#F59B99`  
**Usage:** Celebration moments, illustration accents

#### Sky Blue (Softened)
**Hex:** `#B8E4E6`  
**Usage:** Info states, occasional UI elements

**Usage Rules (Dark Mode):**
- Reduce opacity to 8-15% (vs 15-30% in light mode)
- Use more sparingly—less is more in dark environments
- Excellent for illustration variety

---

### Dark Mode Neutrals

Text hierarchy and subtle UI elements.

#### Light Gray Text
**Hex:** `#A8A8A8`  
**Usage:** Secondary text, icons  
**Replaces:** Slate Gray

```css
color: #A8A8A8;
```

**Use For:**
- Secondary information
- Metadata (timestamps, counts)
- Icon colors
- Disabled text

---

#### Mid Gray
**Hex:** `#6B6B6B`  
**Usage:** Placeholder text, very low emphasis  
**Replaces:** Mid Gray (darkened)

```css
color: #6B6B6B;
```

**Use For:**
- Input placeholders
- Disabled states
- De-emphasized content

---

#### Dark Gray Borders
**Hex:** `#3A3A3A`  
**Usage:** Borders, dividers, separators  
**Replaces:** Light Gray

```css
border: 2px solid #3A3A3A;
```

**Use For:**
- Card borders
- Input borders
- Section dividers
- Subtle separators

---

### Dark Mode Semantic Colors

System feedback colors adjusted for dark mode.

#### Success (Dark Mode)
**Hex:** `#7FA797`  
**Usage:** Success messages, completed states

```css
/* Success alert in dark mode */
background-color: rgba(127, 167, 151, 0.15);
border-color: #7FA797;
color: #F4EFE6;
```

---

#### Warning (Dark Mode)
**Hex:** `#F0B88C`  
**Usage:** Warnings, cautions

```css
/* Warning alert in dark mode */
background-color: rgba(240, 184, 140, 0.15);
border-color: #F0B88C;
color: #F4EFE6;
```

---

#### Error (Dark Mode)
**Hex:** `#E57A63`  
**Usage:** Errors, destructive actions

```css
/* Error alert in dark mode */
background-color: rgba(229, 122, 99, 0.15);
border-color: #E57A63;
color: #F4EFE6;
```

---

#### Info (Dark Mode)
**Hex:** `#8BA5AC`  
**Usage:** Informational messages

```css
/* Info alert in dark mode */
background-color: rgba(139, 165, 172, 0.15);
border-color: #8BA5AC;
color: #F4EFE6;
```

---

### Dark Mode Shadows

Shadows in dark mode are deeper and more pronounced for depth perception.

```css
/* Small shadow - subtle elevation */
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);

/* Medium shadow - cards, dropdowns */
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);

/* Large shadow - modals, major elevation */
box-shadow: 0 4px 24px rgba(0, 0, 0, 0.6);

/* Button shadow (hover state) */
box-shadow: 0 4px 12px rgba(244, 132, 111, 0.35);

/* Focus ring */
box-shadow: 0 0 0 4px rgba(244, 132, 111, 0.25);
```

**Why Deeper Shadows:**
In dark environments, subtle shadows disappear. Deeper shadows (higher alpha values) ensure components maintain visible depth hierarchy.

---

### Dark Mode Component Examples

#### Primary Button (Dark Mode)

```css
.btn-primary--dark {
  background-color: #F4846F; /* Bright Terracotta */
  color: #1A1614;            /* Dark text for contrast */
  box-shadow: 0 4px 12px rgba(244, 132, 111, 0.35);
}

.btn-primary--dark:hover {
  background-color: #F59984; /* Lighter on hover */
  box-shadow: 0 6px 16px rgba(244, 132, 111, 0.4);
  transform: translateY(-2px);
}
```

---

#### Card (Dark Mode)

```css
.card--dark {
  background-color: #242220; /* Elevated surface */
  border: 2px solid #3A3A3A; /* Dark gray border */
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
  color: #F4EFE6;            /* Soft cream text */
}

.card--dark:hover {
  border-color: #F4846F;     /* Terracotta on hover */
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.6);
  transform: translateY(-2px);
}
```

---

#### Input Field (Dark Mode)

```css
.input--dark {
  background-color: #1A1614; /* Deep warm charcoal */
  border: 2px solid #3A3A3A; /* Dark gray border */
  color: #F4EFE6;            /* Soft cream text */
}

.input--dark::placeholder {
  color: #6B6B6B;            /* Mid gray placeholder */
}

.input--dark:focus {
  border-color: #F4846F;     /* Terracotta focus */
  background-color: #242220; /* Slightly lighter when focused */
  box-shadow: 0 0 0 4px rgba(244, 132, 111, 0.25);
}
```

---

### When to Use Dark Mode

**Automatic System Preference:**
Nordride respects user's OS-level dark mode settings by default.

**Manual Toggle:**
Users can override system preference via toggle in navbar.

**Best Use Cases:**
- Evening/night usage
- Extended reading or browsing sessions
- Low-light environments
- User preference for dark interfaces
- Battery conservation (OLED screens)

**Avoid Dark Mode When:**
- Printing documents
- Displaying high-detail images/photos
- User explicitly chooses light mode

---

### Dark Mode Accessibility

All dark mode colors maintain WCAG 2.1 AA contrast standards:

**Text Contrast Ratios:**
- Body text (#F4EFE6 on #1A1614): 12.8:1 ✅ AAA
- Secondary text (#A8A8A8 on #1A1614): 7.2:1 ✅ AA
- Disabled text (#6B6B6B on #1A1614): 4.8:1 ✅ AA (large text)

**Interactive Elements:**
- Primary button text (#1A1614 on #F4846F): 8.3:1 ✅ AAA
- Secondary button (#7A9281 on #1A1614): 5.1:1 ✅ AA

**Testing Tools:**
- WebAIM Contrast Checker
- Chrome DevTools Accessibility Panel
- Stark (Figma plugin)

---

### Dark Mode Best Practices

**DO:**
✅ Use warm dark tones (#1A1614) instead of pure black  
✅ Brighten brand colors slightly for visibility  
✅ Increase shadow depth for depth perception  
✅ Reduce organic shape opacity (8% vs 15%)  
✅ Test with f.lux, Night Shift, or similar night mode tools  
✅ Provide smooth transitions between themes (300ms)  

**DON'T:**
❌ Use pure black backgrounds (#000000)  
❌ Use light mode colors without adjustment  
❌ Ignore shadow depth (shadows must be stronger)  
❌ Forget to test contrast ratios  
❌ Make transitions instant (jarring)  
❌ Use bright white text (#FFFFFF) - too harsh  

---

## Typography

### Font Philosophy

Nordride uses a **dual-font system** that balances warm sophistication with functional clarity:

- **Sora** for display and headings - geometric with subtle roundness, confident yet approachable
- **DM Sans** for body text and UI - clean, readable, professional without being cold

Both fonts are **free and open-source** via Google Fonts.

### Font Families

#### Display & Headings: Sora

```css
font-family: 'Sora', sans-serif;
```

**Google Fonts Import:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&display=swap" rel="stylesheet">
```

**Weights to Load:**
- 500 (Medium) - H3, H4, H5
- 600 (Semi-Bold) - H1, H2, Section titles
- 700 (Bold) - Hero display, emphasis

**Character:** Geometric, modern, slightly rounded, confident

**Use For:**
- Page titles
- Section headers
- Card titles
- Button text (optional)
- Hero headlines

---

#### Body & UI: DM Sans

```css
font-family: 'DM Sans', sans-serif;
```

**Google Fonts Import:**
```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
```

**Weights to Load:**
- 400 (Regular) - Body text, paragraphs
- 500 (Medium) - Labels, captions, emphasis
- 600 (Semi-Bold) - Button text, strong emphasis

**Character:** Clean, geometric, highly readable, neutral

**Use For:**
- Body text
- Form labels
- Button text
- UI elements
- Navigation
- Input fields

---

### Type Scale

#### Desktop Sizes

```css
/* Display */
--text-hero: 56px;        /* Hero headlines only */

/* Headings */
--text-h1: 42px;          /* Page titles */
--text-h2: 32px;          /* Section headers */
--text-h3: 28px;          /* Subsection headers */
--text-h4: 24px;          /* Card titles */
--text-h5: 20px;          /* Small headers */

/* Body */
--text-body-lg: 18px;     /* Lead paragraphs, important content */
--text-body: 16px;        /* Standard text, UI */
--text-body-sm: 14px;     /* Supporting text, labels */
--text-caption: 12px;     /* Timestamps, meta info */
```

#### Mobile Sizes (Automatic Scaling at <768px)

```css
--text-hero: 42px;
--text-h1: 32px;
--text-h2: 28px;
--text-h3: 24px;
--text-h4: 20px;
--text-h5: 18px;
/* Body sizes remain the same */
```

---

### Line Heights

```css
--leading-tight: 1.2;     /* Display, large headings */
--leading-snug: 1.4;      /* H1, H2, H3 */
--leading-normal: 1.5;    /* H4, H5, compact text */
--leading-relaxed: 1.6;   /* Body text */
--leading-loose: 1.75;    /* Large body, lead paragraphs */
```

**Usage Rules:**
- Larger text = tighter line-height
- Body text always uses `--leading-relaxed` (1.6)
- Never go below 1.2 for accessibility

---

### Typography Examples

#### Hero Display

```css
.hero-display {
  font-family: 'Sora', sans-serif;
  font-size: 56px; /* 42px mobile */
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em; /* Tighter for large text */
  color: #2C2C2C;
}
```

**HTML:**
```html
<h1 class="hero-display">
  Good company makes every journey better
</h1>
```

**Optional Playful Rotation:**
```css
.hero-display--rotated {
  transform: rotate(-1deg);
  display: inline-block;
}
```

---

#### Section Title

```css
.section-title {
  font-family: 'Sora', sans-serif;
  font-size: 32px; /* 28px mobile */
  font-weight: 600;
  line-height: 1.4;
  color: #2C2C2C;
  margin-bottom: 24px;
}
```

---

#### Body Text (Large)

```css
.text-lg {
  font-family: 'DM Sans', sans-serif;
  font-size: 18px;
  font-weight: 400;
  line-height: 1.75;
  color: #2C2C2C;
}
```

**Use For:**
- Hero subheadlines
- Lead paragraphs
- Important messaging

---

#### Body Text (Regular)

```css
.text-base {
  font-family: 'DM Sans', sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.6;
  color: #2C2C2C;
}
```

**Use For:**
- All standard paragraphs
- Form descriptions
- Card content

---

#### Caption Text

```css
.text-caption {
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.5;
  letter-spacing: 0.05em;
  color: #6B7280;
  text-transform: uppercase; /* Optional */
}
```

**Use For:**
- Timestamps
- Metadata
- Badge labels
- Small supplementary info

---

### Typography Best Practices

1. **Never use pure black** - Always use Charcoal (#2C2C2C)
2. **Hierarchy through size AND weight** - Larger text can be lighter weight
3. **Generous line-height for body** - 1.6 minimum for readability
4. **Limit line length** - 60-80 characters max for paragraphs
5. **Headlines can be playful** - Slight rotation (-1Â° to 2Â°), mixed scales
6. **Body text is serious** - No rotation, clean alignment
7. **Letter-spacing on all-caps** - +0.05em for readability

---

## Visual Language

### Illustration System

Nordride's visual identity is brought to life through **hand-drawn illustrations** that add warmth, personality, and human connection to the interface.

#### Illustration Style Guide

**Characteristics:**
- Hand-drawn with visible texture (not vector-perfect)
- Black outlines (2-3px stroke), slightly imperfect/organic
- Flat color fills from brand palette
- Expressive but not cartoonish
- Shows connection: gestures, eye contact, natural smiles

**What to Illustrate:**

**People & Interactions:**
- Travelers in cars (driver + passenger conversations)
- People with luggage, coffee cups, phones
- Hands gesturing, waving, high-fiving
- Shared moments: pointing at scenery, sharing playlists
- Celebration poses (arms up, clapping)

**Vehicles:**
- Cars (side view, 3/4 view)
- Motion lines to suggest journey
- Simple, recognizable shapes
- Not photo-realisticâ€”stylized and friendly

**Objects:**
- Backpacks, suitcases, coffee thermoses
- Phones, maps, road signs
- Trees, clouds, stars (environmental context)

**Emotional Tone:**
- Warm and welcoming
- Confident but not arrogant
- Fun without being childish
- Authentic connection (not forced smiles)

---

#### Color Usage in Illustrations

**Primary Colors:**
- Outlines: Always black (#2C2C2C) or very dark charcoal
- Fills: Terracotta (#E76F51), Mustard (#F4A261), Deep Sage (#5F7161)

**Accent Colors:**
- Lavender (#A895D8), Coral (#F28482), Sky Blue (#A8DADC)
- Use sparingly for variety and visual interest

**Neutral Fills:**
- Skin tones: Warm cream variations
- Clothing: Mix of brand colors + neutrals
- Backgrounds: Transparent or very light fills

---

#### Illustration Applications

**Homepage Hero:**
- **Full scene illustration** - Car with driver + passenger mid-conversation
- Size: 400-600px wide
- Style: Detailed but not cluttered
- Background: Organic accent shapes (blob, star, squiggle)
- Animation: Subtle hover effects (rotate Â±3Â°)

**Empty States:**
- **Single character with prop** - Person looking at empty list, holding map
- Size: 200-300px
- Style: Simple, friendly, non-threatening
- Message: Encouraging, not alarming

**Success Messages:**
- **Character celebrating** - Arms up, confetti pieces around
- Size: 150-200px
- Style: Joyful, dynamic
- Animation: Scale-in with confetti burst

**404 / Error Pages:**
- **Character with map looking confused** - Friendly, not frustrated
- Size: 250-350px
- Style: Lighthearted, solution-focused
- Message: "Let's get you back on track"

**Loading States:**
- **Character walking/driving** - Motion lines, continuous movement
- Size: 100-150px
- Style: Simple animation loop
- Message: "Finding your perfect ride..."

---

### Organic Shape Accents

Background decorative elements that add playfulness without overwhelming.

#### Shape Types

**Blob:**
```css
width: 200px;
height: 200px;
background: #A895D8; /* Lavender */
opacity: 0.15;
border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
position: absolute;
```

**Star (4-point):**
```css
width: 40px;
height: 40px;
background: #F4A261; /* Mustard */
opacity: 0.2;
clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
```

**Squiggle/Circle:**
```css
width: 100px;
height: 60px;
background: #F28482; /* Coral */
opacity: 0.15;
border-radius: 50%;
transform: rotate(45deg);
```

#### Usage Rules

1. **Maximum 3-5 shapes per screen** - Don't overdo it
2. **Always low opacity** - 15-30% so they stay in the background
3. **Position absolutely** - Behind main content, non-interactive
4. **Scattered placement** - Corners, edges, not center stage
5. **Animation optional** - Subtle float effect on desktop

**Where to Use:**
- Hero sections
- Feature section backgrounds
- Between major sections
- Around illustrations

**Where NOT to Use:**
- Over text (reduces readability)
- Form pages (too distracting)
- Dense content areas
- Mobile (often too small to work well)

---
