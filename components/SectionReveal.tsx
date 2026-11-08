"use client";

import { useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

const agents = [
  { name: "Alex", color: "#ff5b78", x: "12%", y: "18%", delay: "0s" },
  { name: "Mia", color: "#21d6b4", x: "82%", y: "24%", delay: "-1.1s" },
  { name: "Noah", color: "#39b8ff", x: "18%", y: "72%", delay: "-2.2s" },
  { name: "Zoe", color: "#a879ff", x: "88%", y: "68%", delay: "-0.6s" },
  { name: "Kai", color: "#ffb347", x: "52%", y: "12%", delay: "-1.7s" },
];

const targetSelector =
  "h1,h2,h3,h4,p,a,button,img,article,form,blockquote,li,.glass-card,.skill-tag";

export default function SectionReveal({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(rootRef, { once: true, amount: 0.08 });
  const reducedMotion = useReducedMotion();
  const [rebuilding, setRebuilding] = useState(false);
  const [complete, setComplete] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (!isInView || complete || reducedMotion || !rootRef.current) {
      if (reducedMotion) setComplete(true);
      return;
    }

    const root = rootRef.current;
    const nodes = Array.from(root.querySelectorAll<HTMLElement>(targetSelector));
    nodes.forEach((node, index) => {
      node.style.setProperty("--swarm-order", String(index));
      node.style.setProperty("--swarm-speed", String(speed));
      node.classList.remove("swarm-rebuild-item");
      void node.offsetWidth;
      node.classList.add("swarm-rebuild-item");
    });

    setRebuilding(true);
    const duration = Math.max(1500, (nodes.length * 115 + 950) / speed);
    const timer = window.setTimeout(() => {
      nodes.forEach((node) => {
        node.classList.remove("swarm-rebuild-item");
        node.style.removeProperty("--swarm-order");
        node.style.removeProperty("--swarm-speed");
      });
      setRebuilding(false);
      setComplete(true);
    }, duration);

    return () => window.clearTimeout(timer);
  }, [isInView, complete, reducedMotion, speed, run]);
