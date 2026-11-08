"use client";

import { useInView, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

const selectors =
  "h1,h2,h3,h4,p,a,button,img,svg,canvas,video,article,form,li,blockquote,.glass-card,.skill-tag";

const agents = [
  { name: "G", color: "#28c7ff" },
  { name: "F", color: "#ff5577" },
  { name: "B", color: "#26d6a5" },
  { name: "H", color: "#ffb84d" },
  { name: "T", color: "#a78bfa" },
  { name: "K", color: "#f472b6" },
];

export default function SectionReveal({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(rootRef, { once: true, amount: 0.06 });
  const reducedMotion = useReducedMotion();
  const [active, setActive] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [run, setRun] = useState(0);
  const [finished, setFinished] = useState(false);

  const replay = useCallback(() => {
    setFinished(false);
    setActive(false);
    setRun((value) => value + 1);
  }, []);

  const goLive = useCallback(() => {
    setActive(false);
    setFinished(true);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !isInView || finished || reducedMotion) {
      if (reducedMotion) setFinished(true);
      return;
    }

    let cancelled = false;
    let finishTimer = 0;
    const stage = document.createElement("div");
    stage.className = "swarm-stage";
    stage.setAttribute("aria-hidden", "true");

    const rootRect = root.getBoundingClientRect();
    const targets = Array.from(root.querySelectorAll<HTMLElement>(selectors))
      .filter((element) => {
        if (element.closest("[data-swarm-ignore]")) return false;
        const rect = element.getBoundingClientRect();
        return rect.width > 8 && rect.height > 8;
      })
      .sort((a, b) => {
        const first = a.getBoundingClientRect();
        const second = b.getBoundingClientRect();
        return first.top - second.top || first.left - second.left;
      });

    const points = targets.map((element, index) => {
      const rect = element.getBoundingClientRect();
      const x = rect.left - rootRect.left;
      const y = rect.top - rootRect.top;
      const marker = document.createElement("div");
      marker.className = "swarm-target-outline";
      marker.style.left = `${x}px`;
      marker.style.top = `${y}px`;
      marker.style.width = `${rect.width}px`;
      marker.style.height = `${rect.height}px`;
      marker.style.setProperty("--swarm-delay", `${(index * 95) / speed}ms`);
      marker.style.setProperty("--swarm-duration", `${520 / speed}ms`);

      const badge = document.createElement("span");
      badge.className = "swarm-size-badge";
      badge.textContent = `${Math.round(rect.width)} × ${Math.round(rect.height)}`;
      marker.appendChild(badge);
      stage.appendChild(marker);

      return {
        x: x + rect.width / 2,
        y: y + rect.height / 2,
      };
    });

    const guideX = document.createElement("i");
    guideX.className = "swarm-guide swarm-guide-x";
    const guideY = document.createElement("i");
    guideY.className = "swarm-guide swarm-guide-y";
    stage.append(guideX, guideY);

    agents.forEach((agent, agentIndex) => {
      const cursor = document.createElement("div");
      cursor.className = "swarm-agent-cursor";
      cursor.style.setProperty("--agent-color", agent.color);
      cursor.innerHTML = `<svg viewBox="0 0 24 28" aria-hidden="true"><path d="M3 2.5 20.5 17l-7.2 1.1-3.5 6.5L3 2.5Z" fill="${agent.color}" stroke="white" stroke-width="1.7" stroke-linejoin="round"/></svg><span>${agent.name}</span>`;
      stage.appendChild(cursor);

      const route = points.filter((_, pointIndex) => pointIndex % agents.length === agentIndex);
      const path = route.length ? route : points.slice(agentIndex, agentIndex + 1);
      if (path.length) {
        cursor.animate(
          [
            { transform: "translate(24px, 18px)" },
            ...path.map((point) => ({ transform: `translate(${point.x}px, ${point.y}px)` })),
          ],
          {
            duration: Math.max(1500, (path.length * 780) / speed),
            delay: agentIndex * 90,
            fill: "forwards",
            easing: "cubic-bezier(.45,0,.2,1)",
          },
        );
      }
    });

    // The real section remains visible throughout. Only measurement overlays and cursors are added.
    root.appendChild(stage);
    setActive(true);

    const duration = Math.max(1700, ((points.length - 1) * 95 + 950) / speed);
    finishTimer = window.setTimeout(() => {
      if (cancelled) return;
      stage.remove();
      setActive(false);
      setFinished(true);
    }, duration);

    return () => {
      cancelled = true;
      window.clearTimeout(finishTimer);
      stage.remove();
    };
  }, [isInView, finished, reducedMotion, speed, run]);

  return (
    <div ref={rootRef} className="swarm-reveal">
      {children}
      {active && (
        <div className="swarm-rebuild-toolbar" role="status" aria-live="polite">
          <span className="swarm-rebuild-brand"><i /> SWARM REBUILD</span>
          <span className="swarm-rebuild-count">{agents.length} agents</span>
          <div className="swarm-rebuild-speeds" aria-label="Rebuild speed">
            {[1, 2, 3].map((value) => (
              <button
                key={value}
                type="button"
                className={speed === value ? "is-selected" : ""}
                onClick={() => setSpeed(value)}
              >{value}×</button>
            ))}
          </div>
          <button type="button" onClick={replay}>Replay</button>
          <button type="button" className="swarm-rebuild-live" onClick={goLive}>Go live</button>
        </div>
      )}
    </div>
  );
}
