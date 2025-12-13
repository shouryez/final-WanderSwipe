import type { Metadata, Viewport } from "next"
import type React from "react"

// This is a Server Component - metadata must be exported here
export const metadata: Metadata = {
  title: "WanderSwipe - Swipe Your Way to Adventure",
  description: "Discover amazing destinations with swipe-based travel planning and AI-powered itineraries.",
  keywords: ["travel", "itinerary", "trip planning", "destinations", "swipe"],
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#00B8D4" },
    { media: "(prefers-color-scheme: dark)", color: "#00E5FF" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

// Runtime imports come after metadata exports
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ClientLayout } from "@/components/client-layout"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background text-foreground antialiased`}
      >
        <div className="mountain-bg" />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
