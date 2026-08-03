import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fawtara — Documents & Tax Invoices, in Arabic or English",
  description:
    "Create tax invoices, tenders, offer letters and NOCs with native Arabic (RTL) support, dual-branding and one-click PDF export.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${cairo.variable}`}
        style={{ "--font-sans": "var(--font-inter)" } as React.CSSProperties}
      >
        {children}
      </body>
    </html>
  );
}
