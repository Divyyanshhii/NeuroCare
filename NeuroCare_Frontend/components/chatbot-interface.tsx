"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Send, Bot, User, Heart } from "lucide-react"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: string
}

const quickSuggestions = [
  "I feel sad",
  "I feel stressed",
  "I'm feeling anxious",
  "I need motivation",
  "I'm having trouble sleeping",
  "I feel overwhelmed",
]

const botResponses = {
  sad: [
    "I'm sorry you're feeling sad. It's completely normal to have these feelings. Would you like to talk about what's making you feel this way?",
    "Sadness is a natural part of the human experience. Remember that it's okay to feel this way, and these feelings will pass. What usually helps you feel better?",
    "I hear that you're feeling sad. Sometimes it helps to acknowledge these feelings rather than push them away. Is there something specific that's troubling you today?",
  ],
  stressed: [
    "Stress can be really overwhelming. Let's try some deep breathing together - inhale for 4 counts, hold for 4, then exhale for 4. What's been causing you the most stress lately?",
    "I understand you're feeling stressed. It's important to take breaks and be kind to yourself. Have you tried any relaxation techniques that work for you?",
    "Stress is your body's way of responding to challenges. Let's work together to find some coping strategies. What's the biggest source of stress in your life right now?",
  ],
  anxious: [
    "Anxiety can feel very intense, but you're not alone in this. Try the 5-4-3-2-1 grounding technique: name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.",
    "I understand anxiety can be overwhelming. Remember to breathe slowly and deeply. What situations tend to trigger your anxiety the most?",
    "Anxiety is treatable and manageable. You're taking a positive step by reaching out. Would you like to explore some coping strategies together?",
  ],
  motivation: [
    "Everyone needs motivation sometimes, and it's great that you're seeking it. What's one small thing you could accomplish today that would make you feel proud?",
    "Motivation often comes from taking small steps forward. What's something you've been wanting to work on? Let's break it down into manageable pieces.",
    "You've already shown motivation by reaching out here. That's a positive step! What goals or dreams have been on your mind lately?",
  ],
  sleep: [
    "Sleep troubles can really affect our mental health. Have you tried establishing a bedtime routine? Things like avoiding screens before bed and keeping your room cool can help.",
    "Good sleep is crucial for mental wellness. What's your current bedtime routine like? Sometimes small changes can make a big difference.",
    "Sleep issues are very common. Creating a calm environment and practicing relaxation techniques before bed can help. What time do you usually try to go to sleep?",
  ],
  overwhelmed: [
    "Feeling overwhelmed is a sign that you're dealing with a lot right now. Let's try to break things down into smaller, more manageable pieces. What's feeling most overwhelming?",
    "When everything feels like too much, it helps to focus on just one thing at a time. What's the most important thing you need to handle today?",
    "Being overwhelmed is exhausting. Remember that you don't have to handle everything at once. What support systems do you have available?",
  ],
  default: [
    "Thank you for sharing that with me. I'm here to listen and support you. Can you tell me more about how you're feeling?",
    "I appreciate you opening up. Your feelings are valid, and it's important to acknowledge them. What would be most helpful for you right now?",
    "I'm glad you reached out. Sometimes just talking about our feelings can be really helpful. What's been on your mind lately?",
  ],
}

export function ChatbotInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your AI mental health companion. I'm here to listen, support, and help you work through your feelings. How are you doing today?",
      sender: "bot",
      timestamp: new Date().toISOString(),
    },
  ])
  const [inputText, setInputText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  useEffect(() => {
    if (autoScroll && messagesContainerRef.current) {
      const el = messagesContainerRef.current
      el.scrollTop = el.scrollHeight
    }
  }, [messages, autoScroll])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const API_CHAT = "http://localhost:8080/api/chat"

  const sendMessage = async (text: string) => {
    if (!text.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: "user",
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputText("")
    setIsTyping(true)
    // keep input focused while interacting
    inputRef.current?.focus()

    try {
      const res = await fetch(API_CHAT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim() }),
      })
      let replyText = ""
      if (res.ok) {
        const ct = res.headers.get("content-type") || ""
        if (ct.includes("application/json")) {
          const data = await res.json()
          replyText = data.reply || data.message || data.response || JSON.stringify(data)
        } else {
          replyText = await res.text()
        }
      } else {
        const errText = await res.text()
        replyText = errText || "Sorry, I couldn't get a response."
      }

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: replyText,
        sender: "bot",
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, botResponse])
    } catch (e) {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Network error. Please try again.",
        sender: "bot",
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, botResponse])
    } finally {
      setIsTyping(false)
      inputRef.current?.focus()
      // ensure messages container stays at bottom
      if (messagesContainerRef.current) {
        const el = messagesContainerRef.current
        el.scrollTop = el.scrollHeight
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    sendMessage(inputText)
  }

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion)
    // ensure focus returns to input for continued typing
    inputRef.current?.focus()
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Chat Interface */}
      <Card className="border-border/50 shadow-xl">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="flex items-center">
            <MessageCircle className="h-6 w-6 mr-2 text-primary" />
            AI Mental Health Companion
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col h-[70vh] md:h-[75vh]">
            {/* Messages */}
            <div
              ref={messagesContainerRef}
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-6 space-y-4 relative"
              style={{ overflowAnchor: "none" }}
              onScroll={(e) => {
                const el = e.currentTarget
                const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 16
                setAutoScroll(nearBottom)
              }}
            >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 animate-in fade-in slide-in-from-bottom-2 duration-500 ${
                  message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                <div className={`p-2 rounded-full ${message.sender === "bot" ? "bg-primary/10" : "bg-secondary/50"}`}>
                  {message.sender === "bot" ? (
                    <Bot className="h-5 w-5 text-primary" />
                  ) : (
                    <User className="h-5 w-5 text-secondary-foreground" />
                  )}
                </div>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.sender === "bot" ? "bg-muted/50 text-foreground" : "bg-primary text-primary-foreground"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing Indicator (floating, not pushing content) */}
            {isTyping && (
              <div className="absolute left-6 bottom-3 flex items-center space-x-3 pointer-events-none">
                <div className="p-2 rounded-full bg-primary/10">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div className="bg-muted/70 backdrop-blur px-4 py-2 rounded-lg shadow">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-border/50 p-6 space-y-4">
              <form onSubmit={handleSubmit} className="flex space-x-2" noValidate>
                <Input
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      e.stopPropagation()
                      if (inputText.trim() && !isTyping) {
                        sendMessage(inputText)
                      }
                    }
                  }}
                  placeholder="Type your message here..."
                  className="flex-1"
                  disabled={isTyping}
                />
                <Button type="submit" disabled={!inputText.trim() || isTyping}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>

              {/* Quick Suggestions */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Quick suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickSuggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs bg-transparent hover:bg-primary/10 hover:text-primary hover:border-primary/50"
                      disabled={isTyping}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer removed as requested */}
    </div>
  )
}
