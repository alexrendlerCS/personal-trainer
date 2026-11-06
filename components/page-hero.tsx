import Image from "next/image";
import type { ReactNode } from "react";
import { AnimatedHero } from "@/components/animated-hero";

interface PageHeroProps {
  /** Path in /public. */
  image: string;
  imageAlt: string;
  /** CSS object-position for the photo, e.g. "50% 20%". */
  imagePosition?: string;
  /** Headline. Wrap the accent phrase in <span className="text-red-600">. */
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  /** Shorter hero for utility pages (e.g. Contact). */
  compact?: boolean;
  /** Larger headline for the home page. */
  large?: boolean;
}

/** Shared button styles so every hero uses the same red / white-outline pair. */
export const heroPrimaryButton =
  "rounded-full bg-red-600 px-8 py-6 text-lg text-white shadow-lg shadow-red-950/30 hover:bg-red-700";
export const heroSecondaryButton =
  "rounded-full border-2 border-white bg-transparent px-8 py-6 text-lg text-white hover:bg-white hover:text-red-600";

/**
 * Shared hero for marketing pages: full-bleed photo, dark overlay,
 * centered white headline with a red accent phrase.
 */
export default function PageHero({
  image,
  imageAlt,
  imagePosition = "50% 30%",
  title,
  subtitle,
  children,
  compact = false,
  large = false,
}: PageHeroProps) {
  return (
    <section
      className={`relative isolate flex items-center justify-center overflow-hidden bg-gray-900 ${
        compact ? "min-h-[75svh]" : "min-h-[100svh]"
      }`}
    >
      <Image
        src={image}
        alt={imageAlt}
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover"
        style={{ objectPosition: imagePosition }}
      />
      {/* Even darkening plus a soft vignette so centered text stays legible */}
      <div className="absolute inset-0 -z-10 bg-black/55" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.45)_100%)]" />

      <div className="container mx-auto px-4 pb-20 pt-32 text-center">
        <AnimatedHero delay={0.1}>
          <h1
            className={`mx-auto max-w-5xl font-extrabold uppercase leading-[0.95] tracking-tight text-white ${
              large
                ? "text-5xl sm:text-6xl md:text-7xl lg:text-8xl"
                : "text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
            }`}
          >
            {title}
          </h1>
        </AnimatedHero>

        {(subtitle || children) && (
          <AnimatedHero delay={0.25}>
            {subtitle && (
              <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-white/90 md:text-2xl md:leading-relaxed">
                {subtitle}
              </p>
            )}
            {children && (
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                {children}
              </div>
            )}
          </AnimatedHero>
        )}
      </div>
    </section>
  );
}
