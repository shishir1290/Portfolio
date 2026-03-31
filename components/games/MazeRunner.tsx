"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* ─── Themes ─── */
const THEMES = [
  {
    name: "CYBERPUNK",
    wall: "#1a0a2e",
    accent: "#00f5d4",
    floor: "#0a0f1e",
    fog: "#020817",
    light: "#7209b7",
  },
  {
    name: "MAGMA",
    wall: "#2e0a0a",
    accent: "#ff4400",
    floor: "#1e0a0a",
    fog: "#170202",
    light: "#ff8800",
  },
  {
    name: "CRYSTAL",
    wall: "#0a2e2e",
    accent: "#00ffff",
    floor: "#0a1e1e",
    fog: "#021717",
    light: "#0088ff",
  },
  {
    name: "OBSIDIAN",
    wall: "#111111",
    accent: "#33ff33",
    floor: "#0a0a0a",
    fog: "#000000",
    light: "#00aa00",
  },
  {
    name: "ROYAL",
    wall: "#2e250a",
    accent: "#ffd700",
    floor: "#1e180a",
    fog: "#171202",
    light: "#ff00ff",
  },
];

type Theme = (typeof THEMES)[0];
function generateMaze(
  w: number,
  h: number,
): { grid: boolean[][]; start: [number, number]; end: [number, number] } {
  // grid[r][c] = true means wall
  const grid: boolean[][] = Array.from({ length: h * 2 + 1 }, () =>
    Array(w * 2 + 1).fill(true),
  );

  const visited: boolean[][] = Array.from({ length: h }, () =>
    Array(w).fill(false),
  );

  const dirs = [
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
  ];

  function shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function carve(cx: number, cy: number) {
    visited[cy][cx] = true;
    grid[cy * 2 + 1][cx * 2 + 1] = false;

    for (const [dx, dy] of shuffle([...dirs])) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx >= 0 && nx < w && ny >= 0 && ny < h && !visited[ny][nx]) {
        grid[cy * 2 + 1 + dy][cx * 2 + 1 + dx] = false;
        carve(nx, ny);
      }
    }
  }

  carve(0, 0);

  return {
    grid,
    start: [1, 1], // grid coords
    end: [w * 2 - 1, h * 2 - 1],
  };
}

/* ─── Maze Walls ─── */
function MazeWalls({ grid, theme }: { grid: boolean[][]; theme: Theme }) {
  const wallHeight = 2.5;
  const meshes = useMemo(() => {
    const items: { x: number; z: number; w: number; d: number }[] = [];
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (grid[r][c]) {
          items.push({ x: c, z: r, w: 1, d: 1 });
        }
      }
    }
    return items;
  }, [grid]);

  return (
    <>
      {meshes.map((m, i) => (
        <mesh key={i} position={[m.x, wallHeight / 2, m.z]}>
          <boxGeometry args={[m.w, wallHeight, m.d]} />
          <meshStandardMaterial
            color={i % 7 === 0 ? theme.wall : "#111827"}
            metalness={0.6}
            roughness={0.2}
            emissive={i % 21 === 0 ? theme.accent : "#000"}
            emissiveIntensity={i % 21 === 0 ? 0.2 : 0}
          />
        </mesh>
      ))}
    </>
  );
}

/* ─── Exit Marker ─── */
function ExitMarker({ x, z, theme }: { x: number; z: number; theme: Theme }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.3;
      ref.current.rotation.y += 0.03;
    }
  });

  return (
    <group position={[x, 0, z]}>
      {/* Glow on floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.5, 16]} />
        <meshStandardMaterial
          color={theme.accent}
          emissive={theme.accent}
          emissiveIntensity={1}
          transparent
          opacity={0.3}
        />
      </mesh>
      {/* Floating gem */}
      <mesh ref={ref} position={[0, 1, 0]}>
        <octahedronGeometry args={[0.3]} />
        <meshStandardMaterial
          color={theme.accent}
          emissive={theme.accent}
          emissiveIntensity={2}
        />
      </mesh>
    </group>
  );
}

/* ─── Floor ─── */
function Floor({
  width,
  height,
  theme,
}: {
  width: number;
  height: number;
  theme: Theme;
}) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[width / 2, 0, height / 2]}>
      <planeGeometry args={[width + 3, height + 3]} />
      <meshStandardMaterial
        color={theme.floor}
        metalness={0.4}
        roughness={0.3}
      />
    </mesh>
  );
}

/* ─── FPS Controller ─── */
function FPSController({
  grid,
  endPos,
  onWin,
  startPos,
}: {
  grid: boolean[][];
  endPos: [number, number];
  onWin: () => void;
  startPos: [number, number];
}) {
  const { camera, gl } = useThree();
  const keys = useRef<Set<string>>(new Set());
  const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));
  const isLocked = useRef(false);

  useEffect(() => {
    camera.position.set(startPos[0], 1.2, startPos[1]);

    const down = (e: KeyboardEvent) => keys.current.add(e.key.toLowerCase());
    const up = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    const handleClick = () => gl.domElement.requestPointerLock();
    const handleLockChange = () => {
      isLocked.current = document.pointerLockElement === gl.domElement;
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (!isLocked.current) return;
      euler.current.setFromQuaternion(camera.quaternion);
      euler.current.y -= e.movementX * 0.002;
      euler.current.x -= e.movementY * 0.002;
      euler.current.x = Math.max(
        -Math.PI / 3,
        Math.min(Math.PI / 3, euler.current.x),
      );
      camera.quaternion.setFromEuler(euler.current);
    };

    gl.domElement.addEventListener("click", handleClick);
    document.addEventListener("pointerlockchange", handleLockChange);
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      gl.domElement.removeEventListener("click", handleClick);
      document.removeEventListener("pointerlockchange", handleLockChange);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [camera, gl]);

  useFrame((_, delta) => {
    const speed = 4 * delta;
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    dir.y = 0;
    dir.normalize();
    const right = new THREE.Vector3().crossVectors(
      dir,
      new THREE.Vector3(0, 1, 0),
    );

    const newPos = camera.position.clone();
    if (keys.current.has("w") || keys.current.has("arrowup"))
      newPos.addScaledVector(dir, speed);
    if (keys.current.has("s") || keys.current.has("arrowdown"))
      newPos.addScaledVector(dir, -speed);
    if (keys.current.has("a") || keys.current.has("arrowleft"))
      newPos.addScaledVector(right, -speed);
    if (keys.current.has("d") || keys.current.has("arrowright"))
      newPos.addScaledVector(right, speed);

    // Collision with walls
    const gx = Math.round(newPos.x);
    const gz = Math.round(newPos.z);
    const margin = 0.3;

    // Check surrounding cells
    let canMove = true;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const cr = gz + dr;
        const cc = gx + dc;
        if (
          cr >= 0 &&
          cr < grid.length &&
          cc >= 0 &&
          cc < grid[0].length &&
          grid[cr][cc]
        ) {
          // This cell is a wall, check distance
          const wx = cc;
          const wz = cr;
          const closest = new THREE.Vector2(
            Math.max(wx - 0.5, Math.min(wx + 0.5, newPos.x)),
            Math.max(wz - 0.5, Math.min(wz + 0.5, newPos.z)),
          );
          const dist = new THREE.Vector2(newPos.x, newPos.z).distanceTo(
            closest,
          );
          if (dist < margin) {
            canMove = false;
          }
        }
      }
    }

    if (canMove) {
      camera.position.copy(newPos);
    }
    camera.position.y = 1.2;

    // Write pos to canvas data
    gl.domElement.dataset.px = camera.position.x.toFixed(1);
    gl.domElement.dataset.pz = camera.position.z.toFixed(1);

    // Check win
    const dx = camera.position.x - endPos[0];
    const dz = camera.position.z - endPos[1];
    if (dx * dx + dz * dz < 1) {
      onWin();
    }
  });

  return null;
}

/* ─── Minimap ─── */
function MazeMinimap({
  grid,
  playerPos,
  endPos,
  theme,
}: {
  grid: boolean[][];
  playerPos: { x: number; z: number };
  endPos: [number, number];
  theme: Theme;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridW = grid[0]?.length || 0;
  const gridH = grid.length;

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const w = 128;
    const h = 128;
    const cellW = w / gridW;
    const cellH = h / gridH;

    ctx.fillStyle = "#0a0f1e";
    ctx.fillRect(0, 0, w, h);

    // Walls
    for (let r = 0; r < gridH; r++) {
      for (let c = 0; c < gridW; c++) {
        if (grid[r][c]) {
          ctx.fillStyle = theme.wall;
          ctx.fillRect(c * cellW, r * cellH, cellW, cellH);
        }
      }
    }

    // Exit
    ctx.fillStyle = "#00f5d4";
    ctx.beginPath();
    ctx.arc(
      endPos[0] * cellW + cellW / 2,
      endPos[1] * cellH + cellH / 2,
      3,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Player
    ctx.fillStyle = "#f72585";
    ctx.beginPath();
    ctx.arc(playerPos.x * cellW, playerPos.z * cellH, 3, 0, Math.PI * 2);
    ctx.fill();
  }, [grid, playerPos, endPos, gridW, gridH]);

  return (
    <canvas
      ref={canvasRef}
      width={128}
      height={128}
      className="absolute bottom-20 right-4 z-10 border border-primary/20 rounded-sm"
      style={{ width: 128, height: 128, imageRendering: "pixelated" }}
    />
  );
}

/* ─── Main Component ─── */
export default function MazeRunner() {
  const [level, setLevel] = useState(1);
  const mazeSize = useMemo(() => 6 + level * 2, [level]);
  const theme = useMemo(() => THEMES[(level - 1) % THEMES.length], [level]);

  const [mazeData, setMazeData] = useState(() =>
    generateMaze(mazeSize, mazeSize),
  );
  const [time, setTime] = useState(0);
  const [won, setWon] = useState(false);
  const [started, setStarted] = useState(false);
  const [playerPos, setPlayerPos] = useState({ x: 1, z: 1 });
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Timer
  useEffect(() => {
    if (!started || won) return;
    const interval = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [started, won]);

  // Track player position for minimap
  useEffect(() => {
    if (!started) return;
    const interval = setInterval(() => {
      const canvas = canvasContainerRef.current?.querySelector(
        "canvas:first-of-type",
      ) as HTMLCanvasElement;
      if (canvas) {
        const x = parseFloat(canvas.dataset.px || "1");
        const z = parseFloat(canvas.dataset.pz || "1");
        setPlayerPos({ x, z });
      }
    }, 100);
    return () => clearInterval(interval);
  }, [started]);

  const handleWin = useCallback(() => {
    setWon(true);
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, []);

  const nextLevel = useCallback(() => {
    const nextLvl = level + 1;
    setLevel(nextLvl);
    const newSize = 6 + nextLvl * 2;
    setMazeData(generateMaze(newSize, newSize));
    setTime(0);
    setWon(false);
    setStarted(true);
  }, [level]);

  const restartGame = useCallback(() => {
    setLevel(1);
    setMazeData(generateMaze(8, 8));
    setTime(0);
    setWon(false);
    setStarted(true);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const gridW = mazeData.grid[0].length;
  const gridH = mazeData.grid.length;

  return (
    <div
      className="relative w-full h-full"
      ref={canvasContainerRef}
      style={{ background: theme.fog }}
    >
      <Canvas>
        <ambientLight intensity={0.2} />
        <pointLight
          position={[playerPos.x, 2, playerPos.z]}
          intensity={1.2}
          color={theme.light}
          distance={10}
        />
        <pointLight
          position={[mazeData.end[0], 3, mazeData.end[1]]}
          intensity={2}
          color={theme.accent}
          distance={15}
        />
        <fog attach="fog" args={[theme.fog, 1, 12]} />
        <color attach="background" args={[theme.fog]} />

        <Floor width={gridW} height={gridH} theme={theme} />
        <MazeWalls grid={mazeData.grid} theme={theme} />
        <ExitMarker x={mazeData.end[0]} z={mazeData.end[1]} theme={theme} />

        {started && !won && (
          <FPSController
            grid={mazeData.grid}
            endPos={mazeData.end}
            startPos={mazeData.start}
            onWin={handleWin}
          />
        )}
      </Canvas>

      {/* HUD */}
      <div className="absolute top-16 left-4 z-10 flex gap-4">
        <div className="px-4 py-2 bg-dark/40 backdrop-blur-xl border border-white/10 rounded-lg">
          <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-1">
            Level
          </p>
          <p className="text-primary text-2xl font-black leading-none">
            {level}
          </p>
          <p className="text-white/60 text-[10px] mt-1">{theme.name}</p>
        </div>
        <div className="px-4 py-2 bg-dark/40 backdrop-blur-xl border border-white/10 rounded-lg min-w-[100px]">
          <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-1">
            Time
          </p>
          <p className="text-white text-2xl font-black leading-none">
            {formatTime(time)}
          </p>
        </div>
      </div>

      {/* Click instruction */}
      {started && !won && (
        <div className="absolute bottom-4 left-4 z-10 px-3 py-2 bg-black/20 backdrop-blur-sm border border-white/5 rounded-full">
          <p className="text-white/40 text-[10px] uppercase tracking-tighter">
            Click to unlock camera • WASD/Arrows to move
          </p>
        </div>
      )}

      {/* Crosshair */}
      {started && !won && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-6 h-6 border border-white/10 rounded-full flex items-center justify-center">
            <div className="w-1 h-1 bg-white/40 rounded-full" />
          </div>
        </div>
      )}

      {/* Minimap */}
      {started && !won && (
        <MazeMinimap
          grid={mazeData.grid}
          playerPos={playerPos}
          endPos={mazeData.end}
          theme={theme}
        />
      )}

      {/* Start overlay */}
      {!started && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark/80 backdrop-blur-md z-20">
          <div className="text-center p-12 rounded-3xl border border-white/5 bg-white/5">
            <h2 className="text-7xl font-black italic tracking-tighter text-white mb-2 drop-shadow-2xl">
              MAZE<span className="text-primary">RUNNER</span>
            </h2>
            <div className="h-1 w-24 bg-primary mx-auto mb-8 rounded-full" />
            <p className="text-white/60 max-w-sm mx-auto mb-10 text-sm leading-relaxed">
              Experience the ultimate navigational challenge. Reach the{" "}
              <span className="text-accent underline decoration-accent/30 underline-offset-4">
                glowing artifact
              </span>{" "}
              to advance to the next visual dimension.
            </p>
            <button
              onClick={() => setStarted(true)}
              className="group relative px-12 py-4 bg-primary text-white font-bold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95"
            >
              <span className="relative z-10 tracking-widest">
                INITIATE MISSION
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* Win overlay */}
      {won && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark/90 backdrop-blur-xl z-20 transition-all">
          <div className="text-center">
            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/30 animate-pulse">
              <div className="w-12 h-12 bg-primary rounded-full" />
            </div>
            <h2 className="text-5xl font-black text-white mb-2 tracking-tighter">
              DIMENSION CLEAR
            </h2>
            <p className="text-white/40 text-sm uppercase tracking-[0.3em] mb-12">
              Level {level} Complete • {formatTime(time)}
            </p>

            <div className="flex gap-4 justify-center">
              <button
                onClick={nextLevel}
                className="px-10 py-4 bg-white text-black font-bold rounded-full hover:bg-primary hover:text-white transition-all transform hover:-translate-y-1"
              >
                NEXT LEVEL
              </button>
              <button
                onClick={restartGame}
                className="px-10 py-4 bg-transparent text-white/60 font-bold rounded-full border border-white/10 hover:bg-white/5 transition-all"
              >
                RESTART PHASE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
