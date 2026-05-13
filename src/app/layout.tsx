import type { Metadata } from "next";
import { Noto_Sans_Hebrew } from "next/font/google";
import "./globals.css";
import { auth } from "@/auth";
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
  const session = await auth();

  return (
    <html lang="he" dir="rtl">
      <body className={`${notoHebrew.variable} relative flex min-h-screen flex-col font-sans`}>
        <AmbientBackground />
        <Providers>
          <SiteHeader session={session} />
          <main className="relative z-10 flex-1">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
