"use client";

import { useEffect, useRef, useState } from "react";

const projects = [
  {
    id: "01",
    title: "Live Streaming Platform",
    category: "Full-Stack / Real-Time",
    description:
      "A scalable live streaming application built with RTMP ingestion, HLS playback, and real-time viewer interaction via WebRTC and Socket.io. Supports multiple concurrent streams with dynamic quality switching.",
    technologies: ["Next.js", "Node.js", "RTMP", "HLS", "WebRTC", "Socket.io", "Nginx", "FFmpeg"],
    highlights: [
      "RTMP → HLS transcoding pipeline",
      "Real-time chat with Socket.io",
      "WebRTC peer-to-peer for low-latency mode",
      "Nginx-RTMP media server setup",
    ],
    color: "#00f5d4",
    featured: true,
    status: "Production",
  },
  {
    id: "02",
    title: "Enterprise E-Commerce Platform",
    category: "Full-Stack / E-Commerce",
    description:
      "A comprehensive e-commerce solution with multi-vendor support, advanced filtering, real-time inventory management, and a fully custom admin dashboard built for high-traffic scenarios.",
    technologies: ["Next.js", "Node.js", "PostgreSQL", "Prisma ORM", "Tailwind CSS", "TypeScript"],
    highlights: [
      "Multi-vendor marketplace architecture",
      "Advanced product filtering & search",
      "Real-time inventory with WebSocket",
      "Custom admin analytics dashboard",
    ],
    color: "#7209b7",
    featured: true,
    status: "Production",
  },
  {
    id: "03",
    title: "Video Conferencing App",
    category: "WebRTC / Real-Time",
    description:
      "Peer-to-peer video conferencing application using WebRTC with signaling server, screen sharing, recording capabilities, and virtual rooms. Supports up to 10 concurrent participants.",
    technologies: ["React", "Node.js", "WebRTC", "Socket.io", "MongoDB", "Mongoose"],
    highlights: [
      "Peer-to-peer WebRTC mesh network",
      "Screen sharing & recording",
      "Virtual rooms with join codes",
      "Chat and file sharing",
    ],
    color: "#f72585",
    featured: false,
    status: "Completed",
  },
  {
    id: "04",
    title: "Business Management SaaS",
    category: "Full-Stack / SaaS",
    description:
      "An all-in-one business management platform for SMEs with CRM, invoicing, HR management, and team collaboration tools. Multi-tenant architecture with role-based access control.",
    technologies: ["Nest.js", "Next.js", "PostgreSQL", "TypeScript", "Tailwind CSS", "Nginx"],
    highlights: [
      "Multi-tenant SaaS architecture",
      "Role-based access control (RBAC)",
      "CRM + invoicing + HR modules",
      "RESTful API with Swagger docs",
    ],
    color: "#4cc9f0",
    featured: false,
    status: "In Progress",
  },
  {
    id: "05",
    title: "Real-Time Chat Application",
    category: "Socket.io / Full-Stack",
    description:
      "Feature-rich messaging application with end-to-end encrypted rooms, file sharing, presence indicators, message reactions, and push notifications.",
    technologies: ["React", "Node.js", "Socket.io", "MongoDB", "Mongoose", "Tailwind CSS"],
    highlights: [
      "Real-time messaging with Socket.io",
      "Encrypted private rooms",
      "File & image sharing",
      "Online presence indicators",
    ],
    color: "#f8961e",
    featured: false,
    status: "Completed",
  },
];

export default function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [activeProject, setActiveProject] = useState<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const featured = projects.filter((p) => p.featured);
  const others = projects.filter((p) => !p.featured);

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative py-32 overflow-hidden"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at bottom right, rgba(114,9,183,0.06) 0%, transparent 60%)",
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
            04 / PROJECTS
          </p>
          <h2
            className="text-5xl lg:text-7xl font-bold"
            style={{ fontFamily: "Bebas Neue, sans-serif" }}
          >
            <span className="text-white">SELECTED </span>
            <span className="gradient-text">WORK</span>
          </h2>
          <div className="w-16 h-px bg-primary mt-4" />
        </div>

        {/* Featured Projects */}
        <div className="space-y-8 mb-16">
          {featured.map((project, i) => (
            <div
              key={project.id}
              className={`relative glass-card rounded-sm overflow-hidden transition-all duration-700 cursor-pointer ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              } ${activeProject === i ? "border-opacity-50" : ""}`}
              style={{
                transitionDelay: `${i * 150}ms`,
                borderColor:
                  activeProject === i
                    ? `${project.color}50`
                    : "rgba(0,245,212,0.1)",
              }}
              onMouseEnter={() => setActiveProject(i)}
              onMouseLeave={() => setActiveProject(null)}
            >
              {/* Featured badge */}
              <div
                className="absolute top-6 right-6 text-xs px-3 py-1 rounded-sm"
                style={{
                  fontFamily: "Space Mono, monospace",
                  backgroundColor: `${project.color}15`,
                  color: project.color,
                  border: `1px solid ${project.color}30`,
                }}
              >
                {project.status}
              </div>

              <div className="p-8 lg:p-10">
                <div className="grid lg:grid-cols-5 gap-8">
                  {/* Left content */}
                  <div className="lg:col-span-3">
                    <div className="flex items-center gap-3 mb-4">
                      <span
                        className="text-4xl font-bold opacity-20"
                        style={{
                          fontFamily: "Bebas Neue, sans-serif",
                          color: project.color,
                        }}
                      >
                        {project.id}
                      </span>
                      <span
                        className="text-xs tracking-wider"
                        style={{
                          color: project.color,
                          fontFamily: "Space Mono, monospace",
                        }}
                      >
                        {project.category}
                      </span>
                    </div>
                    <h3
                      className="text-3xl lg:text-4xl font-bold text-white mb-4"
                      style={{ fontFamily: "Bebas Neue, sans-serif" }}
                    >
                      {project.title}
                    </h3>
                    <p className="text-white/50 leading-relaxed mb-6 text-sm">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="text-xs px-2.5 py-1 rounded-sm"
                          style={{
                            fontFamily: "Space Mono, monospace",
                            backgroundColor: `${project.color}10`,
                            borderColor: `${project.color}20`,
                            border: `1px solid ${project.color}20`,
                            color: `${project.color}CC`,
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right: Highlights */}
                  <div className="lg:col-span-2">
                    <p
                      className="text-xs text-white/20 tracking-widest mb-4"
                      style={{ fontFamily: "Space Mono, monospace" }}
                    >
                      KEY FEATURES
                    </p>
                    <ul className="space-y-3">
                      {project.highlights.map((h, j) => (
                        <li key={j} className="flex items-start gap-3">
                          <span
                            className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: project.color }}
                          />
                          <span className="text-white/50 text-sm">{h}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Visual accent */}
                    <div
                      className="mt-8 w-full h-24 rounded-sm overflow-hidden relative"
                      style={{ backgroundColor: `${project.color}05` }}
                    >
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(135deg, ${project.color}15, transparent)`,
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span
                          className="text-6xl font-bold opacity-10"
                          style={{
                            fontFamily: "Bebas Neue, sans-serif",
                            color: project.color,
                          }}
                        >
                          {project.id}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom accent line */}
              <div
                className="h-px w-full"
                style={{
                  background: `linear-gradient(90deg, ${project.color}40, transparent)`,
                }}
              />
            </div>
          ))}
        </div>

        {/* Other Projects Grid */}
        <div
          className={`transition-all duration-700 delay-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <p
            className="text-xs text-white/20 tracking-widest mb-6"
            style={{ fontFamily: "Space Mono, monospace" }}
          >
            OTHER PROJECTS
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {others.map((project, i) => (
              <div
                key={project.id}
                className={`glass-card p-6 rounded-sm transition-all duration-700 ${
                  visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${(i + 2) * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <span
                    className="text-3xl font-bold opacity-20"
                    style={{
                      fontFamily: "Bebas Neue, sans-serif",
                      color: project.color,
                    }}
                  >
                    {project.id}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-sm"
                    style={{
                      fontFamily: "Space Mono, monospace",
                      backgroundColor: `${project.color}15`,
                      color: project.color,
                    }}
                  >
                    {project.status}
                  </span>
                </div>
                <h4
                  className="text-xl font-bold text-white mb-2"
                  style={{ fontFamily: "Bebas Neue, sans-serif" }}
                >
                  {project.title}
                </h4>
                <p className="text-white/40 text-xs mb-4 leading-relaxed">
                  {project.description.slice(0, 120)}...
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {project.technologies.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="text-xs px-2 py-0.5 rounded-sm"
                      style={{
                        fontFamily: "Space Mono, monospace",
                        backgroundColor: `${project.color}10`,
                        color: `${project.color}99`,
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
