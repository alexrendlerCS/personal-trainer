import Header from "@/components/header";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Calendar, MapPin, Phone, Mail, Instagram } from "lucide-react";
import Link from "next/link";
import { AnimatedHero } from "@/components/animated-hero";

export const metadata = {
  title: "About Coach Haley Kilday | Personal Trainer Thornton, CO",
  description:
    "Learn about Coach Haley Kilday, certified personal trainer in Thornton, Colorado. 10+ years experience transforming lives through fitness coaching and strength training.",
  keywords:
    "Coach Haley Kilday, personal trainer Thornton, fitness coach Colorado, strength training specialist, certified personal trainer",
};

export default function AboutPage() {
  const certifications = [
    "Certified Strength & Conditioning Specialist (CSCS)",
    "NASM Certified Personal Trainer",
    "Precision Nutrition Level 1 Coach",
    "First Aid & CPR Certified",
    "Olympic Weightlifting Coach",
  ];

  const achievements = [
    "10+ Years of Professional Experience",
    "500+ Clients Successfully Trained",
    "Former Professional Athlete",
    "Olympic Athlete Coach",
    "Specialist in Strength & Conditioning",
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <div
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url(/deadlift.JPG)" }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          </div>

          {/* Content */}
          <div className="container mx-auto px-4 z-10 text-center">
            <AnimatedHero delay={0.2}>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight">
                ABOUT <span className="text-red-600">COACH KILDAY</span>
              </h1>
            </AnimatedHero>

            <AnimatedHero delay={0.4}>
              <p className="text-xl md:text-2xl text-white mb-8 max-w-2xl mx-auto">
                Certified Personal Trainer in Thornton, Colorado
              </p>
            </AnimatedHero>

            <AnimatedHero delay={0.6}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/services">
                  <Button
                    size="lg"
                    className="bg-red-600 hover:bg-red-700 text-white text-lg rounded-full px-8 py-6"
                  >
                    View Training Packages
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-red-600 text-lg rounded-full px-8 py-6"
                  >
                    Book a Session
                  </Button>
                </Link>
              </div>
            </AnimatedHero>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="relative h-[600px] rounded-2xl overflow-hidden">
                <Image
                  src="/deadlift.JPG"
                  alt="Coach Haley Kilday training"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">My Journey</h2>
                <p className="text-lg text-gray-700">
                  After competing professionally and coaching Olympic athletes,
                  I developed a unique training methodology that combines
                  strength training, mobility work, and personalized nutrition
                  guidance.
                </p>
                <p className="text-lg text-gray-700">
                  My approach isn't about quick fixes—it's about sustainable
                  results through science-backed methods and unwavering
                  accountability. Located at Life Time Thornton, I provide
                  personal training services to help you achieve your fitness
                  goals.
                </p>
                <p className="text-lg text-gray-700">
                  I believe that everyone deserves to feel confident in their
                  body and capable of achieving their fitness goals. Whether
                  you're just starting your fitness journey or looking to break
                  through plateaus, I'm here to guide you every step of the way.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Certifications & Achievements */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
              Certifications & Achievements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-6 w-6 text-red-600" />
                    Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {certifications.map((cert, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                        {cert}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-6 w-6 text-red-600" />
                    Key Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {achievements.map((achievement, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
              Get In Touch
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <Card className="text-center">
                <CardHeader>
                  <MapPin className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Life Time Thornton</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <Phone className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <CardTitle>Phone</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">(720) 979-2808</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <Calendar className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <CardTitle>Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">By Appointment</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <Instagram className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <CardTitle>Social</CardTitle>
                </CardHeader>
                <CardContent>
                  <a
                    href="https://www.instagram.com/coachkilday"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-600 hover:text-red-700"
                  >
                    @coachkilday
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-red-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Your Transformation?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Book your first session with Coach Kilday and take the first step
              towards your fitness goals
            </p>
            <Link href="/login">
              <Button
                size="lg"
                className="bg-white text-red-600 hover:bg-gray-100"
              >
                Book Your First Session
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
