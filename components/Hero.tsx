"use client";

import { motion } from "framer-motion";
import { STATS } from "@/lib/constants";
import { Play, X } from "lucide-react";
import { useState } from "react";

export default function Hero() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [demoStep, setDemoStep] = useState(0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  const scrollToCourseGenerator = () => {
    const element = document.getElementById('course-generator');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openVideoModal = () => {
    setIsVideoOpen(true);
    setDemoStep(0);
  };

  const closeVideoModal = () => {
    setIsVideoOpen(false);
  };

  // Demo steps for animated demonstration
  const demoSteps = [
    {
      title: "🎯 User Request",
      description: "User enters: 'Learn React Development in 12 weeks'",
      icon: "✍️",
      color: "from-black to-gray-700",
      action: "AI analyzing your goal...",
    },
    {
      title: "🤖 AI Processing",
      description: "AI generates personalized curriculum with 12-week roadmap",
      icon: "⚙️",
      color: "from-gray-700 to-gray-900",
      action: "Creating 12-week learning path...",
    },
    {
      title: "📚 Curriculum Created",
      description: "45+ resources, 24 modules, custom projects included",
      icon: "📖",
      color: "from-blue-500 to-black",
      action: "✓ Curriculum Generated Successfully!",
    },
    {
      title: "📊 Progress Tracking",
      description: "Real-time dashboard showing completion, milestones, and difficulty",
      icon: "📈",
      color: "from-gray-500 to-gray-700",
      action: "Tracking: 23/45 modules completed",
    },
    {
      title: "🎓 Adaptive Learning",
      description: "Platform adjusts pace and content based on your performance",
      icon: "🧠",
      color: "from-blue-500 to-gray-800",
      action: "Difficulty: Intermediate → Advanced",
    },
  ];

  return (
    <section id="home" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950 min-h-screen flex items-center">
      <motion.div
        className="max-w-7xl mx-auto w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div className="space-y-6" variants={itemVariants}>
            <motion.h1
              className="text-5xl lg:text-7xl font-black text-black dark:text-white leading-tight tracking-tight"
              variants={itemVariants}
            >
              Master Any Skill with AI
            </motion.h1>

            <motion.p
              className="text-lg lg:text-xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl font-400"
              variants={itemVariants}
            >
              Personalized learning paths created by advanced AI. Adaptive curriculum that evolves with your progress. Your journey to expertise, intelligently crafted.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 pt-8"
              variants={itemVariants}
            >
              <button 
                className="bg-black text-white px-8 py-4 rounded-full font-700 text-base shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 dark:bg-white dark:text-black"
                onClick={scrollToCourseGenerator}
              >
                Generate Your Course
              </button>
              <button 
                className="flex items-center justify-center gap-2 border-2 border-black text-black px-8 py-4 rounded-full font-600 hover:bg-gray-100 dark:border-white dark:text-white dark:hover:bg-gray-900 transition-all duration-300"
                onClick={openVideoModal}
              >
                <Play size={20} />
                Watch Demo
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-3 gap-6 pt-8"
              variants={itemVariants}
            >
              {STATS.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-black dark:text-white">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Side - Illustration/Image */}
          <motion.div
            className="relative hidden lg:block"
            variants={itemVariants}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-gray-300/20 rounded-3xl blur-3xl" />
            <div className="relative bg-gradient-to-br from-gray-100 to-white rounded-3xl p-8 aspect-square flex items-center justify-center border border-gray-200">
              <div className="text-center">
                <div className="text-6xl font-bold text-gradient bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">
                  AI
                </div>
                <p className="text-muted-foreground mt-4">Course Generation in Progress</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* AI-Generated Animated Demo Modal */}
      {isVideoOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-6 bg-black text-white relative">
              <div className="flex items-center gap-4">
                <button
                  onClick={closeVideoModal}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-sm font-medium"
                >
                  ← Back to Home
                </button>
                <div className="h-6 w-px bg-white/30"></div>
                <h3 className="text-2xl font-bold">🎬 AI CourseCrafter Demo</h3>
              </div>
              <button
                onClick={closeVideoModal}
                aria-label="Close demo modal"
                title="Close demo modal"
                className="hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Demo Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Animated Demo Section */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8">
                <div className="max-w-4xl mx-auto">
                  {/* Step Indicator */}
                  <div className="mb-8">
                    <div className="flex justify-center mb-4">
                      {demoSteps.map((_, index) => (
                        <motion.div
                          key={index}
                          className={`h-3 flex-1 mx-1 rounded-full transition-all ${
                            index <= demoStep
                              ? `bg-gradient-to-r ${demoSteps[index].color}`
                              : "bg-gray-300"
                          }`}
                          animate={{
                            scale: index === demoStep ? 1.1 : 1,
                          }}
                        />
                      ))}
                    </div>
                    <div className="text-center text-black text-lg font-medium">
                      Step {demoStep + 1} of {demoSteps.length}
                    </div>
                  </div>

                  {/* Current Demo Step */}
                  <motion.div
                    key={demoStep}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className={`bg-gradient-to-br ${demoSteps[demoStep].color} rounded-xl p-8 text-white text-center mb-8 shadow-lg`}
                  >
                    <div className="text-7xl mb-6">{demoSteps[demoStep].icon}</div>
                    <h4 className="text-4xl font-bold mb-4">{demoSteps[demoStep].title}</h4>
                    <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto leading-relaxed">{demoSteps[demoStep].description}</p>

                    {/* Animated Action */}
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-2xl font-semibold bg-white/10 rounded-lg py-3 px-6 inline-block"
                    >
                      ⚡ {demoSteps[demoStep].action}
                    </motion.div>
                  </motion.div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between items-center gap-6">
                    <button
                      onClick={() => setDemoStep(Math.max(0, demoStep - 1))}
                      disabled={demoStep === 0}
                      className="px-8 py-4 bg-black text-white rounded-xl hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-lg shadow-lg"
                    >
                      ← Previous
                    </button>

                    <div className="flex gap-4">
                      <button
                        onClick={closeVideoModal}
                        className="px-6 py-4 bg-gray-200 text-black rounded-xl hover:bg-gray-300 transition-all font-medium"
                      >
                        Skip Demo
                      </button>

                      {demoStep < demoSteps.length - 1 && (
                        <button
                          onClick={() => setDemoStep(demoStep + 1)}
                          className="px-10 py-4 bg-gradient-to-r from-black to-gray-700 text-white rounded-xl hover:shadow-xl transition-all font-semibold text-lg shadow-lg"
                        >
                          Next Step →
                        </button>
                      )}

                      {demoStep === demoSteps.length - 1 && (
                        <button
                          onClick={() => {
                            closeVideoModal();
                            scrollToCourseGenerator();
                          }}
                          className="px-10 py-4 bg-gradient-to-r from-blue-500 to-black text-white rounded-xl hover:shadow-xl transition-all font-semibold text-lg shadow-lg"
                        >
                          Start Learning 🚀
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Features Overview */}
              <div className="bg-white p-8">
                <div className="max-w-6xl mx-auto">
                  <h4 className="text-3xl font-bold text-foreground mb-8 text-center">✨ What You&apos;ll Experience</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="flex gap-4 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-all duration-300 border border-gray-200">
                      <span className="text-4xl">🎯</span>
                      <div>
                        <h5 className="font-bold text-foreground mb-2 text-lg">AI Course Generation</h5>
                        <p className="text-muted-foreground leading-relaxed">Creates personalized learning paths instantly based on your goals, experience level, and preferred timeline</p>
                      </div>
                    </div>
                    <div className="flex gap-4 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-all duration-300 border border-gray-200">
                      <span className="text-4xl">📊</span>
                      <div>
                        <h5 className="font-bold text-foreground mb-2 text-lg">Progress Tracking</h5>
                        <p className="text-muted-foreground leading-relaxed">Real-time dashboard with milestones, completion rates, and detailed analytics of your learning journey</p>
                      </div>
                    </div>
                    <div className="flex gap-4 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-all duration-300 border border-gray-200">
                      <span className="text-4xl">🤖</span>
                      <div>
                        <h5 className="font-bold text-foreground mb-2 text-lg">Adaptive Learning</h5>
                        <p className="text-muted-foreground leading-relaxed">Content difficulty adjusts automatically based on your performance and learning pace</p>
                      </div>
                    </div>
                    <div className="flex gap-4 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-all duration-300 border border-gray-200">
                      <span className="text-4xl">💾</span>
                      <div>
                        <h5 className="font-bold text-foreground mb-2 text-lg">Course Management</h5>
                        <p className="text-muted-foreground leading-relaxed">Save, organize, and track multiple courses with personalized notes and bookmarks</p>
                      </div>
                    </div>
                    <div className="flex gap-4 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-all duration-300 border border-gray-200">
                      <span className="text-4xl">👥</span>
                      <div>
                        <h5 className="font-bold text-foreground mb-2 text-lg">Community Support</h5>
                        <p className="text-muted-foreground leading-relaxed">Connect with fellow learners, mentors, and industry professionals for guidance and networking</p>
                      </div>
                    </div>
                    <div className="flex gap-4 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-all duration-300 border border-gray-200">
                      <span className="text-4xl">🏆</span>
                      <div>
                        <h5 className="font-bold text-foreground mb-2 text-lg">Certification Ready</h5>
                        <p className="text-muted-foreground leading-relaxed">Complete capstone projects and earn industry-recognized certifications upon course completion</p>
                      </div>
                    </div>
                    <div className="flex gap-4 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-all duration-300 border border-gray-200">
                      <span className="text-4xl">📱</span>
                      <div>
                        <h5 className="font-bold text-foreground mb-2 text-lg">Mobile Learning</h5>
                        <p className="text-muted-foreground leading-relaxed">Access your courses anywhere with our responsive mobile app and offline capabilities</p>
                      </div>
                    </div>
                    <div className="flex gap-4 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-all duration-300 border border-gray-200">
                      <span className="text-4xl">🔄</span>
                      <div>
                        <h5 className="font-bold text-foreground mb-2 text-lg">Lifetime Updates</h5>
                        <p className="text-muted-foreground leading-relaxed">Courses automatically update with latest industry trends and technologies</p>
                      </div>
                    </div>
                    <div className="flex gap-4 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-all duration-300 border border-gray-200">
                      <span className="text-4xl">💬</span>
                      <div>
                        <h5 className="font-bold text-foreground mb-2 text-lg">AI Mentor Chat</h5>
                        <p className="text-muted-foreground leading-relaxed">24/7 intelligent assistance to answer questions and provide personalized guidance</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
