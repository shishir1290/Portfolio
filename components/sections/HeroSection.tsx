"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { getYearsExperience } from "@/lib/experience";

const ParticleBackground = dynamic(() => import("@/components/three/ParticleBackground"), { ssr: false });
const ThreeGlobe = dynamic(() => import("@/components/three/ThreeGlobe"), { ssr: false });

const roles = [
  "Full-Stack Software Engineer",
  "Golang Backend Developer",
  "Node.js & NestJS Developer",
  "Real-Time Systems Engineer",
];

export default function HeroSection() {
  const [currentRole, setCurrentRole] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const role = roles[currentRole];
    let timeout: ReturnType<typeof setTimeout>;
    if (!isDeleting && displayText.length < role.length) {
      timeout = setTimeout(() => setDisplayText(role.slice(0, displayText.length + 1)), 72);
    } else if (!isDeleting) {
      timeout = setTimeout(() => setIsDeleting(true), 1900);
    } else if (displayText.length > 0) {
      timeout = setTimeout(() => setDisplayText(displayText.slice(0, -1)), 30);
    } else {
      setIsDeleting(false);
      setCurrentRole((value) => (value + 1) % roles.length);
    }
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentRole]);

  return (
    <section id="home" className="hero-console relative min-h-screen flex items-center overflow-hidden grid-bg">
      <div className="absolute inset-0 pointer-events-none"><ParticleBackground /></div>
      <div className="hero-vignette absolute inset-0 pointer-events-none" />
      <div className="hero-orbit-glow absolute pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 w-full pt-24 pb-24 lg:pt-28">
        <div className="grid lg:grid-cols-[1.08fr_.92fr] gap-10 xl:gap-14 items-center">
          <div className={`hero-copy transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="hero-status inline-flex items-center gap-2 mb-9">
              <span className="hero-status-dot" />
              <span>OPEN TO FULL-TIME ROLES</span>
            </div>

            <p className="hero-eyebrow">HELLO, I&apos;M</p>
            <h1 className="hero-name">
              <span>MD SADMANUR</span>
              <small>ISLAM SHISHIR</small>
            </h1>
            <p className="hero-role">FULL-STACK SOFTWARE ENGINEER</p>

            <div className="hero-type-line" aria-label={displayText}>
              <span className="hero-prompt">&gt;</span>
              <span>{displayText}</span><span className="hero-caret" />
            </div>

            <p className="hero-description">
              Building full-stack web applications and backend systems with Go, React,
              Next.js, Node.js and real-time technologies. I turn complex ideas into
              reliable products and scalable digital experiences.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <button
                onClick={() => document.querySelector("#projects")?.scrollIntoView({ behavior: "smooth" })}
                className="hero-cta hero-cta-primary"
              >VIEW MY WORK <span>↗</span></button>
              <button
                onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}
                className="hero-cta"
              >GET IN TOUCH</button>
            </div>

            <div className="hero-stats">
              {[
                { value: getYearsExperience(), label: "YEARS EXPERIENCE" },
                { value: "10+", label: "TECHNOLOGIES" },
                { value: "5+", label: "PROJECTS BUILT" },
              ].map((stat) => (
                <div className="hero-stat" key={stat.label}>
                  <strong>{stat.value}</strong><span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`hero-visual relative flex items-center justify-center transition-all duration-1000 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="hero-globe-wrap">
              <div className="hero-globe-ring hero-globe-ring-one" />
              <div className="hero-globe-ring hero-globe-ring-two" />
              <div className="absolute inset-0"><ThreeGlobe /></div>
              {[
                { label: "Go", className: "hero-tech hero-tech-one" },
                { label: "Node.js", className: "hero-tech hero-tech-two" },
                { label: "React", className: "hero-tech hero-tech-three" },
                { label: "WebRTC", className: "hero-tech hero-tech-four" },
                { label: "Next.js", className: "hero-tech hero-tech-five" },
              ].map((item) => <span className={item.className} key={item.label}>{item.label}</span>)}
            </div>
            <div className="hero-availability"><i /> AVAILABLE FOR SELECT PROJECTS</div>
          </div>
        </div>
        <div className="hero-scroll-cue"><span>SCROLL TO EXPLORE</span><i /></div>
      </div>
    </section>
  );
}
