import Header from "@/components/header";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, Check, Instagram, MapPin, Phone } from "lucide-react";
import PageHero, {
  heroPrimaryButton,
  heroSecondaryButton,
} from "@/components/page-hero";

export const metadata = {
  title: "About Coach Haley Kilday | Personal Trainer Thornton, CO",
  description:
    "Learn about Coach Haley Kilday, certified personal trainer in Thornton, Colorado. 10+ years experience transforming lives through fitness coaching and strength training.",
  keywords:
    "Coach Haley Kilday, personal trainer Thornton, fitness coach Colorado, strength training specialist, certified personal trainer",
};

const INSTAGRAM_URL =
  "https://www.instagram.com/coach.kilday?exln=MWV5eWZnNHduemFzaQ%3D%3D&utm_source=qr";

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

function CredentialList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h3>
      <ul className="mt-6 divide-y divide-gray-200 border-y border-gray-200 dark:divide-gray-800 dark:border-gray-800">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-4 py-5 text-lg text-gray-700 dark:text-gray-300"
          >
            <Check className="mt-1 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AboutPage() {
  const contact = [
    { icon: MapPin, label: "Location", value: "Life Time Thornton" },
    { icon: Phone, label: "Phone", value: "(720) 441-3308", href: "tel:+17204413308" },
    { icon: Calendar, label: "Hours", value: "By Appointment" },
    {
      icon: Instagram,
      label: "Social",
      value: "@coach.kilday",
      href: INSTAGRAM_URL,
      external: true,
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      <main>
        <PageHero
          image="/armsup.JPG"
          imageAlt="Coach Haley Kilday in the gym"
          imagePosition="50% 18%"
          title={
            <>
              About <span className="text-red-600">Coach Kilday</span>
            </>
          }
          subtitle="Certified Personal Trainer in Thornton, Colorado"
        >
          <Button asChild className={heroPrimaryButton}>
            <Link href="/services">View Training Packages</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className={heroSecondaryButton}
          >
            <Link href="/login">Book a Session</Link>
          </Button>
        </PageHero>

        {/* Story */}
        <section className="py-24 lg:py-32">
          <div className="container mx-auto grid items-center gap-12 px-4 lg:grid-cols-2 lg:gap-24">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-3xl bg-gray-900 lg:order-last lg:max-w-none">
              <Image
                src="/action.JPG"
                alt="Coach Haley Kilday training with dumbbells"
                fill
                sizes="(min-width: 1024px) 45vw, 90vw"
                className="object-cover object-[50%_25%]"
              />
            </div>
            <div>
              <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-gray-100 md:text-5xl">
                My Journey
              </h2>
              <p className="mt-8 max-w-prose text-xl font-medium leading-relaxed text-gray-900 dark:text-gray-100 md:text-2xl md:leading-snug">
                After competing professionally and coaching Olympic athletes, I
                developed a unique training methodology that combines strength
                training, mobility work, and personalized nutrition guidance.
              </p>
              <div className="mt-6 max-w-prose space-y-5 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                <p>
                  My approach isn't about quick fixes—it's about sustainable
                  results through science-backed methods and unwavering
                  accountability. Located at Life Time Thornton, I provide
                  personal training services to help you achieve your fitness
                  goals.
                </p>
                <p>
                  I believe that everyone deserves to feel confident in their
                  body and capable of achieving their fitness goals. Whether
                  you're just starting your fitness journey or looking to break
                  through plateaus, I'm here to guide you every step of the
                  way.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Certifications & Achievements */}
        <section className="bg-gray-50 py-24 dark:bg-gray-950 lg:py-32">
          <div className="container mx-auto px-4">
            <h2 className="max-w-xl text-4xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-gray-100 md:text-5xl">
              Certifications &amp; Achievements
            </h2>
            <div className="mt-14 grid gap-14 md:grid-cols-2 md:gap-16">
              <CredentialList title="Certifications" items={certifications} />
              <CredentialList title="Key Achievements" items={achievements} />
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-24 lg:py-32">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-gray-100 md:text-5xl">
              Get In Touch
            </h2>
            <dl className="mt-12 grid border-t border-gray-200 dark:border-gray-800 sm:grid-cols-2 lg:grid-cols-4">
              {contact.map(({ icon: Icon, label, value, href, external }) => (
                <div
                  key={label}
                  className="border-b border-gray-200 py-8 dark:border-gray-800 lg:border-b-0 lg:border-r lg:px-8 lg:first:pl-0 lg:last:border-r-0"
                >
                  <Icon className="h-6 w-6 text-red-600" aria-hidden="true" />
                  <dt className="mt-5 text-sm text-gray-500 dark:text-gray-400">{label}</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {href ? (
                      <a
                        href={href}
                        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="transition-colors hover:text-red-600"
                      >
                        {value}
                      </a>
                    ) : (
                      value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
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
            <Button
              asChild
              className="self-start rounded-full bg-white px-8 py-6 text-base font-semibold text-red-600 hover:bg-gray-100 lg:self-auto"
            >
              <Link href="/login">Book Your First Session</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
