"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const ParticleBackground = dynamic(
  () => import("@/components/three/ParticleBackground"),
  { ssr: false }
);

const ThreeGlobe = dynamic(() => import("@/components/three/ThreeGlobe"), {
  ssr: false,
});

const roles = [
  "Full-Stack Developer",
  "WebRTC Specialist",
  "Live Streaming Engineer",
  "UI/UX Enthusiast",
  "Node.js Developer",
];

export default function HeroSection() {
  const [currentRole, setCurrentRole] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const role = roles[currentRole];
    let timeout: NodeJS.Timeout;

    if (!isDeleting) {
      if (displayText.length < role.length) {
        timeout = setTimeout(() => {
          setDisplayText(role.slice(0, displayText.length + 1));
        }, 80);
      } else {
        timeout = setTimeout(() => setIsDeleting(true), 2000);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 40);
      } else {
        setIsDeleting(false);
        setCurrentRole((prev) => (prev + 1) % roles.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentRole]);

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden grid-bg"
    >
      {/* Particle Background */}
      <div className="absolute inset-0">
        <ParticleBackground />
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark via-transparent to-dark pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-dark via-transparent to-transparent pointer-events-none" />

      {/* Glowing orbs */}
      <div
        className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(114,9,183,0.15) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(247,37,133,0.1) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div
            className={`transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            {/* Status badge */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center gap-2 px-3 py-1.5 border border-primary/30 bg-primary/5 rounded-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span
                  className="text-primary text-xs tracking-widest"
                  style={{ fontFamily: "Space Mono, monospace" }}
                >
                  AVAILABLE FOR WORK
                </span>
              </div>
            </div>

            {/* Main heading */}
            <div className="mb-6">
              <p
                className="text-sm text-primary/60 tracking-[0.3em] mb-2"
                style={{ fontFamily: "Space Mono, monospace" }}
              >
                HELLO, I&apos;M
              </p>
              <h1
                className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-none mb-4"
                style={{ fontFamily: "Bebas Neue, sans-serif" }}
              >
                <span className="block text-white">MD SADMANUR</span>
                <span className="block gradient-text text-glow">
                  ISLAM SHISHIR
                </span>
              </h1>
            </div>

            {/* Typewriter */}
            <div className="flex items-center gap-2 mb-8 h-8">
              <span
                className="text-lg text-white/40"
                style={{ fontFamily: "Space Mono, monospace" }}
              >
                &gt;
              </span>
              <span
                className="text-lg text-primary"
                style={{ fontFamily: "Space Mono, monospace" }}
              >
                {displayText}
                <span className="animate-pulse">|</span>
              </span>
            </div>

            {/* Description */}
            <p className="text-white/50 text-base leading-relaxed max-w-lg mb-10 font-light">
              Crafting scalable web applications with a passion for real-time
              systems, live streaming, and modern UI/UX. Based in Dhaka,
              Bangladesh — building the future, one commit at a time.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-12">
              <button
                onClick={() => {
                  document
                    .querySelector("#projects")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="btn-primary"
              >
                <span>VIEW MY WORK</span>
              </button>
              <button
                onClick={() => {
                  document
                    .querySelector("#contact")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-8 py-3 text-white/60 border border-white/10 text-xs tracking-widest hover:text-white hover:border-white/30 transition-all"
                style={{ fontFamily: "Space Mono, monospace" }}
              >
                GET IN TOUCH
              </button>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-8">
              {[
                { value: "1+", label: "Years Experience" },
                { value: "10+", label: "Technologies" },
                { value: "5+", label: "Projects Built" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p
                    className="text-2xl font-bold text-primary"
                    style={{ fontFamily: "Bebas Neue, sans-serif" }}
                  >
                    {stat.value}
                  </p>
                  <p
                    className="text-xs text-white/30 tracking-wider mt-1"
                    style={{ fontFamily: "Space Mono, monospace" }}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Three.js Globe */}
          <div
            className={`relative flex items-center justify-center transition-all duration-1000 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <div className="relative w-80 h-80 lg:w-[450px] lg:h-[450px]">
              {/* Outer ring */}
              <div
                className="absolute inset-0 rounded-full border border-primary/10 animate-pulse-slow"
                style={{ boxShadow: "0 0 60px rgba(0,245,212,0.05)" }}
              />
              <div
                className="absolute inset-4 rounded-full border border-primary/5"
                style={{ animation: "float 8s ease-in-out infinite" }}
              />

              {/* Globe canvas */}
              <div className="absolute inset-0">
                <ThreeGlobe />
              </div>

              {/* Floating tech badges */}
              {[
                { label: "Node.js", top: "5%", left: "10%", color: "#68a063" },
                { label: "WebRTC", top: "15%", right: "5%", color: "#00f5d4" },
                { label: "Next.js", bottom: "20%", left: "0%", color: "#fff" },
                { label: "Socket.io", bottom: "5%", right: "10%", color: "#f72585" },
              ].map((badge) => (
                <div
                  key={badge.label}
                  className="absolute glass-card px-3 py-1.5 rounded-sm"
                  style={{
                    top: badge.top,
                    left: badge.left,
                    right: (badge as any).right,
                    bottom: badge.bottom,
                    animation: `float ${4 + Math.random() * 3}s ease-in-out infinite`,
                    animationDelay: `${Math.random() * 2}s`,
                  }}
                >
                  <span
                    className="text-xs font-bold"
                    style={{
                      fontFamily: "Space Mono, monospace",
                      color: badge.color,
                    }}
                  >
                    {badge.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span
            className="text-xs text-white/20 tracking-widest"
            style={{ fontFamily: "Space Mono, monospace" }}
          >
            SCROLL
          </span>
          <div className="w-px h-12 bg-gradient-to-b from-primary/40 to-transparent" />
        </div>
      </div>
    </section>
  );
}
