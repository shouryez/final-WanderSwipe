"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { User, Mail, Calendar, MapPin, Settings, LogOut, Heart, Map, Compass } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useAppStore } from "@/lib/store"
import Link from "next/link"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const { savedPlaces, preferences } = useAppStore()

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.auth.getUser()

      if (error || !data.user) {
        router.push("/auth/login?redirect=/profile")
        return
      }

      setUser(data.user)
      setLoading(false)
    }

    loadUser()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    )
  }

  const stats = [
    { label: "Saved Places", value: savedPlaces.length, icon: Heart, href: "/wanderlist" },
    { label: "Trips Planned", value: 0, icon: Map, href: "/my-itineraries" },
  ]

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
            <User className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">{user?.email}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Member since {new Date(user?.created_at).toLocaleDateString()}
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href}>
              <div className="rounded-xl border border-border bg-card p-5 hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </motion.div>

        {/* Account Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-6 mb-6"
        >
          <h2 className="text-lg font-semibold mb-4">Account Information</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Joined</p>
                <p className="font-medium">{new Date(user?.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            {preferences?.location && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Starting Location</p>
                  <p className="font-medium">{preferences.location}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card overflow-hidden mb-6"
        >
          <h2 className="text-lg font-semibold p-6 pb-4">Quick Links</h2>
          <div className="border-t border-border">
            <Link
              href="/wanderlist"
              className="flex items-center gap-3 px-6 py-4 hover:bg-secondary/50 transition-colors"
            >
              <Heart className="h-5 w-5 text-muted-foreground" />
              <span>My WanderList</span>
            </Link>
            <Link
              href="/my-itineraries"
              className="flex items-center gap-3 px-6 py-4 hover:bg-secondary/50 transition-colors border-t border-border"
            >
              <Map className="h-5 w-5 text-muted-foreground" />
              <span>My Itineraries</span>
            </Link>
            <Link
              href="/onboarding"
              className="flex items-center gap-3 px-6 py-4 hover:bg-secondary/50 transition-colors border-t border-border"
            >
              <Compass className="h-5 w-5 text-muted-foreground" />
              <span>Update Preferences</span>
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-3 px-6 py-4 hover:bg-secondary/50 transition-colors border-t border-border"
            >
              <Settings className="h-5 w-5 text-muted-foreground" />
              <span>Settings</span>
            </Link>
          </div>
        </motion.div>

        {/* Logout */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Button
            variant="outline"
            className="w-full gap-2 text-destructive hover:text-destructive bg-transparent"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
