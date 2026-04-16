import { SecondaryPageBackLink } from "@/components/layout/secondary-page-back-link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col px-4 py-6 lg:px-8 2xl:px-10">
      <div className="w-full max-w-[1900px] self-start">
        <SecondaryPageBackLink />
      </div>

      <div className="flex flex-1 flex-col items-center justify-start gap-8 pt-8">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Donorix access</p>
          <h1 className="mt-3 text-balance text-3xl font-semibold md:text-5xl">
            Secure blood-donor coordination built for India.
          </h1>
          <p className="mt-3 text-balance text-sm text-muted-foreground md:text-lg">
            Consent-first onboarding, verified profiles, and emergency routing from the first session.
          </p>
        </div>
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}
