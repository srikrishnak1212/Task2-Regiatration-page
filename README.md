# SK Auth

> **Secure Authentication Experience** — A premium, fully responsive authentication interface built with HTML5, CSS3, Vanilla JavaScript, and Bootstrap 5.

---

## Project Overview

**SK Auth** is a production-quality authentication UI system designed with a distinctive editorial aesthetic called **Dusk Orchard** — a warm, premium theme built around a Royal Violet / Deep Teal / Warm Amber palette. It provides a complete Login and Registration experience with advanced micro-interactions, real-time validation, and accessibility-first design.

This project was built with zero dependencies beyond Bootstrap 5 (grid/utilities only) and vanilla JavaScript — no React, no Vue, no jQuery.

---

## Features

### Authentication
- **Login Page** — Email/username + password with "Remember Me" and "Forgot Password"
- **Registration Page** — Full name, email, international phone (country-code picker), password, confirm password
- **Social Login Buttons** — Google & GitHub (styled to match custom theme)
- **Smooth tab switching** — Login ↔ Register with horizontal slide + fade animation (no page reload)

### Validation
- **Real-time inline validation** — blur + input events; shows errors only after field is touched
- **Email regex** — RFC 5322 simplified pattern; email or username detection on login
- **Phone validation** — Strips formatting characters, validates 7–15 international digits
- **Password strength meter** — 4-segment animated bar (Weak / Fair / Strong / Excellent) with color transitions and human-readable tips
- **Live confirm-password match** — ✓ / ✗ icon updates as you type
- **Caps Lock warning** — Real-time tooltip when Caps Lock is detected on password fields

### User Experience
- **Form completion progress ring** — SVG ring showing % of registration fields correctly filled
- **Password show/hide toggle** — Eye icon on all password inputs
- **Country-code picker** — Searchable dropdown with 30 country codes and flag emoji
- **Custom-styled checkbox** — Spring-animated checkmark with brand colors
- **Keyboard accessibility** — Full tab order, Enter-to-submit, arrow-key tab navigation

### Success Flow
- **Loading state** — Button morphs to spinner with contextual label ("Signing In…" / "Creating Account…")
- **Input locking** — All form fields disabled with CSS `is-processing` class during async request
- **Premium success overlay** — Frosted glass backdrop with:
  - SVG circle-draw animation (stroke-dashoffset)
  - Animated checkmark draw
  - Staggered fade-up title and message
  - Gradient redirect countdown progress bar
- **Confetti burst** — Canvas-based particle animation on successful registration
- **Auto-redirect** — Smooth fade-out → navigate to `dashboard.html` after success

### Theming
- **Light Mode** — "Dusk Orchard": warm ivory (#FBF7F0), Royal Violet, Deep Teal, Warm Amber
- **Dark Mode** — "Midnight Orchard": deep plum (#1A1028), teal glow accents
- **Theme toggle** — Sun/moon morph icon, persisted via `localStorage`, respects `prefers-color-scheme`

### Notifications
- **Toast system** — Top-right, auto-dismiss, swipe-to-dismiss (touch), with progress bar
- Four types: `success`, `error`, `info`, `warning`

---

## Technology Stack

| Layer         | Technology                              |
|---------------|-----------------------------------------|
| Structure     | HTML5 (semantic, ARIA attributes)       |
| Styling       | CSS3 (custom properties, keyframes)     |
| Layout        | Bootstrap 5 (grid + utilities only)     |
| Scripting     | Vanilla JavaScript ES2020 (IIFE modules)|
| Fonts         | Google Fonts — Fraunces + Sora          |
| Icons         | Inline SVG (no icon library)            |
| Favicon       | Inline SVG data URI                     |

---

## Folder Structure

```
Task 2/
├── index.html        # Main auth page (Login + Register tabs)
├── dashboard.html    # Post-authentication landing page
├── styles.css        # Full design system (1800+ lines, 20 sections)
├── script.js         # Modular vanilla JS (16 IIFE modules)
└── README.md         # This file
```

---

## Installation

No build step required. This is a pure static project.

**Clone or download:**
```bash
git clone https://github.com/your-username/sk-auth.git
cd sk-auth
```

Or simply download and unzip the project folder.

---

## How to Run

### Option 1 — Direct file open (simplest)
```
Double-click index.html
```
Opens directly in your default browser. All features work except the country-code search input focus on some browsers.

### Option 2 — Local development server (recommended)

Using VS Code Live Server:
```
Install "Live Server" extension → Right-click index.html → "Open with Live Server"
```

Using Python:
```bash
python -m http.server 8000
# Visit http://localhost:8000
```

Using Node.js:
```bash
npx serve .
# Visit http://localhost:3000
```

---

## Responsive Features

| Breakpoint | Behaviour                                                    |
|------------|--------------------------------------------------------------|
| Mobile `< 768px`  | Single-column, decorative panel collapses to slim top banner |
| Tablet `768–991px`| 38% deco / 62% form split                                    |
| Desktop `≥ 992px` | 45% deco / 55% form split (default layout)                   |
| Large `≥ 1200px`  | Generous side padding (80px) on form panel                   |

Toast notifications reflow to full-width on mobile. Social buttons stack vertically on small screens.

---

## Validation Features

| Field          | Rules                                                              |
|----------------|--------------------------------------------------------------------|
| Email/Username | Email regex OR 3–32 char alphanumeric username                     |
| Full Name      | 2–64 chars, letters, spaces, hyphens, apostrophes, Unicode letters |
| Phone          | 7–15 digits after stripping spaces, dashes, dots, parens           |
| Password (new) | Minimum 8 characters; strength score ≥ 2 to submit                |
| Confirm PW     | Live equality check; ✓/✗ icon updates on each keystroke           |

Password strength scoring (0–4):
- `+1` — Length ≥ 8 characters
- `+1` — Length ≥ 14 characters
- `+1` — Mixed upper + lowercase
- `+1` — Contains a digit
- `+1` — Contains a symbol (`!`, `@`, `#`, etc.)

---

## Animations

| Animation               | Technique                          |
|-------------------------|------------------------------------|
| Blob morphing           | CSS `border-radius` keyframes      |
| Gradient orb float      | CSS `translate` + `scale` keyframes|
| Tab indicator slide     | CSS `transform` transition + JS width measurement |
| Panel switch            | CSS `fadeSlideIn` / `fadeSlideInLeft` keyframes |
| Input focus glow        | CSS `box-shadow` transition + `border-color` |
| Button magnetic tilt    | CSS `perspective` + `rotateX` on hover |
| Button sheen sweep      | CSS pseudo-element `left` transition |
| Loading spinner         | CSS `spin` keyframe (border rotate) |
| Success checkmark draw  | SVG `stroke-dashoffset` animation  |
| Success circle draw     | SVG `stroke-dashoffset` animation  |
| Overlay fade + card pop | CSS `overlayFadeIn` + `cardScaleIn`|
| Confetti burst          | Canvas 2D API + `requestAnimationFrame` |
| Theme icon morph        | JS inline style + `setTimeout`     |
| Toast slide-in          | CSS `toastSlideIn` keyframe        |
| Progress ring           | SVG `stroke-dashoffset` via JS     |
| Logo hover tilt         | CSS `scale` + `rotate` transition  |

---

## Accessibility

- Semantic HTML5 (`<form>`, `<fieldset>`, `<legend>`, `<label for>`, `<main>`, `<aside>`, `<section>`)
- ARIA: `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls`, `aria-labelledby`
- Live regions: `aria-live="assertive"` on field errors, `aria-live="polite"` on strength meter and Caps Lock warning
- Toast container: `role="region"`, `aria-live="polite"`
- Success overlay: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- All interactive elements have `:focus-visible` rings styled in brand colors
- Arrow-key navigation within tab list
- Enter-to-submit enforced via JS keydown handler
- `prefers-reduced-motion` media query disables all animations for users who prefer it

---

## Screenshots

> *(Add screenshots here after capturing the UI)*

| View | Preview |
|------|---------|
| Login — Light Mode  | `screenshots/login-light.png`  |
| Login — Dark Mode   | `screenshots/login-dark.png`   |
| Register — Light    | `screenshots/register-light.png` |
| Success Overlay     | `screenshots/success-overlay.png` |
| Mobile View         | `screenshots/mobile.png`       |

---

## Future Improvements

- [ ] Backend integration (Node.js / Firebase / Supabase)
- [ ] JWT token management and secure session handling
- [ ] OAuth 2.0 flow for Google and GitHub social login
- [ ] Email verification step after registration
- [ ] Multi-factor authentication (TOTP / SMS)
- [ ] Rate limiting and brute-force protection UI
- [ ] Profile page and account settings
- [ ] Animated onboarding flow post-registration
- [ ] PWA manifest and offline support
- [ ] Unit tests with Jest for validation helpers
- [ ] E2E tests with Playwright

---

## Author

**SK** — UI Developer & Designer  
Building premium web experiences with an editorial aesthetic.

- GitHub: [github.com/your-username](https://github.com/your-username)
- Portfolio: [your-portfolio.dev](https://your-portfolio.dev)

---

## GitHub Repository

```
https://github.com/your-username/sk-auth
```

> Replace `your-username` with your actual GitHub username before publishing.

---

## License

This project is open source and available under the [MIT License](LICENSE).

```
MIT License

Copyright (c) 2026 SK

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">
  <strong>SK Auth</strong> &mdash; Secure Authentication Experience<br/>
  Built with ❤️ using HTML5, CSS3 &amp; Vanilla JavaScript
</div>
