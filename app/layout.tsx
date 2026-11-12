import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/bottom-nav";

export const metadata: Metadata = {
  title: "RIMIIN — Your crystals, your future",
  description: "A personal Project SEKAI crystal planner.",
  applicationName: "RIMIIN",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "RIMIIN" },
};

export const viewport: Viewport = {
  themeColor: "#f6f1ff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
