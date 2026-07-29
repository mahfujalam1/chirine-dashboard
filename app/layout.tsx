import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type React from "react";
import "./globals.css";
import ReduxWrapper from "@/lib/redux/ReduxWrapper";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://mindshift-admin.vercel.app"),
  title: {
    default: "MindShift Peer Connect Dashboard",
    template: "%s | MindShift Admin",
  },
  description:
    "MindShift Peer Connect administrative management and analytics portal for therapist oversight, event coordination, and platform governance.",
  keywords: [
    "MindShift",
    "Admin Dashboard",
    "Peer Support",
    "Mental Health Analytics",
    "Therapist Management",
  ],
  authors: [{ name: "MindShift Team" }],
  creator: "MindShift",
  publisher: "MindShift",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mindshift-admin.vercel.app",
    siteName: "MindShift Peer Connect",
    title: "MindShift Peer Connect Dashboard",
    description:
      "Admin analytics and platform management dashboard for MindShift Peer Connect.",
    images: [
      {
        url: "/placeholder-logo.png",
        width: 1200,
        height: 630,
        alt: "MindShift Admin Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MindShift Peer Connect Dashboard",
    description:
      "Admin analytics and platform management dashboard for MindShift Peer Connect.",
    images: ["/placeholder-logo.png"],
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen">
        <ReduxWrapper>{children}</ReduxWrapper>
        <Analytics />
      </body>
    </html>
  );
}
