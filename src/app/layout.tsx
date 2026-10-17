import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexwave Productivity Dashboard | Assignment Tracking",
  description: "Nexwave Enterprise Productivity & Assignment Tracking Dashboard untuk memantau alur kerja operasional telekomunikasi secara near real-time.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-background text-gray-900 min-h-screen selection:bg-blue-500/20 selection:text-blue-900">
        {children}
      </body>
    </html>
  );
}
