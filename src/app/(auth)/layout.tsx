export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="hero-grid flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-6xl space-y-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Donorix access</p>
          <h1 className="mt-4 text-balance text-4xl font-semibold md:text-6xl">
            Secure blood-donor coordination built for India.
          </h1>
          <p className="mt-4 text-balance text-base text-muted-foreground md:text-lg">
            Consent-first onboarding, verified profiles, and emergency routing from the first session.
          </p>
        </div>
        <div className="flex justify-center">{children}</div>
      </div>
    </div>
  );
}
