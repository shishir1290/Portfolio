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

function copyStyles(source: Element, target: Element) {
  const computed = window.getComputedStyle(source);
  for (let index = 0; index < computed.length; index += 1) {
    const property = computed.item(index);
    target instanceof HTMLElement || target instanceof SVGElement
      ? target.style.setProperty(property, computed.getPropertyValue(property))
      : null;
  }

  const sourceChildren = Array.from(source.children);
  const targetChildren = Array.from(target.children);
  sourceChildren.forEach((child, index) => {
    if (targetChildren[index]) copyStyles(child, targetChildren[index]);
  });
}

function createVisualClone(source: HTMLElement, boxOnly: boolean) {
  const clone = source.cloneNode(!boxOnly) as HTMLElement;
  if (!boxOnly) copyStyles(source, clone);
  const style = window.getComputedStyle(source);

  clone.style.setProperty("position", "relative", "important");
  clone.style.setProperty("inset", "auto", "important");
  clone.style.setProperty("left", "auto", "important");
  clone.style.setProperty("top", "auto", "important");
  clone.style.setProperty("width", "100%", "important");
  clone.style.setProperty("height", "100%", "important");
  clone.style.setProperty("max-width", "none", "important");
  clone.style.setProperty("max-height", "none", "important");
  clone.style.setProperty("margin", "0", "important");
  clone.style.setProperty("transform", "none", "important");
  clone.style.setProperty("animation", "none", "important");
  clone.style.setProperty("visibility", "visible", "important");
  clone.style.setProperty("opacity", "1", "important");
  clone.style.setProperty("pointer-events", "none", "important");

  if (boxOnly) {
    clone.textContent = "";
    clone.style.setProperty("background", style.background, "important");
    clone.style.setProperty("border", style.border, "important");
    clone.style.setProperty("border-radius", style.borderRadius, "important");
    clone.style.setProperty("box-shadow", style.boxShadow, "important");
  }

  if (source instanceof HTMLCanvasElement && clone instanceof HTMLCanvasElement) {
    try {
      clone.width = source.width;
      clone.height = source.height;
      clone.getContext("2d")?.drawImage(source, 0, 0);
    } catch {
      // Cross-origin or WebGL canvases remain a styled placeholder.
    }
  }
  return clone;
}

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

    const section = root.firstElementChild as HTMLElement | null;
    const background = section ? getComputedStyle(section).backgroundColor : "";
    stage.style.background =
      background && background !== "rgba(0, 0, 0, 0)" ? background : "rgba(2, 8, 23, .97)";

    const candidates = Array.from(root.querySelectorAll<HTMLElement>(selectors))
      .filter((element) => {
        if (element.closest("[data-swarm-ignore]")) return false;
        const rect = element.getBoundingClientRect();
        return rect.width > 3 && rect.height > 3;
      })
      .sort((a, b) => {
        const first = a.getBoundingClientRect();
        const second = b.getBoundingClientRect();
        return first.top - second.top || first.left - second.left;
      });

    const rootRect = root.getBoundingClientRect();
    const tasks: Array<{ x: number; y: number; width: number; height: number; layer: HTMLDivElement }> = [];

    candidates.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      const boxOnly = ["ARTICLE", "FORM", "LI", "BLOCKQUOTE"].includes(element.tagName);
      const layer = document.createElement("div");
      layer.className = "swarm-build-layer";
      layer.style.left = `${rect.left - rootRect.left}px`;
      layer.style.top = `${rect.top - rootRect.top}px`;
      layer.style.width = `${rect.width}px`;
      layer.style.height = `${rect.height}px`;
      layer.style.setProperty("--swarm-delay", `${(index * 58) / speed}ms`);
      layer.style.setProperty("--swarm-duration", `${650 / speed}ms`);

      const clone = createVisualClone(element, boxOnly);
      layer.appendChild(clone);

      const size = document.createElement("span");
      size.className = "swarm-size-badge";
      size.textContent = `${Math.round(rect.width)} × ${Math.round(rect.height)}`;
      layer.appendChild(size);
      stage.appendChild(layer);

      tasks.push({
        x: rect.left - rootRect.left + rect.width / 2,
        y: rect.top - rootRect.top + rect.height / 2,
        width: rect.width,
        height: rect.height,
        layer,
      });
    });

    const guideX = document.createElement("i");
    guideX.className = "swarm-guide swarm-guide-x";
    const guideY = document.createElement("i");
    guideY.className = "swarm-guide swarm-guide-y";
    stage.append(guideX, guideY);

    const cursorNodes: HTMLDivElement[] = [];
    agents.forEach((agent, agentIndex) => {
      const cursor = document.createElement("div");
      cursor.className = "swarm-agent-cursor";
      cursor.style.setProperty("--agent-color", agent.color);
      cursor.innerHTML = `<svg viewBox="0 0 24 28" aria-hidden="true"><path d="M3 2.5 20.5 17l-7.2 1.1-3.5 6.5L3 2.5Z" fill="${agent.color}" stroke="white" stroke-width="1.7" stroke-linejoin="round"/></svg><span>${agent.name}</span>`;
      stage.appendChild(cursor);
      cursorNodes.push(cursor);

      const route = tasks.filter((_, taskIndex) => taskIndex % agents.length === agentIndex);
      const points = route.length ? route : tasks.slice(0, 1);
      if (points.length) {
        const frames = [
          { transform: "translate(50px, 30px)" },
          ...points.map((point) => ({
            transform: `translate(${point.x}px, ${point.y}px)`,
          })),
        ];
        cursor.animate(frames, {
          duration: Math.max(1800, (points.length * 900) / speed),
          delay: agentIndex * 110,
          fill: "forwards",
          easing: "cubic-bezier(.45,0,.2,1)",
        });
      }
    });

    root.classList.add("swarm-original-hidden");
    root.appendChild(stage);
    setActive(true);

    const duration = Math.max(1900, ((tasks.length - 1) * 58 + 900) / speed);
    finishTimer = window.setTimeout(() => {
      if (cancelled) return;
      stage.remove();
      root.classList.remove("swarm-original-hidden");
      setActive(false);
      setFinished(true);
    }, duration);

    return () => {
      cancelled = true;
      window.clearTimeout(finishTimer);
      stage.remove();
      root.classList.remove("swarm-original-hidden");
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
