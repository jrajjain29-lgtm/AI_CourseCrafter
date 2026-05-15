"use client";

import Link from "next/link";
import { NAV_ITEMS } from "@/lib/constants";
import { useState, useEffect } from "react";
import { Menu, X, User, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToCourseGenerator = () => {
    const element = document.getElementById('course-generator');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <nav
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur shadow-lg border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-black dark:text-white">
              AI CourseCrafter
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-800 hover:text-black dark:text-gray-200 dark:hover:text-white transition-colors font-500 text-sm tracking-wide"
              >
                {item.label}
              </Link>
            ))}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Login Status Icon - Upper Right Corner */}
            {status === "loading" ? (
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="relative group">
                  <div className="w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center cursor-pointer hover:shadow-lg transition-all duration-200">
                    <User size={20} className="text-white dark:text-black" />
                  </div>
                  {/* Tooltip */}
                  <div className="absolute top-full right-0 mt-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                    Go to Dashboard
                    <div className="absolute top-0 right-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900 dark:border-b-gray-100 transform -translate-y-1"></div>
                  </div>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 text-gray-800 hover:text-black dark:text-gray-200 dark:hover:text-white transition-colors font-500 text-sm"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/signin"
                  className="text-slate-700 hover:text-black transition-colors font-500 text-sm"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="gradient-button bg-black text-white px-6 py-2.5 rounded-full font-600 text-sm shadow-lg hover:shadow-2xl"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden bg-background border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2 rounded-md text-muted-foreground hover:bg-gray-100 hover:text-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {/* Theme Toggle for Mobile */}
              <div className="px-3 py-2 border-t border-border mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Theme</span>
                  <ThemeToggle />
                </div>
              </div>

              {status === "loading" ? (
                <div className="px-3 py-2">
                  <div className="w-full h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              ) : session ? (
                <>
                  {/* Login Status Icon for Mobile - Clickable to Dashboard */}
                  <Link href="/dashboard" onClick={() => setIsOpen(false)} className="block px-3 py-3 border-b border-gray-200 mb-2 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                        <User size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {session.user?.name || "User"}
                        </p>
                        <p className="text-xs text-gray-500">
                          Tap to go to Dashboard
                        </p>
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleSignOut();
                    }}
                    className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded-md text-gray-700 hover:bg-red-50 hover:text-red-600"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-black"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block mx-3 my-2 bg-black text-white px-4 py-2 rounded-full text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
