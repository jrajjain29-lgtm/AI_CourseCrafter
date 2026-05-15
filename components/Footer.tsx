"use client";

import Link from "next/link";
import { Mail, Share2, Heart, Users } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black dark:bg-gray-950 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Footer Top */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Vision */}
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <span className="text-2xl font-black text-white">
                AI CourseCrafter
              </span>
            </Link>
            <p className="text-sm text-gray-300 font-400 leading-relaxed">
              Personalized AI powered learning for the next generation of tech professionals
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-700 text-white mb-4 text-sm">Product</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="#features" className="text-gray-300 hover:text-white transition-colors font-400">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white transition-colors font-400">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#testimonials" className="text-gray-300 hover:text-white transition-colors font-400">
                  Testimonials
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white transition-colors font-400">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-700 text-white mb-4 text-sm">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="#" className="text-gray-300 hover:text-white transition-colors font-400">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white transition-colors font-400">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white transition-colors font-400">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white transition-colors font-400">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-700 text-white mb-4 text-sm">Legal</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="#" className="text-gray-300 hover:text-white transition-colors font-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white transition-colors font-400">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white transition-colors font-400">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-8" />

        {/* Footer Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-300 font-400">
            © {currentYear} AI CourseCrafter. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex gap-4">
            <Link
              href="#"
              className="text-gray-300 hover:text-white transition-all hover:scale-110"
              aria-label="Social"
            >
              <Share2 size={20} />
            </Link>
            <Link
              href="#"
              className="text-gray-300 hover:text-white transition-all hover:scale-110"
              aria-label="Social"
            >
              <Heart size={20} />
            </Link>
            <Link
              href="#"
              className="text-gray-300 hover:text-white transition-all hover:scale-110"
              aria-label="Community"
            >
              <Users size={20} />
            </Link>
            <Link
              href="#"
              className="text-slate-400 hover:text-cyan-400 transition-all hover:scale-110"
              aria-label="Email"
            >
              <Mail size={20} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
