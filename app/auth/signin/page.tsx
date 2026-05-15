"use client";

import { useState, useEffect } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

interface SavedUser {
  name: string;
  email: string;
}

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedUsers, setSavedUsers] = useState<SavedUser[]>([]);
  const router = useRouter();

  // Load saved users from localStorage on component mount
  useEffect(() => {
    const stored = localStorage.getItem("savedUsers");
    if (stored) {
      try {
        setSavedUsers(JSON.parse(stored));
      } catch (err) {
        console.error("Failed to parse saved users:", err);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        // Save user info to localStorage for future suggestions
        const existingUsers = savedUsers.filter((u) => u.email !== email);
        const updatedUsers = [{ name: email.split("@")[0], email }, ...existingUsers].slice(0, 5); // Keep last 5 users
        localStorage.setItem("savedUsers", JSON.stringify(updatedUsers));

        // Refresh session and redirect
        await getSession();
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fill email when user clicks on saved user
  const handleSelectUser = (selectedEmail: string) => {
    setEmail(selectedEmail);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground">Sign in to AI CourseCrafter</h2>
          <p className="mt-2 text-muted-foreground">Access your personalized learning dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-background p-8 rounded-2xl shadow-lg space-y-6 border border-border">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="your@email.com"
              required
            />
            
            {/* Saved Users Suggestions */}
            {savedUsers.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Quick login:</p>
                <div className="grid grid-cols-1 gap-2">
                  {savedUsers.map((user) => (
                    <button
                      key={user.email}
                      type="button"
                      onClick={() => handleSelectUser(user.email)}
                      className="text-left px-3 py-2 bg-background hover:bg-gray-100 border border-border rounded-lg transition-colors"
                    >
                      <p className="text-sm font-medium text-foreground">{user.name || "User"}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>

          <div className="text-center">
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-foreground hover:text-muted-foreground font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}