"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { useEffect, useState } from "react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { StreakTracker } from "@/components/streak-tracker"
import { moodUtils, type MoodEntry } from "@/lib/mood-utils"

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [user, setUser] = useState<{
    name: string
    email: string
    membership: string
    chatHistory: Array<{ id?: string | number; message: string; timestamp?: string; sender?: string }>
    moodLogs: Array<{ id?: string | number; mood: string; note?: string; date: string }>
  } | null>(null)

  // Local mood/streak state
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [savingMood, setSavingMood] = useState(false)
  const [streakCurrent, setStreakCurrent] = useState(0)
  const [streakLongest, setStreakLongest] = useState(0)
  const [badges, setBadges] = useState<string[]>([])
  const [showMoodCard, setShowMoodCard] = useState(true)

  const ratingEmojis = ["😞", "😟", "😕", "🙁", "😐", "🙂", "😊", "😄", "😁", "🤩"]
  const ratingLabels = [
    "Very Low",
    "Low",
    "Slightly Low",
    "Below Neutral",
    "Neutral",
    "Slightly Good",
    "Good",
    "Very Good",
    "Great",
    "Excellent",
  ]

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("neurocare_token")
        if (!token) {
          throw new Error("Not authenticated. Please log in again.")
        }
        const res = await fetch("http://localhost:8080/api/auth/current-user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || "Failed to fetch user")
        }
        const data = await res.json()
        setUser(data)
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Something went wrong"
        setError(msg)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  useEffect(() => {
    // Initialize streaks/badges from local storage
    const s = moodUtils.getStreaks()
    setStreakCurrent(s.current)
    setStreakLongest(s.longest)
    setBadges(moodUtils.getBadges())
    // Hide mood card if already logged today
    try {
      const moods = moodUtils.getAllMoods()
      const today = new Date().toDateString()
      const hasToday = moods.some((m) => new Date(m.timestamp).toDateString() === today)
      setShowMoodCard(!hasToday)
    } catch {
      setShowMoodCard(true)
    }
  }, [])

  const handleSaveMood = async () => {
    if (!selectedMood) return
    setSavingMood(true)
    try {
      const idx = selectedMood - 1
      const entry: MoodEntry = {
        id: Date.now().toString(),
        text: ratingLabels[idx],
        mood: `Mood ${selectedMood}`,
        emoji: ratingEmojis[idx],
        confidence: selectedMood * 10,
        suggestion: "",
        timestamp: new Date().toISOString(),
      }
      moodUtils.saveMoodEntry(entry)
      moodUtils.updateStreaks()
      moodUtils.checkAndAwardBadges()
      const s = moodUtils.getStreaks()
      setStreakCurrent(s.current)
      setStreakLongest(s.longest)
      setBadges(moodUtils.getBadges())
      setShowMoodCard(false)
    } finally {
      setSavingMood(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8 space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <h1 className="text-3xl font-bold">{user?.name ? `Welcome, ${user.name}` : "Welcome"}</h1>
            <p className="text-muted-foreground">Here are your account details and activity.</p>

            {loading && (
              <div className="py-12">
                <LoadingSpinner size="lg" />
              </div>
            )}

            {!loading && error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!loading && !error && user && (
              <>
                {/* Account Overview FIRST */}
                <Card className="border-border/50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl">Account Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Name</div>
                      <div className="text-base font-medium">{user.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Email</div>
                      <div className="text-base font-medium">{user.email}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Membership</div>
                      <div className="text-base font-medium">{user.membership}</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Track Mood (1-10 with emoji) - hidden after saved today */}
                {showMoodCard && (
                  <Card className="border-border/50 shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-xl">Track Today's Mood</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                        {ratingEmojis.map((emoji, i) => {
                          const value = i + 1
                          const active = selectedMood === value
                          return (
                            <button
                              key={value}
                              onClick={() => setSelectedMood(value)}
                              className={`h-14 rounded-lg border text-xl flex flex-col items-center justify-center transition-all ${
                                active
                                  ? "border-primary bg-primary/10 scale-105"
                                  : "border-border hover:bg-accent/30"
                              }`}
                            >
                              <span>{emoji}</span>
                              <span className="text-xs text-muted-foreground mt-1">{value}</span>
                            </button>
                          )
                        })}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          {selectedMood ? `Selected: ${selectedMood} - ${ratingLabels[selectedMood - 1]}` : "Select a mood"}
                        </div>
                        <Button onClick={handleSaveMood} disabled={!selectedMood || savingMood}>
                          {savingMood ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Streak Section */}
                <StreakTracker currentStreak={streakCurrent} longestStreak={streakLongest} badges={badges} />

                {/* Quick actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Track your mood</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">Log how you feel today.</p>
                      <Button asChild>
                        <Link href="/mood-input">Go to Mood Input</Link>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>View history</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">See your progress over time.</p>
                      <Button asChild>
                        <Link href="/mood-history">Open History</Link>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Chat support</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">Talk to our supportive chatbot.</p>
                      <Button asChild>
                        <Link href="/chatbot">Open Chatbot</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Chat History removed for logged-in dashboard view */}

                {/* Mood Logs */}
                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold">Mood Logs</h2>
                  {user.moodLogs?.length ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[...user.moodLogs]
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((log, idx) => (
                          <Card key={log.id ?? idx} className="border-border/50">
                            <CardContent className="p-4 space-y-1">
                              <div className="flex items-center justify-between">
                                <div className="text-base font-medium">{log.mood}</div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(log.date).toLocaleDateString()}
                                </div>
                              </div>
                              {log.note && <div className="text-sm text-muted-foreground">{log.note}</div>}
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  ) : (
                    <Alert>
                      <AlertDescription>No mood logs yet.</AlertDescription>
                    </Alert>
                  )}
                </div>
              </>
            )}

          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  )
}


