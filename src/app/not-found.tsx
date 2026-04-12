import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">404</p>
      <h1 className="text-4xl font-semibold">The page you requested is not available.</h1>
      <p className="max-w-xl text-muted-foreground">
        The resource may have expired, been removed, or never existed. Return to the live request feed to continue.
      </p>
      <Button asChild>
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}
