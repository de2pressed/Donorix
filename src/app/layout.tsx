import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";

import { AppProviders } from "@/components/providers/app-providers";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { env } from "@/lib/env";
import { getRequestMessages } from "@/lib/i18n";
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

const themeInitScript = `
  try {
    var storedTheme = window.localStorage.getItem('theme');
    var isDark = storedTheme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
  } catch (error) {}
`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { locale, messages } = await getRequestMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={cn(geistSans.variable, geistMono.variable, "min-h-screen")}>
        <AppProviders locale={locale} messages={messages}>
          {children}
        </AppProviders>
        <Analytics />
      </body>
    </html>
  );
}
