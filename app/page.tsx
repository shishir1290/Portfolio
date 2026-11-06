import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import SkillsSection from "@/components/sections/SkillsSection";
import ExperienceSection from "@/components/sections/ExperienceSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import ContactSection from "@/components/sections/ContactSection";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";

export const metadata: Metadata = {
  title: "Md Sadmanur Islam Shishir | Full-Stack Developer",
  description:
    "Full-Stack Software Engineer based in Bangladesh, specializing in Next.js, React, Node.js, NestJS, Golang, backend APIs, and real-time systems. Open to Dubai opportunities.",
};


export default function Home() {
  return (
    <SmoothScroll>
      <main className="relative min-h-screen">
        <Navbar />
        <HeroSection />
        <AboutSection />
        <SkillsSection />
        <ExperienceSection />
        <ProjectsSection />
        <ContactSection />
        <Footer />
      </main>
    </SmoothScroll>
  );
}
