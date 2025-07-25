import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, Sun, Cloud, Moon, CheckCircle } from "lucide-react"
import Header from "@/components/header"

export default function RebalancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      <Header />
      
      <div className="container mx-auto px-4 py-12 pt-24">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            <span className="text-red-600">Rebalance</span> Health
          </h1>
          <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            A hormone-free supplement system made of minty dissolvable lozenges designed to help balance your stress, energy, mood, sleep, and even weight loss resistance — all by supporting your body's natural cortisol rhythm.
          </p>
          <div className="mt-8">
            <Button asChild className="bg-red-600 hover:bg-red-700 text-white rounded-full px-8 py-6 text-lg">
              <a href="https://rebalancehealth.com" target="_blank" rel="noopener noreferrer">
                Visit Rebalance Health <ExternalLink className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>

        {/* How it Works Section */}
        <Card className="mb-12 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-gray-900">How it Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg text-gray-700">
              Your body runs on a daily cortisol rhythm — high in the morning, tapering off through the day. When cortisol is off (too high, too low, or always spiking), you might feel:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                  <p className="text-gray-700">Stressed but exhausted</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                  <p className="text-gray-700">Bloated or stuck in fat-loss</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                  <p className="text-gray-700">Anxious or foggy</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                  <p className="text-gray-700">Wired at night, dragging all day</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                  <p className="text-gray-700">Like your body is fighting you</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 p-6 rounded-lg">
              <p className="text-lg text-gray-700 mb-4">
                Rebalance helps restore a healthy rhythm using adaptogens, nutrients, and antioxidants — no hormones added — taken as needed throughout the day:
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg text-center">
                  <Sun className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Morning</h3>
                  <p className="text-sm text-gray-600">energize + focus</p>
                </div>
                <div className="bg-white p-4 rounded-lg text-center">
                  <Cloud className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Afternoon</h3>
                  <p className="text-sm text-gray-600">control stress</p>
                </div>
                <div className="bg-white p-4 rounded-lg text-center">
                  <Moon className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Evening Mint</h3>
                  <p className="text-sm text-gray-600">calm + sleep</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ingredients Section */}
        <Card className="mb-12 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-gray-900">Clinically Studied Ingredients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Ashwagandha</p>
                    <p className="text-gray-600">regulates cortisol & stress</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Cordyceps & Reishi Mushroom</p>
                    <p className="text-gray-600">immune & hormone support</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Green Tea Extract + L-Theanine</p>
                    <p className="text-gray-600">clean energy & focus</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">DIM</p>
                    <p className="text-gray-600">supports healthy estrogen metabolism</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Zinc, Ginger, Magnolia Bark, EDTA</p>
                    <p className="text-gray-600">anti-inflammatory & calming</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Use Cases Section */}
        <Card className="mb-12 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-gray-900">It's been used by clients struggling with:</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                "Chronic stress",
                "Hormonal imbalance",
                "Trouble losing weight",
                "Poor recovery/sleep",
                "Mood swings or burnout"
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-3 bg-red-50 p-3 rounded-lg">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  <p className="text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendation Sections */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">Why Coach Kilday Might Recommend It</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                Because cortisol mismanagement is one of the most overlooked reasons women struggle with plateaus, stubborn fat, fatigue, or anxiety — even with perfect nutrition and workouts. Rebalance gives your body the tools to handle stress without needing hormone therapy or meds.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-red-200">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-red-600">Why I Personally Recommend It (Big Time)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed mb-4">
                I've been taking Rebalance consistently since spring 2024 — it has completely changed my fitness, my health, and even my ability to run my business.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                It's helped me manage stress, improve my sleep, show up better for my clients, stay leaner with less burnout, and just feel more like me again. I truly don't know where I'd be without it — and I recommend it to my clients who are hitting invisible walls with fat loss, stress, and recovery.
              </p>
              <p className="text-gray-700 leading-relaxed font-medium">
                If your body feels like it's fighting back even when you're doing everything right… this might be the missing link.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-red-600 text-white p-12 rounded-lg">
          <h2 className="text-3xl font-bold mb-4">Ready to Rebalance Your Health?</h2>
          <p className="text-xl mb-8 opacity-90">
            Take the first step toward better stress management, improved sleep, and balanced hormones.
          </p>
          <Button asChild className="bg-white text-red-600 hover:bg-gray-100 rounded-full px-8 py-6 text-lg">
            <a href="https://rebalancehealth.com" target="_blank" rel="noopener noreferrer">
              Visit Rebalance Health <ExternalLink className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
} 