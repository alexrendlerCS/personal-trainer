"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Calendar, Instagram } from "lucide-react";
import Link from "next/link";

export default function ContactPreview() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            GET IN <span className="text-red-600">TOUCH</span>
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Ready to start your fitness transformation? Contact Coach Kilday for
            personal training in Thornton, Colorado.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
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
                className="text-red-600 hover:text-red-700 font-semibold"
              >
                @coachkilday
              </a>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Link href="/contact">
            <Button className="bg-red-600 hover:bg-red-700 text-white rounded-full px-8 py-6 text-lg">
              Contact Coach Kilday
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
