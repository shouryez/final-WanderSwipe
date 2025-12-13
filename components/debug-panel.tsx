"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bug, X, ChevronDown, ChevronUp, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getLastApiCalls, clearApiCalls } from "@/lib/api-client"
import { useAppStore } from "@/lib/store"

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const { settings } = useAppStore()
  const apiCalls = getLastApiCalls()

  if (!settings.debugMode) return null

  return (
    <>
      {/* Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg bg-transparent"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bug className="h-5 w-5" />
      </Button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-20 right-4 z-50 w-[400px] max-h-[60vh] overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border p-3">
              <h3 className="text-sm font-semibold">Debug Panel</h3>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => clearApiCalls()}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="max-h-[50vh] overflow-y-auto p-3 space-y-2">
              {apiCalls.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No API calls yet</p>
              ) : (
                apiCalls.map((call, index) => (
                  <div
                    key={index}
                    className={`rounded-lg border p-2 text-xs ${
                      call.error ? "border-destructive/50 bg-destructive/5" : "border-border"
                    }`}
                  >
                    <button
                      className="flex w-full items-center justify-between text-left"
                      onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${call.error ? "bg-destructive" : "bg-success"}`} />
                        <span className="font-mono truncate max-w-[250px]">{call.endpoint}</span>
                      </div>
                      {expandedIndex === index ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </button>

                    <AnimatePresence>
                      {expandedIndex === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-2 space-y-2 border-t border-border pt-2">
                            <div>
                              <span className="text-muted-foreground">Time:</span> {call.timestamp.toLocaleTimeString()}
                            </div>
                            {call.error && (
                              <div className="text-destructive">
                                <span className="font-semibold">Error:</span> {call.error.message}
                              </div>
                            )}
                            <div>
                              <span className="text-muted-foreground">Response:</span>
                              <pre className="mt-1 max-h-32 overflow-auto rounded bg-muted p-2 text-[10px]">
                                {JSON.stringify(call.response, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
