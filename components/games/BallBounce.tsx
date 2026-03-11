"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* ─── Types ─── */
interface Block {
  id: number;
  x: number;
  y: number;
  color: string;
  alive: boolean;
}

/* ─── Constants ─── */
const PADDLE_WIDTH = 2;
const PADDLE_HEIGHT = 0.25;
const BALL_RADIUS = 0.15;
const BLOCK_W = 1.1;
const BLOCK_H = 0.4;
const COLS = 8;
const ROWS = 5;
const FIELD_LEFT = -5;
const FIELD_RIGHT = 5;
const FIELD_TOP = 6;
const FIELD_BOTTOM = -5;

const BLOCK_COLORS = ["#f72585", "#7209b7", "#3a0ca3", "#4361ee", "#00f5d4"];

function createBlocks(level: number): Block[] {
  const blocks: Block[] = [];
  let id = 0;
  const rows = Math.min(ROWS + level, 8);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < COLS; c++) {
      blocks.push({
        id: id++,
        x: FIELD_LEFT + 1 + c * (BLOCK_W + 0.15),
        y: FIELD_TOP - 1 - r * (BLOCK_H + 0.15),
        color: BLOCK_COLORS[r % BLOCK_COLORS.length],
        alive: true,
      });
    }
  }
  return blocks;
}

/* ─── Walls ─── */
function Walls() {
  return (
    <>
      {/* Top */}
      <mesh position={[0, FIELD_TOP + 0.15, 0]}>
        <boxGeometry args={[FIELD_RIGHT - FIELD_LEFT + 0.6, 0.3, 0.3]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      {/* Left */}
      <mesh position={[FIELD_LEFT - 0.15, (FIELD_TOP + FIELD_BOTTOM) / 2, 0]}>
        <boxGeometry args={[0.3, FIELD_TOP - FIELD_BOTTOM + 0.6, 0.3]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      {/* Right */}
      <mesh position={[FIELD_RIGHT + 0.15, (FIELD_TOP + FIELD_BOTTOM) / 2, 0]}>
        <boxGeometry args={[0.3, FIELD_TOP - FIELD_BOTTOM + 0.6, 0.3]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
    </>
  );
}

/* ─── Paddle ─── */
function Paddle({ x }: { x: number }) {
  return (
    <mesh position={[x, FIELD_BOTTOM + 0.5, 0]}>
      <boxGeometry args={[PADDLE_WIDTH, PADDLE_HEIGHT, 0.3]} />
      <meshStandardMaterial
        color="#00f5d4"
        emissive="#00f5d4"
        emissiveIntensity={0.5}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}

/* ─── Ball ─── */
function Ball({ x, y }: { x: number; y: number }) {
  return (
    <mesh position={[x, y, 0]}>
      <sphereGeometry args={[BALL_RADIUS, 16, 16]} />
      <meshStandardMaterial
        color="#f72585"
        emissive="#f72585"
        emissiveIntensity={1}
      />
    </mesh>
  );
}

/* ─── Block Mesh ─── */
function BlockMesh({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <mesh position={[x, y, 0]}>
      <boxGeometry args={[BLOCK_W, BLOCK_H, 0.25]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.3}
        metalness={0.5}
        roughness={0.4}
      />
    </mesh>
  );
}

/* ─── Game Scene ─── */
function GameScene({
  gameState,
  setGameState,
}: {
  gameState: {
    score: number;
    lives: number;
    level: number;
    gameOver: boolean;
    launched: boolean;
  };
  setGameState: React.Dispatch<React.SetStateAction<typeof gameState>>;
}) {
  const paddleX = useRef(0);
  const [px, setPx] = useState(0);
  const ballPos = useRef({ x: 0, y: FIELD_BOTTOM + 0.8 });
  const ballVel = useRef({ x: 3, y: 5 });
  const [bx, setBx] = useState(0);
  const [by, setBy] = useState(FIELD_BOTTOM + 0.8);
  const [blocks, setBlocks] = useState<Block[]>(() => createBlocks(0));
  const { camera, gl } = useThree();

  useEffect(() => {
    camera.position.set(0, 0, 12);
  }, [camera]);

  // Mouse and Keyboard tracking
  const keys = useRef<Set<string>>(new Set());

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mapped = ndcX * (FIELD_RIGHT - 1);
      paddleX.current = Math.max(
        FIELD_LEFT + PADDLE_WIDTH / 2,
        Math.min(FIELD_RIGHT - PADDLE_WIDTH / 2, mapped),
      );
    };
    const handleClick = () => {
      if (!gameState.launched) {
        setGameState((s) => ({ ...s, launched: true }));
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current.add(e.key.toLowerCase());
      if (e.key === " " || e.key === "Enter") {
        if (!gameState.launched) {
          setGameState((s) => ({ ...s, launched: true }));
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current.delete(e.key.toLowerCase());
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("click", handleClick);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gl, gameState.launched, setGameState]);

  // Reset blocks on level change
  useEffect(() => {
    setBlocks(createBlocks(gameState.level));
    ballPos.current = { x: paddleX.current, y: FIELD_BOTTOM + 0.8 };
    ballVel.current = { x: 3, y: 5 };
    setGameState((s) => ({ ...s, launched: false }));
  }, [gameState.level, setGameState]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.03);

    // Keyboard movement
    const kbSpeed = 10;
    if (keys.current.has("a") || keys.current.has("arrowleft")) {
      paddleX.current = Math.max(
        FIELD_LEFT + PADDLE_WIDTH / 2,
        paddleX.current - kbSpeed * dt,
      );
    }
    if (keys.current.has("d") || keys.current.has("arrowright")) {
      paddleX.current = Math.min(
        FIELD_RIGHT - PADDLE_WIDTH / 2,
        paddleX.current + kbSpeed * dt,
      );
    }

    setPx(paddleX.current);

    if (!gameState.launched || gameState.gameOver) {
      ballPos.current.x = paddleX.current;
      ballPos.current.y = FIELD_BOTTOM + 0.8;
      setBx(ballPos.current.x);
      setBy(ballPos.current.y);
      return;
    }

    const bp = ballPos.current;
    const bv = ballVel.current;

    // Move ball
    bp.x += bv.x * dt;
    bp.y += bv.y * dt;

    // Wall bounces
    if (bp.x - BALL_RADIUS <= FIELD_LEFT) {
      bp.x = FIELD_LEFT + BALL_RADIUS;
      bv.x = Math.abs(bv.x);
    }
    if (bp.x + BALL_RADIUS >= FIELD_RIGHT) {
      bp.x = FIELD_RIGHT - BALL_RADIUS;
      bv.x = -Math.abs(bv.x);
    }
    if (bp.y + BALL_RADIUS >= FIELD_TOP) {
      bp.y = FIELD_TOP - BALL_RADIUS;
      bv.y = -Math.abs(bv.y);
    }

    // Ball falls below
    if (bp.y < FIELD_BOTTOM - 1) {
      setGameState((s) => {
        const newLives = s.lives - 1;
        if (newLives <= 0) return { ...s, lives: 0, gameOver: true };
        return { ...s, lives: newLives, launched: false };
      });
      bp.x = paddleX.current;
      bp.y = FIELD_BOTTOM + 0.8;
      bv.x = 3;
      bv.y = 5;
    }

    // Paddle collision
    const paddleTop = FIELD_BOTTOM + 0.5 + PADDLE_HEIGHT / 2;
    if (
      bv.y < 0 &&
      bp.y - BALL_RADIUS <= paddleTop &&
      bp.y + BALL_RADIUS >= paddleTop - 0.2 &&
      bp.x >= paddleX.current - PADDLE_WIDTH / 2 - 0.1 &&
      bp.x <= paddleX.current + PADDLE_WIDTH / 2 + 0.1
    ) {
      bv.y = Math.abs(bv.y);
      // Angle based on hit position
      const hitPos = (bp.x - paddleX.current) / (PADDLE_WIDTH / 2);
      bv.x = hitPos * 6;
      bp.y = paddleTop + BALL_RADIUS;
    }

    // Block collision
    let hitBlock = false;
    setBlocks((prev) => {
      const next = prev.map((b) => {
        if (!b.alive || hitBlock) return b;
        if (
          bp.x + BALL_RADIUS > b.x - BLOCK_W / 2 &&
          bp.x - BALL_RADIUS < b.x + BLOCK_W / 2 &&
          bp.y + BALL_RADIUS > b.y - BLOCK_H / 2 &&
          bp.y - BALL_RADIUS < b.y + BLOCK_H / 2
        ) {
          hitBlock = true;
          bv.y = -bv.y;
          setGameState((s) => ({ ...s, score: s.score + 10 }));
          return { ...b, alive: false };
        }
        return b;
      });

      // Check if all blocks destroyed → next level
      if (next.every((b) => !b.alive)) {
        setTimeout(() => {
          setGameState((s) => ({ ...s, level: s.level + 1 }));
        }, 500);
      }

      return next;
    });

    // Speed up slightly over time
    const speedFactor = 1 + 0.0003;
    bv.x *= speedFactor;
    bv.y *= speedFactor;

    setBx(bp.x);
    setBy(bp.y);
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 5, 5]} intensity={1} color="#7209b7" />
      <pointLight position={[0, -3, 5]} intensity={0.5} color="#00f5d4" />

      <Walls />
      <Paddle x={px} />
      <Ball x={bx} y={by} />
      {blocks
        .filter((b) => b.alive)
        .map((b) => (
          <BlockMesh key={b.id} x={b.x} y={b.y} color={b.color} />
        ))}

      {/* Background */}
      <mesh position={[0, 0, -1]}>
        <planeGeometry args={[15, 15]} />
        <meshStandardMaterial color="#020817" />
      </mesh>
    </>
  );
}

type BallGameState = {
  score: number;
  lives: number;
  level: number;
  gameOver: boolean;
  launched: boolean;
};

/* ─── Main Component ─── */
export default function BallBounce() {
  const [gameState, setGameState] = useState<BallGameState>({
    score: 0,
    lives: 3,
    level: 0,
    gameOver: false,
    launched: false,
  });

  const restart = useCallback(() => {
    setGameState({
      score: 0,
      lives: 3,
      level: 0,
      gameOver: false,
      launched: false,
    });
  }, []);

  return (
    <div className="relative w-full h-full">
      <Canvas>
        <GameScene gameState={gameState} setGameState={setGameState as any} />
      </Canvas>

      {/* HUD */}
      <div className="absolute top-16 left-4 z-10 flex gap-3">
        <div className="px-3 py-2 bg-dark/80 backdrop-blur-md border border-primary/20 rounded-sm">
          <p
            className="text-primary text-lg font-bold"
            style={{ fontFamily: "Bebas Neue, sans-serif" }}
          >
            SCORE: {gameState.score}
          </p>
        </div>
        <div className="px-3 py-2 bg-dark/80 backdrop-blur-md border border-white/10 rounded-sm">
          <p
            className="text-white/60 text-sm"
            style={{ fontFamily: "Space Mono, monospace" }}
          >
            LEVEL {gameState.level + 1}
          </p>
        </div>
      </div>

      <div className="absolute top-16 right-4 z-10 px-3 py-2 bg-dark/80 backdrop-blur-md border border-secondary/20 rounded-sm">
        <p
          className="text-secondary text-sm"
          style={{ fontFamily: "Space Mono, monospace" }}
        >
          {"♥".repeat(gameState.lives)}
          {"♡".repeat(Math.max(0, 3 - gameState.lives))}
        </p>
      </div>

      {/* Launch instruction */}
      {!gameState.launched && !gameState.gameOver && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-dark/80 backdrop-blur-md border border-primary/20 rounded-sm">
          <p
            className="text-primary text-xs tracking-widest"
            style={{ fontFamily: "Space Mono, monospace" }}
          >
            CLICK TO LAUNCH
          </p>
        </div>
      )}

      {/* Game Over */}
      {gameState.gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark/80 backdrop-blur-sm z-20">
          <div className="text-center">
            <h2
              className="text-5xl font-bold text-secondary mb-2"
              style={{ fontFamily: "Bebas Neue, sans-serif" }}
            >
              GAME OVER
            </h2>
            <p
              className="text-3xl text-primary mb-1"
              style={{ fontFamily: "Bebas Neue, sans-serif" }}
            >
              SCORE: {gameState.score}
            </p>
            <p
              className="text-white/40 text-sm mb-6"
              style={{ fontFamily: "Space Mono, monospace" }}
            >
              LEVEL {gameState.level + 1}
            </p>
            <button onClick={restart} className="btn-primary">
              <span>PLAY AGAIN</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
