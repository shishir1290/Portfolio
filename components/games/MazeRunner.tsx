"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* ─── Maze Generator (Recursive Backtracker) ─── */
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
function MazeWalls({ grid }: { grid: boolean[][] }) {
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
            color={i % 7 === 0 ? "#1a0a2e" : "#111827"}
            roughness={0.8}
          />
        </mesh>
      ))}
    </>
  );
}

/* ─── Exit Marker ─── */
function ExitMarker({ x, z }: { x: number; z: number }) {
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
          color="#00f5d4"
          emissive="#00f5d4"
          emissiveIntensity={1}
          transparent
          opacity={0.3}
        />
      </mesh>
      {/* Floating gem */}
      <mesh ref={ref} position={[0, 1, 0]}>
        <octahedronGeometry args={[0.3]} />
        <meshStandardMaterial
          color="#00f5d4"
          emissive="#00f5d4"
          emissiveIntensity={2}
        />
      </mesh>
    </group>
  );
}

/* ─── Floor ─── */
function Floor({ width, height }: { width: number; height: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[width / 2, 0, height / 2]}>
      <planeGeometry args={[width + 2, height + 2]} />
      <meshStandardMaterial color="#0a0f1e" />
    </mesh>
  );
}

/* ─── FPS Controller ─── */
function FPSController({
  grid,
  endPos,
  onWin,
}: {
  grid: boolean[][];
  endPos: [number, number];
  onWin: () => void;
}) {
  const { camera, gl } = useThree();
  const keys = useRef<Set<string>>(new Set());
  const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));
  const isLocked = useRef(false);

  useEffect(() => {
    camera.position.set(1, 1.2, 1);

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
}: {
  grid: boolean[][];
  playerPos: { x: number; z: number };
  endPos: [number, number];
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
          ctx.fillStyle = "#1a1a2e";
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
  const mazeSize = 8;
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

  const restart = useCallback(() => {
    setMazeData(generateMaze(mazeSize, mazeSize));
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
    <div className="relative w-full h-full" ref={canvasContainerRef}>
      <Canvas>
        <ambientLight intensity={0.15} />
        <pointLight
          position={[1, 3, 1]}
          intensity={1}
          color="#7209b7"
          distance={15}
        />
        <pointLight
          position={[mazeData.end[0], 3, mazeData.end[1]]}
          intensity={1.5}
          color="#00f5d4"
          distance={10}
        />
        <fog attach="fog" args={["#020817", 2, 12]} />
        <color attach="background" args={["#020817"]} />

        <Floor width={gridW} height={gridH} />
        <MazeWalls grid={mazeData.grid} />
        <ExitMarker x={mazeData.end[0]} z={mazeData.end[1]} />

        {started && !won && (
          <FPSController
            grid={mazeData.grid}
            endPos={mazeData.end}
            onWin={handleWin}
          />
        )}
      </Canvas>

      {/* Timer HUD */}
      <div className="absolute top-16 right-4 z-10 px-3 py-2 bg-dark/80 backdrop-blur-md border border-primary/20 rounded-sm">
        <p
          className="text-primary text-lg font-bold"
          style={{ fontFamily: "Bebas Neue, sans-serif" }}
        >
          TIME: {formatTime(time)}
        </p>
      </div>

      {/* Click instruction */}
      {started && !won && (
        <div className="absolute top-16 left-4 z-10 px-3 py-2 bg-dark/80 backdrop-blur-md border border-white/10 rounded-sm">
          <p
            className="text-white/40 text-xs"
            style={{ fontFamily: "Space Mono, monospace" }}
          >
            Click to look around
          </p>
        </div>
      )}

      {/* Crosshair */}
      {started && !won && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-1 h-1 bg-primary/50 rounded-full" />
        </div>
      )}

      {/* Minimap */}
      {started && !won && (
        <MazeMinimap
          grid={mazeData.grid}
          playerPos={playerPos}
          endPos={mazeData.end}
        />
      )}

      {/* Start overlay */}
      {!started && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark/70 backdrop-blur-sm z-20">
          <div className="text-center">
            <h2
              className="text-5xl font-bold gradient-text mb-4"
              style={{ fontFamily: "Bebas Neue, sans-serif" }}
            >
              MAZE RUNNER
            </h2>
            <p
              className="text-white/40 text-sm mb-6"
              style={{ fontFamily: "Space Mono, monospace" }}
            >
              Find the glowing exit before time runs out
            </p>
            <button onClick={() => setStarted(true)} className="btn-primary">
              <span>START</span>
            </button>
          </div>
        </div>
      )}

      {/* Win overlay */}
      {won && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark/70 backdrop-blur-sm z-20">
          <div className="text-center">
            <h2
              className="text-5xl font-bold gradient-text mb-2"
              style={{ fontFamily: "Bebas Neue, sans-serif" }}
            >
              MAZE COMPLETE!
            </h2>
            <p
              className="text-3xl text-primary mb-6"
              style={{ fontFamily: "Bebas Neue, sans-serif" }}
            >
              TIME: {formatTime(time)}
            </p>
            <button onClick={restart} className="btn-primary">
              <span>NEW MAZE</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
