## Donorix Brain (change log)

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

