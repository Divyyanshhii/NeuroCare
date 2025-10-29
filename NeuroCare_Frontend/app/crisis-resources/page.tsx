import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CrisisResourcesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-10 space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <h1 className="text-3xl font-bold">Crisis Resources (India)</h1>
          <p className="text-muted-foreground">
            If you or someone you know is in immediate danger, please contact emergency services right away.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border/50 shadow-xl">
              <CardHeader>
                <CardTitle>Emergency Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p><span className="font-medium text-foreground">112</span>: All-India emergency number</p>
                <p><span className="font-medium text-foreground">100</span>: Police</p>
                <p><span className="font-medium text-foreground">102 / 108</span>: Ambulance</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-xl">
              <CardHeader>
                <CardTitle>Suicide Prevention & Helplines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p><span className="font-medium text-foreground">Kiran (National Helpline)</span>: 1800-599-0019 (24x7)</p>
                <p><span className="font-medium text-foreground">AASRA</span>: 9820466726 (24x7)</p>
                <p><span className="font-medium text-foreground">iCALL</span>: 9152987821 (Mon–Sat, 8am–8pm)</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-xl md:col-span-2">
              <CardHeader>
                <CardTitle>Immediate Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• If you’re in danger, call your local emergency number immediately.</p>
                <p>• Stay with someone you trust or reach out to a helpline.</p>
                <p>• Remove access to anything you could use to harm yourself.</p>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <AlertDescription className="text-sm">
              These resources are for immediate support in India. Availability can change; if a number does not work,
              contact local authorities or a nearby hospital.
            </AlertDescription>
          </Alert>
        </section>
      </main>
      <Footer />
    </div>
  )
}


