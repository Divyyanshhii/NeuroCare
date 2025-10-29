"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface AuthFormProps {
  type: "login" | "register"
}

export function AuthForm({ type }: AuthFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
    newPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const API_BASE = "http://localhost:8080/api/auth"

  // Forgot password state
  const [isForgotMode, setIsForgotMode] = useState(false)
  const [forgotStep, setForgotStep] = useState<"request" | "verify">("request")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const validateForm = () => {
    if (!isForgotMode) {
      if (!formData.email || !formData.password) {
        setError("Please fill in all required fields")
        return false
      }
    }

    if (!isForgotMode && type === "register") {
      if (!formData.name) {
        setError("Please enter your name")
        return false
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long")
        return false
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match")
        return false
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isForgotMode && !validateForm()) return

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      if (isForgotMode) {
        if (forgotStep === "request") {
          // Send OTP to email
          const response = await fetch(`${API_BASE}/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: formData.email }),
          })
          if (!response.ok) {
            const message = await response.text()
            throw new Error(message || "Failed to send OTP")
          }
          setSuccess("OTP sent to your email. Please check your inbox.")
          setForgotStep("verify")
        } else {
          // Verify OTP and reset password
          if (!formData.otp || !formData.newPassword) {
            throw new Error("Please enter OTP and new password")
          }
          if (formData.newPassword.length < 6) {
            throw new Error("New password must be at least 6 characters long")
          }
          const response = await fetch(`${API_BASE}/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: formData.email,
              otp: formData.otp,
              newPassword: formData.newPassword,
            }),
          })
          if (!response.ok) {
            const message = await response.text()
            throw new Error(message || "Failed to reset password")
          }
          setSuccess("Password reset successful! You can sign in now.")
          // Reset forgot state and go back to login
          setTimeout(() => {
            setIsForgotMode(false)
            setForgotStep("request")
            setFormData((prev) => ({ ...prev, otp: "", newPassword: "", password: "" }))
          }, 800)
        }
      } else if (type === "register") {
        // 🔹 Call Signup API
        const response = await fetch(`${API_BASE}/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
          }),
        })

        if (!response.ok) {
          const message = await response.text()
          throw new Error(message || "Failed to create account")
        }

        setSuccess("Account created successfully! Redirecting to login...")
        setTimeout(() => {
          router.push("/login")
        }, 1000)
      } else {
        // 🔹 Call Login API
        const response = await fetch(`${API_BASE}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        })

        const data = await response.json()
        if (!response.ok || !data.token) {
          throw new Error(data.message || "Invalid email or password")
        }

        // Save JWT token in localStorage
        localStorage.setItem("neurocare_token", data.token)
        // Persist display name for navbar (fallback to email prefix)
        const displayName = data.name || data.user?.name || formData.email.split("@")[0]
        localStorage.setItem("neurocare_user", displayName)

        setSuccess("Login successful! Redirecting...")
        setTimeout(() => {
          router.push("/dashboard")
        }, 1000)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again."
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="border-border/50 shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-primary/10">
              <Image src="/brain-logo.svg" alt="NeuroCare Brain" width={32} height={32} className="h-8 w-8" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">
              {isForgotMode ? "Forgot Password" : type === "login" ? "Welcome Back" : "Join NeuroCare"}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {isForgotMode
                ? forgotStep === "request"
                  ? "Enter your email to receive a one-time OTP"
                  : "Enter the OTP and your new password"
                : type === "login"
                  ? "Sign in to continue your mental wellness journey"
                  : "Start your journey to better mental health"}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isForgotMode && type === "register" && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            {!isForgotMode && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}

            {!isForgotMode && type === "register" && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}

            {isForgotMode && forgotStep === "verify" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="otp">OTP</Label>
                  <Input
                    id="otp"
                    name="otp"
                    type="text"
                    placeholder="Enter the 6-digit OTP"
                    value={formData.otp}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    placeholder="Enter your new password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full h-12" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isForgotMode
                    ? forgotStep === "request"
                      ? "Sending OTP..."
                      : "Resetting Password..."
                    : type === "login"
                      ? "Signing In..."
                      : "Creating Account..."}
                </>
              ) : (
                <>
                  {isForgotMode
                    ? forgotStep === "request"
                      ? "Send OTP"
                      : "Reset Password"
                    : type === "login"
                      ? "Sign In"
                      : "Create Account"}
                </>
              )}
            </Button>
          </form>

          <div className="text-center space-y-4">
            {!isForgotMode && (
              <Button variant="outline" className="w-full h-12 bg-transparent" asChild>
                <Link href={type === "login" ? "/register" : "/login"}>
                  {type === "login" ? "Create an Account" : "Sign In Instead"}
                </Link>
              </Button>
            )}
            {type === "login" && (
              <div>
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={() => {
                    setIsForgotMode(!isForgotMode)
                    setForgotStep("request")
                    setError("")
                    setSuccess("")
                  }}
                >
                  {isForgotMode ? "Back to Sign In" : "Forgot password?"}
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
