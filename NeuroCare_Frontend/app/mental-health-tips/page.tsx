import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function MentalHealthTipsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-10 space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <h1 className="text-3xl font-bold">Mental Health Tips (India)</h1>
          <p className="text-muted-foreground">
            Practical, culturally relevant tips for everyday wellbeing.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border/50 shadow-xl">
              <CardHeader>
                <CardTitle>Daily Routine (Dinacharya)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Maintain a consistent sleep schedule (7–9 hours).</p>
                <p>Start your day with light stretching, pranayama, or a short walk.</p>
                <p>Limit late-night screen time; keep devices out of the bedroom.</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-xl">
              <CardHeader>
                <CardTitle>Mind–Body Practices</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Try 5–10 minutes of mindfulness, meditation, or namaaz reflection daily.</p>
                <p>Practice deep breathing (Anulom Vilom, Box Breathing) during stress.</p>
                <p>Short yoga flows can ease anxiety and improve focus.</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-xl">
              <CardHeader>
                <CardTitle>Nutrition & Hydration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Balanced homemade meals: dal, sabzi, roti/rice, curd, seasonal fruits.</p>
                <p>Stay hydrated; limit excessive caffeine and energy drinks.</p>
                <p>Regular meal times help stabilize mood and energy.</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-xl">
              <CardHeader>
                <CardTitle>Social Support & Boundaries</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Check in with friends/family; seek community or support groups.</p>
                <p>Set boundaries with work/academics; schedule short breaks.</p>
                <p>Seek professional help when needed—there is no stigma.</p>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <AlertDescription className="text-sm">
              These tips support wellbeing and do not replace professional medical advice. If you’re struggling,
              consider speaking with a licensed mental health professional.
            </AlertDescription>
          </Alert>
        </section>
      </main>
      <Footer />
    </div>
  )
}


