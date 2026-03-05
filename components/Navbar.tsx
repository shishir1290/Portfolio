"use client";

import { useState, useEffect } from "react";

const navItems = [
  { label: "ABOUT", href: "#about" },
  { label: "SKILLS", href: "#skills" },
  { label: "EXPERIENCE", href: "#experience" },
  { label: "PROJECTS", href: "#projects" },
  { label: "CONTACT", href: "#contact" },
];

export const scrollTo = (href: string) => {
  const el = document.querySelector(href);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }

};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);



  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
            ? "bg-dark/80 backdrop-blur-xl border-b border-primary/10"
            : "bg-transparent"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-3 group"
          >
            <div className="w-8 h-8 border border-primary/50 flex items-center justify-center group-hover:border-primary transition-colors">
              <span
                className="text-primary font-mono text-xs font-bold"
                style={{ fontFamily: "Space Mono, monospace" }}
              >
                S
              </span>
            </div>
            <span
              className="text-white/80 text-sm font-medium tracking-widest group-hover:text-primary transition-colors"
              style={{ fontFamily: "Space Mono, monospace" }}
            >
              SHISHIR
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollTo(item.href)}
                className="nav-link"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="mailto:shishir1290@gmail.com"
              className="btn-primary text-xs"
            >
              <span>HIRE ME</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span
              className={`block w-6 h-px bg-primary transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
            />
            <span
              className={`block w-6 h-px bg-primary transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block w-6 h-px bg-primary transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 bg-dark/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8 transition-all duration-500 md:hidden ${menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
          }`}
      >
        {navItems.map((item, i) => (
          <button
            key={item.label}
            onClick={() => { scrollTo(item.href); setMenuOpen(false) }}
            className="text-3xl font-display text-white/60 hover:text-primary transition-colors tracking-widest"
            style={{
              fontFamily: "Bebas Neue, sans-serif",
              transitionDelay: `${i * 50}ms`,
            }}
          >
            {item.label}
          </button>
        ))}
        <a
          href="mailto:shishir1290@gmail.com"
          className="btn-primary mt-4"
          onClick={() => setMenuOpen(false)}
        >
          <span>HIRE ME</span>
        </a>
      </div>
    </>
  );
}
