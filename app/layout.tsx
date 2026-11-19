import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gaurav Kaushal, full-stack and AI engineer",
  description: "Gaurav Kaushal: React, Next.js and AI agent products, plus the cloud they run on. Delhi NCR, India.",
};
export const viewport: Viewport = { themeColor: "#090C12", colorScheme: "dark", viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
