import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BidderFlow | Agency Activity & Performance Tracker",
  description: "Real-time employee activity tracking, idle monitoring, and bidder performance dashboard for Upwork & Fiverr agencies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090d16] text-slate-100 antialiased selection:bg-emerald-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
