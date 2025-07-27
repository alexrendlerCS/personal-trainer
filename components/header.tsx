"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLoginSignup = () => {
    router.push("/login");
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <a
          href="https://www.instagram.com/coachkilday/?hl=en"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center"
        >
          <span className="font-bold text-2xl text-red-600">COACH KILDAY</span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            href="/"
            className={`font-medium hover:text-red-600 transition-colors ${
              isScrolled ? "text-gray-800" : "text-white"
            }`}
          >
            Home
          </Link>
          <Link
            href="/about"
            className={`font-medium hover:text-red-600 transition-colors ${
              isScrolled ? "text-gray-800" : "text-white"
            }`}
          >
            About
          </Link>
          <Link
            href="/services"
            className={`font-medium hover:text-red-600 transition-colors ${
              isScrolled ? "text-gray-800" : "text-white"
            }`}
          >
            Services
          </Link>
          <Link
            href="/contact"
            className={`font-medium hover:text-red-600 transition-colors ${
              isScrolled ? "text-gray-800" : "text-white"
            }`}
          >
            Contact
          </Link>
          <Button
            onClick={handleLoginSignup}
            className="bg-red-600 hover:bg-red-700 text-white rounded-full px-6"
          >
            Login/Sign Up
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className={`md:hidden transition-colors duration-300 ${
            isScrolled ? "text-gray-800" : "text-white"
          }`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white absolute top-full left-0 right-0 shadow-lg">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <Link
              href="/"
              className="font-medium py-2 text-gray-800 hover:text-red-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/about"
              className="font-medium py-2 text-gray-800 hover:text-red-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/services"
              className="font-medium py-2 text-gray-800 hover:text-red-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Services
            </Link>
            <Link
              href="/contact"
              className="font-medium py-2 text-gray-800 hover:text-red-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <Button
              onClick={() => {
                handleLoginSignup();
                setMobileMenuOpen(false);
              }}
              className="bg-red-600 hover:bg-red-700 text-white rounded-full w-full"
            >
              Login/Sign Up
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
