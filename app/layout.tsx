import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ShadowFox SC - CardTrack",
  description: "Scan • Confirm • Collect",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/favicon-32.png" }, { url: "/favicon-16.png" }],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  themeColor: "#0b1220",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
