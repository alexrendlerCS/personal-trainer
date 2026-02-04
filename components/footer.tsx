import Link from "next/link";
import { Instagram, Facebook, Youtube, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-4">
            <h3 className="text-xl font-bold text-red-500">COACH HALEY</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Transforming bodies and minds through science-backed training and
              unwavering accountability.
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://www.instagram.com/coachkilday"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link
                href="mailto:haley@coachkilday.com"
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span className="sr-only">Email</span>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#about" className="text-gray-400 hover:text-white text-sm transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="#services"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="#results"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Results
                </Link>
              </li>
              <li>
                <Link href="#videos" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Videos
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  1:1 Coaching
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Group Training
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Online Programs
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Nutrition Plans
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact</h3>
            <ul className="space-y-2">
              <li className="text-gray-400 text-sm">Life Time Thornton</li>
              <li className="text-gray-400 text-sm leading-relaxed">
                397 W 148th Ave, Thornton, CO 80023
              </li>
              <li>
                <Link
                  href="mailto:haley@coachkilday.com"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  haley@coachkilday.com
                </Link>
              </li>
              <li>
                <Link
                  href="tel:+17209792808"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  (720) 979-2808
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-800 mt-8 lg:mt-12 pt-6 lg:pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs sm:text-sm text-center sm:text-left">
            &copy; {new Date().getFullYear()} Coach Haley Kilday. All rights
            reserved.
          </p>
          <div className="flex flex-wrap justify-center sm:justify-end gap-4 sm:gap-6">
            <Link href="#" className="text-gray-500 hover:text-white text-xs sm:text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-gray-500 hover:text-white text-xs sm:text-sm transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
