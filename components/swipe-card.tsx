"use client"

import type React from "react"

import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion"
import { useState, useCallback } from "react"
import Link from "next/link"
import { MapPin, Calendar, Info, X, Heart, ChevronLeft, ChevronRight } from "lucide-react"
import { ImageWithBlur } from "./image-with-blur"
import type { Place } from "@/lib/schemas"

interface SwipeCardProps {
  place: Place
  onSwipe: (direction: "left" | "right") => void
  isTop: boolean
  stackPosition: number
}

export function SwipeCard({ place, onSwipe, isTop, stackPosition }: SwipeCardProps) {
  const [photoIndex, setPhotoIndex] = useState(0)
  const [exitX, setExitX] = useState(0)

  const x = useMotionValue(0)
  const rotate = useTransform(x, [-300, 0, 300], [-15, 0, 15])
  const likeOpacity = useTransform(x, [0, 100], [0, 1])
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0])

  const photos = place.photos?.length
    ? place.photos
    : [`/placeholder.svg?height=600&width=400&query=${encodeURIComponent(place.name + " destination")}`]

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const threshold = 100
      const velocity = info.velocity.x

      if (info.offset.x > threshold || velocity > 500) {
        setExitX(1000)
        onSwipe("right")
      } else if (info.offset.x < -threshold || velocity < -500) {
        setExitX(-1000)
        onSwipe("left")
      }
    },
    [onSwipe],
  )

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPhotoIndex((prev) => (prev + 1) % photos.length)
  }

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }

  // Stack effect
  const scale = 1 - stackPosition * 0.05
  const yOffset = stackPosition * 10

  return (
    <motion.div
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        scale,
        y: yOffset,
        zIndex: 100 - stackPosition,
      }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      animate={exitX !== 0 ? { x: exitX, opacity: 0 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none"
    >
      <div className="h-full w-full overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
        {/* Image Section */}
        <div className="relative h-[65%] overflow-hidden">
          <ImageWithBlur
            src={photos[photoIndex] || "/placeholder.svg"}
            alt={place.name}
            fill
            className="h-full w-full"
            priority={isTop}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Like/Nope Overlays */}
          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute inset-0 flex items-center justify-center swipe-like-overlay"
          >
            <div className="rounded-2xl border-4 border-white px-8 py-4 rotate-[-15deg]">
              <span className="text-5xl font-black text-white">LIKE</span>
            </div>
          </motion.div>

          <motion.div
            style={{ opacity: nopeOpacity }}
            className="absolute inset-0 flex items-center justify-center swipe-nope-overlay"
          >
            <div className="rounded-2xl border-4 border-white px-8 py-4 rotate-[15deg]">
              <span className="text-5xl font-black text-white">NOPE</span>
            </div>
          </motion.div>

          {/* Photo Navigation */}
          {photos.length > 1 && (
            <>
              {/* Photo indicators */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {photos.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1 rounded-full transition-all ${
                      idx === photoIndex ? "w-6 bg-white" : "w-1.5 bg-white/50"
                    }`}
                  />
                ))}
              </div>

              {/* Navigation buttons */}
              <button
                onClick={prevPhoto}
                className="absolute left-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextPhoto}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Tags */}
          {place.tags && place.tags.length > 0 && (
            <div className="absolute bottom-20 left-4 flex flex-wrap gap-2">
              {place.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-primary/90 px-3 py-1 text-xs font-medium text-primary-foreground backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Place Info Overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-3xl font-bold text-white text-balance">{place.name}</h2>
            <div className="mt-2 flex items-center gap-4 text-white/80">
              {place.distanceMeters && (
                <span className="flex items-center gap-1 text-sm">
                  <MapPin className="h-4 w-4" />
                  {Math.round(place.distanceMeters / 1000)} km away
                </span>
              )}
              <span className="flex items-center gap-1 text-sm">
                <Calendar className="h-4 w-4" />
                2-3 days
              </span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex h-[35%] flex-col justify-between p-5">
          <div>
            {place.shortDescription ? (
              <p className="text-sm text-muted-foreground line-clamp-2">{place.shortDescription}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Explore {place.name} and discover amazing experiences waiting for you.
              </p>
            )}

            <div className="mt-3 flex items-center gap-3">
              <Link
                href={`/place/${encodeURIComponent(place.id)}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                <Info className="h-4 w-4" />
                View Details
              </Link>
              <Link
                href={`/place/${encodeURIComponent(place.id)}?generate=true`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
              >
                Plan Trip
              </Link>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-6">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setExitX(-1000)
                onSwipe("left")
              }}
              className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
            >
              <X className="h-7 w-7" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setExitX(1000)
                onSwipe("right")
              }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90 transition-colors"
            >
              <Heart className="h-8 w-8" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
