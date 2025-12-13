"use client"

import { useState, useCallback, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { SwipeCard } from "./swipe-card"
import { SkeletonCard } from "./skeleton-card"
import { Compass, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Place } from "@/lib/schemas"

interface CardStackProps {
  places: Place[]
  loading: boolean
  onSwipe: (place: Place, direction: "left" | "right") => void
  onRefresh: () => void
  emptyMessage?: string
}

export function CardStack({ places, loading, onSwipe, onRefresh, emptyMessage }: CardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const visibleCards = 3

  // Reset index when places change
  useEffect(() => {
    setCurrentIndex(0)
  }, [places])

  const handleSwipe = useCallback(
    (direction: "left" | "right") => {
      const currentPlace = places[currentIndex]
      if (currentPlace) {
        onSwipe(currentPlace, direction)
        setCurrentIndex((prev) => prev + 1)
      }
    },
    [currentIndex, places, onSwipe],
  )

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handleSwipe("left")
      } else if (e.key === "ArrowRight") {
        handleSwipe("right")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleSwipe])

  if (loading) {
    return (
      <div className="relative mx-auto h-[600px] w-full max-w-[400px]">
        <SkeletonCard />
      </div>
    )
  }

  const remainingCards = places.slice(currentIndex)

  if (remainingCards.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
          <Compass className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-xl font-semibold">{emptyMessage || "No more places to explore"}</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          You've seen all available destinations. Refresh to discover more or adjust your preferences.
        </p>
        <Button onClick={onRefresh} className="mt-6 gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh Places
        </Button>
      </motion.div>
    )
  }

  return (
    <div className="relative mx-auto h-[600px] w-full max-w-[400px]">
      <AnimatePresence>
        {remainingCards.slice(0, visibleCards).map((place, index) => (
          <SwipeCard key={place.id} place={place} onSwipe={handleSwipe} isTop={index === 0} stackPosition={index} />
        ))}
      </AnimatePresence>

      {/* Progress indicator */}
      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 text-sm text-muted-foreground">
        <span>{currentIndex + 1}</span>
        <div className="h-1 w-24 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / places.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span>{places.length}</span>
      </div>

      {/* Keyboard hints */}
      <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono">←</kbd>
          Skip
        </span>
        <span className="flex items-center gap-1">
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono">→</kbd>
          Save
        </span>
      </div>
    </div>
  )
}
