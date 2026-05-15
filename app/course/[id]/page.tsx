"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bookmark, Share2, Download, CheckCircle } from "lucide-react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

type CourseData = {
  id: string;
  title: string;
  focus: string;
  level: string;
  goals: string;
  modules: any[];
  roadmap: any[];
  youtubeLinks: any[];
  recommendedCourses: any[];
  isSaved: boolean;
  progress: number;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
};

export default function CourseView({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [updatingProgress, setUpdatingProgress] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    fetchCourse();
  }, [session, status, params.id, router]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setCourse(data);
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Failed to fetch course:", error);
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCourse = async () => {
    if (!course) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/courses/${course.id}/save`, {
        method: "POST",
      });

      if (response.ok) {
        setCourse({ ...course, isSaved: !course.isSaved });
      }
    } catch (error) {
      console.error("Failed to save course:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShareCourse = () => {
    if (navigator.share && course) {
      navigator.share({
        title: course.title,
        text: `Check out my ${course.focus} learning path!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Course link copied to clipboard!");
    }
  };

  const handleExportCourse = () => {
    if (!course) return;

    const courseData = {
      title: course.title,
      focus: course.focus,
      level: course.level,
      goals: course.goals,
      generatedAt: course.createdAt,
      progress: course.progress,
      isCompleted: course.isCompleted,
      modules: course.modules,
      roadmap: course.roadmap,
      youtubeLinks: course.youtubeLinks,
      recommendedCourses: course.recommendedCourses,
    };

    const dataStr = JSON.stringify(courseData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `${course.focus.toLowerCase().replace(/\s+/g, '-')}-course-${Date.now()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleProgressUpdate = async (newProgress: number) => {
    if (!course) return;

    setUpdatingProgress(true);
    try {
      const isCompleted = newProgress >= 100;
      const response = await fetch(`/api/courses/${course.id}/progress`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          progress: newProgress,
          isCompleted,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCourse({
          ...course,
          progress: data.progress,
          isCompleted: data.isCompleted,
          completedAt: data.completedAt,
        });
      }
    } catch (error) {
      console.error("Failed to update progress:", error);
    } finally {
      setUpdatingProgress(false);
    }
  };

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

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h2>
          <Link
            href="/dashboard"
            className="text-black hover:text-gray-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSaveCourse}
                disabled={isSaving}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  course.isSaved
                    ? "bg-gray-100 text-black border border-gray-200"
                    : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                }`}
              >
                <Bookmark size={16} className={course.isSaved ? "fill-current" : ""} />
                {isSaving ? "Saving..." : course.isSaved ? "Saved" : "Save"}
              </button>
              <button
                onClick={handleShareCourse}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-all"
              >
                <Share2 size={16} />
                Share
              </button>
              <button
                onClick={handleExportCourse}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-all"
              >
                <Download size={16} />
                Export
              </button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Header */}
        <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="px-3 py-1 bg-gray-100 text-black rounded-full">
                  {course.focus}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                  {course.level}
                </span>
                <span className="text-gray-500">
                  Generated {new Date(course.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Learning Goals</h3>
            <p className="text-gray-700">{course.goals}</p>
          </div>
        </div>

        {/* Progress Tracking */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Progress Tracking</h2>
            {course.isCompleted && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                ✓ Completed
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{course.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`bg-black h-3 rounded-full transition-all duration-300 ${getProgressWidthClass(course.progress)}`}
                ></div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleProgressUpdate(Math.max(0, course.progress - 10))}
                disabled={updatingProgress || course.progress === 0}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                -10%
              </button>
              <button
                onClick={() => handleProgressUpdate(Math.min(100, course.progress + 10))}
                disabled={updatingProgress || course.progress === 100}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                +10%
              </button>
              <button
                onClick={() => handleProgressUpdate(100)}
                disabled={updatingProgress || course.isCompleted}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Mark Complete
              </button>
            </div>
          </div>
        </div>

        {/* Course Modules */}
        <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Modules</h2>
          <div className="space-y-6">
            {course.modules.map((module: any, index: number) => (
              <div key={index} className="flex items-start space-x-4 p-6 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{module.title}</h3>
                  <p className="text-gray-700 mb-2">{module.description}</p>
                  <span className="inline-block px-3 py-1 bg-gray-100 text-black rounded-full text-sm">
                    {module.duration}
                  </span>
                </div>
                <CheckCircle className="w-6 h-6 text-gray-400 flex-shrink-0 mt-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Roadmap */}
        <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Learning Roadmap</h2>
          <div className="space-y-4">
            {course.roadmap.map((step: any, index: number) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {step.step}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-700">{step.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* YouTube Links */}
          <div className="bg-white rounded-xl shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended YouTube Resources</h2>
            <div className="space-y-4">
              {course.youtubeLinks.map((link: any, index: number) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 border border-gray-200 rounded-lg hover:border-black hover:bg-gray-50 transition-all"
                >
                  <h3 className="font-medium text-gray-900 mb-1">{link.title}</h3>
                  <p className="text-sm text-black">Watch on YouTube →</p>
                </a>
              ))}
            </div>
          </div>

          {/* Recommended Courses */}
          <div className="bg-white rounded-xl shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended Courses</h2>
            <div className="space-y-4">
              {course.recommendedCourses.map((recCourse: any, index: number) => (
                <a
                  key={index}
                  href={recCourse.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 border border-gray-200 rounded-lg hover:border-black hover:bg-gray-50 transition-all"
                >
                  <h3 className="font-medium text-gray-900 mb-1">{recCourse.title}</h3>
                  <p className="text-sm text-black">{recCourse.provider}</p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}