"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 py-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 mb-8 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-primary/30 flex items-center justify-center">
              <span
                className="text-primary text-xs font-bold"
                style={{ fontFamily: "Space Mono, monospace" }}
              >
                S
              </span>
            </div>
            <div>
              <p
                className="text-white/60 text-xs tracking-widest"
                style={{ fontFamily: "Space Mono, monospace" }}
              >
                MD SADMANUR ISLAM SHISHIR
              </p>
              <p className="text-white/20 text-xs mt-0.5">
                Full-Stack Developer · College Gate, Konabari, Gazipur, Bangladesh
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/#about" className="text-white/30 hover:text-primary transition-colors text-xs tracking-wider" style={{ fontFamily: "Space Mono, monospace" }}>
              ABOUT
            </Link>
            <Link href="/#skills" className="text-white/30 hover:text-primary transition-colors text-xs tracking-wider" style={{ fontFamily: "Space Mono, monospace" }}>
              SKILLS
            </Link>
            <Link href="/#experience" className="text-white/30 hover:text-primary transition-colors text-xs tracking-wider" style={{ fontFamily: "Space Mono, monospace" }}>
              EXPERIENCE
            </Link>
            <Link href="/#projects" className="text-white/30 hover:text-primary transition-colors text-xs tracking-wider" style={{ fontFamily: "Space Mono, monospace" }}>
              PROJECTS
            </Link>
            <Link href="/games" className="text-white/30 hover:text-primary transition-colors text-xs tracking-wider" style={{ fontFamily: "Space Mono, monospace" }}>
              GAMES
            </Link>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <p
            className="text-white/20 text-xs text-center"
            style={{ fontFamily: "Space Mono, monospace" }}
          >
            © {new Date().getFullYear()} All rights reserved
          </p>

          <div className="flex items-center gap-4">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = "mailto:" + "shishir1290" + "@" + "gmail.com";
              }}
              className="text-white/30 hover:text-primary transition-colors text-xs"
              style={{ fontFamily: "Space Mono, monospace" }}
            >
              EMAIL
            </a>
            <span className="text-white/10">·</span>
            <a
              href="tel:+8801946432534"
              className="text-white/30 hover:text-primary transition-colors text-xs"
              style={{ fontFamily: "Space Mono, monospace" }}
            >
              PHONE
            </a>
            <span className="text-white/10">·</span>
            <a
              href="https://github.com/shishir1290"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/30 hover:text-primary transition-colors text-xs"
              style={{ fontFamily: "Space Mono, monospace" }}
            >
              GITHUB
            </a>
            <span className="text-white/10">·</span>
            <a
              href="https://linkedin.com/in/shishir1290"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/30 hover:text-primary transition-colors text-xs"
              style={{ fontFamily: "Space Mono, monospace" }}
            >
              LINKEDIN
            </a>
            <span className="text-white/10">·</span>
            <a
              href="https://x.com/shishir1290"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/30 hover:text-primary transition-colors text-xs"
              style={{ fontFamily: "Space Mono, monospace" }}
            >
              X
            </a>
            <span className="text-white/10">·</span>
            <a
              href="https://facebook.com/shishir1290"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/30 hover:text-primary transition-colors text-xs"
              style={{ fontFamily: "Space Mono, monospace" }}
            >
              FACEBOOK
            </a>
            <span className="text-white/10">·</span>
            <a
              href="https://instagram.com/shishir1290"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/30 hover:text-primary transition-colors text-xs"
              style={{ fontFamily: "Space Mono, monospace" }}
            >
              INSTAGRAM
            </a>
            <span className="text-white/10">·</span>
            <a
              href="https://youtube.com/@shishir1290"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/30 hover:text-primary transition-colors text-xs"
              style={{ fontFamily: "Space Mono, monospace" }}
            >
              YOUTUBE
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
