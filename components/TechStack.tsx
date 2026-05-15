"use client";

import { motion } from "framer-motion";
import { TECH_STACK } from "@/lib/constants";

export default function TechStack() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section
      id="tech-stack"
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
          <h2 className="text-4xl lg:text-6xl font-black mb-4 tracking-tight text-black dark:text-white">
            Tech Stack Supported
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto font-400">
            Learn Industry-Leading Technologies
          </p>
        </motion.div>

        <div className="flex flex-wrap gap-3 justify-center max-w-5xl mx-auto">
          {TECH_STACK.map((tech, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-800 border-2 border-black dark:border-white rounded-full px-5 py-2.5 hover:shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 group cursor-pointer"
              variants={itemVariants}
              whileHover={{ scale: 1.08 }}
            >
              <span className="font-600 text-black dark:text-white text-sm">{tech}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
