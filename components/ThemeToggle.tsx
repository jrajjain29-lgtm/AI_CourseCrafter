"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme-context";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="group relative inline-flex h-10 w-[4.75rem] items-center rounded-full border border-border bg-background px-1 shadow-sm transition-colors duration-200 hover:shadow-md"
    >
      <span
        className={`absolute inset-y-1 left-1 w-8 rounded-full bg-black transition-transform duration-300 ease-out ${
          theme === "dark" ? "translate-x-0" : "translate-x-[0.5rem]"
        }`}
      />
      <Sun
        className={`relative z-10 ml-1 h-4 w-4 transition-colors duration-200 ${
          theme === "light" ? "text-white" : "text-muted-foreground"
        }`}
      />
      <Moon
        className={`relative z-10 ml-auto mr-1 h-4 w-4 transition-colors duration-200 ${
          theme === "dark" ? "text-white" : "text-muted-foreground"
        }`}
      />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}