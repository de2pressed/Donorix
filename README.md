## Donorix

Donorix is a Next.js + Supabase platform for blood-request coordination with donor, hospital, and admin workflows.

### Local Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables in `.env.local` (Supabase keys, cron secret, optional Twilio/OpenAI/Upstash values).
   - Add `OPENAI_API_KEY=your_key_here` to enable the AI assistant. If it is omitted, the chatbot falls back to deterministic replies.

3. Apply Supabase migrations:

```bash
npx supabase db push
```

4. Start the app:

```bash
npm run dev
```

### Repo Structure

- App routes and APIs: `src/app`
- Shared UI: `src/components`
- Data/auth/business logic: `src/lib`
- Database schema: `supabase/migrations`
- Generated DB typings: `src/types/database.ts`

### Key Commands

```bash
npm run lint
npm run typecheck
npm run build
```
