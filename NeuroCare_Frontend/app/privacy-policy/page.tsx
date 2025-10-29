import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-10 space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <h1 className="text-3xl font-bold">Privacy Policy (India)</h1>
          <p className="text-muted-foreground">Your privacy is important to us.</p>

          <Card className="border-border/50 shadow-xl">
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                We follow best practices aligned with Indian data protection principles. We collect only the information
                necessary to provide our services—such as account details, mood logs, and chat interactions.
              </p>
              <p>
                Data is used to personalize your experience and improve our service. We do not sell your personal data.
              </p>
              <p>
                You can request access, correction, or deletion of your data by contacting support@neurocare.com.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-xl">
            <CardHeader>
              <CardTitle>Storage & Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>We use secure systems and encryption where appropriate to protect your information.</p>
              <p>Access to sensitive data is restricted and logged.</p>
              <p>You should also protect your account by using strong passwords and keeping tokens private.</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-xl">
            <CardHeader>
              <CardTitle>Children’s Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Our services are intended for individuals 16 years and older. If you believe a child has provided us
                personal data, please contact us and we will take appropriate action.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  )
}


