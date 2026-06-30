import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ordeasy — The Restaurant Growth Operating System",
  description:
    "An intelligent restaurant operating system that increases profit, reduces manual work, speeds up service, and modernizes restaurant operations.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#080808",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full min-h-screen-safe">{children}</body>
    </html>
  );
}
