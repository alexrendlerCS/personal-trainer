import Link from "next/link";
import { Instagram, Facebook, Youtube, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-red-500">COACH HALEY</h3>
            <p className="text-gray-400">
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

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#about" className="text-gray-400 hover:text-white">
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="#services"
                  className="text-gray-400 hover:text-white"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="#results"
                  className="text-gray-400 hover:text-white"
                >
                  Results
                </Link>
              </li>
              <li>
                <Link href="#videos" className="text-gray-400 hover:text-white">
                  Videos
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  1:1 Coaching
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Group Training
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Online Programs
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Nutrition Plans
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-gray-400">Life Time Thornton</li>
              <li className="text-gray-400">
                397 W 148th Ave, Thornton, CO 80023
              </li>
              <li>
                <Link
                  href="mailto:haley@coachkilday.com"
                  className="text-gray-400 hover:text-white"
                >
                  haley@coachkilday.com
                </Link>
              </li>
              <li>
                <Link
                  href="tel:+17209792808"
                  className="text-gray-400 hover:text-white"
                >
                  (720) 979-2808
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Coach Haley Kilday. All rights
            reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="#" className="text-gray-500 hover:text-white text-sm">
              Privacy Policy
            </Link>
            <Link href="#" className="text-gray-500 hover:text-white text-sm">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
