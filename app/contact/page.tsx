import Header from "@/components/header";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight, Calendar, Instagram, MapPin, Phone } from "lucide-react";
import PageHero from "@/components/page-hero";

export const metadata = {
  title: "Contact Coach Kilday | Personal Trainer Thornton, CO",
  description:
    "Contact Coach Kilday for personal training in Thornton, Colorado. Located at Life Time Thornton. Call (720) 441-3308 or book online.",
  keywords:
    "contact Coach Kilday, personal trainer Thornton, fitness coach contact, Life Time Thornton, personal training Colorado",
};

const INSTAGRAM_URL =
  "https://www.instagram.com/coach.kilday?exln=MWV5eWZnNHduemFzaQ%3D%3D&utm_source=qr";
const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Life+Time+Thornton+397+W+148th+Ave+Thornton+CO+80023";

const nextSteps = [
  {
    title: "Book Your First Session",
    description:
      "Take the first step towards your fitness goals with a personalized training session.",
    links: [{ label: "Book Online", href: "/login" }],
  },
  {
    title: "View Training Packages",
    description:
      "Explore our training packages and find the perfect fit for your goals.",
    links: [{ label: "View Packages", href: "/login" }],
  },
  {
    title: "Learn More",
    description:
      "Discover more about Coach Kilday's training approach and experience.",
    links: [
      { label: "About Coach Kilday", href: "/about" },
      { label: "Training Services", href: "/services" },
    ],
  },
];

const faqs = [
  {
    q: "How do I book my first session?",
    a: "You can book your first session online through our booking system, or call/text Coach Kilday directly at (720) 441-3308.",
  },
  {
    q: "What should I bring to my first session?",
    a: "Bring comfortable workout clothes, athletic shoes, a water bottle, and a positive attitude! All equipment is provided at Life Time.",
  },
  {
    q: "Do you offer virtual training sessions?",
    a: "Currently, we focus on in-person training at Life Time Thornton for the best results and personalized attention.",
  },
  {
    q: "What areas do you serve?",
    a: "Coach Kilday serves Thornton, Broomfield, and the surrounding Denver metro area. Sessions are held at Life Time Thornton.",
  },
];

const linkClass = "transition-colors hover:text-red-600";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      <main>
        <PageHero
          compact
          image="/back.JPG"
          imageAlt="Coach Haley Kilday flexing in front of a kettlebell rack"
          imagePosition="50% 30%"
          title={
            <>
              Contact <span className="text-red-600">Coach Kilday</span>
            </>
          }
          subtitle="Ready to start your fitness transformation? Get in touch with Coach Kilday for personal training in Thornton, Colorado."
        />

        <section className="py-24 lg:py-32">
          <div className="container mx-auto grid gap-20 px-4 lg:grid-cols-2 lg:gap-24">
            {/* Contact details */}
            <div>
              <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-gray-100 md:text-5xl">
                Get In Touch
              </h2>

              <dl className="mt-12 divide-y divide-gray-200 border-y border-gray-200 dark:divide-gray-800 dark:border-gray-800">
                <div className="flex gap-5 py-8">
                  <MapPin className="mt-1 h-6 w-6 shrink-0 text-red-600" aria-hidden="true" />
                  <div>
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Location</dt>
                    <dd className="mt-1">
                      <a
                        href={MAPS_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`block text-gray-900 dark:text-gray-100 ${linkClass}`}
                      >
                        <span className="block text-xl font-semibold">Life Time Thornton</span>
                        <span className="block text-gray-600 dark:text-gray-300">397 W 148th Ave</span>
                        <span className="block text-gray-600 dark:text-gray-300">Thornton, CO 80023</span>
                      </a>
                      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                        Conveniently located in Thornton, serving the Denver
                        metro area
                      </p>
                    </dd>
                  </div>
                </div>

                <div className="flex gap-5 py-8">
                  <Phone className="mt-1 h-6 w-6 shrink-0 text-red-600" aria-hidden="true" />
                  <div>
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Phone</dt>
                    <dd className="mt-1">
                      <a
                        href="tel:+17204413308"
                        className={`text-xl font-semibold tabular-nums text-gray-900 dark:text-gray-100 ${linkClass}`}
                      >
                        (720) 441-3308
                      </a>
                      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                        Call or text for immediate assistance
                      </p>
                    </dd>
                  </div>
                </div>

                <div className="flex gap-5 py-8">
                  <Calendar className="mt-1 h-6 w-6 shrink-0 text-red-600" aria-hidden="true" />
                  <div>
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Hours</dt>
                    <dd className="mt-1">
                      <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        By Appointment
                      </p>
                      <p className="text-gray-600 dark:text-gray-300">
                        Flexible scheduling available
                      </p>
                      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                        Morning, afternoon, and evening sessions
                      </p>
                    </dd>
                  </div>
                </div>

                <div className="flex gap-5 py-8">
                  <Instagram className="mt-1 h-6 w-6 shrink-0 text-red-600" aria-hidden="true" />
                  <div>
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Social Media</dt>
                    <dd className="mt-1">
                      <a
                        href={INSTAGRAM_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-xl font-semibold text-gray-900 dark:text-gray-100 ${linkClass}`}
                      >
                        @coach.kilday
                      </a>
                      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                        Follow for fitness tips and motivation
                      </p>
                    </dd>
                  </div>
                </div>
              </dl>
            </div>

            {/* Next steps */}
            <div>
              <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-gray-100 md:text-5xl">
                Ready to Start?
              </h2>

              <div className="mt-12 rounded-3xl bg-red-600 p-8 text-white shadow-xl shadow-red-600/20 md:p-10">
                <h3 className="text-2xl font-extrabold leading-tight tracking-tight md:text-3xl">
                  Sign Up Now for Your First Session Free!
                </h3>
                <Button
                  asChild
                  className="mt-8 rounded-full bg-white px-8 py-6 text-base font-semibold text-red-600 hover:bg-gray-100"
                >
                  <Link href="/login">
                    Claim Free Session <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>

              <ul className="mt-6 divide-y divide-gray-200 dark:divide-gray-800">
                {nextSteps.map((step) => (
                  <li key={step.title} className="py-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {step.title}
                    </h3>
                    <p className="mt-2 leading-relaxed text-gray-600 dark:text-gray-300">
                      {step.description}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3">
                      {step.links.map((link) => (
                        <Button
                          key={link.label}
                          asChild
                          variant="outline"
                          className="rounded-full border-gray-300 px-6 text-gray-900 hover:border-red-600 hover:bg-red-600 hover:text-white dark:border-gray-700 dark:bg-transparent dark:text-gray-100"
                        >
                          <Link href={link.href}>{link.label}</Link>
                        </Button>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-gray-50 py-24 dark:bg-gray-950 lg:py-32">
          <div className="container mx-auto grid gap-12 px-4 lg:grid-cols-[1fr_1.4fr] lg:gap-24">
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-gray-100 md:text-5xl lg:sticky lg:top-28 lg:self-start">
              Frequently Asked Questions
            </h2>
            <Accordion
              type="multiple"
              defaultValue={[faqs[0].q]}
              className="border-t border-gray-200 dark:border-gray-800"
            >
              {faqs.map((faq) => (
                <AccordionItem
                  key={faq.q}
                  value={faq.q}
                  className="border-gray-200 dark:border-gray-800"
                >
                  <AccordionTrigger className="py-6 text-left text-lg font-bold text-gray-900 hover:text-red-600 hover:no-underline dark:text-gray-100 md:text-xl">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 pr-8 text-base leading-relaxed text-gray-600 dark:text-gray-300 md:text-lg">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>
    </div>
  );
}
