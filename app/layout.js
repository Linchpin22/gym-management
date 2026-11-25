import { Poppins } from "next/font/google";
import LayoutShell from "@/components/LayoutShell";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://your-domain.com"),

  title: {
    default: "GymHisab - Gym Management Software",
    template: "%s | GymHisab",
  },

  description:
    "Manage your gym smarter with GymHisab. Track members, memberships, payments, renewals and daily gym operations from one simple dashboard.",

  applicationName: "GymHisab",
  keywords: [
    "GymHisab",
    "gym management software",
    "gym management system",
    "gym membership management",
    "gym member tracking",
    "gym payment management",
    "fitness business software",
    "gym subscription management",
  ],

  authors: [{ name: "GymHisab" }],
  creator: "GymHisab",

  openGraph: {
    type: "website",
    title: "GymHisab - Gym Management Software",
    description:
      "Simplify gym operations with GymHisab. Manage members, memberships, payments and renewals in one place.",
    siteName: "GymHisab",
  },

  twitter: {
    card: "summary_large_image",
    title: "GymHisab - Gym Management Software",
    description:
      "Manage your gym members, memberships and payments with GymHisab.",
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
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className={`${poppins.className} min-h-full`}>
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
