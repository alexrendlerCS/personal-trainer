import Header from "@/components/header";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Salad,
  UtensilsCrossed,
  Dumbbell,
  Phone,
  Instagram,
} from "lucide-react";
import { AnimatedHero } from "@/components/animated-hero";
import AppSupportForm from "@/components/app-support-form";
import { heroPrimaryButton, heroSecondaryButton } from "@/components/page-hero";

export const metadata = {
  title: "The Coach Kilday App | Workouts, Nutrition & AI Coaching",
  description:
    "A personalized fitness coaching app that combines customized workouts, nutrition planning, progress tracking, and AI-powered coaching into one seamless mobile experience.",
};

const INSTAGRAM_URL =
  "https://www.instagram.com/coachkilday?obrf=MTliYm80eHJmNXp5aQ%3D%3D&utm_source=qr";

const features = [
  {
    icon: LayoutDashboard,
    title: "Personalized daily dashboard",
    description:
      "Access your scheduled workouts, nutrition goals, and meal plans tailored to your individual fitness objectives.",
  },
  {
    icon: Salad,
    title: "Structured nutrition guidance",
    description:
      "Recommended foods, serving sizes, calorie targets, and macronutrient breakdowns.",
  },
  {
    icon: UtensilsCrossed,
    title: "Flexible meal logging",
    description:
      "Easily log meals, adjust portions, substitute foods, and track your daily nutritional intake while staying aligned with your personalized fitness plan.",
  },
  {
    icon: Dumbbell,
    title: "Customized workouts",
    description:
      "Structured workout programming and progress tracking to help you stay informed, accountable, and supported throughout your fitness journey.",
  },
];

const aiFacts = [
  { value: "24/7", label: "Available any time" },
  { value: "Haley's approach", label: "Trained on her coaching style and knowledge" },
  { value: "Fitness + nutrition", label: "Personalized guidance and answers" },
];

/** Real app screenshot in a device frame. */
function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[270px] sm:w-[300px]">
      {/* Warm glow, picks up the app's gold tones */}
      <div
        aria-hidden="true"
        className="absolute -inset-12 rounded-full bg-amber-500/20 blur-3xl"
      />

      <div className="relative rounded-[2.75rem] bg-gray-950 p-2.5 shadow-2xl ring-1 ring-white/10 lg:rotate-[4deg]">
        {/* Modern phone proportions (9:18). The 16:9 screenshot is cropped
            slightly at the sides to fill it. */}
        <div className="relative aspect-[9/18] overflow-hidden rounded-[2.2rem] bg-black">
          <Image
            src="/App.png"
            alt="The Coach Kilday app home screen with the daily check-in, quick actions for Dashboard, Log food, and Check in, and a message box for the AI coach"
            fill
            priority
            sizes="300px"
            className="object-cover object-center"
          />
          {/* Dynamic island */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-3 h-6 w-24 -translate-x-1/2 rounded-full bg-black"
          />
        </div>
      </div>
    </div>
  );
}

export default function AppPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-gray-900">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25 grayscale"
            style={{ backgroundImage: "url(/curl.JPG)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/90 to-gray-900/40" />

          <div className="container relative mx-auto grid min-h-screen items-center gap-16 px-4 pb-20 pt-32 lg:grid-cols-2 lg:pt-24">
            <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
              <AnimatedHero delay={0.1}>
                <h1 className="text-5xl font-extrabold uppercase leading-[0.95] tracking-tight text-white sm:text-6xl xl:text-7xl">
                  Your training,{" "}
                  <span className="text-red-600">in your pocket.</span>
                </h1>
              </AnimatedHero>
              <AnimatedHero delay={0.25}>
                <p className="mx-auto mt-8 max-w-md text-lg leading-relaxed text-white/90 md:text-xl">
                  A personalized fitness coaching app that combines customized
                  workouts, nutrition planning, progress tracking, and
                  AI-powered coaching into one seamless mobile experience.
                </p>
                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Button asChild className={heroPrimaryButton}>
                    <Link href="/login">Get started</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className={heroSecondaryButton}
                  >
                    <a href="#support">Get help with the app</a>
                  </Button>
                </div>
              </AnimatedHero>
            </div>

            <AnimatedHero delay={0.4}>
              <PhoneMockup />
            </AnimatedHero>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 lg:py-32">
          <div className="container mx-auto grid gap-12 px-4 lg:grid-cols-[1fr_1.4fr] lg:gap-24">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-gray-100 md:text-5xl">
                Workouts and nutrition,
                <br />
                built around you.
              </h2>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                By combining professional fitness coaching with intelligent AI
                assistance, structured workout programming, and flexible
                nutrition tracking, Coach Kilday delivers a more accessible,
                personalized, and engaging fitness experience.
              </p>
              <div className="mt-8 h-1 w-16 rounded-full bg-red-600" />
            </div>

            <ul className="divide-y divide-gray-200 border-y border-gray-200 dark:divide-gray-800 dark:border-gray-800">
              {features.map(({ icon: Icon, title, description }) => (
                <li key={title} className="flex gap-6 py-8">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-900/20">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {title}
                    </h3>
                    <p className="mt-2 max-w-prose leading-relaxed text-gray-600 dark:text-gray-300">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Coach Kilday AI */}
        <section className="relative isolate overflow-hidden bg-gray-900 py-24 text-white dark:bg-gray-950 lg:py-32">
          <div
            aria-hidden="true"
            className="absolute -right-40 top-1/2 -z-10 h-[36rem] w-[36rem] -translate-y-1/2 rounded-full bg-amber-500/10 blur-3xl"
          />
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h2 className="text-5xl font-extrabold leading-[0.95] tracking-tight md:text-7xl">
                Coach Kilday AI
              </h2>
              <p className="mt-8 text-xl leading-relaxed text-gray-200 md:text-2xl md:leading-snug">
                A virtual coaching assistant trained to reflect Haley Kilday's
                coaching style, knowledge, and approach.
              </p>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-400">
                Available 24/7, it provides personalized fitness and nutrition
                guidance, answers questions, and helps clients navigate their
                programs even when Haley isn't available. This gives users
                continuous access to coaching support that feels consistent
                with Haley's personal approach.
              </p>
            </div>

            <dl className="mt-16 grid border-t border-white/15 sm:grid-cols-3 sm:divide-x sm:divide-white/15">
              {aiFacts.map((fact) => (
                <div
                  key={fact.label}
                  className="border-b border-white/15 py-8 sm:border-b-0 sm:px-8 sm:first:pl-0"
                >
                  <dt className="text-2xl font-extrabold tracking-tight text-amber-300 md:text-3xl">
                    {fact.value}
                  </dt>
                  <dd className="mt-2 text-gray-400">{fact.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Support & Feedback */}
        <section
          id="support"
          className="scroll-mt-16 bg-gray-50 py-24 dark:bg-gray-950 lg:py-32"
        >
          <div className="container mx-auto max-w-3xl px-4">
            <div className="text-center">
              <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-gray-100 md:text-5xl">
                App support &amp; feedback
              </h2>
              <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                Need help, found a bug, or have an idea? Let me know!
              </p>
            </div>

            <div className="mt-12">
              <AppSupportForm />
            </div>

            <div className="mt-14 text-center">
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                Prefer to talk?
              </p>
              <ul className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-8">
                <li>
                  <a
                    href="tel:+17204413308"
                    className="inline-flex items-center gap-3 text-gray-600 transition-colors hover:text-red-600 dark:text-gray-300"
                  >
                    <Phone className="h-5 w-5 text-red-600" aria-hidden="true" />
                    Call or text (720) 441-3308
                  </a>
                </li>
                <li>
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 text-gray-600 transition-colors hover:text-red-600 dark:text-gray-300"
                  >
                    <Instagram className="h-5 w-5 text-red-600" aria-hidden="true" />
                    @coachkilday
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
