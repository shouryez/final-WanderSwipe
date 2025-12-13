"use client"

import { motion } from "framer-motion"

interface TagChipProps {
  label: string
  selected?: boolean
  onClick?: () => void
  variant?: "default" | "primary" | "outline"
  size?: "sm" | "md"
}

export function TagChip({ label, selected, onClick, variant = "default", size = "md" }: TagChipProps) {
  const baseStyles = "inline-flex items-center justify-center rounded-full font-medium transition-all"

  const sizeStyles = {
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  }

  const variantStyles = {
    default: selected
      ? "bg-primary text-primary-foreground"
      : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: selected
      ? "border-2 border-primary bg-primary/10 text-primary"
      : "border border-border bg-transparent text-muted-foreground hover:border-primary/50",
  }

  const Component = onClick ? motion.button : motion.span

  return (
    <Component
      whileHover={onClick ? { scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${onClick ? "cursor-pointer" : ""}`}
    >
      {label}
    </Component>
  )
}
