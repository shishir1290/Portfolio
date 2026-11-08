"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Point = { x: number; y: number };
type Glyph = { value: string; x: number; y: number };
type Task = {
  kind: "box" | "text" | "image";
  x: number;
  y: number;
  width: number;
  height: number;
  start: number;
  duration: number;
  lane: number;
  background?: string;
  borderColor?: string;
  borderWidth?: number;
  radius?: number;
  color?: string;
  font?: string;
  glyphs?: Glyph[];
  image?: HTMLImageElement;
  opacity: number;
};

const SWARM = [
  { name: "MAYA", color: "#65f4d0" },
  { name: "NOAH", color: "#ffca72" },
  { name: "ARIA", color: "#a78bfa" },
  { name: "LEO", color: "#fb7185" },
  { name: "ELI", color: "#67b7ff" },
  { name: "ZOE", color: "#e6e6e6" },
  { name: "KAI", color: "#f0a6ff" },
  { name: "IVY", color: "#b8e986" },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
const ease = (value: number) => 1 - Math.pow(1 - value, 3);

function buildBlueprint(root: HTMLElement): Task[] {
  const rootRect = root.getBoundingClientRect();
  const origin = { x: rootRect.left + window.scrollX, y: rootRect.top + window.scrollY };
  const tasks: Task[] = [];
  const lanes = SWARM.length;
  const laneClocks = Array(lanes).fill(0) as number[];
  const addTask = (
    item: Omit<Task, "start" | "duration" | "lane">,
    duration: number,
  ) => {
    const lane = tasks.length % lanes;
    const start = laneClocks[lane];
    tasks.push({ ...item, lane, start, duration });
    laneClocks[lane] += duration + 28;
  };

  const elements = Array.from(root.querySelectorAll<HTMLElement>("*")).slice(0, 1800);
  for (const element of elements) {
    if (element.closest("[data-swarm-ui]")) continue;
    const rect = element.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) continue;
    const style = window.getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) continue;

    const x = rect.left + window.scrollX - origin.x;
    const y = rect.top + window.scrollY - origin.y;
    const background = style.backgroundColor;
    const borderWidth = Math.max(
      parseFloat(style.borderTopWidth) || 0,
      parseFloat(style.borderRightWidth) || 0,
      parseFloat(style.borderBottomWidth) || 0,
      parseFloat(style.borderLeftWidth) || 0,
    );
    const hasBackground = background !== "rgba(0, 0, 0, 0)" && background !== "transparent";
    const hasBorder = borderWidth > 0 && style.borderColor !== "rgba(0, 0, 0, 0)";
    const radius = parseFloat(style.borderTopLeftRadius) || 0;

    if (hasBackground || hasBorder) {
      addTask({
        kind: "box", x, y, width: rect.width, height: rect.height,
        background: hasBackground ? background : undefined,
        borderColor: hasBorder ? style.borderColor : undefined,
        borderWidth, radius, opacity: Number(style.opacity) || 1,
      }, 210);
    }

    if (element instanceof HTMLImageElement && element.complete && element.naturalWidth > 0) {
      addTask({
        kind: "image", x, y, width: rect.width, height: rect.height,
        image: element, opacity: Number(style.opacity) || 1,
      }, 520);
    }
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let textNode: Node | null;
  let glyphCount = 0;
  while ((textNode = walker.nextNode()) && glyphCount < 14000) {
    const parent = textNode.parentElement;
    const value = textNode.textContent ?? "";
    if (!parent || !value.trim() || parent.closest("[data-swarm-ui],script,style,noscript,svg")) continue;
    const style = window.getComputedStyle(parent);
    if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) continue;

    const range = document.createRange();
    const lines = new Map<number, Glyph[]>();
    for (let index = 0; index < value.length && glyphCount < 14000; index += 1) {
      range.setStart(textNode, index);
      range.setEnd(textNode, index + 1);
      const charRect = range.getBoundingClientRect();
      if (!charRect.width && !charRect.height) continue;
      const line = Math.round(charRect.top + window.scrollY - origin.y);
      const glyphs = lines.get(line) ?? [];
      glyphs.push({
        value: value[index],
        x: charRect.left + window.scrollX - origin.x,
        y: charRect.top + window.scrollY - origin.y + charRect.height * 0.82,
      });
      lines.set(line, glyphs);
      glyphCount += 1;
    }

    for (const [line, glyphs] of lines) {
      if (!glyphs.length) continue;
      const left = Math.min(...glyphs.map((glyph) => glyph.x));
      const right = Math.max(...glyphs.map((glyph) => glyph.x));
      addTask({
        kind: "text", x: left, y: line, width: Math.max(1, right - left + 8),
        height: parseFloat(style.fontSize) * 1.5 || 20,
        color: style.color, font: style.font, glyphs, opacity: Number(style.opacity) || 1,
      }, clamp(glyphs.length * 17, 300, 1500));
    }
  }

  return tasks.sort((a, b) => a.start - b.start);
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, width: number, height: number, radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

export default function SwarmRebuild({ children }: { children: React.ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tasksRef = useRef<Task[]>([]);
  const frameRef = useRef<number | null>(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);
  const startRef = useRef(0);
  const durationRef = useRef(0);

  const startRebuild = useCallback(() => {
    if (!contentRef.current) return;
    const tasks = buildBlueprint(contentRef.current);
    tasksRef.current = tasks;
    durationRef.current = Math.max(...tasks.map((task) => task.start + task.duration), 0);
    startRef.current = performance.now();
    setProgress(0);
    setRunning(true);
  }, []);

  useEffect(() => {
    if (!running) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let animationFrame = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const render = (now: number) => {
      const elapsed = (now - startRef.current) * speed;
      const total = durationRef.current;
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const cursors: Array<{ point: Point; previous: Point; active: boolean }> =
        SWARM.map(() => ({ point: { x: -100, y: -100 }, previous: { x: -100, y: -100 }, active: false }));

      for (const task of tasksRef.current) {
        const local = clamp((elapsed - task.start) / task.duration, 0, 1);
        if (elapsed < task.start) continue;
        const p = ease(local);
        const x = task.x - scrollX;
        const y = task.y - scrollY;
        const cursor = cursors[task.lane];
        cursor.previous = cursor.point;
        cursor.point = { x: x + task.width * (task.kind === "text" ? p : p * 0.82), y: y + Math.min(task.height * 0.55, 24) };
        cursor.active = local < 1;

        context.save();
        context.globalAlpha = task.opacity;
        if (task.kind === "box") {
          if (task.background) {
            context.fillStyle = task.background;
            roundedRect(context, x, y, task.width, task.height, task.radius ?? 0);
            context.save();
            context.beginPath();
            context.rect(x, y, task.width * p, task.height);
            context.clip();
            context.fill();
            context.restore();
          }
          if (task.borderColor && task.borderWidth) {
            context.strokeStyle = task.borderColor;
            context.lineWidth = Math.max(1, task.borderWidth);
            context.setLineDash([Math.max(1, (task.width + task.height) * 2)]);
            context.lineDashOffset = (1 - p) * (task.width + task.height) * 2;
            roundedRect(context, x, y, task.width, task.height, task.radius ?? 0);
            context.stroke();
            context.setLineDash([]);
          }
        } else if (task.kind === "image" && task.image) {
          context.beginPath();
          context.rect(x, y, task.width * p, task.height);
          context.clip();
          context.drawImage(task.image, x, y, task.width, task.height);
        } else if (task.kind === "text" && task.glyphs) {
          context.fillStyle = task.color ?? "#ffffff";
          context.font = task.font ?? "14px sans-serif";
          const visible = Math.ceil(task.glyphs.length * p);
          for (let index = 0; index < visible; index += 1) {
            const glyph = task.glyphs[index];
            context.fillText(glyph.value, glyph.x - scrollX, glyph.y - scrollY);
          }
        }
        context.restore();
      }

      // Draw cursor trails and the eight named swarm agents.
      cursors.forEach((cursor, index) => {
        if (cursor.point.x < -20 || cursor.point.x > window.innerWidth + 20 ||
            cursor.point.y < -20 || cursor.point.y > window.innerHeight + 20) return;
        const agent = SWARM[index];
        context.save();
        context.globalAlpha = cursor.active ? 0.9 : 0.45;
        context.strokeStyle = agent.color;
        context.lineWidth = 1.2;
        context.beginPath();
        context.moveTo(cursor.previous.x, cursor.previous.y);
        context.lineTo(cursor.point.x, cursor.point.y);
        context.stroke();
        context.translate(cursor.point.x, cursor.point.y);
        context.fillStyle = agent.color;
        context.shadowColor = agent.color;
        context.shadowBlur = 12;
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(0, 17);
        context.lineTo(4.5, 12.5);
        context.lineTo(8, 20);
        context.lineTo(11, 18.5);
        context.lineTo(7.5, 11);
        context.lineTo(14, 11);
        context.closePath();
        context.fill();
        context.shadowBlur = 0;
        context.font = "10px monospace";
        const labelWidth = context.measureText(agent.name).width + 12;
        context.fillStyle = "rgba(2,8,23,.88)";
        context.fillRect(13, 4, labelWidth, 17);
        context.strokeStyle = agent.color;
        context.strokeRect(13, 4, labelWidth, 17);
        context.fillStyle = agent.color;
        context.fillText(agent.name, 19, 16);
        context.restore();
      });

      const nextProgress = total > 0 ? clamp(elapsed / total, 0, 1) : 1;
      setProgress((previous) => Math.abs(previous - nextProgress) > 0.015 ? nextProgress : previous);

      if (elapsed >= total + 650) {
        setProgress(1);
        setRunning(false);
        return;
      }
      animationFrame = requestAnimationFrame(render);
      frameRef.current = animationFrame;
    };

    animationFrame = requestAnimationFrame(render);
    frameRef.current = animationFrame;
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, [running, speed]);

  useEffect(() => () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <div className="relative min-h-screen">
      <div ref={contentRef} style={{ visibility: running ? "hidden" : "visible" }}>
        {children}
      </div>

      {running && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[9997]"
        />
      )}

      <div data-swarm-ui className="fixed right-5 top-5 z-[10000] flex items-center gap-2">
        {running && (
          <div className="hidden min-w-36 items-center gap-2 rounded border border-white/10 bg-[#07111f]/90 px-3 py-2 text-[10px] text-white/70 backdrop-blur sm:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#65f4d0]" />
            <span className="font-mono tracking-widest">REBUILDING</span>
            <span className="font-mono tabular-nums">{Math.round(progress * 100)}%</span>
          </div>
        )}
        <button
          type="button"
          onClick={startRebuild}
          disabled={running}
          className="rounded border border-[#65f4d0]/50 bg-[#06121e]/90 px-4 py-2.5 font-mono text-[10px] font-bold tracking-[0.18em] text-[#65f4d0] shadow-[0_0_24px_rgba(101,244,208,.12)] backdrop-blur transition hover:border-[#65f4d0] hover:bg-[#65f4d0]/10 disabled:cursor-wait disabled:opacity-60"
          aria-label="Replay the swarm rebuild animation"
        >
          {running ? "SWARM ACTIVE" : "↻ REBUILD PAGE"}
        </button>
      </div>

      {running && (
        <div data-swarm-ui className="pointer-events-none fixed bottom-0 left-0 z-[9999] h-[2px] w-full bg-white/10">
          <div className="h-full bg-[#65f4d0] shadow-[0_0_12px_#65f4d0]" style={{ width: `${progress * 100}%` }} />
        </div>
      )}
      {!running && progress === 1 && (
        <div data-swarm-ui className="pointer-events-none fixed bottom-5 left-1/2 z-[9999] -translate-x-1/2 rounded border border-white/10 bg-[#07111f]/85 px-3 py-1.5 font-mono text-[9px] tracking-widest text-white/45 backdrop-blur">
          PAGE REBUILT · SWARM COMPLETE
        </div>
      )}
    </div>
  );
}
