"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { Compass, Heart, Map, User, Menu, X, LogOut, Settings, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "./theme-toggle"
import Image from "next/image"

const navLinks = [
  { href: "/onboarding", label: "Plan Trip", icon: Map },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/wanderlist", label: "WanderList", icon: Heart },
  { href: "/community", label: "Community", icon: Users },
]

export function Navbar() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null)
    })

    return () => {
      subscription.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUserEmail(null)
    router.push("/")
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? "glass border-b border-border/50 shadow-sm" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }} className="relative h-10 w-10">
            <Image
              src="/wanderswipe-logo.png"
              alt="WanderSwipe Logo"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
          </motion.div>
          <span className="text-lg font-bold tracking-tight gradient-text">WanderSwipe</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            const Icon = link.icon
            return (
              <Link key={link.href} href={link.href}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary/10 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </motion.div>
              </Link>
            )
          })}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* Desktop Auth */}
          <div className="hidden md:block">
            {userEmail ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 text-primary">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="max-w-[120px] truncate text-xs">{userEmail}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-itineraries" className="flex items-center gap-2">
                      <Map className="h-4 w-4" />
                      My Itineraries
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth/otp">
                <Button
                  size="sm"
                  className="btn-ripple bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass border-t border-border md:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                const Icon = link.icon
                return (
                  <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)}>
                    <motion.div
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary/10"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {link.label}
                    </motion.div>
                  </Link>
                )
              })}

              <div className="border-t border-border pt-3 mt-3">
                {userEmail ? (
                  <>
                    <div className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      {userEmail}
                    </div>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMobileMenuOpen(false)
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="h-5 w-5" />
                      Logout
                    </button>
                  </>
                ) : (
                  <Link href="/auth/otp" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-primary to-secondary text-white">Sign In</Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
