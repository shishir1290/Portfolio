"use client";

import { useEffect, useRef, useState } from "react";

const projects = [
  {
    id: "01",
    title: "Vehicle Management System",
    category: "Full-Stack / Business Platform",
    description:
      "A vehicle management platform developed for managing vehicle-related operations, records, workflows, and business data through a modern web interface.",
    image: "https://image.thum.io/get/width/1400/crop/850/https://vms.criptonpro.com",
    url: "https://vms.criptonpro.com",
    technologies: ["Next.js", "Golang", "REST API", "PostgreSQL", "TypeScript"],
    highlights: [
      "Modern responsive web interface",
      "Full-stack development with Next.js and Go",
      "Structured business data management",
      "Production-oriented application architecture",
    ],
    color: "#00f5d4",
    featured: true,
    status: "Production",
  },
  {
    id: "02",
    title: "gsocket.io",
    category: "Open Source / Go Framework",
    description:
      "A Go implementation of Socket.IO and Engine.IO designed to enable real-time, event-driven communication between Go servers and compatible clients.",
    image: "https://image.thum.io/get/width/1400/crop/850/https://gsocketio.vercel.app",
    url: "https://gsocketio.vercel.app",
    technologies: ["Go", "WebSocket", "Socket.IO v4", "Engine.IO v4", "Real-Time Systems"],
    highlights: [
      "Socket.IO v4 and Engine.IO v4 compatibility focus",
      "Real-time event-based communication",
      "Go-native server implementation",
      "Open-source developer-focused project",
    ],
    color: "#b892ff",
    featured: true,
    status: "Open Source",
  },
  {
    id: "03",
    title: "SS QR Code",
    category: "Web Utility / Frontend",
    description:
      "A lightweight QR code generation web application that provides a simple and accessible way to create QR codes from user-provided content.",
    image: "https://image.thum.io/get/width/1400/crop/850/https://ss-qr-code.vercel.app",
    url: "https://ss-qr-code.vercel.app",
    technologies: ["Next.js", "React", "TypeScript", "QR Code API", "Tailwind CSS"],
    highlights: [
      "Simple QR code generation workflow",
      "Clean and responsive user interface",
      "Fast client-focused experience",
      "Deployed on Vercel",
    ],
    color: "#4cc9f0",
    featured: true,
    status: "Live",
  },
  {
    id: "04",
    title: "Live Streaming Platform",
    category: "Full-Stack / Real-Time",
    description:
      "A scalable live streaming application with RTMP ingestion, HLS playback, real-time viewer interaction, and dynamic quality switching.",
    technologies: ["Next.js", "Node.js", "RTMP", "HLS", "WebRTC", "Socket.io", "FFmpeg"],
    highlights: ["RTMP to HLS transcoding", "Real-time chat", "WebRTC low-latency mode", "Nginx media server"],
    color: "#ff6b8b",
    featured: false,
    status: "Completed",
  },
  {
    id: "05",
    title: "Enterprise E-Commerce Platform",
    category: "Full-Stack / E-Commerce",
    description:
      "A comprehensive e-commerce solution with multi-vendor support, advanced filtering, inventory management, and a custom admin dashboard.",
    technologies: ["Next.js", "Node.js", "PostgreSQL", "Prisma", "Tailwind CSS", "TypeScript"],
    highlights: ["Multi-vendor architecture", "Advanced product search", "Real-time inventory", "Admin analytics"],
    color: "#f8961e",
    featured: false,
    status: "Production",
  },
];

export default function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true);
    }, { threshold: 0.05 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const featured = projects.filter((project) => project.featured);
  const others = projects.filter((project) => !project.featured);

  return (
    <section id="projects" ref={sectionRef} className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className={`mb-20 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <p className="text-primary text-xs tracking-[0.4em] mb-3" style={{ fontFamily: "Space Mono, monospace" }}>04 / PROJECTS</p>
          <h2 className="text-5xl lg:text-7xl font-bold" style={{ fontFamily: "Bebas Neue, sans-serif" }}>
            <span className="text-white">SELECTED </span><span className="gradient-text">WORK</span>
          </h2>
          <div className="w-16 h-px bg-primary mt-4" />
        </div>

        <div className="space-y-8 mb-16">
          {featured.map((project, index) => (
            <article key={project.id} className={`glass-card rounded-sm overflow-hidden transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: `${index * 150}ms`, borderColor: `${project.color}20` }}>
              <div className="grid lg:grid-cols-5 gap-0">
                <a href={project.url} target="_blank" rel="noreferrer" className="lg:col-span-2 block overflow-hidden min-h-[240px] bg-black/20">
                  <img src={project.image} alt={`${project.title} project preview`} className="w-full h-full min-h-[240px] object-cover transition-transform duration-500 hover:scale-105" loading="lazy" />
                </a>
                <div className="lg:col-span-3 p-8 lg:p-10">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3"><span className="text-4xl font-bold opacity-20" style={{ fontFamily: "Bebas Neue, sans-serif", color: project.color }}>{project.id}</span><span className="text-xs tracking-wider" style={{ color: project.color, fontFamily: "Space Mono, monospace" }}>{project.category}</span></div>
                    <span className="text-xs px-3 py-1 rounded-sm whitespace-nowrap" style={{ backgroundColor: `${project.color}15`, color: project.color }}>{project.status}</span>
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4" style={{ fontFamily: "Bebas Neue, sans-serif" }}>{project.title}</h3>
                  <p className="text-white/50 leading-relaxed mb-6 text-sm">{project.description}</p>
                  <ul className="space-y-2 mb-6">{project.highlights.map((highlight) => <li key={highlight} className="flex items-start gap-3 text-sm text-white/50"><span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />{highlight}</li>)}</ul>
                  <div className="flex flex-wrap gap-2 mb-6">{project.technologies.map((tech) => <span key={tech} className="text-xs px-2.5 py-1 rounded-sm" style={{ backgroundColor: `${project.color}10`, border: `1px solid ${project.color}20`, color: `${project.color}CC` }}>{tech}</span>)}</div>
                  <a href={project.url} target="_blank" rel="noreferrer" className="inline-flex text-xs tracking-widest text-primary hover:underline">VIEW LIVE PROJECT ↗</a>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="text-xs text-white/20 tracking-widest mb-6" style={{ fontFamily: "Space Mono, monospace" }}>OTHER PROJECTS</p>
        <div className="grid md:grid-cols-2 gap-5">
          {others.map((project) => <article key={project.id} className="glass-card p-6 rounded-sm"><div className="flex items-start justify-between mb-4"><span className="text-3xl font-bold opacity-20" style={{ color: project.color }}>{project.id}</span><span className="text-xs px-2 py-1" style={{ color: project.color, backgroundColor: `${project.color}15` }}>{project.status}</span></div><h4 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "Bebas Neue, sans-serif" }}>{project.title}</h4><p className="text-white/40 text-xs mb-4 leading-relaxed">{project.description}</p><div className="flex flex-wrap gap-1.5">{project.technologies.slice(0, 4).map((tech) => <span key={tech} className="text-xs px-2 py-1" style={{ color: `${project.color}99`, backgroundColor: `${project.color}10` }}>{tech}</span>)}</div></article>)}
        </div>
      </div>
    </section>
  );
}
