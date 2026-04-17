import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Noto_Sans_Devanagari, Playfair_Display, Syne } from "next/font/google";
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

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari", "latin"],
  variable: "--font-noto-devanagari",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
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
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const bootstrapScript = `
  try {
    var storedTheme = window.localStorage.getItem('theme');
    var isDark = storedTheme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';

    var storedLocale = window.localStorage.getItem('donorix_locale');
    if (storedLocale === 'en' || storedLocale === 'hi') {
      document.documentElement.lang = storedLocale;
      document.cookie = 'donorix_locale=' + storedLocale + '; Path=/; Max-Age=31536000; SameSite=Lax';
    }

    if (window.sessionStorage.getItem('donorix_splash_v2_seen') !== 'true') {
      window.__donorixSplashStart = Date.now();
      window.requestAnimationFrame(function() {
        document.documentElement.classList.add('donorix-booting');
      });
    }
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
        <script dangerouslySetInnerHTML={{ __html: bootstrapScript }} />
      </head>
      <body
        suppressHydrationWarning
        className={cn(
          geistSans.variable,
          geistMono.variable,
          notoDevanagari.variable,
          syne.variable,
          playfair.variable,
          "min-h-screen",
        )}
      >
        <div aria-hidden="true" id="donorix-boot-splash" suppressHydrationWarning>
          <div className="donorix-boot-splash__content">
            <div className="donorix-boot-splash__brand">
              <div className="donorix-boot-splash__mark">D</div>
              <div>
                <p className="donorix-boot-splash__eyebrow">India-first blood matching</p>
                <p className="donorix-boot-splash__title">Donorix</p>
              </div>
            </div>
            <div className="donorix-boot-splash__meter">
              <div className="donorix-boot-splash__meter-fill" />
            </div>
          </div>
        </div>
        <AppProviders locale={locale} messages={messages}>
          {children}
        </AppProviders>
        <Analytics />
      </body>
    </html>
  );
}
