import Header from "@/components/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Dumbbell,
  Heart,
  Target,
  Users,
  Video,
  Utensils,
} from "lucide-react";
import Link from "next/link";
import { AnimatedHero } from "@/components/animated-hero";

export const metadata = {
  title: "Personal Training Services | Coach Kilday - Thornton, CO",
  description:
    "Transform your fitness with Coach Kilday's personal training services in Thornton, Colorado. Strength training, weight loss, muscle building, and nutrition coaching.",
  keywords:
    "personal training services, fitness coaching, strength training, weight loss, muscle building, nutrition coaching, Thornton Colorado, Coach Kilday",
};

export default function ServicesPage() {
  const services = [
    {
      title: "In-Person Training",
      description:
        "One-on-one personal training sessions at Life Time Thornton with hands-on coaching and real-time feedback.",
      icon: Dumbbell,
      features: [
        "Customized workout programs",
        "Form correction and technique",
        "Progress tracking and assessment",
        "Motivation and accountability",
      ],
    },
    {
      title: "Virtual Training",
      description:
        "Remote coaching sessions via video call with personalized workout plans and ongoing support from anywhere.",
      icon: Video,
      features: [
        "Live video coaching sessions",
        "Personalized workout plans",
        "Progress tracking and assessment",
        "Flexible scheduling options",
      ],
    },
    {
      title: "Partner Training",
      description:
        "Small group sessions with a partner for motivation, accountability, and shared fitness goals.",
      icon: Users,
      features: [
        "Small group sizes (2-4 people)",
        "Shared motivation and accountability",
        "Cost-effective training option",
        "Community building",
      ],
    },
    {
      title: "Diet Recommendations",
      description:
        "Personalized nutrition guidance and meal planning to complement your fitness journey.",
      icon: Utensils,
      features: [
        "Personalized nutrition plans",
        "Meal planning and prep guidance",
        "Supplement recommendations",
        "Lifestyle habit coaching",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
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
                PERSONAL <span className="text-red-600">TRAINING SERVICES</span>
              </h1>
            </AnimatedHero>

            <AnimatedHero delay={0.4}>
              <p className="text-xl md:text-2xl text-white mb-8 max-w-3xl mx-auto">
                Transform your fitness journey with Coach Kilday's comprehensive
                personal training services in Thornton, Colorado
              </p>
            </AnimatedHero>

            <AnimatedHero delay={0.6}>
              <Link href="/login">
                <Button
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white text-lg rounded-full px-8 py-6"
                >
                  View Packages <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </AnimatedHero>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 dark:text-gray-100">
              Training Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {services.map((service, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <service.icon className="h-8 w-8 text-red-600" />
                      <CardTitle className="text-2xl dark:text-gray-100">
                        {service.title}
                      </CardTitle>
                    </div>
                    <CardDescription className="text-lg dark:text-gray-400">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 dark:text-gray-300">
                      {service.features.map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className="flex items-center gap-2"
                        >
                          <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Location Section */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 dark:text-gray-100">
              Located at Life Time Thornton
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              397 W 148th Ave, Thornton, CO 80023
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-2 dark:text-gray-100">
                  Convenient Location
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Easy access from Thornton, Broomfield, and surrounding areas
                </p>
              </div>
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-2 dark:text-gray-100">
                  Premium Facility
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  State-of-the-art equipment and amenities at Life Time
                </p>
              </div>
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-2 dark:text-gray-100">
                  Flexible Scheduling
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Morning, afternoon, and evening sessions available
                </p>
              </div>
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
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" variant="secondary">
                  View Training Packages
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  className="bg-white text-red-600 hover:bg-gray-100"
                >
                  Book a Session
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
