export const NAV_ITEMS = [
  { label: "How it Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Tech Stack", href: "#tech-stack" },
  { label: "Testimonials", href: "#testimonials" },
] as const;

export const FEATURES = [
  {
    title: "Personalized Learning Paths",
    description: "AI-generated curricula tailored to your goals, pace, and learning style",
    icon: "Brain",
  },
  {
    title: "AI Mentor Support",
    description: "24/7 intelligent assistance to answer questions and guide your journey",
    icon: "MessageCircle",
  },
  {
    title: "Hands-On Projects",
    description: "Build real-world applications and portfolio-worthy projects",
    icon: "Code",
  },
  {
    title: "Progress Tracking",
    description: "Detailed analytics and insights into your learning progress",
    icon: "BarChart3",
  },
  {
    title: "Community Access",
    description: "Connect with peers, mentors, and industry professionals",
    icon: "Users",
  },
  {
    title: "Adaptive Difficulty",
    description: "Content adjusts dynamically based on your performance",
    icon: "Zap",
  },
] as const;

export const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Tell Us Your Goals",
    description: "Share what you want to learn and your current skill level",
  },
  {
    step: "02",
    title: "AI Generates Course",
    description: "Advanced algorithms create your personalized curriculum",
  },
  {
    step: "03",
    title: "Learn & Practice",
    description: "Follow your adaptive roadmap with hands-on projects",
  },
  {
    step: "04",
    title: "Achieve Mastery",
    description: "Complete capstone projects and earn certifications",
  },
] as const;

export const TECH_STACK = [
  "React",
  "Node.js",
  "Python",
  "TensorFlow",
  "AWS",
  "Docker",
  "PostgreSQL",
  "MongoDB",
  "TypeScript",
  "Next.js",
  "GraphQL",
  "Kubernetes",
] as const;

export const TESTIMONIALS = [
  {
    quote:
      "AI CourseCrafter created a perfect learning roadmap for me. I went from beginner to landing my dream job in 6 months.",
    author: "Sarah Chen",
    role: "ML Engineer at Google",
    rating: 5,
  },
  {
    quote:
      "The personalized approach and AI mentorship transformed my learning experience. Highly recommended!",
    author: "Alex Johnson",
    role: "Frontend Developer at Microsoft",
    rating: 5,
  },
  {
    quote:
      "Best investment in my career. The adaptive difficulty kept me engaged and challenged throughout.",
    author: "Emma Rodriguez",
    role: "Data Scientist at Meta",
    rating: 5,
  },
] as const;

export const STATS = [
  { number: "10K+", label: "Active Learners" },
  { number: "500+", label: "Courses" },
  { number: "95%", label: "Success Rate" },
] as const;