"use client";

import { useInView, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

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

  const startRebuild = useCallback(() => {
    if (reducedMotion || !rootRef.current) {
      setComplete(true);
      return;
    }

    const root = rootRef.current;
    const nodes = Array.from(root.querySelectorAll<HTMLElement>(targetSelector))
      .filter((node) => !node.closest("[data-swarm-target]"));

    nodes.forEach((node, index) => {
      node.dataset.swarmTarget = "true";
      node.style.setProperty("--swarm-order", String(index));
      node.style.setProperty("--swarm-speed", String(speed));
      node.classList.remove("swarm-rebuild-item");
      void node.offsetWidth;
      node.classList.add("swarm-rebuild-item");
    });

    setComplete(false);
    setRebuilding(true);
    const duration = Math.max(1500, (nodes.length * 115 + 950) / speed);

    const timer = window.setTimeout(() => {
      nodes.forEach((node) => {
        node.classList.remove("swarm-rebuild-item");
        node.removeAttribute("data-swarm-target");
        node.style.removeProperty("--swarm-order");
        node.style.removeProperty("--swarm-speed");
      });
      setRebuilding(false);
      setComplete(true);
    }, duration);

    return () => window.clearTimeout(timer);
  }, [reducedMotion, speed]);

  useEffect(() => {
    if (!isInView || complete || rebuilding) return;
    const cleanup = startRebuild();
    return cleanup;
  }, [isInView, complete, rebuilding, startRebuild, run]);

  const replay = () => {
    setComplete(false);
    setRebuilding(false);
    setRun((value) => value + 1);
  };

  return (
    <div ref={rootRef} className={`swarm-reveal ${rebuilding ? "is-rebuilding" : ""}`}>
      {children}

      {rebuilding && !reducedMotion && (
        <>
          <div className="swarm-rebuild-agents" aria-hidden="true">
            {agents.map((agent) => (
              <div
                className="swarm-rebuild-agent"
                key={agent.name}
                style={
                  {
                    "--agent-color": agent.color,
                    "--agent-x": agent.x,
                    "--agent-y": agent.y,
                    "--agent-delay": agent.delay,
                  } as React.CSSProperties
                }
              >
                <svg viewBox="0 0 24 28" className="swarm-rebuild-pointer">
                  <path d="M3 2.5 20.5 17l-7.2 1.1-3.5 6.5L3 2.5Z" fill={agent.color} stroke="white" strokeWidth="1.7" strokeLinejoin="round" />
                </svg>
                <span>{agent.name}</span>
              </div>
            ))}
          </div>
          <div className="swarm-rebuild-toolbar" role="status" aria-live="polite">
            <span className="swarm-rebuild-brand"><i /> Swarm Rebuild</span>
            <span className="swarm-rebuild-divider" />
            <span className="swarm-rebuild-status"><b /> Rebuilding section</span>
            <label className="swarm-rebuild-speed">
              Speed
              <input
                aria-label="Rebuild speed"
                type="range"
                min="0.5"
                max="2"
                step="0.25"
                value={speed}
                onChange={(event) => setSpeed(Number(event.target.value))}
              />
              <strong>{speed.toFixed(2).replace(/0$/, "")}×</strong>
            </label>
            <button type="button" onClick={replay}>Replay</button>
            <button type="button" className="swarm-rebuild-live" onClick={() => setRebuilding(false)}>Go Live</button>
          </div>
        </>
      )}
    </div>
  );
}
