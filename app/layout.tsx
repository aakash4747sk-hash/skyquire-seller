import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skyquire for Sellers — List & sell your business",
  description: "Submit your business to Skyquire. Our team verifies it, then lists it to qualified buyers across India.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
