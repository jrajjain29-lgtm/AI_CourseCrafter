"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  BookOpen,
  Bookmark,
  Activity,
  Settings,
  Plus,
  Calendar,
  TrendingUp,
  Award,
  Clock,
  Target,
  Flame,
  Trophy,
  Star,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";

type Course = {
  id: string;
  title: string;
  focus: string;
  level: string;
  goals: string;
  isSaved: boolean;
  progress: number;
  isCompleted: boolean;
  completedAt?: string | Date | null;
  createdAt: string | Date;
};

type Activity = {
  id: string;
  type: string;
  description: string;
  createdAt: string | Date;
};

type UserPreferences = {
  theme: string;
  notifications: boolean;
  defaultFocus?: string | null;
  defaultLevel: string;
} | null;

type Stats = {
  totalCourses: number;
  savedCourses: number;
  learningStreak: number;
  currentStreak: number;
  longestStreak: number;
  activeDaysCount: number;
  completionRate: number;
  averageProgress: number;
  completedThisMonth: number;
  mostActiveFocus: string;
  recentActivity: string | Date | null;
};

type ActivityDay = string;

export default function DashboardClient({
  user,
  courses,
  activities,
  preferences,
  stats,
  activityDays,
}: {
  user: any;
  courses: Course[];
  activities: Activity[];
  preferences: UserPreferences;
  stats: Stats;
  activityDays: ActivityDay[];
}) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("overview");

  const activitySet = new Set(activityDays);

  const getProgressWidthClass = (value: number) => {
    if (value <= 0) return "w-0";
    if (value <= 10) return "w-1/12";
    if (value <= 20) return "w-1/6";
    if (value <= 30) return "w-1/4";
    if (value <= 40) return "w-1/3";
    if (value <= 50) return "w-5/12";
    if (value <= 60) return "w-1/2";
    if (value <= 70) return "w-7/12";
    if (value <= 80) return "w-2/3";
    if (value <= 90) return "w-5/6";
    return "w-full";
  };

  const heatmapDays = (() => {
    const days: Array<{ date: string; intensity: number }> = [];
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate());
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (13 * 7 - 1));

    for (let i = 0; i < 13 * 7; i += 1) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const key = date.toISOString().slice(0, 10);
      days.push({ date: key, intensity: activitySet.has(key) ? 1 : 0 });
    }

    return days;
  })();

  const weekColumns = Array.from({ length: 13 }, (_, weekIndex) =>
    heatmapDays.slice(weekIndex * 7, weekIndex * 7 + 7)
  );

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "course_generated":
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      case "course_saved":
        return <Bookmark className="w-4 h-4 text-green-600" />;
      case "account_created":
        return <Award className="w-4 h-4 text-purple-600" />;
      default:
        return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-background shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                ← Back to Home
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Welcome back, {user.name || "Learner"}!
                </h1>
                <p className="text-muted-foreground mt-1">
                  Track your learning progress and manage your courses
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link
                href="/#course-generator"
                className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Generate New Course</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Overview */}
        <div className="bg-background rounded-xl shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Learning Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-muted-foreground">Course Completion</span>
                <span className="text-sm text-muted-foreground">{stats.completionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className={`bg-gradient-to-r from-black to-gray-700 h-3 rounded-full transition-all duration-500 ${getProgressWidthClass(stats.completionRate)}`} />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-muted-foreground">Learning Consistency</span>
                <span className="text-sm text-muted-foreground">{Math.min(stats.learningStreak * 10, 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className={`bg-gradient-to-r from-gray-700 to-black h-3 rounded-full transition-all duration-500 ${getProgressWidthClass(Math.min(stats.learningStreak * 10, 100))}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-background rounded-xl shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Achievements</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg border-2 text-center ${stats.totalCourses >= 1 ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-gray-50'}`}>
              <Trophy className={`w-8 h-8 mx-auto mb-2 ${stats.totalCourses >= 1 ? 'text-yellow-600' : 'text-gray-400'}`} />
              <h3 className="font-medium text-sm">First Course</h3>
              <p className="text-xs text-muted-foreground">Generate your first course</p>
            </div>
            <div className={`p-4 rounded-lg border-2 text-center ${stats.savedCourses >= 3 ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
              <Bookmark className={`w-8 h-8 mx-auto mb-2 ${stats.savedCourses >= 3 ? 'text-blue-600' : 'text-gray-400'}`} />
              <h3 className="font-medium text-sm">Course Collector</h3>
              <p className="text-xs text-muted-foreground">Save 3 courses</p>
            </div>
            <div className={`p-4 rounded-lg border-2 text-center ${stats.learningStreak >= 7 ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-gray-50'}`}>
              <Flame className={`w-8 h-8 mx-auto mb-2 ${stats.learningStreak >= 7 ? 'text-orange-600' : 'text-gray-400'}`} />
              <h3 className="font-medium text-sm">Week Warrior</h3>
              <p className="text-xs text-muted-foreground">7-day learning streak</p>
            </div>
            <div className={`p-4 rounded-lg border-2 text-center ${stats.completionRate >= 80 ? 'border-purple-300 bg-purple-50' : 'border-gray-200 bg-gray-50'}`}>
              <Star className={`w-8 h-8 mx-auto mb-2 ${stats.completionRate >= 80 ? 'text-purple-600' : 'text-gray-400'}`} />
              <h3 className="font-medium text-sm">Completion Master</h3>
              <p className="text-xs text-muted-foreground">80% completion rate</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <div className="bg-background p-4 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">Total Courses</p>
                <p className="text-xl font-bold text-foreground">{stats.totalCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-background p-4 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Bookmark className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">Saved Courses</p>
                <p className="text-xl font-bold text-foreground">{stats.savedCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-background p-4 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Flame className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">Streak</p>
                <p className="text-xl font-bold text-foreground">{stats.learningStreak}d</p>
              </div>
            </div>
          </div>

          <div className="bg-background p-4 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Target className="w-5 h-5 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">Completion</p>
                <p className="text-xl font-bold text-foreground">{stats.completionRate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-background p-4 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">Avg Progress</p>
                <p className="text-xl font-bold text-foreground">{stats.averageProgress}%</p>
              </div>
            </div>
          </div>

          <div className="bg-background p-4 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Award className="w-5 h-5 text-pink-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">This Month</p>
                <p className="text-xl font-bold text-foreground">{stats.completedThisMonth}</p>
              </div>
            </div>
          </div>

          <div className="bg-background p-4 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-teal-100 rounded-lg">
                <Star className="w-5 h-5 text-teal-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">Focus Area</p>
                <p className="text-sm font-bold text-foreground truncate">{stats.mostActiveFocus}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Streak Calendar */}
        <div className="bg-background rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Learning Streak</h2>
              <p className="text-muted-foreground mt-1">
                Your consistent learning days, shown like a GitHub/LeetCode calendar.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-lg border bg-gray-50 px-4 py-3">
                <p className="text-muted-foreground">Current streak</p>
                <p className="text-lg font-semibold text-foreground">{stats.currentStreak}d</p>
              </div>
              <div className="rounded-lg border bg-gray-50 px-4 py-3">
                <p className="text-muted-foreground">Longest streak</p>
                <p className="text-lg font-semibold text-foreground">{stats.longestStreak}d</p>
              </div>
              <div className="rounded-lg border bg-gray-50 px-4 py-3">
                <p className="text-muted-foreground">Active days</p>
                <p className="text-lg font-semibold text-foreground">{stats.activeDaysCount}</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="min-w-[780px]">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3 px-1">
                <span>Less</span>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-200" />
                  <span className="w-3 h-3 rounded-sm bg-gray-300" />
                  <span className="w-3 h-3 rounded-sm bg-gray-500" />
                  <span className="w-3 h-3 rounded-sm bg-black" />
                </div>
                <span>More</span>
              </div>

              <div className="flex gap-2">
                {weekColumns.map((week, weekIndex) => (
                  <div key={weekIndex} className="grid grid-rows-7 gap-2">
                    {week.map((day) => (
                      <div
                        key={day.date}
                        title={`${day.date}${activitySet.has(day.date) ? ' - active' : ''}`}
                        className={`w-4 h-4 rounded-sm border border-gray-200 ${
                          day.intensity > 0 ? 'bg-black' : 'bg-gray-100'
                        }`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Courses */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-foreground">Recent Courses</h2>
                <p className="text-muted-foreground mt-1">Your latest generated learning paths</p>
              </div>
              <div className="p-6">
                {courses.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No courses yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Generate your first personalized course to get started
                    </p>
                    <Link
                      href="/#course-generator"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                    >
                      Generate Course
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {courses.map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground">{course.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {course.focus} • {course.level} • {formatDate(course.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {course.isSaved && (
                            <Bookmark className="w-4 h-4 text-green-600" />
                          )}
                          <Link
                            href={`/course/${course.id}`}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
                <p className="text-muted-foreground mt-1">Your learning journey</p>
              </div>
              <div className="p-6">
                {activities.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-muted-foreground">No activity yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activities.slice(0, 10).map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-500">{formatDate(activity.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border mt-6">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-3">
                <Link
                  href="/#course-generator"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-foreground">Generate New Course</span>
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Settings className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium text-foreground">Settings</span>
                </Link>
                <button className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors w-full text-left">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-foreground">View Learning Plan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}