"use client";

import { useRef, useState } from "react";
import { useInView } from "framer-motion";
import { Play, Pause, X } from "lucide-react";

const videos = [
  {
    thumbnail: "/videos/video1-thumbnail.png",
    title: "Full Body Workout",
    duration: "20s",
    src: "/videos/video1.mov",
    description:
      "Complete strength training session targeting all major muscle groups",
  },
  {
    thumbnail: "/videos/video2-thumbnail.png",
    title: "Cardio Training",
    duration: "26s",
    src: "/videos/video2.mov",
    description: "High-intensity cardio workout for maximum calorie burn",
  },
  {
    thumbnail: "/videos/video3-thumbnail.png",
    title: "Mobility & Flexibility",
    duration: "41s",
    src: "/videos/video3.mov",
    description: "Improve your range of motion and prevent injuries",
  },
  {
    thumbnail: "/videos/video4-thumbnail.png",
    title: "Core Strength",
    duration: "46s",
    src: "/videos/video4.mov",
    description: "Build a strong foundation with targeted core exercises",
  },
];

export default function VideoGallerySection() {
  const ref = useRef(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(ref, { once: true });
  const [activeVideo, setActiveVideo] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const openVideo = (index: number) => {
    setActiveVideo(index);
    setIsPlaying(true);
  };

  const closeVideo = () => {
    setActiveVideo(null);
    setIsPlaying(false);
  };

  return (
    <section
      id="videos"
      className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950"
    >
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 dark:text-gray-100">
          VIDEO <span className="text-red-600">GALLERY</span>
        </h2>

        <div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
        >
          {videos.map((video, index) => (
            <div
              key={index}
              className={`relative rounded-xl overflow-hidden shadow-lg cursor-pointer transform transition-all duration-500 ${
                isInView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-20"
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
                {/* Red to transparent gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-red-600/60 via-red-600/20 to-transparent"></div>

                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center group-hover:bg-opacity-20 transition-all">
                  <div className="bg-red-600 rounded-full p-4 bg-opacity-90">
                    <Play className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-2 py-1 rounded-md text-sm">
                  {video.duration}
                </div>
              </div>
              <div className="p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-gray-800 dark:text-gray-100 mb-2">
                      {video.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      {video.description}
                    </p>
                  </div>
                  <div className="ml-4 flex flex-col items-center">
                    <div className="bg-red-100 rounded-full p-2 mb-1">
                      <Play className="h-4 w-4 text-red-600" />
                    </div>
                    <span className="text-xs text-gray-500 font-medium">
                      {video.duration}
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center space-x-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Training
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Form Guide
                    </span>
                  </div>

                  <button className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors duration-200">
                    Watch Now →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Video Modal */}
        {activeVideo !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-100">
              {/* Header with close button */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-600 to-red-700">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>

                {/* Center title */}
                <div className="absolute left-1/2 transform -translate-x-1/2">
                  <h3 className="text-white font-bold text-lg tracking-wide">
                    COACH KILDAY
                  </h3>
                </div>

                <button
                  onClick={closeVideo}
                  className="text-white hover:text-red-200 transition-colors duration-200 p-2 rounded-full hover:bg-white hover:bg-opacity-20"
                  aria-label="Close video"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Video Container */}
              <div className="relative aspect-video bg-black">
                <video
                  ref={videoRef}
                  src={videos[activeVideo].src}
                  className="w-full h-full object-cover"
                  controls
                  autoPlay={isPlaying}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                />

                {/* Video overlay with play button when paused */}
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-red-600 hover:bg-red-700 rounded-full p-4 transition-all duration-200 hover:scale-110 cursor-pointer">
                      <Play className="h-12 w-12 text-white" />
                    </div>
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-900">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-red-600 mb-3">
                      {videos[activeVideo].title}
                    </h3>
                    <p className="text-gray-300 text-base leading-relaxed">
                      {videos[activeVideo].description}
                    </p>
                  </div>
                  <div className="ml-4 flex flex-col items-center">
                    <div className="bg-red-100 rounded-full p-2 mb-2">
                      <Play className="h-6 w-6 text-red-600" />
                    </div>
                    <span className="text-sm text-gray-500 font-medium">
                      {videos[activeVideo].duration}
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors duration-200">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      <span className="text-sm font-medium">
                        Training Video
                      </span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors duration-200">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-sm font-medium">Form Guide</span>
                    </button>
                  </div>

                  <button
                    onClick={() => window.open("/login", "_blank")}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-medium transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                  >
                    Book Session
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
