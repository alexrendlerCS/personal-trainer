import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHero, { heroPrimaryButton, heroSecondaryButton } from "./page-hero";

export default function HeroSection() {
  return (
    <PageHero
      large
      image="/deadlift.JPG"
      imageAlt="Coach Haley Kilday setting up a barbell deadlift"
      imagePosition="50% 30%"
      title={
        <>
          Coach Kilday <span className="text-red-600">Personal Training</span>
        </>
      }
      subtitle="Transform your fitness journey in Thornton, Colorado. Personalized training to help you break through plateaus and reach your next level"
    >
      <Button asChild className={heroPrimaryButton}>
        <Link href="/login">
          Login/Sign Up <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </Button>
      <Button asChild variant="outline" className={heroSecondaryButton}>
        <Link href="/services">Learn More</Link>
      </Button>
    </PageHero>
  );
}
