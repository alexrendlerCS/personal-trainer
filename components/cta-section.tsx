"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, CheckCircle, Gift, Newspaper } from "lucide-react"

export default function CtaSection() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      // Here you would normally send the email to your backend
      setSubmitted(true)
      setEmail("")
      setTimeout(() => setSubmitted(false), 5000)
    }
  }

  const handleSignUp = () => {
    router.push("/login?tab=signup")
  }

  return (
    <section className="py-20 bg-red-600 text-white relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/back.JPG)' }}
      >
        <div className="absolute inset-0 bg-red-600/80"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">READY TO TRANSFORM YOUR FITNESS?</h2>
          <p className="text-xl mb-8 text-white/90">
            Take the first step toward your strongest self. Get your first session free when you sign up today, or join Coach Haley's newsletter for tips and advice.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white bg-opacity-90 p-8 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center justify-center mb-4">
                <Gift className="h-8 w-8 mr-3 text-red-600" />
                <h3 className="text-2xl font-bold text-gray-800">Book First Session</h3>
              </div>
              <div className="bg-red-600 text-white font-bold text-sm px-3 py-1 rounded-full inline-block mb-4">
                FREE WITH SIGNUP
              </div>
              <p className="mb-6 text-gray-700">
                Sign up today and get your first training session absolutely free! Choose from virtual, in-person, or partner training.
              </p>
              <Button 
                onClick={handleSignUp}
                className="bg-white text-red-600 hover:bg-gray-100 rounded-full px-6 py-6 text-lg w-full"
              >
                Sign Up Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="bg-white bg-opacity-90 p-8 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center justify-center mb-4">
                <Newspaper className="h-8 w-8 mr-3 text-red-600" />
                <h3 className="text-2xl font-bold text-gray-800">Join the Newsletter</h3>
              </div>
              <p className="mb-6 text-gray-700">Get weekly training tips, nutrition advice, and exclusive offers.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-gray-100 border border-gray-300 placeholder:text-gray-500 text-gray-800 py-6"
                />
                <Button
                  type="submit"
                  className="bg-white text-red-600 hover:bg-gray-100 rounded-full px-6 py-6 text-lg w-full"
                >
                  {submitted ? (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" /> Subscribed!
                    </>
                  ) : (
                    <>
                      Subscribe Now <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-white" />
              <span>First Session Free</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-white" />
              <span>Personalized Approach</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-white" />
              <span>Results Guaranteed</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
