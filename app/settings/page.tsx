"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Settings, User, Bell, Palette, Save } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    theme: "light",
    notifications: true,
    defaultFocus: "",
    defaultLevel: "Beginner",
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    // Load user preferences
    fetchPreferences();
  }, [session, status, router]);

  const fetchPreferences = async () => {
    try {
      const response = await fetch("/api/user/preferences");
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error("Failed to load preferences:", error);
    }
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        // Show success message
        alert("Preferences saved successfully!");
      } else {
        alert("Failed to save preferences");
      }
    } catch (error) {
      alert("Failed to save preferences");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-6">
            <div className="flex items-center">
              <Settings className="w-8 h-8 text-black mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600 mt-1">Customize your learning experience</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Profile Settings */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex items-center">
                <User className="w-5 h-5 text-black mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={session.user?.name || ""}
                  disabled
                  placeholder={session.user?.name || "Name"}
                  title={session.user?.name || "Name"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Name is managed through your authentication provider
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={session.user?.email || ""}
                  disabled
                  placeholder={session.user?.email || "Email"}
                  title={session.user?.email || "Email"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Learning Preferences */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex items-center">
                <Settings className="w-5 h-5 text-black mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Learning Preferences</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Focus Area
                </label>
                <select
                  value={preferences.defaultFocus}
                  onChange={(e) => setPreferences({ ...preferences, defaultFocus: e.target.value })}
                  title="Default Focus Area"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="">Select a focus area</option>
                  <option value="AI & Machine Learning">AI & Machine Learning</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Cloud Engineering">Cloud Engineering</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Skill Level
                </label>
                <select
                  value={preferences.defaultLevel}
                  onChange={(e) => setPreferences({ ...preferences, defaultLevel: e.target.value })}
                  title="Default Skill Level"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex items-center">
                <Bell className="w-5 h-5 text-black mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Learning Reminders</h3>
                  <p className="text-sm text-gray-600">Receive notifications about your learning progress</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.notifications}
                    onChange={(e) => setPreferences({ ...preferences, notifications: e.target.checked })}
                    aria-label="Toggle learning reminders"
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-black/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex items-center">
                <Palette className="w-5 h-5 text-black mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Appearance</h2>
              </div>
            </div>
            <div className="p-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Theme
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="theme"
                      value="light"
                      checked={preferences.theme === "light"}
                      onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                      className="mr-2"
                    />
                    <span className="text-sm">Light</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="theme"
                      value="dark"
                      checked={preferences.theme === "dark"}
                      onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                      className="mr-2"
                    />
                    <span className="text-sm">Dark</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSavePreferences}
              disabled={isLoading}
              className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{isLoading ? "Saving..." : "Save Preferences"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}