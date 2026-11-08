"use client";

import { useInView, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

const targetSelector =
  "h1,h2,h3,h4,p,a,button,img,svg,canvas,video,article,form,li,blockquote,.glass-card,.skill-tag";

const agents = [
  { name: "Mia", color: "#ff6b8a" },
  { name: "Alex", color: "#36c5ff" },
  { name: "Sam", color: "#9b8cff" },
  { name: "Jo", color: "#35d6a1" },
  { name: "Kai", color: "#ffbd4a" },
  { name: "Lee", color: "#f28bd8" },
  { name: "Noah", color: "#b6e45c" },
  { name: "Ari", color: "#ff8a4c" },
];

type SavedVisibility = { element: HTMLElement; value: string };

export default function SectionReveal({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(rootRef, { once: true, amount: 0.04 });
  const reducedMotion = useReducedMotion();
  const [active, setActive] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [run, setRun] = useState(0);
  const [finished, setFinished] = useState(false);

  const replay = useCallback(() => {
    setFinished(false);
    setRun((value) => value + 1);
  }, []);

  const goLive = useCallback(() => {
    setFinished(true);
    setActive(false);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !isInView || finished || reducedMotion) {
      if (reducedMotion) setFinished(true);
      return;
    }

    let cancelled = false;
    let finishTimer = 0;
    const savedVisibility: SavedVisibility[] = [];
    const animations: Animation[] = [];
    const stage = document.createElement("div");
    stage.className = "swarm-stage";
    stage.setAttribute("aria-hidden", "true");

    const rootRect = root.getBoundingClientRect();
    const originalTargets = Array.from(
      root.querySelectorAll<HTMLElement>(targetSelector),
    ).filter((element) => {
      if (element.closest("[data-swarm-ignore]")) return false;
      const rect = element.getBoundingClientRect();
      return rect.width > 8 && rect.height > 8;
    });

    // Snapshot the real section before hiding it. The clone is visual-only:
    // links, buttons and form controls cannot receive interaction while rebuilding.
    const clone = root.cloneNode(true) as HTMLDivElement;
    clone.removeAttribute("id");
    clone.setAttribute("aria-hidden", "true");
    clone.setAttribute("inert", "");
    clone.style.position = "absolute";
    clone.style.inset = "0";
    clone.style.width = "100%";
    clone.style.height = "100%";
    clone.style.pointerEvents = "none";
    clone.style.zIndex = "1";

    const cloneTargets = Array.from(
      clone.querySelectorAll<HTMLElement>(targetSelector),
    );
    const pairedTargets = originalTargets
      .map((element, index) => ({ original: element, visual: cloneTargets[index] }))
      .filter((pair): pair is { original: HTMLElement; visual: HTMLElement } =>
        Boolean(pair.visual),
      );

    // Hide only the original section's direct content; the reconstruction
    // stage is appended as a sibling and remains visible above it.
    Array.from(root.children).forEach((node) => {
      if (!(node instanceof HTMLElement)) return;
      savedVisibility.push({ element: node, value: node.style.visibility });
      node.style.visibility = "hidden";
    });

    stage.appendChild(clone);

    const points = pairedTargets.map(({ original, visual }, index) => {
      const rect = original.getBoundingClientRect();
      const x = rect.left - rootRect.left;
      const y = rect.top - rootRect.top;
      const width = rect.width;
      const height = rect.height;

      visual.style.opacity = "0";
      visual.style.willChange = "opacity, clip-path, filter, transform";
      visual.style.pointerEvents = "none";

      const badge = document.createElement("span");
      badge.className = "swarm-size-badge";
      badge.textContent = `${Math.round(width)} × ${Math.round(height)}`;
      badge.style.position = "absolute";
      badge.style.left = `${x}px`;
      badge.style.top = `${y + height + 4}px`;
      badge.style.bottom = "auto";
      badge.style.height = "auto";
      badge.style.zIndex = "5";
      stage.appendChild(badge);

      const outline = document.createElement("i");
      outline.className = "swarm-build-outline";
      outline.style.left = `${x}px`;
      outline.style.top = `${y}px`;
      outline.style.width = `${width}px`;
      outline.style.height = `${height}px`;
      outline.style.setProperty("--swarm-delay", `${(index * 115) / speed}ms`);
      outline.style.setProperty("--swarm-duration", `${560 / speed}ms`);
      outline.style.position = "absolute";
      outline.style.boxSizing = "border-box";
      outline.style.border = "1px solid rgba(52,155,255,.96)";
      outline.style.outline = "1px solid rgba(52,155,255,.28)";
      outline.style.boxShadow = "0 0 16px rgba(52,155,255,.16)";
      outline.style.pointerEvents = "none";
      outline.style.zIndex = "4";
      const outlineAnimation = outline.animate(
        [{ opacity: 0, transform: "scale(.985)" }, { opacity: 1, transform: "scale(1)", offset: 0.22 }, { opacity: 0, transform: "scale(1)" }],
        { duration: 760 / speed, delay: (index * 115) / speed, easing: "ease-out", fill: "forwards" },
      );
      animations.push(outlineAnimation);
      stage.appendChild(outline);

      const animation = visual.animate(
        [
          { opacity: 0, clipPath: "inset(0 100% 0 0)", filter: "blur(4px)", transform: "translateY(4px)" },
          { opacity: 1, clipPath: "inset(0 0 0 0)", filter: "blur(0)", transform: "translateY(0)" },
        ],
        {
          duration: Math.max(260, 680 / speed),
          delay: (index * 115) / speed,
          easing: "cubic-bezier(.2,.75,.2,1)",
          fill: "forwards",
        },
      );
      animations.push(animation);

      return { x: x + width / 2, y: y + height / 2 };
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
        const keyframes: Keyframe[] = [
          { transform: "translate(18px, 24px) rotate(-12deg)" },
          ...path.map((point, pointIndex) => ({
            transform: `translate(${point.x + Math.sin(pointIndex) * 12}px, ${point.y + Math.cos(pointIndex) * 10}px) rotate(${(pointIndex % 2 ? 7 : -7)}deg)`,
          })),
        ];
        const animation = cursor.animate(keyframes, {
          duration: Math.max(1800, (path.length * 740) / speed),
          delay: agentIndex * 75,
          easing: "cubic-bezier(.45,0,.2,1)",
          fill: "forwards",
        });
        animations.push(animation);
      }
    });

    root.appendChild(stage);
    setActive(true);

    const buildDuration = Math.max(1900, ((points.length - 1) * 115 + 1450) / speed);
    finishTimer = window.setTimeout(() => {
      if (cancelled) return;
      stage.remove();
      savedVisibility.forEach(({ element, value }) => {
        element.style.visibility = value;
      });
      setActive(false);
      setFinished(true);
    }, buildDuration);

    return () => {
      cancelled = true;
      window.clearTimeout(finishTimer);
      animations.forEach((animation) => animation.cancel());
      stage.remove();
      savedVisibility.forEach(({ element, value }) => {
        element.style.visibility = value;
      });
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
