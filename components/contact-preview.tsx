import Link from "next/link";
import { Calendar, Instagram, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const INSTAGRAM_URL =
  "https://www.instagram.com/coachkilday?obrf=MTliYm80eHJmNXp5aQ%3D%3D&utm_source=qr";

export default function ContactPreview() {
  const items = [
    { icon: MapPin, label: "Location", value: "Life Time Thornton" },
    {
      icon: Phone,
      label: "Phone",
      value: "(720) 441-3308",
      href: "tel:+17204413308",
    },
    { icon: Calendar, label: "Hours", value: "By Appointment" },
    {
      icon: Instagram,
      label: "Social",
      value: "@coachkilday",
      href: INSTAGRAM_URL,
      external: true,
    },
  ];

  return (
    <section className="py-24 lg:py-32">
      <div className="container mx-auto grid gap-12 px-4 lg:grid-cols-[1fr_1.4fr] lg:gap-24">
        <div>
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-gray-100 md:text-5xl">
            Get In Touch
          </h2>
          <p className="mt-6 max-w-sm text-lg leading-relaxed text-gray-600 dark:text-gray-300">
            Ready to start your fitness transformation? Contact Coach Kilday for
            personal training in Thornton, Colorado.
          </p>
          <Button
            asChild
            className="mt-10 rounded-full bg-red-600 px-8 py-6 text-base text-white hover:bg-red-700"
          >
            <Link href="/contact">Contact Coach Kilday</Link>
          </Button>
        </div>

        <dl className="grid self-center border-t border-gray-200 dark:border-gray-800 sm:grid-cols-2">
          {items.map(({ icon: Icon, label, value, href, external }) => (
            <div
              key={label}
              className="flex gap-4 border-b border-gray-200 py-7 dark:border-gray-800"
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">{label}</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {href ? (
                    <a
                      href={href}
                      {...(external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="transition-colors hover:text-red-600"
                    >
                      {value}
                    </a>
                  ) : (
                    value
                  )}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
