// "use client"

// import { useState, useEffect } from "react"
// import Image from "next/image"
// import { ChevronLeft, ChevronRight, Star } from "lucide-react"

// const testimonials = [
//   {
//     name: "Sarah Johnson",
//     role: "Client - 8 months",
//     image: "/placeholder.svg?height=200&width=200",
//     quote:
//       "Coach Haley completely transformed my approach to fitness. I've lost 30 pounds and gained so much strength and confidence. Her program is challenging but sustainable.",
//     stars: 5,
//     before: "/placeholder.svg?height=400&width=300",
//     after: "/placeholder.svg?height=400&width=300",
//   },
//   {
//     name: "Michael Chen",
//     role: "Client - 1 year",
//     image: "/placeholder.svg?height=200&width=200",
//     quote:
//       "After hitting a plateau for years, Haley's strength program helped me break through. I've added 50 pounds to my deadlift and finally achieved the physique I've been working toward.",
//     stars: 5,
//     before: "/placeholder.svg?height=400&width=300",
//     after: "/placeholder.svg?height=400&width=300",
//   },
//   {
//     name: "Taylor Rodriguez",
//     role: "Client - 6 months",
//     image: "/placeholder.svg?height=200&width=200",
//     quote:
//       "Coach Haley's nutrition guidance alongside her training program was exactly what I needed. I've completely changed my relationship with food while getting stronger than ever.",
//     stars: 5,
//     before: "/placeholder.svg?height=400&width=300",
//     after: "/placeholder.svg?height=400&width=300",
//   },
// ]

// export default function TestimonialsSection() {
//   const [current, setCurrent] = useState(0)
//   const [autoplay, setAutoplay] = useState(true)

//   useEffect(() => {
//     if (!autoplay) return

//     const interval = setInterval(() => {
//       setCurrent((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))
//     }, 5000)

//     return () => clearInterval(interval)
//   }, [autoplay])

//   const next = () => {
//     setAutoplay(false)
//     setCurrent((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))
//   }

//   const prev = () => {
//     setAutoplay(false)
//     setCurrent((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))
//   }

//   return (
//     <section id="results" className="py-20 bg-white">
//       <div className="container mx-auto px-4">
//         <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
//           CLIENT <span className="text-red-600">RESULTS</span>
//         </h2>

//         <div className="relative max-w-5xl mx-auto">
//           {/* Testimonial Carousel */}
//           <div className="overflow-hidden">
//             <div
//               className="flex transition-transform duration-500 ease-in-out"
//               style={{ transform: `translateX(-${current * 100}%)` }}
//             >
//               {testimonials.map((testimonial, index) => (
//                 <div key={index} className="w-full flex-shrink-0">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
//                     <div className="space-y-6">
//                       <div className="flex items-center space-x-4">
//                         <div className="relative w-16 h-16 rounded-full overflow-hidden">
//                           <Image
//                             src={testimonial.image || "/placeholder.svg"}
//                             alt={testimonial.name}
//                             fill
//                             className="object-cover"
//                           />
//                         </div>
//                         <div>
//                           <h3 className="font-bold text-xl">{testimonial.name}</h3>
//                           <p className="text-gray-600">{testimonial.role}</p>
//                         </div>
//                       </div>

//                       <div className="flex">
//                         {[...Array(testimonial.stars)].map((_, i) => (
//                           <Star key={i} className="h-5 w-5 fill-red-600 text-red-600" />
//                         ))}
//                       </div>

//                       <blockquote className="text-lg italic text-gray-700">"{testimonial.quote}"</blockquote>
//                     </div>

//                     <div className="flex gap-4 justify-center">
//                       <div className="relative">
//                         <div className="relative w-36 h-64 md:w-40 md:h-72 rounded-lg overflow-hidden">
//                           <Image
//                             src={testimonial.before || "/placeholder.svg"}
//                             alt="Before transformation"
//                             fill
//                             className="object-cover"
//                           />
//                           <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-center py-1 text-sm">
//                             BEFORE
//                           </div>
//                         </div>
//                       </div>

//                       <div className="relative">
//                         <div className="relative w-36 h-64 md:w-40 md:h-72 rounded-lg overflow-hidden">
//                           <div className="absolute bottom-0 left-0 right-0 bg-red-600 text-white text-center py-1 text-sm">
//                             AFTER
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Navigation Buttons */}
//           <button
//             onClick={prev}
//             className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-4 md:-translate-x-12 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
//             aria-label="Previous testimonial"
//           >
//             <ChevronLeft className="h-6 w-6 text-gray-800" />
//           </button>

//           <button
//             onClick={next}
//             className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-4 md:translate-x-12 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
//             aria-label="Next testimonial"
//           >
//             <ChevronRight className="h-6 w-6 text-gray-800" />
//           </button>

//           {/* Indicators */}
//           <div className="flex justify-center mt-8 gap-2">
//             {testimonials.map((_, index) => (
//               <button
//                 key={index}
//                 onClick={() => {
//                   setAutoplay(false)
//                   setCurrent(index)
//                 }}
//                 className={`h-3 w-3 rounded-full ${current === index ? "bg-red-600" : "bg-gray-300"}`}
//                 aria-label={`Go to testimonial ${index + 1}`}
//               ></button>
//             ))}
//           </div>
//         </div>
//       </div>
//     </section>
//   )
// }

// Temporarily commented out until we get real client testimonials and results
export default function TestimonialsSection() {
  return null;
}
