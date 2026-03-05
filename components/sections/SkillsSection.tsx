"use client";

import { useEffect, useRef, useState } from "react";

const skillGroups = [
  {
    category: "Frontend",
    icon: "◈",
    color: "#00f5d4",
    skills: ["Next.js", "React", "TypeScript", "Tailwind CSS", "JavaScript"],
  },
  {
    category: "Backend",
    icon: "◇",
    color: "#7209b7",
    skills: ["Node.js", "Nest.js", "golang", "RESTful APIs", "PostgreSQL"],
  },
  {
    category: "Real-Time & Streaming",
    icon: "◆",
    color: "#f72585",
    skills: ["WebRTC", "Socket.io", "RTMP", "HLS", "FFmpeg"],
  },
  {
    category: "Databases & ORM",
    icon: "◉",
    color: "#4cc9f0",
    skills: ["MongoDB", "MySQL", "Mongoose", "Prisma ORM", "Sequelize"],
  },
  {
    category: "DevOps & Tools",
    icon: "⬡",
    color: "#f8961e",
    skills: ["Nginx", "Git", "Docker", "Linux", "Postman"],
  },
  {
    category: "Design & UX",
    icon: "◑",
    color: "#b5e48c",
    skills: ["Figma", "Responsive Design", "UI/UX Principles", "CSS Animations"],
  },
];

export default function SkillsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [activeGroup, setActiveGroup] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="relative py-32 overflow-hidden"
    >
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,245,212,0.03) 0%, transparent 70%)",
        }}
      />
      <div className="absolute inset-0 grid-bg opacity-50" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div
          className={`mb-20 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <p
            className="text-primary text-xs tracking-[0.4em] mb-3"
            style={{ fontFamily: "Space Mono, monospace" }}
          >
            02 / SKILLS
          </p>
          <h2
            className="text-5xl lg:text-7xl font-bold"
            style={{ fontFamily: "Bebas Neue, sans-serif" }}
          >
            <span className="text-white">TECHNICAL </span>
            <span className="gradient-text">ARSENAL</span>
          </h2>
          <div className="w-16 h-px bg-primary mt-4" />
        </div>

        {/* Skills Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillGroups.map((group, i) => (
            <div
              key={group.category}
              className={`glass-card p-6 rounded-sm cursor-pointer transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              style={{
                transitionDelay: `${i * 100}ms`,
                borderColor:
                  activeGroup === i
                    ? `${group.color}40`
                    : "rgba(0,245,212,0.1)",
              }}
              onMouseEnter={() => setActiveGroup(i)}
            >
              {/* Category header */}
              <div className="flex items-center gap-3 mb-5">
                <span
                  className="text-2xl"
                  style={{ color: group.color, fontFamily: "Space Mono, monospace" }}
                >
                  {group.icon}
                </span>
                <div>
                  <h3
                    className="text-white/90 font-semibold text-sm"
                    style={{ color: group.color }}
                  >
                    {group.category}
                  </h3>
                </div>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs px-3 py-1.5 rounded-sm border transition-all duration-200"
                    style={{
                      fontFamily: "Space Mono, monospace",
                      backgroundColor: `${group.color}10`,
                      borderColor: `${group.color}25`,
                      color: group.color,
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Progress bar decoration */}
              <div className="mt-5 h-px w-full bg-white/5 relative overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 transition-all duration-1000"
                  style={{
                    width: visible ? `${70 + i * 5}%` : "0%",
                    background: `linear-gradient(90deg, ${group.color}, transparent)`,
                    transitionDelay: `${i * 100 + 500}ms`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* All skills flat list */}
        <div
          className={`mt-16 transition-all duration-700 delay-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <p
            className="text-xs text-white/20 tracking-widest text-center mb-6"
            style={{ fontFamily: "Space Mono, monospace" }}
          >
            FULL TECH STACK
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Node.js", "golang", "WebRTC", "Socket.io", "RTMP", "HLS",
              "TypeScript", "Tailwind CSS", "Next.js", "MongoDB",
              "Mongoose", "MySQL", "JavaScript", "Nest.js",
              "PostgreSQL", "Prisma ORM", "Nginx", "React",
            ].map((skill) => (
              <span key={skill} className="skill-tag">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
