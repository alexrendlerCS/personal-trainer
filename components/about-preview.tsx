import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { value: "10+", label: "In the Fitness Industry" },
  { value: "5+", label: "Years Transforming Lives" },
  { value: "500+", label: "Clients" },
];

export default function AboutPreview() {
  return (
    <section id="about" className="py-24 lg:py-32">
      <div className="container mx-auto grid items-center gap-12 px-4 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
        <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-3xl bg-gray-900 lg:max-w-none">
          <Image
            src="/curl.JPG"
            alt="Coach Haley Kilday doing dumbbell curls"
            fill
            sizes="(min-width: 1024px) 40vw, 90vw"
            className="object-cover object-[50%_30%]"
          />
        </div>

        <div>
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-gray-100 md:text-5xl">
            Meet Coach Haley Kilday
          </h2>
          <p className="mt-3 text-xl font-semibold text-red-600">
            Personal Trainer in Thornton, Colorado
          </p>

          <div className="mt-8 max-w-prose space-y-5 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
            <p>
              With over a decade of experience transforming bodies and lives,
              Coach Haley Kilday brings elite-level training techniques to
              clients of all fitness levels in Thornton, Colorado and the
              surrounding Denver metro area.
            </p>
            <p>
              As an ISSA certified personal trainer with over half a decade of
              experience training and transforming individuals, Haley has
              developed a unique training methodology that combines strength
              training, mobility work, and personalized nutrition guidance.
            </p>
          </div>

          <dl className="mt-10 grid grid-cols-3 divide-x divide-gray-200 border-y border-gray-200 dark:divide-gray-800 dark:border-gray-800">
            {stats.map((stat) => (
              <div key={stat.label} className="px-4 py-6 first:pl-0">
                <dt className="sr-only">{stat.label}</dt>
                <dd className="text-3xl font-extrabold tabular-nums tracking-tight text-gray-900 dark:text-gray-100 md:text-4xl">
                  {stat.value}
                </dd>
                <dd className="mt-1 text-sm leading-snug text-gray-600 dark:text-gray-400">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>

          <Button
            asChild
            className="mt-10 rounded-full bg-red-600 px-8 py-6 text-base text-white hover:bg-red-700"
          >
            <Link href="/about">
              Learn More About Coach Kilday <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
