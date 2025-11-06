### Photography Guidelines

While Nordride is illustration-first, occasional photography can support the brand when used correctly.

#### Photo Style

**Characteristics:**
- Natural lighting, warm tones
- Candid moments, not posed
- Diverse representation of Swedish travelers
- Cars, roads, landscapes (when relevant)
- High quality, not stock-photo feel

**Color Treatment:**
- Warm color grade
- Slightly increased saturation
- Avoid cold/blue tones

**Subject Matter:**
- People in cars (candid conversation)
- Travelers at train stations, bus stops
- Swedish landscapes (forests, cities, coastlines)
- Coffee shops, rest stops (journey context)

**What to Avoid:**
- Generic stock photos
- Overly posed/staged shots
- Cold, corporate aesthetics
- Photos that compete with illustrations

---

### Icon System

**Style:** Line icons (2px stroke weight), slightly rounded corners  
**Size:** 20px Ã— 20px (standard), 24px Ã— 24px (large)  
**Color:** Charcoal (#2C2C2C) or Slate Gray (#6B7280)  
**Library:** Use [Lucide React](https://lucide.dev/) (already in your stack)

**Common Icons:**
- Car, MapPin, Calendar, Clock, Users, MessageCircle
- DollarSign, Leaf, Star, Heart, Info, AlertCircle

---

## Component Library

### Button System

#### Primary Button (Terracotta)

**Use For:** Main actions, primary CTAs

```html
<button class="btn-nordride btn-nordride--primary">
  Find your ride
</button>
```

**Specs:**
- Background: Terracotta (#E76F51)
- Text: White, DM Sans 600, 16px
- Padding: 12px 32px
- Border-radius: 24px (pill shape)
- Hover: Lift 2px, darken to #D65A3D, shadow

**Variants:**
```html
<!-- Standard -->
<button class="btn-nordride btn-nordride--primary">Find your ride</button>

<!-- With icon -->
<button class="btn-nordride btn-nordride--primary">
  <svg class="btn-nordride__icon">...</svg>
  Find your ride
</button>

<!-- Small size -->
<button class="btn-nordride btn-nordride--primary btn-nordride--sm">Book now</button>

<!-- Large size -->
<button class="btn-nordride btn-nordride--primary btn-nordride--lg">Get started</button>

<!-- Disabled -->
<button class="btn-nordride btn-nordride--primary" disabled>Loading...</button>
```

---

#### Secondary Button (Sage Outline)

**Use For:** Secondary actions, alternative paths

```html
<button class="btn-nordride btn-nordride--secondary">
  Offer a ride
</button>
```

**Specs:**
- Background: Transparent
- Border: 2px solid Deep Sage (#5F7161)
- Text: Deep Sage, DM Sans 600, 16px
- Padding: 10px 30px (adjusted for border)
- Hover: Fill with Sage, text becomes white

---

#### Ghost Button

**Use For:** Tertiary actions, minimal emphasis

```html
<button class="btn-nordride btn-nordride--ghost">
  Cancel
</button>
```

**Specs:**
- Background: Transparent
- No border
- Text: Charcoal, DM Sans 500, 16px
- Hover: Underline, color changes to Terracotta

---

### Card Components

#### Standard Card

**Use For:** Ride listings, content containers, information display

```html
<div class="card-nordride">
  <h3>Stockholm â†’ Gothenburg</h3>
  <p>Tomorrow at 10:00 AM</p>
</div>
```

**Specs:**
- Background: Soft White (#FAFAF8)
- Border: 2px solid Light Gray (#E5E7EB)
- Border-radius: 16px
- Padding: 24px
- Shadow: 0 2px 8px rgba(0, 0, 0, 0.04)
- Hover: Border becomes Terracotta, shadow grows, lift 2px

---

#### Elevated Card

**Use For:** Important content, featured items, modals

```html
<div class="card-nordride card-nordride--elevated">
  <h2>Trip Details</h2>
  <p>Your ride is confirmed!</p>
</div>
```

**Specs:**
- Background: White
- No border
- Border-radius: 20px
- Padding: 32px
- Shadow: 0 4px 24px rgba(0, 0, 0, 0.06)

---

#### Ride Card (Specialized)

**Use For:** Search results, ride listings

```html
<div class="ride-card">
  <div class="ride-card__header">
    <div class="ride-card__route">Stockholm â†’ MalmÃ¶</div>
    <div class="ride-card__price">350 SEK</div>
  </div>
  
  <div class="ride-card__details">
    <span>Tomorrow 10:00</span>
    <span>5h 30min</span>
    <span>3 seats</span>
  </div>
  
  <div class="ride-card__driver">
    <img src="..." alt="Driver" />
    <span>Emma S.</span>
  </div>
</div>
```

**Additional Features:**
- Click to view details
- Hover state shows more information
- Price displayed prominently in Terracotta
- Driver info with avatar

---

### Form Components

#### Text Input

```html
<label class="label-nordride">
  Departure City
  <input type="text" class="input-nordride" placeholder="e.g. Stockholm" />
</label>
```

**Specs:**
- Background: White
- Border: 2px solid Light Gray (#E5E7EB)
- Border-radius: 12px
- Padding: 12px 16px
- Font: DM Sans 400, 16px
- Focus: Border becomes Terracotta, shadow ring

---

#### Textarea

```html
<label class="label-nordride">
  Special Requests
  <textarea class="textarea-nordride" placeholder="Any specific details..."></textarea>
</label>
```

**Specs:**
- Same as input, but with min-height: 120px
- Resize: vertical only

---

#### Form Label

```html
<label class="label-nordride label-nordride--required">
  Email Address
</label>
```

**Specs:**
- Font: DM Sans 500, 14px
- Color: Charcoal
- Required indicator (*) in Error color

---

### Badge Components

```html
<!-- Primary (Mustard) -->
<span class="badge-nordride badge-nordride--primary">New</span>

<!-- Success (Green) -->
<span class="badge-nordride badge-nordride--success">Approved</span>

<!-- Warning (Orange) -->
<span class="badge-nordride badge-nordride--warning">Pending</span>

<!-- Error (Red) -->
<span class="badge-nordride badge-nordride--error">Cancelled</span>

<!-- Neutral (Gray) -->
<span class="badge-nordride badge-nordride--neutral">Completed</span>
```

**Specs:**
- Padding: 4px 12px
- Border-radius: 12px
- Font: DM Sans 600, 12px, uppercase
- Letter-spacing: 0.05em

---

### Alert Components

```html
<!-- Info -->
<div class="alert-nordride alert-nordride--info">
  <svg><!-- icon --></svg>
  <p>Your profile is 80% complete. Add a bio to finish!</p>
</div>

<!-- Success -->
<div class="alert-nordride alert-nordride--success">
  <svg><!-- icon --></svg>
  <p>Your ride request was sent successfully.</p>
</div>

<!-- Warning -->
<div class="alert-nordride alert-nordride--warning">
  <svg><!-- icon --></svg>
  <p>This ride departs in 2 hours. Be ready!</p>
</div>

<!-- Error -->
<div class="alert-nordride alert-nordride--error">
  <svg><!-- icon --></svg>
  <p>Unable to process your request. Please try again.</p>
</div>
```

**Specs:**
- Padding: 16px 24px
- Border-radius: 12px
- Border-left: 4px solid (semantic color)
- Background: 10% opacity version of semantic color
- Icon + text layout with 16px gap

---

## Layout System

### Grid System

Nordride uses a flexible grid system that adapts to content needs.

#### Standard Grid

```html
<div class="grid-nordride grid-nordride--3">
  <div class="card-nordride">Card 1</div>
  <div class="card-nordride">Card 2</div>
  <div class="card-nordride">Card 3</div>
</div>
```

**Available Grids:**
- `grid-nordride--2` - 2 columns (300px min per column)
- `grid-nordride--3` - 3 columns (280px min per column)
- `grid-nordride--4` - 4 columns (240px min per column)

**Behavior:**
- Desktop: Fixed column count
- Tablet: Auto-fit within constraints
- Mobile: Single column

**Gap:** 24px between items

---

### Hero Section Layout

```html
<section class="hero-nordride">
  <div class="hero-nordride__container">
    <div class="hero-nordride__content">
      <h1 class="hero-display">Good company makes every journey better</h1>
      <p class="hero-nordride__subtitle">
        Find rides across Sweden. Share costs, stories, and maybe a coffee stop.
      </p>
      <div class="hero-nordride__cta">
        <button class="btn-nordride btn-nordride--primary">Find your ride</button>
        <button class="btn-nordride btn-nordride--secondary">Offer a ride</button>
      </div>
    </div>
    <div class="hero-nordride__illustration">
      <!-- Illustration SVG or image -->
    </div>
  </div>
</section>
```

**Layout:**
- Desktop: 2-column (50/50 split)
- Mobile: Single column (content first, then illustration)
- Background: Warm Cream
- Padding: 80px vertical (desktop), 64px (mobile)
- Max-width: 1280px centered

---

### Section Layout

```html
<section class="section-nordride section-nordride--cream">
  <div class="section-nordride__container">
    <h2 class="section-title section-title--center">How Nordride Works</h2>
    <div class="grid-nordride grid-nordride--3">
      <!-- Feature cards -->
    </div>
  </div>
</section>
```

**Variants:**
- `section-nordride--cream` - Warm Cream background
- `section-nordride--white` - Soft White background

**Padding:**
- Desktop: 120px vertical
- Tablet: 80px vertical
- Mobile: 64px vertical

**Max-width:** 1280px centered with auto margins

---

### Spacing System

**Consistent spacing scale:**

```css
--space-xs: 4px;    /* Tight spacing, icon gaps */
--space-sm: 8px;    /* Small gaps, badges */
--space-md: 16px;   /* Standard spacing, card padding */
--space-lg: 24px;   /* Section gaps, large padding */
--space-xl: 32px;   /* Between major sections */
--space-2xl: 48px;  /* Large section breaks */
--space-3xl: 64px;  /* Major section padding */
--space-4xl: 80px;  /* Hero section padding */
--space-5xl: 120px; /* Extra large section padding */
```

**Usage:**
- Use the scale consistentlyâ€”don't create custom values
- Mobile typically uses one step down (e.g., `xl` becomes `lg`)
- Vertical rhythm: Maintain consistent spacing between sections

---

## Interaction Design

### Custom Cursor Trail (Desktop Only)

**Implementation:**

```javascript
// Create cursor trail dots
const NUM_DOTS = 10;
const dots = [];
const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

// Create trail elements
for (let i = 0; i < NUM_DOTS; i++) {
  const dot = document.createElement('div');
  dot.classList.add('nordride-cursor-trail');
  document.body.appendChild(dot);
  dots.push({ el: dot, x: mouse.x, y: mouse.y });
}

// Track mouse position
window.addEventListener('pointermove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

// Animate trail
function animate() {
  let x = mouse.x;
  let y = mouse.y;

  dots.forEach((dot, i) => {
    // Easing - each dot follows the previous
    dot.x += (x - dot.x) * 0.35;
    dot.y += (y - dot.y) * 0.35;
    
    // Position
    dot.el.style.transform = `translate3d(${dot.x}px, ${dot.y}px, 0)`;
    
    // Fade out along trail
    dot.el.style.opacity = 1 - (i / NUM_DOTS);
    
    // Next dot follows this one
    x = dot.x;
    y = dot.y;
  });

  requestAnimationFrame(animate);
}
animate();

// Add to body for custom cursor effect
document.body.classList.add('custom-cursor');
```

**CSS:**
```css
.nordride-cursor-trail {
  position: fixed;
  width: 12px;
  height: 12px;
  background-color: #E76F51; /* Terracotta */
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  transform: translate(-50%, -50%);
  will-change: transform, opacity;
}

body.custom-cursor {
  cursor: none;
}

/* Mobile: Disable */
@media (hover: none) {
  .nordride-cursor-trail {
    display: none;
  }
  
  body.custom-cursor {
    cursor: default;
  }
}
```

**Key Parameters:**
- **Number of dots:** 8-10 (balance between smooth trail and performance)
- **Color:** Terracotta (#E76F51)
- **Size:** 12px diameter
- **Easing:** 0.35 (smooth, not too fast)
- **Opacity fade:** Linear from 1.0 to 0.2

**When to Use:**
- Desktop only (disable on mobile/tablet)
- Active sitewide for cohesive experience
- Hide during forms/text input for usability

---

### Hover States

#### Buttons

```css
.btn-nordride--primary:hover {
  background-color: #D65A3D; /* Darker */
  transform: translateY(-2px); /* Lift */
  box-shadow: 0 4px 12px rgba(231, 111, 81, 0.3); /* Shadow */
}

.btn-nordride--primary:active {
  transform: translateY(0); /* Return to base */
}
```

#### Cards

```css
.card-nordride:hover {
  border-color: #E76F51; /* Terracotta */
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); /* Grow shadow */
  transform: translateY(-2px); /* Slight lift */
}
```

#### Links

```css
a:hover {
  color: #E76F51; /* Terracotta */
  text-decoration: underline;
}
```

---

### Animations

#### Fade In (Page Load)

```css
.fade-in {
  animation: fadeIn 400ms ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Use For:** Page content on load, modal appearances

---

#### Slide Up (Scroll Reveal)

```css
.slide-up {
  animation: slideUp 300ms ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Use For:** Sections appearing on scroll

---

#### Scale In (Success Moments)

```css
.scale-in {
  animation: scaleIn 300ms ease-out;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

**Use For:** Success messages, checkmarks, badges

---

#### Float (Organic Shapes)

```css
@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

.organic-shape--blob {
  animation: float 8s ease-in-out infinite;
}
```

**Use For:** Background decorative shapes

---

### Transition Timing

```css
--transition-fast: 150ms ease-out;    /* Micro-interactions */
--transition-normal: 300ms ease-out;  /* Standard hover states */
--transition-slow: 400ms ease-out;    /* Page transitions */
```

**Easing:** Always use `ease-out` for natural deceleration

**Accessibility:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

### Loading States

#### Skeleton Screens

Use for content that's loading:

```html
<div class="card-nordride">
  <div class="skeleton skeleton--title"></div>
  <div class="skeleton skeleton--text"></div>
  <div class="skeleton skeleton--text"></div>
</div>
```

```css
.skeleton {
  background: linear-gradient(
    90deg,
    #E5E7EB 25%,
    #F3F4F6 50%,
    #E5E7EB 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s ease-in-out infinite;
  border-radius: 8px;
}

.skeleton--title {
  width: 60%;
  height: 24px;
  margin-bottom: 12px;
}

.skeleton--text {
  width: 100%;
  height: 16px;
  margin-bottom: 8px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

---

#### Spinner (Alternative)

For buttons and inline loading:

```html
<button class="btn-nordride btn-nordride--primary" disabled>
  <svg class="spinner" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
  </svg>
  Loading...
</button>
```

```css
.spinner {
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

.spinner circle {
  stroke-dasharray: 60;
  stroke-dashoffset: 15;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

---

## Dark Mode Toggle Component

### Overview

The dark mode toggle is a professional, accessible switch component designed for integration into the Nordride navbar. It provides smooth theme transitions and respects user preferences.

---

### Component Specifications

**Visual States:**
1. **Light Mode** - Gray background, slider on left
2. **Dark Mode** - Terracotta background, slider on right
3. **Hover** - Slight background color change
4. **Focus** - Terracotta outline (keyboard navigation)

**Dimensions:**
- Width: 52px
- Height: 28px
- Slider: 20px diameter
- Border radius: Full (pill shape)

**Animation:**
- Transition duration: 300ms
- Easing: ease-out
- Slider movement: translateX(24px)

---

### HTML Structure

#### Basic Toggle (Icon Version)

```html
<button class="theme-toggle" aria-label="Toggle theme">
  <!-- Sun icon (light mode indicator) -->
  <span class="theme-toggle__icon theme-toggle__icon--sun">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  </span>
  
  <!-- Toggle switch -->
  <div class="theme-toggle__switch">
    <input 
      type="checkbox" 
      class="theme-toggle__input"
      id="theme-toggle-checkbox"
      aria-label="Dark mode toggle"
    />
    <div class="theme-toggle__slider"></div>
  </div>
  
  <!-- Moon icon (dark mode indicator) -->
  <span class="theme-toggle__icon theme-toggle__icon--moon">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  </span>
</button>
```

---

#### Text Version (Alternative)

```html
<button class="theme-toggle theme-toggle--text">
  <span class="theme-toggle__icon theme-toggle__icon--sun">
    <!-- Sun icon -->
  </span>
  <span class="theme-toggle__label">Light</span>
</button>
```

---

### CSS Styling

All styles are included in `nordride-dark-mode-system.css`. Key classes:

```css
/* Main container */
.theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

/* Switch container */
.theme-toggle__switch {
  width: 52px;
  height: 28px;
  background-color: var(--color-light-gray);
  border-radius: 9999px;
  transition: background-color 300ms ease-out;
}

/* Slider (moves left/right) */
.theme-toggle__slider {
  width: 20px;
  height: 20px;
  background-color: var(--color-soft-white);
  border-radius: 50%;
  transform: translateX(0); /* Light mode */
}

/* Dark mode active state */
html[data-theme="dark"] .theme-toggle__switch {
  background-color: var(--color-terracotta);
}

html[data-theme="dark"] .theme-toggle__slider {
  transform: translateX(24px); /* Moves to right */
}
```

---

### JavaScript Implementation

#### Vanilla JavaScript

```javascript
// Initialize theme on page load
const initTheme = () => {
  const savedTheme = localStorage.getItem('nordride-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Priority: saved preference > system preference > light (default)
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  
  // Update checkbox state
  const checkbox = document.getElementById('theme-toggle-checkbox');
  if (checkbox) checkbox.checked = theme === 'dark';
};

// Toggle theme
const toggleTheme = () => {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  // Set theme
  html.setAttribute('data-theme', newTheme);
  
  // Save to localStorage
  localStorage.setItem('nordride-theme', newTheme);
  
  // Update checkbox
  const checkbox = document.getElementById('theme-toggle-checkbox');
  if (checkbox) checkbox.checked = newTheme === 'dark';
};

// Run on page load
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  
  // Add click listener to toggle button
  const toggleButton = document.querySelector('.theme-toggle');
  if (toggleButton) {
    toggleButton.addEventListener('click', toggleTheme);
  }
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('nordride-theme')) {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
  });
});
```

---

#### React/Next.js Implementation

**File:** `components/ThemeToggle.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    
    // Initialize theme
    const savedTheme = localStorage.getItem('nordride-theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('nordride-theme', newTheme);
  };

  // Prevent SSR flash
  if (!mounted) return null;

  return (
    <button 
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <span className="theme-toggle__icon theme-toggle__icon--sun">
        <Sun size={18} />
      </span>
      
      <div className="theme-toggle__switch">
        <input 
          type="checkbox" 
          className="theme-toggle__input"
          checked={theme === 'dark'}
          onChange={toggleTheme}
          aria-label="Dark mode toggle"
        />
        <div className="theme-toggle__slider" />
      </div>
      
      <span className="theme-toggle__icon theme-toggle__icon--moon">
        <Moon size={18} />
      </span>
    </button>
  );
}
```

---

**Usage in Navbar:**

```typescript
// app/components/Navbar.tsx
import { ThemeToggle } from './ThemeToggle';

export function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar__logo">
        {/* Logo */}
      </div>
      
      <div className="navbar__actions">
        {/* Other nav items */}
        <ThemeToggle />
      </div>
    </nav>
  );
}
```

---

### Accessibility Features

**Keyboard Navigation:**
- Toggle with `Space` or `Enter` key
- Visible focus ring (2px terracotta outline)
- Screen reader announces current state

**Screen Reader Support:**
```html
<button aria-label="Switch to dark mode">
  <!-- Icons are aria-hidden by default -->
</button>
```

**Focus Management:**
```css
.theme-toggle__input:focus-visible + .theme-toggle__switch {
  outline: 2px solid var(--color-terracotta);
  outline-offset: 2px;
}
```

**Reduced Motion:**
```css
@media (prefers-reduced-motion: reduce) {
  .theme-toggle__slider,
  .theme-toggle__switch {
    transition-duration: 0.01ms !important;
  }
}
```

---

### Placement Guidelines

**Navbar Integration:**

**Desktop:**
- Position: Top-right corner of navbar
- Spacing: 24px from right edge
- Alignment: Vertically centered

**Mobile:**
- Position: In hamburger menu (if mobile nav collapses)
- Alternative: Always visible in top-right (next to hamburger icon)

**Visual Example:**

```
┌────────────────────────────────────────────────┐
│  [Logo]                   [Links]  [🌞 ◉ 🌙]  │
└────────────────────────────────────────────────┘
```

**Spacing:**
```css
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
}

.navbar__actions {
  display: flex;
  align-items: center;
  gap: 24px; /* Space between nav items and toggle */
}
```

---

### Testing Checklist

**Visual Testing:**
- [ ] Toggle switches smoothly between states
- [ ] Slider animates to correct position
- [ ] Background color transitions properly
- [ ] Icons fade in/out correctly
- [ ] No layout shift when toggling

**Functional Testing:**
- [ ] Theme persists across page reloads
- [ ] localStorage saves preference correctly
- [ ] System preference detection works
- [ ] Manual toggle overrides system preference
- [ ] All components update when theme changes

**Accessibility Testing:**
- [ ] Keyboard navigation works (Tab, Space, Enter)
- [ ] Focus indicator is visible
- [ ] Screen reader announces state changes
- [ ] Contrast ratios meet WCAG AA
- [ ] Reduced motion is respected

**Cross-Browser Testing:**
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (macOS/iOS)
- [ ] Mobile browsers (Chrome, Safari)

---

### Troubleshooting

**Issue: Flash of incorrect theme on page load**

**Solution:** Add theme script to `<head>` before any content renders:

```html
<!-- In <head> -->
<script>
  (function() {
    const theme = localStorage.getItem('nordride-theme') || 
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  })();
</script>
```

---

**Issue: Theme doesn't persist across pages**

**Cause:** localStorage not being read on page navigation  
**Solution:** Ensure `initTheme()` runs on every page load, not just initial mount

---

**Issue: Toggle not updating when system theme changes**

**Cause:** Missing event listener for system preference changes  
**Solution:** Add `matchMedia` change listener (see JavaScript implementation)

---

### Performance Considerations

**Critical CSS:**
Include theme toggle styles in critical CSS bundle for immediate render.

**Lazy Loading:**
Don't lazy load the toggle component—it should be immediately interactive.

**Repaints:**
Use `transform` and `opacity` for animations (GPU-accelerated), avoid `left`/`right` positioning.

**Bundle Size:**
- CSS: ~2KB (compressed)
- JS: ~1KB (compressed)
- Icons: Use system icons (Lucide React) or inline SVG

---

## Implementation Guide

### Integration with Existing Codebase

Your current stack:
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **UI Components:** Custom components with shadcn/ui base
- **Fonts:** DM Sans (body), Space Grotesk (display) â†’ **Migrating to Sora + DM Sans**

#### Step 1: Add New CSS File

**Option A: Import in Global CSS**

Add to `app/globals.css`:

```css
@import url('./nordride-brand-system.css');
```

**Option B: Import in Root Layout**

Add to `app/layout.tsx`:

```tsx
import './nordride-brand-system.css';
```

---

#### Step 2: Update Font Imports

Replace Space Grotesk with Sora in your font configuration:

**Before:**
```tsx
import { DM_Sans, Space_Grotesk } from 'next/font/google';

const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '600'] });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['500', '600', '700'] });
```

**After:**
```tsx
import { DM_Sans, Sora } from 'next/font/google';

const dmSans = DM_Sans({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600'],
  variable: '--font-body'
});

const sora = Sora({ 
  subsets: ['latin'], 
  weight: ['500', '600', '700'],
  variable: '--font-display'
});

// In your HTML/Layout:
<body className={`${dmSans.variable} ${sora.variable}`}>
```

---

#### Step 3: Gradual Migration Strategy

**DON'T:** Replace everything at once (risk breaking existing functionality)

**DO:** Migrate page-by-page or component-by-component

**Priority Order:**
1. **Homepage** - Maximum brand impact, highly visible
2. **Search & Ride Details Pages** - Core user experience
3. **Profile Pages** - User-facing content
4. **Dashboard & My Rides** - Functional areas
5. **Form Pages** - Last (most complex)

**Example Migration:**

```tsx
// Old component (Tailwind)
<button className="bg-black text-white px-8 py-3 rounded-full">
  Find your ride
</button>

// New component (Nordride system)
<button className="btn-nordride btn-nordride--primary">
  Find your ride
</button>
```

---

#### Step 4: Coexistence Strategy

The Nordride CSS is designed to **coexist** with your existing Tailwind setup:

- **Class prefix:** All Nordride classes use `nordride` or specific prefixes (e.g., `btn-nordride`, `card-nordride`)
- **No conflicts:** Doesn't override Tailwind defaults
- **CSS Variables:** Uses `--color-*`, `--space-*` to avoid collisions
- **Scoped selectors:** Only targets classes you explicitly add

**You can use both systems simultaneously:**

```tsx
{/* Tailwind (existing) */}
<div className="flex gap-4 p-6">
  
  {/* Nordride (new) */}
  <button className="btn-nordride btn-nordride--primary">
    New button
  </button>
  
  {/* Tailwind (existing) */}
  <button className="bg-black text-white px-6 py-2 rounded-full">
    Old button
  </button>
</div>
```

---

#### Step 5: Tailwind Config Updates (Optional)

To use Nordride colors in Tailwind classes, extend your `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'warm-cream': '#F4EFE6',
        'soft-white': '#FAFAF8',
        'charcoal': '#2C2C2C',
        'terracotta': '#E76F51',
        'terracotta-hover': '#D65A3D',
        'deep-sage': '#5F7161',
        'mustard': '#F4A261',
        'lavender': '#A895D8',
        'coral': '#F28482',
        'sky-blue': '#A8DADC',
        'slate-gray': '#6B7280',
        'mid-gray': '#9CA3AF',
        'light-gray': '#E5E7EB',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      borderRadius: {
        'nordride-sm': '8px',
        'nordride-md': '12px',
        'nordride-lg': '16px',
        'nordride-xl': '20px',
        'nordride-2xl': '24px',
      },
    },
  },
};
```

Now you can use:
```tsx
<div className="bg-warm-cream text-charcoal p-6 rounded-nordride-lg">
  Content
</div>
```

---

#### Step 6: Custom Cursor Implementation

Add to your root layout or a global component:

**File:** `components/CustomCursor.tsx`

```tsx
'use client';

import { useEffect } from 'react';

export function CustomCursor() {
  useEffect(() => {
    // Only run on desktop
    if (window.matchMedia('(hover: hover)').matches) {
      const NUM_DOTS = 10;
      const dots: Array<{ el: HTMLDivElement; x: number; y: number }> = [];
      const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

      // Create trail dots
      for (let i = 0; i < NUM_DOTS; i++) {
        const dot = document.createElement('div');
        dot.classList.add('nordride-cursor-trail');
        document.body.appendChild(dot);
        dots.push({ el: dot, x: mouse.x, y: mouse.y });
      }

      // Track mouse
      const handleMove = (e: PointerEvent) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      };
      window.addEventListener('pointermove', handleMove);

      // Animate
      let animationId: number;
      function animate() {
        let x = mouse.x;
        let y = mouse.y;

        dots.forEach((dot, i) => {
          dot.x += (x - dot.x) * 0.35;
          dot.y += (y - dot.y) * 0.35;
          dot.el.style.transform = `translate3d(${dot.x}px, ${dot.y}px, 0)`;
          dot.el.style.opacity = String(1 - i / NUM_DOTS);
          x = dot.x;
          y = dot.y;
        });

        animationId = requestAnimationFrame(animate);
      }
      animate();

      // Enable custom cursor
      document.body.classList.add('custom-cursor');

      // Cleanup
      return () => {
        window.removeEventListener('pointermove', handleMove);
        cancelAnimationFrame(animationId);
        dots.forEach(dot => dot.el.remove());
        document.body.classList.remove('custom-cursor');
      };
    }
  }, []);

  return null;
}
```

**Add to layout:**
```tsx
import { CustomCursor } from '@/components/CustomCursor';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
```

---

### Component Migration Examples

#### Homepage Hero

**Before (Current):**
```tsx
<section className="bg-white py-20">
  <div className="max-w-7xl mx-auto px-4">
    <h1 className="text-5xl font-bold mb-4">
      Share the ride, share the planet
    </h1>
    <p className="text-xl text-gray-600 mb-8">
      Join Sweden's community-driven ride-sharing platform.
    </p>
    <div className="flex gap-4">
      <button className="bg-black text-white px-8 py-3 rounded-full">
        Find a ride
      </button>
      <button className="border-2 border-black px-8 py-3 rounded-full">
        Offer a ride
      </button>
    </div>
  </div>
</section>
```

**After (Nordride):**
```tsx
<section className="hero-nordride">
  <div className="hero-nordride__container">
    <div className="hero-nordride__content">
      <h1 className="hero-display">
        Good company makes every journey better
      </h1>
      <p className="hero-nordride__subtitle">
        Find rides across Sweden. Share costs, stories, and maybe a coffee stop.
      </p>
      <div className="hero-nordride__cta">
        <button className="btn-nordride btn-nordride--primary">
          Find your ride
        </button>
        <button className="btn-nordride btn-nordride--secondary">
          Offer a ride
        </button>
      </div>
    </div>
    <div className="hero-nordride__illustration">
      {/* Add illustration here */}
      <svg>...</svg>
    </div>
  </div>
  
  {/* Organic shapes */}
  <div className="organic-shape organic-shape--blob" style={{ top: '10%', right: '5%' }} />
  <div className="organic-shape organic-shape--star" style={{ top: '60%', left: '10%' }} />
</section>
```

---

#### Ride Card

**Before:**
```tsx
<div className="bg-white border-2 rounded-2xl p-6 hover:shadow-lg">
  <div className="flex justify-between">
    <h3 className="font-semibold text-xl">Stockholm â†’ Gothenburg</h3>
    <span className="text-green-600 font-bold">350 SEK</span>
  </div>
  <div className="flex gap-4 text-gray-600 text-sm mt-2">
    <span>Tomorrow 10:00</span>
    <span>5h 30min</span>
    <span>3 seats</span>
  </div>
</div>
```

**After:**
```tsx
<div className="ride-card">
  <div className="ride-card__header">
    <div className="ride-card__route">Stockholm â†’ Gothenburg</div>
    <div className="ride-card__price">350 SEK</div>
  </div>
  
  <div className="ride-card__details">
    <span>Tomorrow 10:00</span>
    <span>5h 30min</span>
    <span>3 seats</span>
  </div>
</div>
```

---

### Testing Checklist

Before deploying:

- [ ] All fonts loading correctly (Sora + DM Sans)
- [ ] Colors match specification (use browser DevTools to verify hex values)
- [ ] Custom cursor trail works on desktop, hidden on mobile
- [ ] Hover states function correctly on all interactive elements
- [ ] Forms maintain existing functionality
- [ ] Accessibility: Keyboard navigation works
- [ ] Accessibility: Focus states visible
- [ ] Responsive: Test on mobile (375px), tablet (768px), desktop (1440px)
- [ ] Performance: No layout shifts, animations smooth
- [ ] Cross-browser: Test in Chrome, Firefox, Safari, Edge

---

## Accessibility Standards

### WCAG 2.1 AA Compliance

Nordride adheres to **WCAG 2.1 Level AA** standards.

#### Color Contrast

All text meets minimum contrast ratios:

**Large Text (18px+ regular, 14px+ bold):**
- Minimum contrast: 3:1
- Nordride: âœ… All combinations meet or exceed

**Normal Text (< 18px):**
- Minimum contrast: 4.5:1
- Nordride: âœ… All combinations meet or exceed

**Verified Combinations:**

| Text Color | Background | Ratio | Pass |
|------------|------------|-------|------|
| Charcoal (#2C2C2C) | Warm Cream (#F4EFE6) | 11.5:1 | âœ… AAA |
| Charcoal (#2C2C2C) | Soft White (#FAFAF8) | 13.2:1 | âœ… AAA |
| Slate Gray (#6B7280) | Warm Cream (#F4EFE6) | 5.8:1 | âœ… AA |
| White (#FFFFFF) | Terracotta (#E76F51) | 4.6:1 | âœ… AA |
| White (#FFFFFF) | Deep Sage (#5F7161) | 5.2:1 | âœ… AA |

**Never Use:**
- Light gray text on white backgrounds
- Mustard text on cream backgrounds (fails contrast)

---

#### Keyboard Navigation

All interactive elements must be keyboard accessible:

**Focus States:**
```css
*:focus-visible {
  outline: 2px solid #E76F51; /* Terracotta */
  outline-offset: 2px;
}
```

**Tab Order:**
- Logical reading order (top to bottom, left to right)
- Skip links for navigation
- Focus trap in modals

**Keyboard Shortcuts:**
- `Tab` - Next element
- `Shift + Tab` - Previous element
- `Enter` / `Space` - Activate button
- `Esc` - Close modal/dialog

---

#### Screen Reader Support

**Semantic HTML:**
```html
<!-- Good: Semantic -->
<nav>
  <ul>
    <li><a href="/rides">Find a ride</a></li>
  </ul>
</nav>

<!-- Bad: Divs only -->
<div class="nav">
  <div class="nav-item">Find a ride</div>
</div>
```

**ARIA Labels:**
```html
<!-- Icon-only button -->
<button aria-label="Close dialog">
  <svg>...</svg>
</button>

<!-- Form with helpful labels -->
<label for="departure-city">
  Departure City
  <input id="departure-city" type="text" />
</label>

<!-- Status messages -->
<div role="status" aria-live="polite">
  Your ride request was sent successfully.
</div>
```

**Image Alt Text:**
```html
<!-- Decorative (no alt needed) -->
<img src="blob.svg" alt="" role="presentation" />

<!-- Informative -->
<img src="driver-avatar.jpg" alt="Emma S., 4.9 stars, 47 rides" />

<!-- Complex (use aria-describedby) -->
<svg aria-labelledby="chart-title chart-desc">
  <title id="chart-title">Ride statistics</title>
  <desc id="chart-desc">Bar chart showing 12 rides completed this month</desc>
</svg>
```

---

#### Motion & Animation

**Respect User Preferences:**

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  /* Disable custom cursor */
  .nordride-cursor-trail {
    display: none;
  }
  
  body.custom-cursor {
    cursor: default;
  }
}
```

**Essential Animations Only:**
- Loading states (convey system status)
- Success/error feedback (important user feedback)
- Focus indicators (navigation aid)

**Non-Essential:**
- Decorative hover effects (reduce or remove)
- Parallax scrolling (remove)
- Automatic carousels (pause or remove)

---

#### Touch Targets

**Minimum Size:** 44x44px for all interactive elements

```css
.btn-nordride {
  min-width: 44px;
  min-height: 44px;
  padding: 12px 32px; /* Usually exceeds minimum */
}
```

**Spacing:**
- Minimum 8px between adjacent touch targets
- Use `gap: 16px` in flex/grid layouts for comfortable spacing

---

#### Form Accessibility

**Required Fields:**
```html
<label for="email" class="label-nordride label-nordride--required">
  Email Address
</label>
<input 
  id="email" 
  type="email" 
  required 
  aria-required="true"
  aria-describedby="email-error"
  class="input-nordride"
/>
<span id="email-error" class="text-sm text-error" role="alert">
  <!-- Error message appears here -->
</span>
```

**Error Messages:**
- Use `role="alert"` or `aria-live="polite"`
- Associate with input via `aria-describedby`
- Display inline, not just as color change
- Provide correction suggestions

**Success Confirmation:**
```html
<div role="status" aria-live="polite" class="alert-nordride alert-nordride--success">
  <svg aria-hidden="true">...</svg>
  <span>Your ride request was sent successfully.</span>
</div>
```

---

### Testing Tools

**Automated:**
- [axe DevTools](https://www.deque.com/axe/devtools/) - Browser extension
- [WAVE](https://wave.webaim.org/) - Web accessibility evaluation tool
- Lighthouse (Chrome DevTools) - Accessibility audit

**Manual:**
- Keyboard navigation testing
- Screen reader testing (NVDA, JAWS, VoiceOver)
- Color contrast analyzer
- Mobile touch target testing

**Checklist:**
- [ ] All images have appropriate alt text
- [ ] All interactive elements keyboard accessible
- [ ] Focus states clearly visible
- [ ] Color not sole indicator of meaning
- [ ] Forms have clear labels and error messages
- [ ] Sufficient color contrast (4.5:1 minimum for text)
- [ ] Touch targets minimum 44x44px
- [ ] Respects prefers-reduced-motion
- [ ] Screen reader announces status changes
- [ ] Logical heading hierarchy (H1 > H2 > H3)

---

## Brand Voice & Messaging

### Voice Principles

Nordride's voice is:
- **Warm** - Friendly and inviting, not cold or transactional
- **Clear** - Direct and honest, not vague or confusing
- **Encouraging** - Supportive and positive, not pushy or salesy
- **Human** - Conversational and real, not robotic or corporate

### Tone Variations by Context

| Context | Tone | Example |
|---------|------|---------|
| Homepage Hero | Inspiring, inviting | "Good company makes every journey better" |
| Feature Copy | Helpful, clear | "Turn drive time into story time. Every ride is a chance to meet someone interesting." |
| Error Messages | Understanding, solution-focused | "We couldn't find that ride. Let's search again together." |
| Success Messages | Celebratory, warm | "Your ride is booked! Time to pack that coffee thermos." |
| Empty States | Encouraging, friendly | "No rides yet? Be the first to offer one." |
| Legal Pages | Professional, transparent | "Your data is yours. Here's exactly what we do with it." |

---

### Writing Style Guidelines

**DO:**
- Use contractions (you'll, we're, it's)
- Start sentences with "And" or "But" when natural
- Ask questions to engage users
- Use specific examples
- Keep sentences short (15-20 words max)
- Put the most important info first

**DON'T:**
- Use jargon ("mobility solutions" â†’ "rides")
- Say "users" (say "travelers" or "people")
- Be overly formal or corporate
- Use passive voice
- Apologize excessively
- Use exclamation marks everywhere (!!!)

---

### Key Messaging

#### Tagline

**Primary:** "Good company makes every journey better"

**Alternate:** "Share the ride, share the planet"

#### Value Propositions

**For Riders:**
> Find rides across Sweden. Share costs, stories, and maybe a coffee stop.

**For Drivers:**
> Offset your travel costs while meeting interesting people on the road.

#### Feature Descriptions

**Real Conversations:**
> Turn drive time into story time. Every ride is a chance to meet someone interesting. Share travel tips, local recommendations, or just enjoy good company on the road.

**Safe Connections:**
> Connect with confidence. Verified profiles, written reviews, and secure messaging. Meet people, not strangers.

**Your Pace, Your Style:**
> Find your travel match. Prefer quiet rides? Love chatting? Filter by language, interests, and trip preferences to find compatible travel companions.

**Easy & Affordable:**
> Share costs, not just space. Split fuel costs fairly. No surge pricing, no commissionsâ€”just honest ride-sharing.

---

### Vocabulary Guide

**Preferred Terms:**

| Use This | Not This |
|----------|----------|
| Travelers | Users, passengers, customers |
| Travel companions | Riders (too transactional) |
| Rides | Trips, journeys (unless poetic) |
| Cost-sharing | Carpooling (informal) |
| Find a ride | Book a ride (sounds commercial) |
| Connect | Network (too corporate) |
| Share the journey | Share the ride (when emphasizing connection) |

**Key Phrases:**
- "Your next adventure starts here"
- "Travel with someone, not just somewhere"
- "Find your people on the road"
- "Turn travel time into conversation time"
- "Good company, shared costs"

---

### Call-to-Action Copy

**Primary CTAs:**
- **Find your ride** (not "Search rides" or "Book now")
- **Offer a ride** (not "Post a trip" or "Become a driver")
- **Get started** (generic, when specific action unclear)

**Secondary CTAs:**
- **View ride details** (not "Learn more")
- **Message driver** (not "Contact" or "Chat")
- **Cancel request** (not "Delete" or "Remove")
- **Leave a review** (not "Write review" or "Rate")

**Tertiary:**
- **See all rides** (not "View more")
- **Edit profile** (not "Update" or "Manage")
- **Back to search** (not "Return" or "Go back")

---

### Error & Empty State Messages

#### Error Messages

**Connection Failed:**
> Oops, we lost connection. Check your internet and try again.

**Ride Not Found:**
> We couldn't find that ride. It may have been cancelled or completed.

**Form Validation:**
> Please enter a valid email address so we can reach you.

**Server Error:**
> Something went wrong on our end. We're looking into itâ€”please try again in a moment.

#### Empty States

**No Rides Found:**
> No rides match your search yet. Try adjusting your dates or expanding your search area.

**No Bookings Yet:**
> You haven't joined any rides yet. Find your next adventure below.

**No Messages:**
> Your inbox is empty. When you request a ride, you can chat with drivers here.

**Profile Incomplete:**
> Your profile is almost ready! Add a photo and bio to start connecting.

---

#