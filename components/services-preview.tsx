"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Dumbbell,
  Users,
  Calendar,
  Video,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const services = [
  {
    icon: <Dumbbell className="h-10 w-10 text-red-600" />,
    title: "In-Person Training",
    description:
      "One-on-one personal training sessions at Life Time Thornton with hands-on coaching, form correction, and real-time feedback.",
    color: "bg-red-50",
  },
  {
    icon: <Video className="h-10 w-10 text-red-600" />,
    title: "Virtual Training",
    description:
      "Remote coaching sessions via video call with personalized workout plans, progress tracking, and ongoing support from anywhere.",
    color: "bg-gray-50",
  },
  {
    icon: <Users className="h-10 w-10 text-red-600" />,
    title: "Partner Training",
    description:
      "Small group sessions with a partner for motivation, accountability, and shared fitness goals while maintaining personalized attention.",
    color: "bg-red-50",
  },
];

export default function ServicesPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  const scrollToService = (direction: "prev" | "next") => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const cards = container.querySelectorAll("[data-card]");

    if (direction === "next" && currentIndex < services.length - 1) {
      const nextCard = cards[currentIndex + 1] as HTMLElement;
      if (nextCard) {
        nextCard.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
        setCurrentIndex(currentIndex + 1);
      }
    } else if (direction === "prev" && currentIndex > 0) {
      const prevCard = cards[currentIndex - 1] as HTMLElement;
      if (prevCard) {
        prevCard.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
        setCurrentIndex(currentIndex - 1);
      }
    }
  };

  // Update current index when user scrolls manually
  const handleScroll = () => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const cards = container.querySelectorAll("[data-card]");

    // Find which card is most centered in the viewport
    let mostCenteredIndex = 0;
    let minDistance = Infinity;

    cards.forEach((card, index) => {
      const cardRect = card.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const containerCenter = containerRect.left + containerRect.width / 2;
      const distance = Math.abs(cardCenter - containerCenter);

      if (distance < minDistance) {
        minDistance = distance;
        mostCenteredIndex = index;
      }
    });

    setCurrentIndex(mostCenteredIndex);
  };

  return (
    <section
      id="services"
      className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 dark:text-gray-100">
            TRAINING <span className="text-red-600">SERVICES</span>
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            Coach Haley's approach combines science-backed training methods with
            personalized attention to help you achieve sustainable results.
          </p>
        </div>

        <div className="relative overflow-hidden">
          {/* Navigation Arrows */}
          <button
            onClick={() => scrollToService("prev")}
            disabled={currentIndex === 0}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-red-600 disabled:text-gray-300 disabled:cursor-not-allowed rounded-full p-3 shadow-lg border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:scale-110"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            onClick={() => scrollToService("next")}
            disabled={currentIndex === services.length - 1}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-red-600 disabled:text-gray-300 disabled:cursor-not-allowed rounded-full p-3 shadow-lg border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:scale-110"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <motion.div
            ref={containerRef}
            style={{ y }}
            className="flex flex-nowrap overflow-x-auto pb-8 hide-scrollbar px-16 snap-x snap-mandatory"
            onScroll={handleScroll}
          >
            <div className="flex gap-6">
              {services.map((service, index) => (
                <div
                  key={index}
                  data-card
                  className="min-w-[300px] md:min-w-[350px] flex-shrink-0 snap-center"
                >
                  <div
                    className={`h-full rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-800 ${service.color} dark:bg-gray-900 transition-transform hover:scale-105`}
                  >
                    <div className="mb-6">{service.icon}</div>
                    <h3 className="text-xl font-bold mb-4 dark:text-gray-100">
                      {service.title}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-6">
                      {service.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Progress Indicators */}
          <div className="absolute -bottom-2 left-0 right-0 flex justify-center gap-2 py-4">
            {services.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-colors duration-300 ${
                  index === currentIndex
                    ? "bg-red-600"
                    : "bg-gray-300 dark:bg-gray-700"
                }`}
              ></div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <Link href="/services">
            <Button className="bg-red-600 hover:bg-red-700 text-white rounded-full px-8 py-6 text-lg">
              View All Services <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
