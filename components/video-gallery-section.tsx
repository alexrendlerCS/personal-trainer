"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [activeVideo, setActiveVideo] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const closeVideo = () => {
    setActiveVideo(null);
    triggerRef.current?.focus();
  };

  // Escape to close, lock page scroll, and move focus into the dialog.
  useEffect(() => {
    if (activeVideo === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeVideo();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [activeVideo]);

  const current = activeVideo !== null ? videos[activeVideo] : null;

  return (
    <section id="videos" className="bg-gray-50 py-24 dark:bg-gray-900 lg:py-32">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-gray-100 md:text-5xl">
          Video Gallery
        </h2>

        <ul className="mt-12 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
          {videos.map((video, index) => (
            <li key={video.src}>
              <button
                type="button"
                onClick={(e) => {
                  triggerRef.current = e.currentTarget;
                  setActiveVideo(index);
                }}
                className="group relative block aspect-[9/16] w-full overflow-hidden rounded-2xl bg-gray-900 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
                aria-label={`Play ${video.title} (${video.duration})`}
              >
                <img
                  src={video.thumbnail}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

                <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium tabular-nums text-white backdrop-blur-sm">
                  {video.duration}
                </span>

                <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-red-600 text-white shadow-lg shadow-black/30 transition-transform duration-200 group-hover:scale-110 motion-reduce:transition-none">
                  <Play className="ml-0.5 h-6 w-6 fill-current" aria-hidden="true" />
                </span>

                <span className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                  <span className="block text-lg font-bold leading-tight text-white md:text-xl">
                    {video.title}
                  </span>
                  <span className="mt-1.5 hidden text-sm leading-snug text-gray-300 sm:block">
                    {video.description}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={current.title}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={closeVideo}
        >
          <div
            className="relative flex w-full max-w-sm flex-col overflow-hidden rounded-2xl bg-gray-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              ref={closeRef}
              type="button"
              onClick={closeVideo}
              className="absolute right-3 top-3 z-10 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Close video"
            >
              <X className="h-5 w-5" />
            </button>

            <video
              key={current.src}
              src={current.src}
              poster={current.thumbnail}
              className="max-h-[70vh] w-full bg-black object-contain"
              controls
              autoPlay
              playsInline
            />

            <div className="flex items-end justify-between gap-4 p-5">
              <div>
                <h3 className="text-lg font-bold text-white">{current.title}</h3>
                <p className="mt-1 text-sm leading-snug text-gray-400">
                  {current.description}
                </p>
              </div>
              <Button
                asChild
                className="shrink-0 rounded-full bg-red-600 px-5 text-white hover:bg-red-700"
              >
                <Link href="/login">Book Session</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
