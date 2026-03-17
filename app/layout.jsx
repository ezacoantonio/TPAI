import "@/app/globals.css";
import { AppStateProvider } from "@/lib/store";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "TPAI Life Coach",
    template: "%s | TPAI Life Coach"
  },
  description: "Phone-first AI life coach, planner, and progress tracker."
  ,
  applicationName: "TPAI Life Coach",
  keywords: ["life coach", "planner", "habits", "time blocking", "ai coach"],
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/apple-icon.svg"
  },
  openGraph: {
    title: "TPAI Life Coach",
    description: "Phone-first AI life coach, planner, and progress tracker.",
    url: siteUrl,
    siteName: "TPAI Life Coach",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "TPAI Life Coach",
    description: "Phone-first AI life coach, planner, and progress tracker."
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AppStateProvider>{children}</AppStateProvider>
      </body>
    </html>
  );
}
