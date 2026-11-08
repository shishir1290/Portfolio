"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const swarmParticles = [
  { top: "12%", left: "8%", x: -46, y: -32 },
  { top: "18%", left: "88%", x: 42, y: -38 },
  { top: "34%", left: "18%", x: -54, y: 8 },
  { top: "28%", left: "76%", x: 48, y: -12 },
  { top: "52%", left: "5%", x: -38, y: 24 },
  { top: "64%", left: "94%", x: 44, y: 30 },
  { top: "82%", left: "15%", x: -34, y: 36 },
  { top: "86%", left: "82%", x: 38, y: 34 },
  { top: "10%", left: "48%", x: 4, y: -48 },
  { top: "92%", left: "52%", x: -6, y: 42 },
  { top: "46%", left: "96%", x: 52, y: 2 },
  { top: "58%", left: "2%", x: -48, y: -4 },
];

export default function SectionReveal({ children }: { children: ReactNode }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="swarm-reveal"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 36, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.85,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {!prefersReducedMotion &&
        swarmParticles.map((particle, index) => (
          <motion.span
            key={index}
            aria-hidden="true"
            className="swarm-reveal__particle"
            style={{ top: particle.top, left: particle.left }}
            initial={{
              opacity: 0,
              x: particle.x,
              y: particle.y,
              scale: 0.25,
            }}
            whileInView={{
              opacity: [0, 0.9, 0],
              x: 0,
              y: 0,
              scale: [0.25, 1, 0.2],
            }}
            viewport={{ once: true, amount: 0.12 }}
            transition={{
              duration: 1.05,
              delay: index * 0.025,
              ease: "easeOut",
            }}
          />
        ))}
      {children}
    </motion.div>
  );
}
