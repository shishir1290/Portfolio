"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { scrollTo } from "../Navbar";

function getExperienceDuration(startDate: Date): string {
  const now = new Date();
  let years = now.getFullYear() - startDate.getFullYear();
  let months = now.getMonth() - startDate.getMonth();
  if (now.getDate() < startDate.getDate()) months--;
  if (months < 0) { years--; months += 12; }
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} Year${years > 1 ? "s" : ""}`);
  if (months > 0) parts.push(`${months} Month${months > 1 ? "s" : ""}`);
  return parts.length > 0 ? parts.join(" ") : "< 1 Month";
}

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const experience = useMemo(() => getExperienceDuration(new Date(2024, 9, 1)), []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative py-32 overflow-hidden"
    >
      {/* Background accent */}
      <div
        className="absolute top-0 right-0 w-1/3 h-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at right, rgba(114,9,183,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div
          className={`mb-20 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <p
            className="text-primary text-xs tracking-[0.4em] mb-3"
            style={{ fontFamily: "Space Mono, monospace" }}
          >
            01 / ABOUT
          </p>
          <h2
            className="text-5xl lg:text-7xl font-bold"
            style={{ fontFamily: "Bebas Neue, sans-serif" }}
          >
            <span className="text-white">WHO </span>
            <span className="gradient-text">I AM</span>
          </h2>
          <div className="w-16 h-px bg-primary mt-4" />
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left: Bio */}
          <div
            className={`transition-all duration-700 delay-200 ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
          >
            <div className="space-y-5 text-white/50 leading-relaxed">
              <p>
                I&apos;m a{" "}
                <span className="text-primary font-semibold">
                  Full-Stack Web Developer
                </span>{" "}
                currently working as a Junior Executive at{" "}
                <span className="text-white/80">Pakiza Software Limited</span>{" "}
                in Dhaka, Bangladesh. I specialize in building scalable
                applications with modern architectures.
              </p>
              <p>
                My passion lies in{" "}
                <span className="text-secondary font-semibold">
                  real-time communication systems
                </span>{" "}
                — from WebRTC peer-to-peer connections to live streaming
                pipelines using RTMP and HLS protocols. I&apos;ve delivered
                enterprise-grade solutions for live streaming, e-commerce, and
                business platforms.
              </p>
              <p>
                I hold a{" "}
                <span className="text-white/80">
                  B.Sc in Software Engineering
                </span>{" "}
                from American International University, Bangladesh (CGPA: 3.61),
                and I continuously push my limits by exploring new technologies
                and best practices.
              </p>
              <p>
                Beyond code, I believe in clean architecture, team
                collaboration, and writing software that not only works but is
                maintainable and performant.
              </p>
            </div>

            {/* Personal info grid */}
            <div className="mt-10 grid grid-cols-2 gap-4">
              {[
                { label: "Location", value: "Dhaka, Bangladesh" },
                { label: "Email", value: "shishir1290@gmail.com" },
                { label: "Phone", value: "+880 1946-432534" },
                { label: "Available", value: "Full-Time / Remote" },
                { label: "Experience", value: experience },
              ].map((item) => (
                <div key={item.label} className="border-l border-primary/20 pl-4">
                  <p
                    className="text-xs text-primary/60 tracking-wider mb-1"
                    style={{ fontFamily: "Space Mono, monospace" }}
                  >
                    {item.label.toUpperCase()}
                  </p>
                  <p className="text-white/70 text-sm">{item.value}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-10 flex gap-4">
              <a
                onClick={() => { scrollTo("#contact") }}
                className="btn-primary inline-block"
              >
                <span>CONTACT ME</span>
              </a>
              <a
                href="/CV.pdf"
                target="_blank"
                className="inline-flex items-center gap-2 px-6 py-3 text-xs text-white/50 border border-white/10 hover:text-white hover:border-white/30 transition-all"
                style={{ fontFamily: "Space Mono, monospace" }}
              >
                <span>DOWNLOAD CV</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right: Visual card */}
          <div
            className={`transition-all duration-700 delay-400 ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
          >
            <div className="relative">
              {/* Main card */}
              <div className="glass-card p-8 rounded-sm relative overflow-hidden">
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-primary" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-secondary" />

                <div className="flex items-start gap-6 mb-8">
                  {/* Avatar placeholder */}
                  <div
                    className="w-20 h-20 rounded-sm flex items-center justify-center flex-shrink-0 text-3xl font-bold"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(0,245,212,0.1), rgba(114,9,183,0.2))",
                      border: "1px solid rgba(0,245,212,0.2)",
                      fontFamily: "Bebas Neue, sans-serif",
                    }}
                  >
                    <Image src="/shishir.png" alt="Profile" width={60} height={60} />
                  </div>
                  <div>
                    <h3
                      className="text-xl font-bold text-white"
                      style={{ fontFamily: "Bebas Neue, sans-serif" }}
                    >
                      MD SADMANUR ISLAM SHISHIR
                    </h3>
                    <p
                      className="text-primary/70 text-xs tracking-wider mt-1"
                      style={{ fontFamily: "Space Mono, monospace" }}
                    >
                      JUNIOR EXECUTIVE @ PAKIZA SOFTWARE LIMITED
                    </p>
                    <p className="text-white/30 text-xs mt-2">
                      College Gate, Konabari, Gazipur 1437
                    </p>
                  </div>
                </div>

                {/* Education Timeline */}
                <div>
                  <p
                    className="text-xs text-primary/60 tracking-wider mb-4"
                    style={{ fontFamily: "Space Mono, monospace" }}
                  >
                    EDUCATION
                  </p>
                  <div className="space-y-4">
                    {[
                      {
                        degree: "B.Sc Software Engineering",
                        school: "AIUB, Bangladesh",
                        result: "CGPA 3.61",
                        year: "2019-2024",
                        color: "#00f5d4",
                      },
                      {
                        degree: "HSC (Science)",
                        school: "Milestone College, Uttara",
                        result: "GPA 5.0",
                        year: "2017-2018",
                        color: "#7209b7",
                      },
                      {
                        degree: "SSC (Science)",
                        school: "Sristy Academic School",
                        result: "GPA 5.0",
                        year: "2015",
                        color: "#f72585",
                      },
                    ].map((edu, i) => (
                      <div key={i} className="flex gap-4 items-start">
                        <div
                          className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                          style={{ backgroundColor: edu.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white/80 text-sm font-medium">
                            {edu.degree}
                          </p>
                          <p className="text-white/30 text-xs mt-0.5">
                            {edu.school}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p
                            className="text-xs font-bold"
                            style={{ color: edu.color, fontFamily: "Space Mono, monospace" }}
                          >
                            {edu.result}
                          </p>
                          <p className="text-white/20 text-xs mt-0.5">
                            {edu.year}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div
                className="absolute -top-4 -right-4 w-24 h-24 border border-primary/10 rounded-sm -z-10"
                style={{ transform: "rotate(10deg)" }}
              />
              <div
                className="absolute -bottom-4 -left-4 w-20 h-20 border border-secondary/10 rounded-sm -z-10"
                style={{ transform: "rotate(-8deg)" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
