"use client"

import type React from "react"

import { Navbar } from "./Navbar"

export function BackendClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </>
  )
}
