"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { MapPin, Clock, Bookmark, ArrowRight } from "lucide-react"
import { ImageWithBlur } from "./image-with-blur"
import { Button } from "@/components/ui/button"
import type { Place } from "@/lib/schemas"

interface PlaceCardProps {
  place: Place
  onSave?: () => void
  isSaved?: boolean
  showActions?: boolean
}

export function PlaceCard({ place, onSave, isSaved, showActions = true }: PlaceCardProps) {
  const photo =
    place.photos?.[0] ||
    `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(place.name + " travel destination")}`

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group overflow-hidden rounded-2xl border border-border bg-card card-hover"
    >
      <div className="relative h-48 overflow-hidden">
        <ImageWithBlur
          src={photo || "/placeholder.svg"}
          alt={place.name}
          fill
          className="h-full w-full transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {showActions && onSave && (
          <Button
            variant="ghost"
            size="icon"
            className={`absolute right-3 top-3 h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm ${
              isSaved ? "text-primary" : "text-muted-foreground"
            }`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onSave()
            }}
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
          </Button>
        )}

        {place.tags && place.tags.length > 0 && (
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
            {place.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-primary/90 px-2.5 py-0.5 text-xs font-medium text-primary-foreground backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold line-clamp-1">{place.name}</h3>

        {place.shortDescription && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{place.shortDescription}</p>
        )}

        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          {place.distanceMeters && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              <span>{Math.round(place.distanceMeters / 1000)} km</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>2-3 days</span>
          </div>
        </div>

        {showActions && (
          <div className="mt-4 flex items-center gap-2">
            <Link href={`/place/${encodeURIComponent(place.id)}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent">
                View Details
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  )
}
