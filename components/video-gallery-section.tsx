"use client"

import { useRef, useState } from "react"
import { useInView } from "framer-motion"
import { Play, Pause, X } from "lucide-react"

const videos = [
  {
    thumbnail: "/placeholder.svg?height=400&width=600",
    title: "Perfect Deadlift Form",
    duration: "2:45",
    src: "/placeholder.svg?height=720&width=1280",
  },
  {
    thumbnail: "/placeholder.svg?height=400&width=600",
    title: "Squat Technique Masterclass",
    duration: "3:20",
    src: "/placeholder.svg?height=720&width=1280",
  },
  {
    thumbnail: "/placeholder.svg?height=400&width=600",
    title: "Essential Mobility Routine",
    duration: "4:10",
    src: "/placeholder.svg?height=720&width=1280",
  },
  {
    thumbnail: "/placeholder.svg?height=400&width=600",
    title: "Client Success Story",
    duration: "5:30",
    src: "/placeholder.svg?height=720&width=1280",
  },
]

export default function VideoGallerySection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, threshold: 0.2 })
  const [activeVideo, setActiveVideo] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const openVideo = (index: number) => {
    setActiveVideo(index)
    setIsPlaying(true)
  }

  const closeVideo = () => {
    setActiveVideo(null)
    setIsPlaying(false)
  }

  return (
    <section id="videos" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          VIDEO <span className="text-red-600">GALLERY</span>
        </h2>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {videos.map((video, index) => (
            <div
              key={index}
              className={`relative rounded-xl overflow-hidden shadow-lg cursor-pointer transform transition-all duration-500 ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
              onClick={() => openVideo(index)}
            >
              <div className="relative aspect-video">
                <img
                  src={video.thumbnail || "/placeholder.svg"}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center group-hover:bg-opacity-20 transition-all">
                  <div className="bg-red-600 rounded-full p-4 bg-opacity-90">
                    <Play className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-2 py-1 rounded-md text-sm">
                  {video.duration}
                </div>
              </div>
              <div className="p-4 bg-white">
                <h3 className="font-bold text-lg">{video.title}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Video Modal */}
        {activeVideo !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl">
              <button
                onClick={closeVideo}
                className="absolute -top-12 right-0 text-white hover:text-red-500"
                aria-label="Close video"
              >
                <X className="h-8 w-8" />
              </button>

              <div className="relative aspect-video bg-black">
                <img
                  src={videos[activeVideo].src || "/placeholder.svg"}
                  alt={videos[activeVideo].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="bg-red-600 bg-opacity-90 rounded-full p-4 hover:bg-opacity-100 transition-all"
                    aria-label={isPlaying ? "Pause video" : "Play video"}
                  >
                    {isPlaying ? <Pause className="h-8 w-8 text-white" /> : <Play className="h-8 w-8 text-white" />}
                  </button>
                </div>
              </div>

              <div className="bg-white p-4">
                <h3 className="font-bold text-xl">{videos[activeVideo].title}</h3>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
