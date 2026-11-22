import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zomato Lite",
  description: "Reviews for Ludhiana Burrito in Sector 32.",
};

export const viewport: Viewport = {
  themeColor: "#f7f5ef",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
