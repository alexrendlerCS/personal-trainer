import Link from "next/link";
import { Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t py-6 mt-auto z-0 relative bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      <div className="container flex items-center justify-between px-4 text-gray-800 dark:text-gray-200">
        {/* Left Side - Copyright */}
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            © 2025 FitWeb Studios. All rights reserved.
          </p>
        </div>

        {/* Center - Social Links */}
        <div className="flex items-center space-x-3">
          <Link
            href="https://www.instagram.com/coachkilday"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <Instagram className="h-4 w-4" />
            <span className="text-sm font-medium">Follow on Instagram</span>
          </Link>
          <Link
            href="mailto:haley@coachkilday.com"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <span className="text-sm font-medium">Email Coach Kilday</span>
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 text-white transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
              <span className="text-red-600 text-xs font-bold">K</span>
            </div>
            <span className="text-sm font-medium">Create an Account</span>
          </Link>
        </div>

        {/* Right Side - Legal Links */}
        <nav className="flex gap-4">
          <Link
            href="/privacy"
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
          >
            Terms of Service
          </Link>
        </nav>
      </div>
    </footer>
  );
}
