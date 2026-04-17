## Donorix Brain (change log)

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
