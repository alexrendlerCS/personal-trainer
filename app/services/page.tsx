import Header from "@/components/header";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Dumbbell, MapPin, Users, Utensils, Video } from "lucide-react";
import PageHero, { heroPrimaryButton } from "@/components/page-hero";

export const metadata = {
  title: "Personal Training Services | Coach Kilday - Thornton, CO",
  description:
    "Transform your fitness with Coach Kilday's personal training services in Thornton, Colorado. Strength training, weight loss, muscle building, and nutrition coaching.",
  keywords:
    "personal training services, fitness coaching, strength training, weight loss, muscle building, nutrition coaching, Thornton Colorado, Coach Kilday",
};

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

const locationPerks = [
  {
    title: "Convenient Location",
    description: "Easy access from Thornton, Broomfield, and surrounding areas",
  },
  {
    title: "Premium Facility",
    description: "State-of-the-art equipment and amenities at Life Time",
  },
  {
    title: "Flexible Scheduling",
    description: "Morning, afternoon, and evening sessions available",
  },
];

const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Life+Time+Thornton+397+W+148th+Ave+Thornton+CO+80023";

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      <main>
        <PageHero
          image="/curl.JPG"
          imageAlt="Coach Haley Kilday doing dumbbell curls"
          imagePosition="50% 22%"
          title={
            <>
              Personal <span className="text-red-600">Training Services</span>
            </>
          }
          subtitle="Transform your fitness journey with Coach Kilday's comprehensive personal training services in Thornton, Colorado"
        >
          <Button asChild className={heroPrimaryButton}>
            <Link href="/login">
              View Packages <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </PageHero>

        {/* Services */}
        <section className="py-24 lg:py-32">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-gray-100 md:text-5xl">
              Training Services
            </h2>

            <ul className="mt-14 border-t border-gray-200 dark:border-gray-800">
              {services.map(({ icon: Icon, title, description, features }) => (
                <li
                  key={title}
                  className="grid gap-6 border-b border-gray-200 py-12 dark:border-gray-800 lg:grid-cols-[1fr_1fr] lg:gap-16"
                >
                  <div className="flex gap-6">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-900/20">
                      <Icon className="h-7 w-7" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 md:text-3xl">
                        {title}
                      </h3>
                      <p className="mt-3 max-w-md text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                        {description}
                      </p>
                    </div>
                  </div>
                  <ul className="grid content-start gap-x-8 gap-y-3 pl-20 sm:grid-cols-2 lg:pl-0 lg:pt-2">
                    {features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                      >
                        <Check className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Location */}
        <section className="bg-gray-900 py-24 text-white dark:bg-gray-950 lg:py-32">
          <div className="container mx-auto grid gap-12 px-4 lg:grid-cols-[1fr_1.2fr] lg:gap-24">
            <div>
              <h2 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
                Located at Life Time Thornton
              </h2>
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-start gap-3 text-xl text-gray-300 transition-colors hover:text-white"
              >
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-red-500" aria-hidden="true" />
                <span className="underline decoration-white/30 underline-offset-4">
                  397 W 148th Ave, Thornton, CO 80023
                </span>
              </a>
            </div>

            <ul className="divide-y divide-white/15 border-y border-white/15">
              {locationPerks.map((perk) => (
                <li key={perk.title} className="py-8">
                  <h3 className="text-xl font-bold">{perk.title}</h3>
                  <p className="mt-2 leading-relaxed text-gray-400">{perk.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-red-600 py-20 text-white lg:py-24">
          <div className="container mx-auto flex flex-col gap-10 px-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-extrabold leading-[0.95] tracking-tight md:text-5xl">
                Ready to Start Your Transformation?
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-red-50 md:text-xl">
                Book your first session with Coach Kilday and take the first
                step towards your fitness goals
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                className="rounded-full bg-white px-8 py-6 text-base font-semibold text-red-600 hover:bg-gray-100"
              >
                <Link href="/login">Book a Session</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full border-white/50 bg-transparent px-8 py-6 text-base text-white hover:bg-white hover:text-red-600"
              >
                <Link href="/login">View Training Packages</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
