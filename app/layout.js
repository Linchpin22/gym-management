import { Geist, Geist_Mono } from "next/font/google";
import LayoutShell from "@/components/LayoutShell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://your-domain.com"),

  title: {
    default: "Gym Pilot - Gym Management Software",
    template: "%s | Gym Pilot",
  },

  description:
    "Manage your gym smarter with Gym Pilot. Track members, memberships, payments, renewals and daily gym operations from one simple dashboard.",

  applicationName: "Gym Pilot",

  keywords: [
    "Gym Pilot",
    "gym management software",
    "gym management system",
    "gym membership management",
    "gym member tracking",
    "gym payment management",
    "fitness business software",
    "gym subscription management",
  ],

  authors: [{ name: "Gym Pilot" }],
  creator: "Gym Pilot",

  openGraph: {
    type: "website",
    title: "Gym Pilot - Gym Management Software",
    description:
      "Simplify gym operations with Gym Pilot. Manage members, memberships, payments and renewals in one place.",
    siteName: "Gym Pilot",
  },

  twitter: {
    card: "summary_large_image",
    title: "Gym Pilot - Gym Management Software",
    description:
      "Manage your gym members, memberships and payments with Gym Pilot.",
  },

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: "/32.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
