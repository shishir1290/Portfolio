"use client";

import { useEffect, useRef, useState } from "react";

const experiences = [
  {
    title: "Junior Executive",
    company: "Pakiza Software Limited",
    period: "September 2024 — Present",
    duration: "1 Year 4 Months",
    type: "Full-Time",
    location: "Dhanmondi, Dhaka",
    color: "#00f5d4",
    description:
      "Working on enterprise-grade full-stack web applications serving business clients across Bangladesh. Key role in architecting and building real-time communication features.",
    responsibilities: [
      "Design and develop scalable full-stack web applications using Next.js, Node.js, and Tailwind CSS.",
      "Implement and maintain real-time communication features using WebRTC and Socket.io.",
      "Collaborate with UI/UX designers to build modern, responsive interfaces that enhance user experience.",
      "Optimize application performance and ensure code quality through testing and best practices.",
      "Integrate RESTful APIs and manage database operations using Sequelize and PostgreSQL/MySQL.",
    ],
    technologies: ["Next.js", "Node.js", "WebRTC", "Socket.io", "PostgreSQL", "MySQL", "Tailwind CSS", "TypeScript"],
  },
];

export default function ExperienceSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

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
      id="experience"
      ref={sectionRef}
      className="relative py-32 overflow-hidden"
    >
      <div
        className="absolute top-0 left-0 w-1/3 h-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at left, rgba(247,37,133,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div
          className={`mb-20 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <p
            className="text-primary text-xs tracking-[0.4em] mb-3"
            style={{ fontFamily: "Space Mono, monospace" }}
          >
            03 / EXPERIENCE
          </p>
          <h2
            className="text-5xl lg:text-7xl font-bold"
            style={{ fontFamily: "Bebas Neue, sans-serif" }}
          >
            <span className="text-white">WORK </span>
            <span className="gradient-text-2">HISTORY</span>
          </h2>
          <div className="w-16 h-px bg-secondary mt-4" />
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div
            className={`absolute left-0 lg:left-8 top-0 w-px transition-all duration-1000 ${
              visible ? "h-full" : "h-0"
            }`}
            style={{ background: "linear-gradient(to bottom, #00f5d4, rgba(0,245,212,0.1))" }}
          />

          <div className="space-y-16">
            {experiences.map((exp, i) => (
              <div
                key={i}
                className={`relative pl-8 lg:pl-24 transition-all duration-700 ${
                  visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
                }`}
                style={{ transitionDelay: `${i * 200}ms` }}
              >
                {/* Timeline dot */}
                <div
                  className="absolute left-0 lg:left-8 top-6 w-3 h-3 rounded-full -translate-x-1/2 border-2"
                  style={{
                    backgroundColor: exp.color,
                    borderColor: exp.color,
                    boxShadow: `0 0 15px ${exp.color}60`,
                  }}
                />

                <div className="glass-card p-8 rounded-sm">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                    <div>
                      <h3
                        className="text-2xl font-bold text-white mb-1"
                        style={{ fontFamily: "Bebas Neue, sans-serif" }}
                      >
                        {exp.title}
                      </h3>
                      <p
                        className="text-lg font-semibold"
                        style={{ color: exp.color }}
                      >
                        {exp.company}
                      </p>
                      <p className="text-white/30 text-sm mt-1">
                        {exp.location}
                      </p>
                    </div>
                    <div className="lg:text-right flex-shrink-0">
                      <div
                        className="inline-flex items-center gap-2 px-3 py-1 border rounded-sm mb-2"
                        style={{
                          borderColor: `${exp.color}40`,
                          backgroundColor: `${exp.color}08`,
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full animate-pulse"
                          style={{ backgroundColor: exp.color }}
                        />
                        <span
                          className="text-xs"
                          style={{ color: exp.color, fontFamily: "Space Mono, monospace" }}
                        >
                          {exp.type}
                        </span>
                      </div>
                      <p
                        className="text-white/40 text-xs"
                        style={{ fontFamily: "Space Mono, monospace" }}
                      >
                        {exp.period}
                      </p>
                      <p
                        className="text-xs mt-1"
                        style={{ color: exp.color, fontFamily: "Space Mono, monospace" }}
                      >
                        {exp.duration}
                      </p>
                    </div>
                  </div>

                  <p className="text-white/50 text-sm leading-relaxed mb-6">
                    {exp.description}
                  </p>

                  {/* Responsibilities */}
                  <div className="mb-6">
                    <p
                      className="text-xs text-white/30 tracking-widest mb-3"
                      style={{ fontFamily: "Space Mono, monospace" }}
                    >
                      KEY RESPONSIBILITIES
                    </p>
                    <ul className="space-y-2">
                      {exp.responsibilities.map((resp, j) => (
                        <li key={j} className="flex items-start gap-3 text-sm text-white/50">
                          <span
                            className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0"
                            style={{ backgroundColor: exp.color }}
                          />
                          {resp}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Technologies */}
                  <div>
                    <p
                      className="text-xs text-white/30 tracking-widest mb-3"
                      style={{ fontFamily: "Space Mono, monospace" }}
                    >
                      TECHNOLOGIES
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {exp.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="text-xs px-3 py-1 rounded-sm border"
                          style={{
                            fontFamily: "Space Mono, monospace",
                            backgroundColor: `${exp.color}10`,
                            borderColor: `${exp.color}25`,
                            color: exp.color,
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Future placeholder */}
            <div
              className={`relative pl-8 lg:pl-24 transition-all duration-700 delay-200 ${
                visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
              }`}
            >
              <div
                className="absolute left-0 lg:left-8 top-6 w-3 h-3 rounded-full -translate-x-1/2 border-2 border-dashed"
                style={{ borderColor: "rgba(0,245,212,0.3)" }}
              />
              <div className="border border-dashed border-white/5 rounded-sm p-8">
                <p
                  className="text-white/20 text-center text-sm"
                  style={{ fontFamily: "Space Mono, monospace" }}
                >
                  YOUR COMPANY?{" "}
                  <a
                    href="mailto:shishir1290@gmail.com"
                    className="text-primary/60 hover:text-primary transition-colors"
                  >
                    Let&apos;s talk.
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
