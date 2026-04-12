import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import { Analytics } from "@vercel/analytics/react";

import { AppProviders } from "@/components/providers/app-providers";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { env } from "@/lib/env";
import { cn } from "@/lib/utils/cn";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: `${APP_NAME} | Blood Donation Matching for India`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_TAGLINE,
  openGraph: {
    title: APP_NAME,
    description: APP_TAGLINE,
    type: "website",
    locale: "en_IN",
  },
  applicationName: APP_NAME,
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  themeColor: "#b30c31",
  colorScheme: "light dark",
};

async function getMessages(locale: string) {
  if (locale === "hi") {
    const messages = await import("../../messages/hi.json");
    return messages.default;
  }

  const messages = await import("../../messages/en.json");
  return messages.default;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("donorix_locale")?.value === "hi" ? "hi" : "en";
  const messages = await getMessages(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={cn(geistSans.variable, geistMono.variable, "min-h-screen")}>
        <AppProviders locale={locale} messages={messages}>
          {children}
        </AppProviders>
        <Analytics />
      </body>
    </html>
  );
}
