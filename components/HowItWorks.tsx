"use client";

import { motion } from "framer-motion";
import { HOW_IT_WORKS } from "@/lib/constants";

export default function HowItWorks() {
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
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section
      id="how-it-works"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900"
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
            Four Steps to Mastery
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto font-400">
            Our AI analyzes your goals and creates a personalized learning journey
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {HOW_IT_WORKS.map((item, index) => (
            <motion.div
              key={index}
              className="relative"
              variants={itemVariants}
            >
              <div className="card-hover bg-white dark:bg-gray-800 rounded-2xl p-8 h-full shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
                {/* Step Number */}
                <div className="inline-flex items-center justify-center w-16 h-16 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold text-2xl mb-6 relative z-10 shadow-lg">
                  {item.step}
                </div>

                {/* Title */}
                <h3 className="text-lg lg:text-xl font-700 text-black dark:text-white mb-3">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-400">
                  {item.description}
                </p>

                {/* Connector Line */}
                {index < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute -right-4 top-1/2 w-8 h-0.5 bg-black dark:bg-white" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
