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
  title: "Full-Stack Developer in Bangladesh",
  description:
    "Explore the portfolio of Md Sadmanur Islam Shishir: a full-stack developer in Bangladesh building Next.js applications, Node.js and Go backends, APIs, and real-time systems. Open to remote roles and Dubai relocation.",
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
