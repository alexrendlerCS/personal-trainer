import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Calendar, Instagram, Mail } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Contact Coach Kilday | Personal Trainer Westminster, CO",
  description:
    "Contact Coach Kilday for personal training in Westminster, Colorado. Located at Life Time Westminster. Call (720) 979-2808 or book online.",
  keywords:
    "contact Coach Kilday, personal trainer Westminster, fitness coach contact, Life Time Westminster, personal training Colorado",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-red-600 to-red-800 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Contact Coach Kilday
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Ready to start your fitness transformation? Get in touch with
              Coach Kilday for personal training in Westminster, Colorado.
            </p>
          </div>
        </section>

        {/* Contact Information */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Contact Details */}
              <div className="space-y-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-8">
                  Get In Touch
                </h2>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <MapPin className="h-6 w-6 text-red-600" />
                        Location
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg font-semibold">
                        Life Time Westminster
                      </p>
                      <p className="text-gray-600">397 W 148th Ave</p>
                      <p className="text-gray-600">Westminster, CO 80023</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Conveniently located in Westminster, serving the Denver
                        metro area
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Phone className="h-6 w-6 text-red-600" />
                        Phone
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg font-semibold">(720) 979-2808</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Call or text for immediate assistance
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Calendar className="h-6 w-6 text-red-600" />
                        Hours
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg font-semibold">By Appointment</p>
                      <p className="text-gray-600">
                        Flexible scheduling available
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Morning, afternoon, and evening sessions
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Instagram className="h-6 w-6 text-red-600" />
                        Social Media
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <a
                        href="https://www.instagram.com/coachkilday"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-600 hover:text-red-700 font-semibold"
                      >
                        @coachkilday
                      </a>
                      <p className="text-sm text-gray-500 mt-2">
                        Follow for fitness tips and motivation
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Booking CTA */}
              <div className="space-y-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-8">
                  Ready to Start?
                </h2>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">
                        Book Your First Session
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-700">
                        Take the first step towards your fitness goals with a
                        personalized training session.
                      </p>
                      <Link href="/client/booking">
                        <Button
                          size="lg"
                          className="w-full bg-red-600 hover:bg-red-700"
                        >
                          Book Online
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">
                        View Training Packages
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-700">
                        Explore our training packages and find the perfect fit
                        for your goals.
                      </p>
                      <Link href="/client/packages">
                        <Button size="lg" variant="outline" className="w-full">
                          View Packages
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">Learn More</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-700">
                        Discover more about Coach Kilday's training approach and
                        experience.
                      </p>
                      <div className="flex flex-col gap-2">
                        <Link href="/about">
                          <Button variant="outline" className="w-full">
                            About Coach Kilday
                          </Button>
                        </Link>
                        <Link href="/services">
                          <Button variant="outline" className="w-full">
                            Training Services
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
              Visit Us at Life Time Westminster
            </h2>
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardContent className="p-8">
                  <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-16 w-16 text-red-600 mx-auto mb-4" />
                      <p className="text-xl font-semibold">
                        Life Time Westminster
                      </p>
                      <p className="text-gray-600">
                        397 W 148th Ave, Westminster, CO 80023
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Interactive map would be embedded here
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
              Frequently Asked Questions
            </h2>
            <div className="max-w-4xl mx-auto space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>How do I book my first session?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    You can book your first session online through our booking
                    system, or call/text Coach Kilday directly at (720)
                    979-2808.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    What should I bring to my first session?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Bring comfortable workout clothes, athletic shoes, a water
                    bottle, and a positive attitude! All equipment is provided
                    at Life Time.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Do you offer virtual training sessions?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Currently, we focus on in-person training at Life Time
                    Westminster for the best results and personalized attention.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>What areas do you serve?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Coach Kilday serves Westminster, Broomfield, and the
                    surrounding Denver metro area. Sessions are held at Life
                    Time Westminster.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
