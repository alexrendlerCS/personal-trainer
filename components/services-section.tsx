"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Dumbbell, Users, Calendar, ChefHat } from "lucide-react"
import { Button } from "@/components/ui/button"

const services = [
  {
    icon: <Dumbbell className="h-10 w-10 text-red-600" />,
    title: "Strength Training",
    description:
      "Custom strength programs designed to build muscle, increase power, and improve overall athletic performance.",
    color: "bg-red-50",
  },
  {
    icon: <Users className="h-10 w-10 text-red-600" />,
    title: "Group Sessions",
    description: "High-energy small group training sessions that combine strength work with metabolic conditioning.",
    color: "bg-gray-50",
  },
  {
    icon: <Calendar className="h-10 w-10 text-red-600" />,
    title: "Personalized Programs",
    description:
      "Fully customized training and nutrition plans based on your goals, lifestyle, and assessment results.",
    color: "bg-red-50",
  },
  {
    icon: <ChefHat className="h-10 w-10 text-red-600" />,
    title: "Nutrition Coaching",
    description: "Science-based nutrition guidance to fuel performance, recovery, and body composition goals.",
    color: "bg-gray-50",
  },
]

export default function ServicesSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [100, -100])

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            TRAINING <span className="text-red-600">PHILOSOPHY & SERVICES</span>
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Coach Haley's approach combines science-backed training methods with personalized attention to help you
            achieve sustainable results.
          </p>
        </div>

        <div ref={containerRef} className="relative overflow-hidden">
          <motion.div
            style={{ y }}
            className="flex flex-nowrap overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar"
          >
            <div className="flex gap-6">
              {services.map((service, index) => (
                <div key={index} className="snap-center min-w-[300px] md:min-w-[350px] flex-shrink-0">
                  <div
                    className={`h-full rounded-2xl p-8 shadow-lg border border-gray-100 ${service.color} transition-transform hover:scale-105`}
                  >
                    <div className="mb-6">{service.icon}</div>
                    <h3 className="text-xl font-bold mb-4">{service.title}</h3>
                    <p className="text-gray-700 mb-6">{service.description}</p>
                    <Button
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white bg-transparent"
                    >
                      Learn More
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="absolute -bottom-2 left-0 right-0 flex justify-center gap-2 py-4">
            {services.map((_, index) => (
              <div key={index} className={`h-2 w-2 rounded-full ${index === 0 ? "bg-red-600" : "bg-gray-300"}`}></div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <Button className="bg-red-600 hover:bg-red-700 text-white rounded-full px-8 py-6 text-lg">
            View All Services
          </Button>
        </div>
      </div>
    </section>
  )
}
