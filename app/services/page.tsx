import Header from "@/components/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Dumbbell, Heart, Target, Users } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Personal Training Services | Coach Kilday - Westminster, CO",
  description:
    "Transform your fitness with Coach Kilday's personal training services in Westminster, Colorado. Strength training, weight loss, muscle building, and nutrition coaching.",
  keywords:
    "personal training services, fitness coaching, strength training, weight loss, muscle building, nutrition coaching, Westminster Colorado, Coach Kilday",
};

export default function ServicesPage() {
  const services = [
    {
      title: "Personal Training Sessions",
      description:
        "One-on-one personal training sessions tailored to your specific goals and fitness level.",
      icon: Dumbbell,
      features: [
        "Customized workout programs",
        "Form correction and technique",
        "Progress tracking and assessment",
        "Motivation and accountability",
      ],
    },
    {
      title: "Strength Training",
      description:
        "Build strength, muscle, and confidence with proven strength training methodologies.",
      icon: Target,
      features: [
        "Compound movement focus",
        "Progressive overload training",
        "Injury prevention techniques",
        "Strength assessment and testing",
      ],
    },
    {
      title: "Weight Loss Coaching",
      description:
        "Sustainable weight loss through proper nutrition and effective training programs.",
      icon: Heart,
      features: [
        "Nutrition guidance and meal planning",
        "Metabolic conditioning",
        "Lifestyle habit coaching",
        "Body composition tracking",
      ],
    },
    {
      title: "Group Training",
      description:
        "Small group sessions for motivation and community while maintaining personalized attention.",
      icon: Users,
      features: [
        "Small group sizes (2-4 people)",
        "Shared motivation and accountability",
        "Cost-effective training option",
        "Community building",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-red-600 to-red-800 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Personal Training Services
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Transform your fitness journey with Coach Kilday's comprehensive
              personal training services in Westminster, Colorado
            </p>
            <Link href="/client/packages">
              <Button
                size="lg"
                className="bg-white text-red-600 hover:bg-gray-100"
              >
                View Packages <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
              Training Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {services.map((service, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <service.icon className="h-8 w-8 text-red-600" />
                      <CardTitle className="text-2xl">
                        {service.title}
                      </CardTitle>
                    </div>
                    <CardDescription className="text-lg">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
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
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              Located at Life Time Westminster
            </h2>
            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
              397 W 148th Ave, Westminster, CO 80023
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-2">Convenient Location</h3>
                <p className="text-gray-600">
                  Easy access from Westminster, Broomfield, and surrounding
                  areas
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-2">Premium Facility</h3>
                <p className="text-gray-600">
                  State-of-the-art equipment and amenities at Life Time
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-2">Flexible Scheduling</h3>
                <p className="text-gray-600">
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
              <Link href="/client/packages">
                <Button size="lg" variant="secondary">
                  View Training Packages
                </Button>
              </Link>
              <Link href="/client/booking">
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
