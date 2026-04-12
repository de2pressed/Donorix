export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="hero-grid flex min-h-dvh items-start justify-center px-4 py-6 md:items-center md:py-10">
      <div className="w-full max-w-5xl space-y-6">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Donorix access</p>
          <h1 className="mt-3 text-balance text-3xl font-semibold md:text-5xl">
            Secure blood-donor coordination built for India.
          </h1>
          <p className="mt-3 text-balance text-sm text-muted-foreground md:text-lg">
            Consent-first onboarding, verified profiles, and emergency routing from the first session.
          </p>
        </div>
        <div className="flex justify-center">{children}</div>
      </div>
    </div>
  );
}
