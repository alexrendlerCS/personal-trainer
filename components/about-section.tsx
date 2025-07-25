"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { motion, useInView, useAnimation } from "framer-motion"

export default function AboutSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const controls = useAnimation()

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [isInView, controls])

  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          ABOUT <span className="text-red-600">HALEY KILDAY</span>
        </h2>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial="hidden"
            animate={controls}
            variants={{
              hidden: { opacity: 0, x: -50 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
            }}
            className="relative h-[500px] rounded-2xl overflow-hidden"
          >
            <Image src="/curl.JPG" alt="Coach Haley Kilday" fill className="object-cover" />
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-red-600 to-transparent opacity-70"></div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={controls}
            variants={{
              hidden: { opacity: 0, x: 50 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.6, delay: 0.2 } },
            }}
            className="space-y-6"
          >
            <h3 className="text-2xl md:text-3xl font-bold">Certified Strength & Conditioning Specialist</h3>
            <p className="text-lg text-gray-700">
              With over a decade of experience transforming bodies and lives, Coach Haley Kilday brings elite-level
              training techniques to clients of all fitness levels.
            </p>
            <p className="text-lg text-gray-700">
              After competing professionally and coaching Olympic athletes, Haley developed a unique training
              methodology that combines strength training, mobility work, and personalized nutrition guidance.
            </p>
            <p className="text-lg text-gray-700">
              Her approach isn't about quick fixes—it's about sustainable results through science-backed methods and
              unwavering accountability.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center">
                <span className="text-red-600 font-bold text-xl mr-2">10+</span>
                <span className="text-sm">Years Experience</span>
              </div>
              <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center">
                <span className="text-red-600 font-bold text-xl mr-2">500+</span>
                <span className="text-sm">Clients Trained</span>
              </div>
              <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center">
                <span className="text-red-600 font-bold text-xl mr-2">5</span>
                <span className="text-sm">Certifications</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
