import Link from "next/link";
import { Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t py-6 sm:py-8 mt-auto z-0 relative bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      <div className="container px-4 sm:px-6 lg:px-8 text-gray-800 dark:text-gray-200">
        {/* Mobile Layout */}
        <div className="flex flex-col space-y-6 sm:hidden">
          {/* Social Links - Mobile */}
          <div className="flex flex-col space-y-4">
            <Link
              href="https://www.instagram.com/coachkilday"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white transition-all duration-300 shadow-lg text-center"
            >
              <Instagram className="h-5 w-5 flex-shrink-0" />
              <span className="text-base font-medium">Follow on Instagram</span>
            </Link>
            <Link
              href="mailto:haley@coachkilday.com"
              className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300 shadow-lg text-center"
            >
              <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <span className="text-base font-medium">Email Coach Kilday</span>
            </Link>
            <Link
              href="/login"
              className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 text-white transition-all duration-300 shadow-lg text-center"
            >
              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-red-600 text-sm font-bold">K</span>
              </div>
              <span className="text-base font-medium">Create an Account</span>
            </Link>
          </div>

          {/* Legal Links - Mobile */}
          <nav className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/privacy"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors px-2 py-1"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors px-2 py-1"
            >
              Terms of Service
            </Link>
          </nav>

          {/* Copyright - Mobile */}
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © 2025 FitWeb Studios. All rights reserved.
            </p>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center justify-between gap-4">
          {/* Left Side - Copyright */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              © 2025 FitWeb Studios. All rights reserved.
            </p>
          </div>

          {/* Center - Social Links */}
          <div className="flex items-center space-x-3 md:space-x-4 lg:space-x-6 flex-wrap justify-center gap-y-2">
            <Link
              href="https://www.instagram.com/coachkilday"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-2 rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white transition-all duration-300 hover:scale-105 shadow-lg whitespace-nowrap"
            >
              <Instagram className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm font-medium">Follow on Instagram</span>
            </Link>
            <Link
              href="mailto:haley@coachkilday.com"
              className="flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300 hover:scale-105 shadow-lg whitespace-nowrap"
            >
              <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <span className="text-sm font-medium">Email Coach Kilday</span>
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-2 rounded-lg bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 text-white transition-all duration-300 hover:scale-105 shadow-lg whitespace-nowrap"
            >
              <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-red-600 text-xs font-bold">K</span>
              </div>
              <span className="text-sm font-medium">Create an Account</span>
            </Link>
          </div>

          {/* Right Side - Legal Links */}
          <nav className="flex gap-3 lg:gap-4 flex-shrink-0">
            <Link
              href="/privacy"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors whitespace-nowrap"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors whitespace-nowrap"
            >
              Terms of Service
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
