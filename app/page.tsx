import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import AboutPreview from "@/components/about-preview";
import ServicesPreview from "@/components/services-preview";
import TestimonialsSection from "@/components/testimonials-section";
import VideoGallerySection from "@/components/video-gallery-section";
import ContactPreview from "@/components/contact-preview";
import CtaSection from "@/components/cta-section";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      <main>
        <HeroSection />
        <AboutPreview />
        <ServicesPreview />
        <TestimonialsSection />
        <VideoGallerySection />
        <ContactPreview />
        <CtaSection />
      </main>
    </div>
  );
}
