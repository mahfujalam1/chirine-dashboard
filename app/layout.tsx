import { Analytics } from "@vercel/analytics/next"
import type { Metadata } from "next"
import type React from "react"
import "./globals.css"
import ReduxWrapper from './redux-query/ReduxWrapper'

export const metadata: Metadata = {
  title: "MindShift Peer Connect Dashboard",
  description: "MindShift Peer Connect analytics dashboard",
  generator: "",
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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <ReduxWrapper>
          {children}
        </ReduxWrapper>
        <Analytics />
      </body>
    </html>
  )
}
