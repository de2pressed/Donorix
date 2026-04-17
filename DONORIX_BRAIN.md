## Donorix Brain (change log)

### 2026-04-18 - Changelog 15 (theme fade, toast theming, feed cards, mobile nav)

#### Theme switch
- Replaced the global `.theme-transition` repaint hack with a frosted overlay fade for theme changes.
- Kept the theme switch animation localized to the toggle interaction instead of transitioning every element on the page.

#### Toasts
- Replaced Sonner `richColors` with theme-matched toast class names.
- Added global Sonner CSS variable overrides and toast backdrop blur so notifications match the glass UI.

#### Feed cards
- Reworked feed post cards into collapsed and expanded states with click-to-expand and second-click navigation.
- Kept interactive controls and profile links from triggering card navigation.

#### Mobile nav
- Increased the bottom-sheet clearance so the logout action is not hidden behind the fixed mobile nav bar.
- Moved logout to the top of the more-menu list and styled it as a destructive action.

#### Hero polish
- Reduced the guest hero headline weight and size so it better matches the logged-in hero treatment.

#### Files touched
- `donorix/src/app/globals.css`
- `donorix/src/components/layout/theme-toggle.tsx`
- `donorix/src/components/providers/app-providers.tsx`
- `donorix/src/components/posts/post-card.tsx`
- `donorix/src/components/layout/mobile-nav.tsx`
- `donorix/src/app/(main)/page.tsx`

### 2026-04-18 - Font system revert

#### Revert
- Returned the app shell and Tailwind font stack to the default system UI families.
- Removed the custom font loaders from the root layout and cleared the font CSS variables from the global stylesheet.
- Switched the logo wordmark and policies header brand link back to plain system sans treatment.

#### Files touched
- `donorix/src/app/layout.tsx`
- `donorix/src/app/globals.css`
- `donorix/src/components/layout/app-logo.tsx`
- `donorix/src/app/policies/layout.tsx`
- `donorix/tailwind.config.ts`

### 2026-04-18 — Changelog 14 (typography reset + glass depth + logo cache execution)

#### Typography reset
- Removed the Playfair / italic brand system from the app shell and Tailwind font map.
- Standardized the Donorix wordmark on `font-display` with a bold, straight treatment.
- Kept the main landing hero headlines at `font-extrabold` for stronger display presence.

#### Light mode depth
- Reworked the light theme background, ambient blobs, and grid contrast so frosted surfaces read with more depth.
- Strengthened `.glass-panel`, `.surface`, and `.glass` with lower opacity, clearer borders, and heavier blur.
- Added a light-mode nested glass override so cards on glass surfaces stay visually legible.

#### Logo reliability
- Moved logo resolution into a module-level cache so client navigations reuse the resolved asset instead of flashing the fallback icon.

#### CTA guard
- Hid the donor hero "Register as Hospital" button for authenticated users and kept it for guests only.

#### Files touched
- `donorix/src/app/layout.tsx`
- `donorix/src/app/globals.css`
- `donorix/src/app/(main)/page.tsx`
- `donorix/src/app/policies/layout.tsx`
- `donorix/src/components/layout/app-logo.tsx`
- `donorix/src/components/layout/site-footer.tsx`
- `donorix/tailwind.config.ts`

### 2026-04-18 — Changelog 13 (typography + shell polish execution)

#### Typography
- Added a 4-font system with `Syne` for display headings and `Playfair Display` for brand moments, alongside the existing Geist Sans / Geist Mono stack.
- Registered `font-display` and `font-brand` in Tailwind, and applied the new typography rules across shared primitives and major screens.
- Updated the logo wordmark, footer tagline, boot splash title, policy brand link, page titles, section headings, card titles, dialogs, and request/list cards to use the new font roles.

#### Shell + footer
- Reworked the main app shell bottom spacing so the center column keeps footer clearance without relying on the old oversized outer padding.
- Removed the footer stacking offset that could visually sit above sticky content.

#### Light mode
- Increased the light-mode background, radial glow, and grid visibility so the page no longer reads washed out.
- Strengthened light-mode glass/surface contrast with warmer fills, visible borders, and deeper shadows while leaving dark mode unchanged.

#### Data emphasis
- Applied monospace treatment to blood types, IDs, counts, karma, ranks, and timestamp-like metadata in feed cards, right-rail stats, leaderboard rows, donor lists, profile badges, and chat inbox rows.

#### Pages touched
- Main home/feed page
- Find-to-donate feed
- Leaderboard
- Settings
- About
- Policies layout and document headings
- Hospital posts, donors, and chats
- Donor chats
- Profile header/history/badge components
- Shared card/dialog/blood-type components
- Footer, sidebar, right rail, root shell, and app logo

### 2026-04-17 — Changelog 12 (final refinement execution)

#### Build + stability
- Fixed Vercel build failure due to raw `->` tokens in JSX text by using safe HTML entity arrows in `donorix/src/components/posts/post-card.tsx`.
- Kept new environment variables **optional** (no build failures if unset):
  - Email: `RESEND_API_KEY`, `NOTIFICATION_FROM_EMAIL`
  - Demo: `DEMO_SETUP_TOKEN`

#### Notifications
- Added hospital post notification fan-out:
  - `donorix/src/lib/notifications/hospital-post-alerts.ts`
  - Triggered from `donorix/src/app/api/posts/route.ts`
  - In-app notifications always persisted; email delivery attempted only when email env is configured and user opted-in.

#### Security hardening (demo-safe)
- Added optional production gate for demo account provisioning (only enforced if `DEMO_SETUP_TOKEN` is set):
  - `donorix/src/app/api/demo-accounts/route.ts`

#### Layout + scaling
- Improved mid-desktop (~1100–1280px) layout behavior to prevent sidebar/content collisions:
  - `donorix/src/components/layout/root-layout.tsx`
  - `donorix/src/components/layout/sidebar.tsx`
  - `donorix/src/components/layout/right-rail.tsx`
- Added chat page bottom padding to prevent fixed UI overlap:
  - `donorix/src/app/(main)/chat/[postId]/page.tsx`

#### UI & design system
- Added global logo override support (custom logo file in `donorix/public/logo/` with fallback to default mark):
  - `donorix/src/components/layout/app-logo.tsx`
  - Wired into header/sidebar/footer/about
- Refined glassmorphism + background motion layers:
  - `donorix/src/app/globals.css`
- Adjusted light theme background color intensity to make glass panels read more clearly (dark theme preserved):
  - `donorix/src/app/globals.css`

#### Footer
- Upgraded footer structure + spacing, then removed excessive translucency causing “visual overlap” perception:
  - `donorix/src/components/layout/site-footer.tsx`
- Fixed footer clipping/overlap by moving large safe-area bottom padding from inner wrapper onto the footer container:
  - `donorix/src/components/layout/site-footer.tsx`

#### Header (mobile)
- Fixed top bar mobile text overlap by hiding tagline on small screens and improving truncation:
  - `donorix/src/components/layout/app-logo.tsx`
  - `donorix/src/components/layout/header.tsx`

#### Logo reliability
- Prevented broken-image placeholder by preloading logo candidates and only rendering the `<img>` once a logo successfully loads:
  - `donorix/src/components/layout/app-logo.tsx`
- Added Linux/Vercel-safe filename variants and runtime `onError` fallback to guarantee the default mark shows instead of a broken icon:
  - `donorix/src/components/layout/app-logo.tsx`

#### Language (Hindi)
- Removed `????` placeholder strings from `messages/hi.json` and ensured Hindi renders using a Devanagari-capable font:
  - `donorix/messages/hi.json`
  - `donorix/src/app/layout.tsx`
  - `donorix/src/app/globals.css`
  - `donorix/tailwind.config.ts`

#### Footer overlap prevention
- Added footer visibility detection and lifted fixed UI (assistant + FAB) when the footer enters the viewport to prevent overlap:
  - `donorix/src/components/layout/site-footer.tsx`
  - `donorix/src/components/layout/floating-assistant.tsx`
  - `donorix/src/components/layout/new-post-fab.tsx`

#### Chats
- Adjusted donor-hospital chat typography and metadata row to reduce overly-wide appearance:
  - `donorix/src/components/chats/chat-thread.tsx`
- Added lightweight message image URL rendering (links + previews) without breaking layout:
  - `donorix/src/components/chats/chat-thread.tsx`

#### Animations
- Slowed and de-rectangled emergency card animation; reduced clipping and improved premium feel:
  - `donorix/src/app/globals.css`
  - `donorix/src/components/posts/post-card.tsx`
