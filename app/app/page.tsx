import Header from "@/components/header";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CalendarCheck,
  Package,
  MessageSquare,
  RefreshCw,
  FileSignature,
  Gift,
  Home,
  CalendarDays,
  MapPin,
  Phone,
  Instagram,
} from "lucide-react";
import { AnimatedHero } from "@/components/animated-hero";
import AppSupportForm from "@/components/app-support-form";

export const metadata = {
  title: "The Coach Kilday App | Book, Train & Stay Connected",
  description:
    "Book sessions, manage training packages, message Coach Kilday, and sync your schedule — all in one place. Get app support or share feedback.",
};

const INSTAGRAM_URL =
  "https://www.instagram.com/coach.kilday?exln=MWV5eWZnNHduemFzaQ%3D%3D&utm_source=qr";

const features = [
  {
    icon: CalendarCheck,
    title: "Book sessions",
    description:
      "See real-time availability and book, reschedule, or cancel your training sessions in a few taps.",
  },
  {
    icon: Package,
    title: "Manage packages",
    description:
      "Purchase training packages, track your remaining sessions, and handle payments securely.",
  },
  {
    icon: MessageSquare,
    title: "Message your coach",
    description:
      "Ask questions, share updates, and stay accountable with direct messaging between sessions.",
  },
  {
    icon: RefreshCw,
    title: "Calendar sync",
    description:
      "Connect Google Calendar so every session shows up automatically alongside the rest of your week.",
  },
  {
    icon: FileSignature,
    title: "Simple onboarding",
    description:
      "Sign up, review and sign your training agreement, and claim your first session — all online.",
  },
  {
    icon: Gift,
    title: "Referral rewards",
    description:
      "Share your referral link with friends and earn rewards when they start training.",
  },
];

/** A code-drawn phone showing a representative app screen. Decorative. */
function PhoneMockup() {
  return (
    <div aria-hidden="true" className="relative mx-auto w-[280px] sm:w-[300px]">
      {/* Glow */}
      <div className="absolute -inset-10 rounded-full bg-red-600/25 blur-3xl" />

      {/* Device */}
      <div className="relative rounded-[2.75rem] bg-gray-950 p-3 shadow-2xl ring-1 ring-white/10 lg:rotate-[4deg]">
        <div className="relative overflow-hidden rounded-[2.1rem] bg-gray-50">
          {/* Notch */}
          <div className="absolute left-1/2 top-2 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-gray-950" />

          {/* Status bar */}
          <div className="flex items-center justify-between px-7 pb-2 pt-3 text-[11px] font-semibold text-gray-900">
            <span className="tabular-nums">6:12</span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-3 rounded-[2px] bg-gray-900" />
            </span>
          </div>

          <div className="space-y-3 px-4 pb-4 pt-5">
            <div className="px-1">
              <p className="text-xs text-gray-500">Good morning,</p>
              <p className="text-lg font-bold leading-tight text-gray-900">Jordan</p>
            </div>

            {/* Next session */}
            <div className="rounded-2xl bg-red-600 p-4 text-white shadow-lg shadow-red-600/30">
              <p className="text-xs font-medium text-red-100">Next session</p>
              <p className="mt-1 text-xl font-extrabold leading-tight">Tuesday, Nov 11</p>
              <p className="text-sm font-medium tabular-nums text-red-50">6:00 – 7:00 AM</p>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-red-100">
                <MapPin className="h-3.5 w-3.5" />
                Life Time Thornton
              </p>
              <div className="mt-3 flex gap-2">
                <span className="whitespace-nowrap rounded-full bg-white px-3 py-1 text-xs font-semibold text-red-600">
                  Reschedule
                </span>
                <span className="whitespace-nowrap rounded-full bg-red-700/60 px-3 py-1 text-xs font-semibold">
                  Directions
                </span>
              </div>
            </div>

            {/* Package progress */}
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-semibold text-gray-900">Strength 10-pack</p>
                <p className="text-xs tabular-nums text-gray-500">6 of 10</p>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full w-[60%] rounded-full bg-red-600" />
              </div>
              <p className="mt-2 text-xs text-gray-500">4 sessions left</p>
            </div>

            {/* Message */}
            <div className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                H
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">Coach Haley</p>
                <p className="text-xs leading-snug text-gray-600">
                  Strong deadlifts today. Add 5 lb next week and keep that brace.
                </p>
              </div>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex items-center justify-around border-t border-gray-200 bg-white px-4 pb-5 pt-3 text-gray-400">
            <Home className="h-5 w-5 text-red-600" />
            <CalendarDays className="h-5 w-5" />
            <MessageSquare className="h-5 w-5" />
            <Package className="h-5 w-5" />
          </div>
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
            <div className="mx-auto flex max-w-xl flex-col items-center text-center">
              <AnimatedHero delay={0.1}>
                <h1 className="text-5xl font-extrabold leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
                  Your training,
                  <br />
                  in your pocket.
                </h1>
              </AnimatedHero>
              <AnimatedHero delay={0.25}>
                <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-gray-300">
                  Book sessions, track your packages, and stay connected with
                  Coach Kilday between workouts — all in one place.
                </p>
                <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
                  <Button
                    asChild
                    className="rounded-full bg-red-600 px-8 py-6 text-base text-white hover:bg-red-700"
                  >
                    <Link href="/login">Get started</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-full border-white/30 bg-transparent px-8 py-6 text-base text-white hover:bg-white hover:text-gray-900"
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
                Less scheduling.
                <br />
                More training.
              </h2>
              <p className="mt-6 max-w-sm text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                Everything you need to work with Coach Kilday, without the
                back-and-forth texts.
              </p>
              <div className="mt-8 h-1 w-16 rounded-full bg-red-600" />
            </div>

            <ul className="divide-y divide-gray-200 border-y border-gray-200 dark:divide-gray-800 dark:border-gray-800">
              {features.map(({ icon: Icon, title, description }) => (
                <li key={title} className="flex gap-6 py-8">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-900/20">
                    <Icon className="h-6 w-6" />
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
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  Prefer to talk?
                </p>
                <ul className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-8">
                  <li>
                    <a
                      href="tel:+17204413308"
                      className="inline-flex items-center gap-3 text-gray-600 transition-colors hover:text-red-600 dark:text-gray-300"
                    >
                      <Phone className="h-5 w-5 text-red-600" />
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
                      <Instagram className="h-5 w-5 text-red-600" />
                      @coach.kilday
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
