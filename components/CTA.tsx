"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const scrollToCourseGenerator = () => {
    const element = document.getElementById('course-generator');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950">
      <motion.div
        className="max-w-4xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="bg-black dark:bg-gray-900 rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl border border-gray-800">
          <motion.h2
            className="text-4xl lg:text-6xl font-black mb-6 tracking-tight text-white"
            variants={containerVariants}
          >
            Start Learning Smarter Today
          </motion.h2>

          <motion.p
            className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto font-400 text-gray-200"
            variants={containerVariants}
          >
            Join thousands of learners who have transformed their careers with AI powered education
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={containerVariants}
          >
            <motion.button
              className="bg-white text-black px-8 py-4 rounded-full font-700 text-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 group shadow-lg hover:bg-gray-100"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={scrollToCourseGenerator}
            >
              Generate Your Course Now
              <ArrowRight
                size={20}
                className="group-hover:translate-x-2 transition-transform"
              />
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
