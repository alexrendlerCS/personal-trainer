"use client";

import { useState, useRef, useEffect } from "react";
import { PlayCircle, Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Video {
  id: string;
  src: string;
  thumbnail: string;
  title: string;
  description: string;
}

const videos: Video[] = [
  {
    id: "video1",
    src: "/videos/video1.mov",
    thumbnail: "/videos/video1-thumbnail.png",
    title: "Full Body Workout",
    description:
      "Complete strength training session targeting all major muscle groups",
  },
  {
    id: "video2",
    src: "/videos/video2.mov",
    thumbnail: "/videos/video2-thumbnail.png",
    title: "Cardio Training",
    description: "High-intensity cardio workout for maximum calorie burn",
  },
  {
    id: "video3",
    src: "/videos/video3.mov",
    thumbnail: "/videos/video3-thumbnail.png",
    title: "Mobility & Flexibility",
    description: "Improve your range of motion and prevent injuries",
  },
  {
    id: "video4",
    src: "/videos/video4.mov",
    thumbnail: "/videos/video4-thumbnail.png",
    title: "Core Strength",
    description: "Build a strong foundation with targeted core exercises",
  },
];

const LazyVideoCard = ({ video }: { video: Video }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Load video when in view
  useEffect(() => {
    if (isInView && videoRef.current) {
      videoRef.current.src = video.src;
      setIsLoaded(true);
    }
  }, [isInView, video.src]);

  const handlePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleMuteToggle = () => {
    if (!videoRef.current) return;

    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  const handleVideoClick = () => {
    handlePlayPause();
  };

  return (
    <div
      ref={containerRef}
      className="group relative bg-white rounded-2xl shadow-lg overflow-hidden"
    >
      <div className="relative aspect-video">
        {isLoaded ? (
          <video
            ref={videoRef}
            className="w-full h-full object-cover cursor-pointer"
            onClick={handleVideoClick}
            onEnded={handleVideoEnded}
            muted={isMuted}
            playsInline
          />
        ) : (
          <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-400">Loading...</div>
          </div>
        )}

        {/* Thumbnail overlay when not playing */}
        {!isPlaying && isLoaded && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <PlayCircle className="h-16 w-16 text-white opacity-80" />
          </div>
        )}

        {/* Video controls overlay */}
        {isPlaying && (
          <div className="absolute bottom-4 right-4 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleMuteToggle}
              className="bg-black bg-opacity-50 text-white hover:bg-opacity-70"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}

        {/* Play/Pause button overlay */}
        {isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="lg"
              variant="secondary"
              onClick={handlePlayPause}
              className="bg-black bg-opacity-50 text-white hover:bg-opacity-70"
            >
              {isPlaying ? (
                <Pause className="h-8 w-8" />
              ) : (
                <PlayCircle className="h-8 w-8" />
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{video.title}</h3>
        <p className="text-gray-600 text-sm">{video.description}</p>
      </div>
    </div>
  );
};

export default function VideoGallery() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            TRAINING <span className="text-red-600">VIDEOS</span>
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Watch Coach Haley demonstrate proper form and technique for
            effective workouts. Click on any video to start learning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {videos.map((video) => (
            <LazyVideoCard key={video.id} video={video} />
          ))}
        </div>
      </div>
    </section>
  );
}
