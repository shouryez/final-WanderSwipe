"use client"

import { useState } from "react"
import Image from "next/image"

interface ImageWithBlurProps {
  src: string
  alt: string
  className?: string
  fill?: boolean
  width?: number
  height?: number
  priority?: boolean
}

export function ImageWithBlur({
  src,
  alt,
  className = "",
  fill = false,
  width,
  height,
  priority = false,
}: ImageWithBlurProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  const fallbackSrc = `/placeholder.svg?height=${height || 400}&width=${width || 600}&query=${encodeURIComponent(alt)}`

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && <div className="absolute inset-0 skeleton" />}

      {fill ? (
        <Image
          src={error ? fallbackSrc : src}
          alt={alt}
          fill
          priority={priority}
          className={`object-cover transition-all duration-500 ${isLoading ? "scale-110 blur-xl" : "scale-100 blur-0"}`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setError(true)
            setIsLoading(false)
          }}
        />
      ) : (
        <Image
          src={error ? fallbackSrc : src}
          alt={alt}
          width={width || 600}
          height={height || 400}
          priority={priority}
          className={`object-cover transition-all duration-500 ${isLoading ? "scale-110 blur-xl" : "scale-100 blur-0"}`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setError(true)
            setIsLoading(false)
          }}
        />
      )}
    </div>
  )
}
