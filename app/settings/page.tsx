"use client"

import { motion } from "framer-motion"
import { Settings, Bug, Shield, Trash2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { settings, updateSettings } = useAppStore()
  const { toast } = useToast()

  const handleClearData = () => {
    if (confirm("Are you sure you want to clear all local data? This cannot be undone.")) {
      localStorage.clear()
      toast({
        title: "Data cleared",
        description: "All local data has been removed.",
      })
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>
          <p className="text-muted-foreground">Manage your app preferences and developer options</p>
        </motion.div>

        {/* Developer Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card overflow-hidden mb-6"
        >
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Bug className="h-5 w-5 text-muted-foreground" />
              Developer Options
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Advanced settings for debugging</p>
          </div>

          <div className="divide-y divide-border">
            {/* Debug Mode */}
            <div className="flex items-center justify-between p-6">
              <div>
                <p className="font-medium">Debug Mode</p>
                <p className="text-sm text-muted-foreground">Show debug panel with API call logs</p>
              </div>
              <button
                onClick={() => updateSettings({ debugMode: !settings.debugMode })}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  settings.debugMode ? "bg-primary" : "bg-input"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-background shadow-sm transition-transform ${
                    settings.debugMode ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Schema Validation */}
            <div className="flex items-center justify-between p-6">
              <div>
                <p className="font-medium">Schema Validation</p>
                <p className="text-sm text-muted-foreground">Validate API responses with Zod schemas</p>
              </div>
              <button
                onClick={() => updateSettings({ schemaValidation: !settings.schemaValidation })}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  settings.schemaValidation ? "bg-primary" : "bg-input"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-background shadow-sm transition-transform ${
                    settings.schemaValidation ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {/* API Base URL */}
            <div className="p-6">
              <div className="mb-3">
                <p className="font-medium">API Base URL</p>
                <p className="text-sm text-muted-foreground">Override the default API endpoint (dev only)</p>
              </div>
              <input
                type="text"
                value={settings.apiBaseUrl}
                onChange={(e) => updateSettings({ apiBaseUrl: e.target.value })}
                placeholder="Leave empty to use default"
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm font-mono"
              />
            </div>
          </div>
        </motion.div>

        {/* Data & Privacy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card overflow-hidden mb-6"
        >
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              Data & Privacy
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Manage your data</p>
          </div>

          <div className="p-6">
            <Button
              variant="outline"
              className="w-full gap-2 text-destructive hover:text-destructive bg-transparent"
              onClick={handleClearData}
            >
              <Trash2 className="h-4 w-4" />
              Clear All Local Data
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              This will remove all saved preferences, wanderlist, and cached data from this device.
            </p>
          </div>
        </motion.div>

        {/* About */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h2 className="text-lg font-semibold mb-4">About WanderSwipe</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Built with</span>
              <span>Next.js, Tailwind, Framer Motion</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Documentation</span>
              <a href="#" className="text-primary hover:underline inline-flex items-center gap-1">
                View Docs
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
