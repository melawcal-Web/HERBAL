import type { Metadata } from "next";
import { Noto_Sans_Hebrew } from "next/font/google";
import "./globals.css";
import { auth } from "@/auth";
import { getSiteTitle } from "@/lib/site-config";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Providers } from "@/app/providers";
import { AmbientBackground } from "@/components/AmbientBackground";

const notoHebrew = Noto_Sans_Hebrew({
  variable: "--font-display",
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "המרכז למטפלים בצמחי מרפא | Herbal Therapists Center",
    template: "%s | Herbal Therapists Center",
  },
  description:
    "קהילה, שוק וכלי EMR למטפלים בצמחי מרפא. Community, marketplace, and clinical tools for herbal therapists.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [session, siteTitle] = await Promise.all([auth(), getSiteTitle()]);

  return (
    <html lang="he" dir="rtl">
      <body
        className={`${notoHebrew.variable} relative flex min-h-screen flex-col overflow-x-hidden font-sans`}
      >
        <AmbientBackground />
        <Providers>
          <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1400px] flex-col px-3 sm:px-5">
            <SiteHeader session={session} siteTitle={siteTitle} />
            <main className="relative flex-1 transition-opacity duration-300 ease-out">{children}</main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
