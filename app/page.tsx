import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import CourseGenerator from "@/components/CourseGenerator";
import Features from "@/components/Features";
import TechStack from "@/components/TechStack";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <HowItWorks />
      <CourseGenerator />
      <Features />
      <TechStack />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}
