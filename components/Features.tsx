"use client";

import { motion } from "framer-motion";
import { FEATURES } from "@/lib/constants";
import {
  Brain,
  MessageCircle,
  Code,
  BarChart3,
  Users,
  Zap,
} from "lucide-react";

export default function Features() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const getIcon = (iconName: string) => {
    const iconProps = { size: 28, className: "text-black dark:text-white" };
    switch (iconName) {
      case "Brain":
        return <Brain {...iconProps} />;
      case "MessageCircle":
        return <MessageCircle {...iconProps} />;
      case "Code":
        return <Code {...iconProps} />;
      case "BarChart3":
        return <BarChart3 {...iconProps} />;
      case "Users":
        return <Users {...iconProps} />;
      case "Zap":
        return <Zap {...iconProps} />;
      default:
        return <Brain {...iconProps} />;
    }
  };

  return (
    <section
      id="features"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950"
    >
      <motion.div
        className="max-w-7xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <motion.div
          className="text-center mb-16"
          variants={itemVariants}
        >
          <h2 className="text-4xl lg:text-6xl font-black mb-4 tracking-tight">
            Everything You Need to Succeed
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto font-400">
            Complete tools and support for your learning journey
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={index}
              className="card-hover bg-background rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 border border-slate-100 hover:border-blue-200 group"
              variants={itemVariants}
              whileHover={{ y: -8 }}
            >
              <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:from-blue-600/20 group-hover:to-purple-600/20 transition-all">
                {getIcon(feature.icon)}
              </div>

              <h3 className="text-lg lg:text-xl font-700 text-slate-900 mb-3">
                {feature.title}
              </h3>

              <p className="text-slate-600 leading-relaxed font-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
