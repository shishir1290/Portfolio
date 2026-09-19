"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type CellValue = "X" | "O" | null;
type Board = CellValue[];

/* ─── Minimax AI Logic ─── */
const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function checkWinner(board: Board): { winner: CellValue | "draw" | null; line?: number[] } {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }
  if (board.every((c) => c !== null)) return { winner: "draw" };
  return { winner: null };
}

function minimax(board: Board, isMax: boolean, depth: number): number {
  const result = checkWinner(board);
  if (result.winner === "O") return 10 - depth;
  if (result.winner === "X") return depth - 10;
  if (result.winner === "draw") return 0;

  if (isMax) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = "O";
        best = Math.max(best, minimax(board, false, depth + 1));
        board[i] = null;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = "X";
        best = Math.min(best, minimax(board, true, depth + 1));
        board[i] = null;
      }
    }
    return best;
  }
}

function getBestMove(board: Board, difficulty: "easy" | "medium" | "unbeatable"): number {
  const available: number[] = [];
  board.forEach((val, idx) => {
    if (!val) available.push(idx);
  });

  if (available.length === 0) return -1;

  if (difficulty === "easy") {
    return available[Math.floor(Math.random() * available.length)];
  }

  if (difficulty === "medium" && Math.random() < 0.35) {
    return available[Math.floor(Math.random() * available.length)];
  }

  let bestScore = -Infinity;
  let bestMove = available[0];
  for (const idx of available) {
    board[idx] = "O";
    const score = minimax(board, false, 0);
    board[idx] = null;
    if (score > bestScore) {
      bestScore = score;
      bestMove = idx;
    }
  }
  return bestMove;
}

// 3D coordinates for the 3x3 grid (spacing = 1.35)
const GRID_POSITIONS: [number, number, number][] = [
  [-1.35, 0, -1.35], [0, 0, -1.35], [1.35, 0, -1.35],
  [-1.35, 0, 0],     [0, 0, 0],     [1.35, 0, 0],
  [-1.35, 0, 1.35],  [0, 0, 1.35],  [1.35, 0, 1.35],
];

export default function TicTacToe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [turn, setTurn] = useState<"X" | "O">("X");
  const [winner, setWinner] = useState<CellValue | "draw" | null>(null);
  const [scores, setScores] = useState({ player: 0, ai: 0, ties: 0 });
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "unbeatable">("unbeatable");
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Sync ref with state
  const stateRef = useRef({
    board: Array(9).fill(null) as Board,
    turn: "X" as "X" | "O",
    winner: null as CellValue | "draw" | null,
    difficulty: "unbeatable" as "easy" | "medium" | "unbeatable",
    isAiThinking: false,
    tileMeshes: [] as THREE.Mesh[],
    pieceGroups: [] as (THREE.Group | null)[],
    winBeam: null as THREE.Mesh | null,
    isDragging: false,
    prevMouse: { x: 0, y: 0 },
    rotation: { x: 0.5, y: -0.4 },
    targetRotation: { x: 0.5, y: -0.4 },
  });

  stateRef.current.difficulty = difficulty;

  /* ─── Handle Turn & AI Play ─── */
  const handleCellClick = (idx: number) => {
    const s = stateRef.current;
    if (s.board[idx] || s.winner || s.turn !== "X" || s.isAiThinking) return;

    // Place Player "X"
    const nextBoard = [...s.board];
    nextBoard[idx] = "X";
    s.board = nextBoard;
    setBoard(nextBoard);

    const winCheck = checkWinner(nextBoard);
    if (winCheck.winner) {
      handleGameOver(winCheck.winner, winCheck.line);
      return;
    }

    // Switch to AI "O"
    s.turn = "O";
    setTurn("O");
    s.isAiThinking = true;
    setIsAiThinking(true);

    setTimeout(() => {
      if (stateRef.current.winner) return;
      const aiMove = getBestMove(stateRef.current.board, stateRef.current.difficulty);
      if (aiMove !== -1) {
        const afterAiBoard = [...stateRef.current.board];
        afterAiBoard[aiMove] = "O";
        stateRef.current.board = afterAiBoard;
        setBoard(afterAiBoard);

        const aiWinCheck = checkWinner(afterAiBoard);
        if (aiWinCheck.winner) {
          handleGameOver(aiWinCheck.winner, aiWinCheck.line);
        } else {
          stateRef.current.turn = "X";
          setTurn("X");
        }
      }
      stateRef.current.isAiThinking = false;
      setIsAiThinking(false);
    }, 450);
  };

  const handleGameOver = (winResult: CellValue | "draw", winLine?: number[]) => {
    stateRef.current.winner = winResult;
    setWinner(winResult);

    if (winResult === "X") {
      setScores((prev) => ({ ...prev, player: prev.player + 1 }));
    } else if (winResult === "O") {
      setScores((prev) => ({ ...prev, ai: prev.ai + 1 }));
    } else {
      setScores((prev) => ({ ...prev, ties: prev.ties + 1 }));
    }
  };

  const resetGame = () => {
    const emptyBoard = Array(9).fill(null);
    stateRef.current.board = emptyBoard;
    stateRef.current.turn = "X";
    stateRef.current.winner = null;
    stateRef.current.isAiThinking = false;
    setBoard(emptyBoard);
    setTurn("X");
    setWinner(null);
    setIsAiThinking(false);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    /* ─── Three.js Scene Setup ─── */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060813);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 4.5, 6.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    /* ─── Ambient & Spotlights ─── */
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);

    const cyanLight = new THREE.PointLight(0x00f5d4, 3, 20);
    cyanLight.position.set(4, 6, 4);
    scene.add(cyanLight);

    const magentaLight = new THREE.PointLight(0xff007f, 3, 20);
    magentaLight.position.set(-4, 6, -4);
    scene.add(magentaLight);

    /* ─── Root Rotating Board Group ─── */
    const boardGroup = new THREE.Group();
    scene.add(boardGroup);

    // Grid Base Platform
    const baseGeo = new THREE.BoxGeometry(4.8, 0.25, 4.8);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0c1020,
      roughness: 0.3,
      metalness: 0.8,
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -0.15;
    boardGroup.add(base);

    // Glowing Platform Edge Trim
    const edgeGeo = new THREE.BoxGeometry(5.0, 0.05, 5.0);
    const edgeMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4, wireframe: true });
    const edgeMesh = new THREE.Mesh(edgeGeo, edgeMat);
    edgeMesh.position.y = 0.02;
    boardGroup.add(edgeMesh);

    // 3x3 Clickable Tile Pedestals
    const tileMeshes: THREE.Mesh[] = [];
    const pieceGroups: (THREE.Group | null)[] = Array(9).fill(null);

    GRID_POSITIONS.forEach((pos, idx) => {
      const tileGeo = new THREE.BoxGeometry(1.2, 0.1, 1.2);
      const tileMat = new THREE.MeshStandardMaterial({
        color: 0x141a2e,
        roughness: 0.4,
        metalness: 0.6,
      });
      const tile = new THREE.Mesh(tileGeo, tileMat);
      tile.position.set(pos[0], 0.05, pos[2]);
      (tile as any).userData = { index: idx };
      boardGroup.add(tile);
      tileMeshes.push(tile);
    });
    stateRef.current.tileMeshes = tileMeshes;

    /* ─── 3D X Piece Builder ─── */
    function createXMesh() {
      const group = new THREE.Group();
      const barGeo = new THREE.BoxGeometry(0.18, 0.18, 1.05);
      const barMat = new THREE.MeshStandardMaterial({
        color: 0x00f5d4,
        emissive: 0x00f5d4,
        emissiveIntensity: 0.8,
        roughness: 0.2,
      });

      const bar1 = new THREE.Mesh(barGeo, barMat);
      bar1.rotation.y = Math.PI / 4;
      group.add(bar1);

      const bar2 = new THREE.Mesh(barGeo, barMat);
      bar2.rotation.y = -Math.PI / 4;
      group.add(bar2);

      group.position.y = 0.35;
      return group;
    }

    /* ─── 3D O Piece Builder ─── */
    function createOMesh() {
      const group = new THREE.Group();
      const torusGeo = new THREE.TorusGeometry(0.42, 0.09, 16, 32);
      const torusMat = new THREE.MeshStandardMaterial({
        color: 0xff007f,
        emissive: 0xff007f,
        emissiveIntensity: 0.8,
        roughness: 0.2,
      });
      const torus = new THREE.Mesh(torusGeo, torusMat);
      torus.rotation.x = Math.PI / 2;
      group.add(torus);

      group.position.y = 0.35;
      return group;
    }

    /* ─── Particles Burst on Win ─── */
    const particleCount = 200;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    const pVel = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pPos[i * 3] = 0;
      pPos[i * 3 + 1] = 0.5;
      pPos[i * 3 + 2] = 0;
      pVel[i * 3] = (Math.random() - 0.5) * 4;
      pVel[i * 3 + 1] = Math.random() * 4 + 1;
      pVel[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x00f5d4,
      size: 0.12,
      transparent: true,
      opacity: 0,
    });
    const confetti = new THREE.Points(pGeo, pMat);
    scene.add(confetti);

    let confettiActive = false;
    let confettiTimer = 0;

    /* ─── Raycasting & Pointer Interactions ─── */
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredIdx: number | null = null;

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (stateRef.current.isDragging) {
        const dx = e.clientX - stateRef.current.prevMouse.x;
        const dy = e.clientY - stateRef.current.prevMouse.y;
        stateRef.current.targetRotation.y += dx * 0.008;
        stateRef.current.targetRotation.x = Math.max(
          0.2,
          Math.min(1.2, stateRef.current.targetRotation.x + dy * 0.008)
        );
        stateRef.current.prevMouse = { x: e.clientX, y: e.clientY };
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      stateRef.current.isDragging = true;
      stateRef.current.prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      const wasDrag =
        Math.abs(e.clientX - stateRef.current.prevMouse.x) > 4 ||
        Math.abs(e.clientY - stateRef.current.prevMouse.y) > 4;

      stateRef.current.isDragging = false;

      if (!wasDrag && hoveredIdx !== null) {
        handleCellClick(hoveredIdx);
      }
    };

    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);

    /* ─── Animation Loop ─── */
    let frameId: number;
    let lastRenderBoard: Board = Array(9).fill(null);

    const animate = () => {
      frameId = requestAnimationFrame(animate);

      // Smooth Board Rotation Damping
      const s = stateRef.current;
      s.rotation.x += (s.targetRotation.x - s.rotation.x) * 0.1;
      s.rotation.y += (s.targetRotation.y - s.rotation.y) * 0.1;
      boardGroup.rotation.x = s.rotation.x;
      boardGroup.rotation.y = s.rotation.y;

      // Check Raycast Hover on tiles
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(tileMeshes);

      hoveredIdx = null;
      tileMeshes.forEach((tile, idx) => {
        const mat = tile.material as THREE.MeshStandardMaterial;
        if (intersects.length > 0 && intersects[0].object === tile && !s.board[idx] && !s.winner) {
          hoveredIdx = idx;
          mat.color.setHex(s.turn === "X" ? 0x00443d : 0x440026);
          mat.emissive.setHex(s.turn === "X" ? 0x00f5d4 : 0xff007f);
          mat.emissiveIntensity = 0.4;
          container.style.cursor = "pointer";
        } else {
          mat.color.setHex(0x141a2e);
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0;
        }
      });

      if (hoveredIdx === null) {
        container.style.cursor = s.isDragging ? "grabbing" : "grab";
      }

      // Sync 3D Meshes with Current Board State
      for (let i = 0; i < 9; i++) {
        const currentVal = s.board[i];
        const prevVal = lastRenderBoard[i];

        if (currentVal !== prevVal) {
          if (!currentVal && pieceGroups[i]) {
            boardGroup.remove(pieceGroups[i]!);
            pieceGroups[i] = null;
          } else if (currentVal === "X" && !pieceGroups[i]) {
            const xMesh = createXMesh();
            xMesh.position.set(GRID_POSITIONS[i][0], 0.35, GRID_POSITIONS[i][2]);
            boardGroup.add(xMesh);
            pieceGroups[i] = xMesh;
          } else if (currentVal === "O" && !pieceGroups[i]) {
            const oMesh = createOMesh();
            oMesh.position.set(GRID_POSITIONS[i][0], 0.35, GRID_POSITIONS[i][2]);
            boardGroup.add(oMesh);
            pieceGroups[i] = oMesh;
          }
        }
      }
      lastRenderBoard = [...s.board];

      // Handle win confetti particles
      if (s.winner === "X" && !confettiActive) {
        confettiActive = true;
        confettiTimer = 1.5;
        pMat.opacity = 0.9;
        pMat.color.setHex(0x00f5d4);
      } else if (!s.winner) {
        confettiActive = false;
        pMat.opacity = 0;
      }

      if (confettiActive && confettiTimer > 0) {
        confettiTimer -= 0.016;
        const arr = pGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          arr[i * 3] += pVel[i * 3] * 0.02;
          arr[i * 3 + 1] += pVel[i * 3 + 1] * 0.02;
          arr[i * 3 + 2] += pVel[i * 3 + 2] * 0.02;
          pVel[i * 3 + 1] -= 0.06; // Gravity
        }
        pGeo.attributes.position.needsUpdate = true;
        pMat.opacity = Math.max(0, confettiTimer);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      cancelAnimationFrame(frameId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-dark">
      {/* 3D Canvas */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full touch-none" />

      {/* Top HUD Overlay */}
      <div className="absolute top-16 left-0 right-0 px-4 sm:px-8 flex items-start justify-between pointer-events-none z-30">
        {/* Turn & Status Indicator */}
        <div className="bg-black/75 border border-primary/30 backdrop-blur-md px-4 py-2.5 rounded-sm">
          <span className="text-[10px] font-mono text-white/40 tracking-widest uppercase block mb-0.5">
            MATCH STATUS
          </span>
          <div className="flex items-center gap-2">
            {isAiThinking ? (
              <span className="text-sm font-mono font-bold text-accent animate-pulse">
                AI CALCULATING...
              </span>
            ) : winner ? (
              <span className="text-sm font-mono font-bold text-primary">
                {winner === "draw" ? "DRAW GAME" : `${winner} WINS!`}
              </span>
            ) : (
              <span
                className={`text-sm font-mono font-bold ${
                  turn === "X" ? "text-primary" : "text-pink-400"
                }`}
              >
                {turn === "X" ? "YOUR TURN [X]" : "AI TURN [O]"}
              </span>
            )}
          </div>
        </div>

        {/* Scoreboard */}
        <div className="bg-black/75 border border-white/20 backdrop-blur-md px-4 py-2.5 rounded-sm font-mono text-right">
          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-white/40 text-[10px] block">YOU (X)</span>
              <span className="text-primary font-bold text-base">{scores.player}</span>
            </div>
            <div>
              <span className="text-white/40 text-[10px] block">AI (O)</span>
              <span className="text-pink-400 font-bold text-base">{scores.ai}</span>
            </div>
            <div>
              <span className="text-white/40 text-[10px] block">TIES</span>
              <span className="text-white/70 font-bold text-base">{scores.ties}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 sm:gap-3 bg-black/85 border border-white/10 px-4 py-2.5 rounded-full backdrop-blur-md">
        {/* Difficulty selector */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10">
          {(["easy", "medium", "unbeatable"] as const).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setDifficulty(lvl)}
              className={`text-[10px] font-mono uppercase px-2.5 py-1 rounded-full transition-all ${
                difficulty === lvl
                  ? "bg-primary text-black font-bold"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* New Game / Reset Button */}
        <button
          type="button"
          onClick={resetGame}
          className="px-4 py-1.5 bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary font-mono text-xs font-bold rounded-full transition-all active:scale-95"
        >
          RESET BOARD
        </button>
      </div>

      {/* Game Over Modal */}
      {winner && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40 p-4 animate-in fade-in duration-150">
          <div className="bg-dark/95 border border-primary/50 p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl rounded-sm">
            <div className="inline-block px-3 py-1 bg-primary/20 border border-primary/40 text-primary text-[11px] font-mono tracking-widest uppercase mb-3">
              MATCH COMPLETED
            </div>
            <h2
              className="text-4xl sm:text-5xl font-bold text-white tracking-wider mb-2"
              style={{ fontFamily: "Bebas Neue, sans-serif" }}
            >
              {winner === "draw" ? "STALEMATE" : winner === "X" ? "VICTORY!" : "AI VICTORY"}
            </h2>
            <p className="text-white/50 text-xs font-mono mb-6">
              {winner === "X"
                ? "You defeated the minimax algorithm!"
                : winner === "O"
                ? "The AI calculated the winning sequence."
                : "A perfect tactical draw."}
            </p>
            <button
              type="button"
              onClick={resetGame}
              className="w-full py-3 bg-primary hover:bg-primary/90 text-dark font-mono font-bold tracking-widest text-xs transition-transform active:scale-95 shadow-lg shadow-primary/20"
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
