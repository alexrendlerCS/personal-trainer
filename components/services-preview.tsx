import Link from "next/link";
import { ArrowRight, Dumbbell, Users, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

const services = [
  {
    icon: Dumbbell,
    title: "In-Person Training",
    description:
      "One-on-one personal training sessions at Life Time Thornton with hands-on coaching, form correction, and real-time feedback.",
  },
  {
    icon: Video,
    title: "Virtual Training",
    description:
      "Remote coaching sessions via video call with personalized workout plans, progress tracking, and ongoing support from anywhere.",
  },
  {
    icon: Users,
    title: "Partner Training",
    description:
      "Small group sessions with a partner for motivation, accountability, and shared fitness goals while maintaining personalized attention.",
  },
];

export default function ServicesPreview() {
  return (
    <section id="services" className="bg-gray-900 py-24 text-white dark:bg-gray-950 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
              Training Services
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-gray-300">
              Coach Haley's approach combines science-backed training methods
              with personalized attention to help you achieve sustainable
              results.
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            className="self-start rounded-full border-white/30 bg-transparent px-8 py-6 text-base text-white hover:bg-white hover:text-gray-900 lg:self-auto"
          >
            <Link href="/services">
              View All Services <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>

        <ul className="mt-16 grid border-t border-white/15 md:grid-cols-3 md:divide-x md:divide-white/15">
          {services.map(({ icon: Icon, title, description }) => (
            <li
              key={title}
              className="border-b border-white/15 py-10 md:border-b-0 md:px-8 md:first:pl-0 md:last:pr-0"
            >
              <Icon className="h-8 w-8 text-red-500" aria-hidden="true" />
              <h3 className="mt-6 text-2xl font-bold">{title}</h3>
              <p className="mt-3 leading-relaxed text-gray-400">{description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
