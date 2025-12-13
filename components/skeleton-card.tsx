"use client"

import { motion } from "framer-motion"

export function SkeletonCard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="overflow-hidden rounded-2xl border border-border bg-card"
    >
      <div className="skeleton h-64 w-full" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-6 w-3/4 rounded-lg" />
        <div className="skeleton h-4 w-1/2 rounded-lg" />
        <div className="flex gap-2">
          <div className="skeleton h-6 w-16 rounded-full" />
          <div className="skeleton h-6 w-20 rounded-full" />
          <div className="skeleton h-6 w-14 rounded-full" />
        </div>
      </div>
    </motion.div>
  )
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
