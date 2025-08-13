"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useInView, useAnimation } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AboutPreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  return (
    <section
      id="about"
      className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950"
    >
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
        >
          <motion.div
            initial="hidden"
            animate={controls}
            variants={{
              hidden: { opacity: 0, x: -50 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
            }}
            className="relative h-[500px] rounded-2xl overflow-hidden"
          >
            <Image
              src="/curl.JPG"
              alt="Coach Haley Kilday"
              fill
              className="object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-red-600 to-transparent opacity-70"></div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={controls}
            variants={{
              hidden: { opacity: 0, x: 50 },
              visible: {
                opacity: 1,
                x: 0,
                transition: { duration: 0.6, delay: 0.2 },
              },
            }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold dark:text-gray-100">
              Meet Coach Haley Kilday
            </h2>
            <h3 className="text-xl md:text-2xl font-semibold text-red-600">
              Personal Trainer in Thornton, Colorado
            </h3>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              With over a decade of experience transforming bodies and lives,
              Coach Haley Kilday brings elite-level training techniques to
              clients of all fitness levels in Thornton, Colorado and the
              surrounding Denver metro area.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              As an ISSA certified personal trainer with over half a decade of
              experience training and transforming individuals, Haley has
              developed a unique training methodology that combines strength
              training, mobility work, and personalized nutrition guidance.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 flex items-center">
                <span className="text-red-600 font-bold text-xl mr-2">10+</span>
                <span className="text-sm dark:text-gray-300">
                  In the Fitness Industry
                </span>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 flex items-center">
                <span className="text-red-600 font-bold text-xl mr-2">5+</span>
                <span className="text-sm">
                  Years Transforming the Lives of{" "}
                  <span className="text-red-600 font-bold text-xl">500+</span>{" "}
                  Clients
                </span>
              </div>
            </div>
            <div className="pt-6">
              <Link href="/about">
                <Button className="bg-red-600 hover:bg-red-700 text-white rounded-full px-6 py-3">
                  Learn More About Coach Kilday{" "}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
