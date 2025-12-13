"use client"

import type React from "react"

import { Navbar } from "@/components/Navbar"
import { Toaster } from "@/components/ui/toaster"
import { DebugPanel } from "@/components/debug-panel"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="relative">{children}</main>
      <Toaster />
      <DebugPanel />
    </>
  )
}
