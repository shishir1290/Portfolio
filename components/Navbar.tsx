"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const navItems = [
  { label: "ABOUT", href: "/#about" },
  { label: "SKILLS", href: "/#skills" },
  { label: "EXPERIENCE", href: "/#experience" },
  { label: "PROJECTS", href: "/#projects" },
  { label: "CONTACT", href: "/#contact" },
  { label: "GAMES", href: "/games", isRoute: true },
];

export const scrollTo = (href: string) => {
  const hash = href.includes("#") ? href.substring(href.indexOf("#")) : href;
  const element = document.querySelector(hash);
  element?.scrollIntoView({ behavior: "smooth" });
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const goToContact = () => {
    window.location.href = "mailto:shishir1290@gmail.com";
  };

  return (
    <>
      <nav className={`site-nav fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "site-nav-scrolled" : ""}`}>
        <div className="site-nav-inner max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
          <Link href="/" className="site-brand" onClick={(event) => {
            if (window.location.pathname === "/") {
              event.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}>
            <span className="site-brand-mark">S</span><span>SHISHIR</span>
          </Link>

          <div className="hidden md:flex items-center site-nav-links">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} className="nav-link" onClick={(event) => {
                if (!item.isRoute && window.location.pathname === "/") {
                  event.preventDefault();
                  scrollTo(item.href);
                }
              }}>{item.label}</Link>
            ))}
          </div>

          <button type="button" onClick={goToContact} className="site-hire hidden md:inline-flex">HIRE ME <span>↗</span></button>
          <button
            className="md:hidden site-menu-button"
            type="button"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className={menuOpen ? "menu-line menu-line-one open" : "menu-line menu-line-one"} />
            <span className={menuOpen ? "menu-line menu-line-two open" : "menu-line menu-line-two"} />
          </button>
        </div>
      </nav>

      <div id="mobile-navigation" aria-label="Mobile navigation" className={`site-mobile-menu fixed inset-0 z-40 md:hidden ${menuOpen ? "is-open" : ""}`}>
        {navItems.map((item) => (
          <Link key={item.label} href={item.href} onClick={(event) => {
            setMenuOpen(false);
            if (!item.isRoute && window.location.pathname === "/") {
              event.preventDefault();
              scrollTo(item.href);
            }
          }}>{item.label}</Link>
        ))}
        <button type="button" onClick={() => { setMenuOpen(false); goToContact(); }}>HIRE ME ↗</button>
      </div>
    </>
  );
}
