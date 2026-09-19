"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/* ─── Web Audio Sound Effects Synthesizer ─── */
class MazeAudio {
  private ctx: AudioContext | null = null;
  public enabled = true;

  private init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playStep() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(90, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  playPickup() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [440, 554.37, 659.25, 880].forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + i * 0.04);
      gain.gain.setValueAtTime(0.08, now + i * 0.04);
      gain.gain.linearRampToValueAtTime(0.001, now + i * 0.04 + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + i * 0.04);
      osc.stop(now + i * 0.04 + 0.08);
    });
  }

  playLevelComplete() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0.12, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.001, now + i * 0.08 + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.2);
    });
  }
}

const mazeSfx = new MazeAudio();

/* ─── Procedural Maze Generator ─── */
function generateMaze(w: number, h: number) {
  const gridWidth = w * 2 + 1;
  const gridHeight = h * 2 + 1;
  const grid: boolean[][] = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(true));

  function carve(cx: number, cy: number) {
    grid[cy][cx] = false;
    const directions = [
      [0, -2],
      [0, 2],
      [-2, 0],
      [2, 0],
    ].sort(() => Math.random() - 0.5);

    for (const [dx, dy] of directions) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx > 0 && nx < gridWidth - 1 && ny > 0 && ny < gridHeight - 1 && grid[ny][nx]) {
        grid[cy + dy / 2][cx + dx / 2] = false;
        carve(nx, ny);
      }
    }
  }

  carve(1, 1);
  return {
    grid,
    gridWidth,
    gridHeight,
    start: [1, 1] as [number, number],
    end: [gridWidth - 2, gridHeight - 2] as [number, number],
  };
}

/* ─── Level Definitions ─── */
const LEVELS = [
  {
    level: 1,
    name: "SECTOR ALPHA",
    subname: "INITIATION OUTPOST",
    w: 5,
    h: 5,
    theme: {
      wall: 0x11162b,
      neon: 0x00f5d4,
      floor: 0x080c18,
      fog: 0x040710,
    },
    targetTime: 45,
  },
  {
    level: 2,
    name: "SECTOR BETA",
    subname: "MAGMA CRUCIBLE",
    w: 7,
    h: 7,
    theme: {
      wall: 0x240e11,
      neon: 0xff4422,
      floor: 0x140508,
      fog: 0x0c0204,
    },
    targetTime: 70,
  },
  {
    level: 3,
    name: "SECTOR GAMMA",
    subname: "CRYSTAL LABYRINTH",
    w: 9,
    h: 9,
    theme: {
      wall: 0x0f2233,
      neon: 0x38bdf8,
      floor: 0x081320,
      fog: 0x030a12,
    },
    targetTime: 100,
  },
  {
    level: 4,
    name: "SECTOR DELTA",
    subname: "SYNTHWAVE CITADEL",
    w: 11,
    h: 11,
    theme: {
      wall: 0x220f2e,
      neon: 0xff007f,
      floor: 0x12071a,
      fog: 0x0a030f,
    },
    targetTime: 140,
  },
  {
    level: 5,
    name: "SECTOR EPSILON",
    subname: "TITAN MATRIX CORE",
    w: 13,
    h: 13,
    theme: {
      wall: 0x0a1a0f,
      neon: 0x22c55e,
      floor: 0x050f08,
      fog: 0x020804,
    },
    targetTime: 180,
  },
];

interface CrystalShard {
  mesh: THREE.Group;
  light: THREE.PointLight;
  x: number;
  z: number;
  collected: boolean;
}

export default function MazeRunner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const minimapCanvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<"menu" | "playing" | "level_complete" | "campaign_victory">("menu");
  const [currentLevel, setCurrentLevel] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [levelTime, setLevelTime] = useState(0);
  const [distanceToExit, setDistanceToExit] = useState(100);
  const [shardsCollected, setShardsCollected] = useState(0);
  const [totalShards, setTotalShards] = useState(0);
  const [flashlightOn, setFlashlightOn] = useState(true);
  const [speedBoostActive, setSpeedBoostActive] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);
  const [levelScoreGain, setLevelScoreGain] = useState(0);

  const rebuildMazeRef = useRef<(lvlIdx: number) => void>(() => {});

  const stateRef = useRef({
    gameState: "menu" as "menu" | "playing" | "level_complete" | "campaign_victory",
    currentLevel: 1,
    totalScore: 0,
    playerPos: new THREE.Vector3(1, 1.2, 1),
    yaw: 0,
    pitch: 0,
    headBob: 0,
    keys: { w: false, a: false, s: false, d: false, shift: false },
    mazeData: null as ReturnType<typeof generateMaze> | null,
    isPointerLocked: false,
    levelStartTime: 0,
    shards: [] as CrystalShard[],
    shardsCollected: 0,
    speedBoostTimer: 0,
    flashlightOn: true,
    exploredGrid: [] as boolean[][],
    stepDistanceAccum: 0,
    exitPos: { x: 0, z: 0 },
  });

  stateRef.current.gameState = gameState;
  stateRef.current.currentLevel = currentLevel;
  stateRef.current.flashlightOn = flashlightOn;

  const startLevel = (lvlNum: number) => {
    setCurrentLevel(lvlNum);
    stateRef.current.currentLevel = lvlNum;
    stateRef.current.levelStartTime = performance.now();
    stateRef.current.shardsCollected = 0;
    stateRef.current.speedBoostTimer = 0;
    setShardsCollected(0);
    setLevelTime(0);
    setSpeedBoostActive(false);
    rebuildMazeRef.current(lvlNum);
    setGameState("playing");
  };

  const nextLevel = () => {
    if (currentLevel < LEVELS.length) {
      startLevel(currentLevel + 1);
    } else {
      setGameState("campaign_victory");
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    /* ─── Three.js Scene Setup ─── */
    const scene = new THREE.Scene();
    const initialLvl = LEVELS[0];
    scene.background = new THREE.Color(initialLvl.theme.fog);
    scene.fog = new THREE.FogExp2(initialLvl.theme.fog, 0.085);

    const camera = new THREE.PerspectiveCamera(
      70,
      container.clientWidth / container.clientHeight,
      0.1,
      90
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    /* ─── Lighting ─── */
    const ambient = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambient);

    const spotLight = new THREE.SpotLight(0xffffff, 3.8, 20, Math.PI / 3.8, 0.35, 1.4);
    scene.add(spotLight);
    scene.add(spotLight.target);

    const playerPointLight = new THREE.PointLight(initialLvl.theme.neon, 1.6, 7);
    scene.add(playerPointLight);

    /* ─── Dynamic Level Builder ─── */
    const CELL_SIZE = 2.6;
    const WALL_HEIGHT = 3.0;

    let mazeGroup = new THREE.Group();
    scene.add(mazeGroup);

    let portalGroup = new THREE.Group();
    scene.add(portalGroup);

    let ring1: THREE.Mesh;
    let ring2: THREE.Mesh;
    let beacon: THREE.Mesh;
    let exitLight: THREE.PointLight;

    // Portal Meshes Setup
    const ringGeo = new THREE.TorusGeometry(1.0, 0.08, 16, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: initialLvl.theme.neon, wireframe: true });
    ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring2 = new THREE.Mesh(ringGeo, ringMat);
    portalGroup.add(ring1);
    portalGroup.add(ring2);

    const beaconGeo = new THREE.CylinderGeometry(0.12, 0.12, 22, 8);
    const beaconMat = new THREE.MeshBasicMaterial({ color: initialLvl.theme.neon, transparent: true, opacity: 0.65 });
    beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.y = 11;
    portalGroup.add(beacon);

    exitLight = new THREE.PointLight(initialLvl.theme.neon, 4.0, 18);
    portalGroup.add(exitLight);

    function buildMazeForLevel(lvlNum: number) {
      // Clear old maze & shards
      scene.remove(mazeGroup);
      stateRef.current.shards.forEach((s) => scene.remove(s.mesh));
      stateRef.current.shards = [];

      mazeGroup = new THREE.Group();
      scene.add(mazeGroup);

      const lvlConfig = LEVELS[lvlNum - 1];
      const curTheme = lvlConfig.theme;

      // Update Theme Environment
      scene.background = new THREE.Color(curTheme.fog);
      if (scene.fog) scene.fog.color.setHex(curTheme.fog);
      playerPointLight.color.setHex(curTheme.neon);
      ringMat.color.setHex(curTheme.neon);
      beaconMat.color.setHex(curTheme.neon);
      exitLight.color.setHex(curTheme.neon);

      // Generate Level Maze
      const maze = generateMaze(lvlConfig.w, lvlConfig.h);
      stateRef.current.mazeData = maze;

      // Reset Fog of War
      const explored: boolean[][] = Array.from({ length: maze.gridHeight }, () =>
        Array(maze.gridWidth).fill(false)
      );
      stateRef.current.exploredGrid = explored;

      // Floor
      const floorGeo = new THREE.PlaneGeometry(
        maze.gridWidth * CELL_SIZE,
        maze.gridHeight * CELL_SIZE
      );
      const floorMat = new THREE.MeshStandardMaterial({
        color: curTheme.floor,
        roughness: 0.85,
        metalness: 0.2,
      });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.position.set((maze.gridWidth * CELL_SIZE) / 2, 0, (maze.gridHeight * CELL_SIZE) / 2);
      mazeGroup.add(floor);

      // Walls
      const wallGeo = new THREE.BoxGeometry(CELL_SIZE, WALL_HEIGHT, CELL_SIZE);
      const wallMat = new THREE.MeshStandardMaterial({
        color: curTheme.wall,
        roughness: 0.4,
        metalness: 0.7,
      });
      const trimGeo = new THREE.BoxGeometry(CELL_SIZE + 0.02, 0.08, CELL_SIZE + 0.02);
      const trimMat = new THREE.MeshBasicMaterial({ color: curTheme.neon });

      for (let r = 0; r < maze.gridHeight; r++) {
        for (let c = 0; c < maze.gridWidth; c++) {
          if (maze.grid[r][c]) {
            const wx = c * CELL_SIZE + CELL_SIZE / 2;
            const wz = r * CELL_SIZE + CELL_SIZE / 2;

            const wall = new THREE.Mesh(wallGeo, wallMat);
            wall.position.set(wx, WALL_HEIGHT / 2, wz);
            mazeGroup.add(wall);

            const trim = new THREE.Mesh(trimGeo, trimMat);
            trim.position.set(wx, WALL_HEIGHT, wz);
            mazeGroup.add(trim);
          }
        }
      }

      // Exit Portal Position
      const exitX = maze.end[0] * CELL_SIZE + CELL_SIZE / 2;
      const exitZ = maze.end[1] * CELL_SIZE + CELL_SIZE / 2;
      portalGroup.position.set(exitX, 1.4, exitZ);
      stateRef.current.exitPos = { x: exitX, z: exitZ };

      // Collectible Speed Shards in dead ends
      const shards: CrystalShard[] = [];
      const shardGeo = new THREE.OctahedronGeometry(0.35, 0);
      const shardMat = new THREE.MeshStandardMaterial({
        color: 0xffbe0b,
        emissive: 0xffbe0b,
        emissiveIntensity: 0.9,
      });

      for (let r = 1; r < maze.gridHeight - 1; r++) {
        for (let c = 1; c < maze.gridWidth - 1; c++) {
          if (!maze.grid[r][c] && (r !== maze.start[0] || c !== maze.start[1]) && (r !== maze.end[0] || c !== maze.end[1])) {
            let wallsCount = 0;
            if (maze.grid[r - 1][c]) wallsCount++;
            if (maze.grid[r + 1][c]) wallsCount++;
            if (maze.grid[r][c - 1]) wallsCount++;
            if (maze.grid[r][c + 1]) wallsCount++;

            if (wallsCount === 3 && Math.random() < 0.65) {
              const sx = c * CELL_SIZE + CELL_SIZE / 2;
              const sz = r * CELL_SIZE + CELL_SIZE / 2;

              const grp = new THREE.Group();
              grp.position.set(sx, 1.2, sz);
              grp.add(new THREE.Mesh(shardGeo, shardMat));

              const lt = new THREE.PointLight(0xffbe0b, 1.8, 6);
              grp.add(lt);
              scene.add(grp);

              shards.push({
                mesh: grp,
                light: lt,
                x: sx,
                z: sz,
                collected: false,
              });
            }
          }
        }
      }
      stateRef.current.shards = shards;
      setTotalShards(shards.length);

      // Reset Player Start Position
      const startX = maze.start[0] * CELL_SIZE + CELL_SIZE / 2;
      const startZ = maze.start[1] * CELL_SIZE + CELL_SIZE / 2;
      stateRef.current.playerPos.set(startX, 1.2, startZ);
      stateRef.current.yaw = 0;
      stateRef.current.pitch = 0;
      camera.position.copy(stateRef.current.playerPos);
    }

    rebuildMazeRef.current = buildMazeForLevel;
    buildMazeForLevel(1);

    /* ─── Pointer Lock & Mouse Look ─── */
    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== container) return;
      const s = stateRef.current;
      s.yaw -= e.movementX * 0.0024;
      s.pitch = Math.max(-Math.PI / 2.4, Math.min(Math.PI / 2.4, s.pitch - e.movementY * 0.0024));
    };

    container.addEventListener("click", () => {
      if (stateRef.current.gameState === "playing" && document.pointerLockElement !== container) {
        container.requestPointerLock();
      }
    });

    document.addEventListener("mousemove", onMouseMove);

    /* ─── Keyboard Listeners ─── */
    const onKeyDown = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (e.key === "w" || e.key === "W" || e.key === "ArrowUp") s.keys.w = true;
      if (e.key === "s" || e.key === "S" || e.key === "ArrowDown") s.keys.s = true;
      if (e.key === "a" || e.key === "A" || e.key === "ArrowLeft") s.keys.a = true;
      if (e.key === "d" || e.key === "D" || e.key === "ArrowRight") s.keys.d = true;
      if (e.key === "Shift") s.keys.shift = true;
      if (e.key === "f" || e.key === "F") setFlashlightOn((prev) => !prev);
      if (e.key === "m" || e.key === "M") setShowMinimap((prev) => !prev);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (e.key === "w" || e.key === "W" || e.key === "ArrowUp") s.keys.w = false;
      if (e.key === "s" || e.key === "S" || e.key === "ArrowDown") s.keys.s = false;
      if (e.key === "a" || e.key === "A" || e.key === "ArrowLeft") s.keys.a = false;
      if (e.key === "d" || e.key === "D" || e.key === "ArrowRight") s.keys.d = false;
      if (e.key === "Shift") s.keys.shift = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    /* ─── Wall Collision Check ─── */
    function checkWallCollision(px: number, pz: number, radius = 0.38): boolean {
      const maze = stateRef.current.mazeData;
      if (!maze) return true;
      const minC = Math.floor((px - radius) / CELL_SIZE);
      const maxC = Math.floor((px + radius) / CELL_SIZE);
      const minR = Math.floor((pz - radius) / CELL_SIZE);
      const maxR = Math.floor((pz + radius) / CELL_SIZE);

      for (let r = minR; r <= maxR; r++) {
        for (let c = minC; c <= maxC; c++) {
          if (r < 0 || r >= maze.gridHeight || c < 0 || c >= maze.gridWidth) return true;
          if (maze.grid[r][c]) return true;
        }
      }
      return false;
    }

    /* ─── Minimap Rendering ─── */
    function drawMinimap() {
      const canvas = minimapCanvasRef.current;
      const maze = stateRef.current.mazeData;
      if (!canvas || !maze) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const cw = canvas.width;
      const ch = canvas.height;
      ctx.clearRect(0, 0, cw, ch);

      const cellW = cw / maze.gridWidth;
      const cellH = ch / maze.gridHeight;

      for (let r = 0; r < maze.gridHeight; r++) {
        for (let c = 0; c < maze.gridWidth; c++) {
          if (stateRef.current.exploredGrid[r][c]) {
            if (maze.grid[r][c]) {
              ctx.fillStyle = "#1e293b";
              ctx.fillRect(c * cellW, r * cellH, cellW, cellH);
            } else {
              ctx.fillStyle = "#0f172a";
              ctx.fillRect(c * cellW, r * cellH, cellW, cellH);
            }
          } else {
            ctx.fillStyle = "#050810";
            ctx.fillRect(c * cellW, r * cellH, cellW, cellH);
          }
        }
      }

      // Exit Portal
      ctx.fillStyle = "#00f5d4";
      ctx.beginPath();
      ctx.arc(
        maze.end[0] * cellW + cellW / 2,
        maze.end[1] * cellH + cellH / 2,
        cellW * 0.8,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Player Arrow
      const playerC = stateRef.current.playerPos.x / CELL_SIZE;
      const playerR = stateRef.current.playerPos.z / CELL_SIZE;
      const px = playerC * cellW;
      const py = playerR * cellH;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(-stateRef.current.yaw + Math.PI);
      ctx.fillStyle = "#ff007f";
      ctx.beginPath();
      ctx.moveTo(0, -cellW * 1.2);
      ctx.lineTo(-cellW * 0.8, cellW * 0.8);
      ctx.lineTo(cellW * 0.8, cellW * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    /* ─── Game Loop ─── */
    let frameId: number;
    let lastTime = performance.now();
    let minimapTimer = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);

      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const s = stateRef.current;
      const maze = s.mazeData;

      // Animate Exit Rings
      ring1.rotation.x += dt * 2.2;
      ring1.rotation.y += dt * 1.6;
      ring2.rotation.y -= dt * 2.2;

      s.shards.forEach((sh) => {
        if (!sh.collected) {
          sh.mesh.rotation.y += dt * 3;
          sh.mesh.position.y = 1.2 + Math.sin(now * 0.004 + sh.x) * 0.2;
        }
      });

      if (s.speedBoostTimer > 0) {
        s.speedBoostTimer -= dt;
        if (s.speedBoostTimer <= 0) setSpeedBoostActive(false);
      }

      if (s.gameState === "playing" && maze) {
        const baseSpeed = s.speedBoostTimer > 0 ? 7.2 : s.keys.shift ? 6.0 : 4.2;
        const forward = new THREE.Vector3(-Math.sin(s.yaw), 0, -Math.cos(s.yaw)).normalize();
        const right = new THREE.Vector3(Math.cos(s.yaw), 0, -Math.sin(s.yaw)).normalize();

        const moveVec = new THREE.Vector3();
        if (s.keys.w) moveVec.add(forward);
        if (s.keys.s) moveVec.sub(forward);
        if (s.keys.d) moveVec.add(right);
        if (s.keys.a) moveVec.sub(right);

        if (moveVec.lengthSq() > 0) {
          moveVec.normalize().multiplyScalar(baseSpeed * dt);

          const nextX = s.playerPos.x + moveVec.x;
          if (!checkWallCollision(nextX, s.playerPos.z)) {
            s.playerPos.x = nextX;
          }

          const nextZ = s.playerPos.z + moveVec.z;
          if (!checkWallCollision(s.playerPos.x, nextZ)) {
            s.playerPos.z = nextZ;
          }

          s.headBob += dt * (baseSpeed > 5 ? 14 : 9);
          s.stepDistanceAccum += dt * baseSpeed;
          if (s.stepDistanceAccum > 2.2) {
            s.stepDistanceAccum = 0;
            mazeSfx.playStep();
          }
        } else {
          s.headBob = 0;
        }

        camera.position.x = s.playerPos.x;
        camera.position.y = s.playerPos.y + Math.sin(s.headBob) * 0.06;
        camera.position.z = s.playerPos.z;

        const euler = new THREE.Euler(s.pitch, s.yaw, 0, "YXZ");
        camera.quaternion.setFromEuler(euler);

        // Spotlight
        spotLight.position.copy(camera.position);
        const dirVec = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        spotLight.target.position.copy(camera.position).add(dirVec);
        spotLight.intensity = s.flashlightOn ? 3.8 : 0;
        playerPointLight.position.copy(camera.position);

        // Update Explored Cells
        const curC = Math.floor(s.playerPos.x / CELL_SIZE);
        const curR = Math.floor(s.playerPos.z / CELL_SIZE);
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const nr = curR + dr;
            const nc = curC + dc;
            if (nr >= 0 && nr < maze.gridHeight && nc >= 0 && nc < maze.gridWidth) {
              s.exploredGrid[nr][nc] = true;
            }
          }
        }

        // Shards Pickup Check
        s.shards.forEach((sh) => {
          if (!sh.collected) {
            const d = Math.hypot(s.playerPos.x - sh.x, s.playerPos.z - sh.z);
            if (d < 1.3) {
              sh.collected = true;
              scene.remove(sh.mesh);
              s.shardsCollected += 1;
              s.speedBoostTimer = 8;
              setShardsCollected(s.shardsCollected);
              setSpeedBoostActive(true);
              mazeSfx.playPickup();
            }
          }
        });

        // Exit Portal Collision
        const dist = Math.hypot(s.playerPos.x - s.exitPos.x, s.playerPos.z - s.exitPos.z);
        setDistanceToExit(Math.round(dist));

        if (dist < 1.5) {
          const timeSpent = Math.floor((now - s.levelStartTime) / 1000);
          const lvlCfg = LEVELS[s.currentLevel - 1];
          const timeBonus = Math.max(0, (lvlCfg.targetTime - timeSpent) * 20);
          const shardBonus = s.shardsCollected * 300;
          const levelTotal = 1000 + timeBonus + shardBonus;

          s.totalScore += levelTotal;
          setLevelScoreGain(levelTotal);
          setTotalScore(s.totalScore);
          mazeSfx.playLevelComplete();

          if (document.pointerLockElement === container) {
            document.exitPointerLock();
          }

          if (s.currentLevel >= LEVELS.length) {
            s.gameState = "campaign_victory";
            setGameState("campaign_victory");
          } else {
            s.gameState = "level_complete";
            setGameState("level_complete");
          }
        }

        setLevelTime(Math.floor((now - s.levelStartTime) / 1000));

        minimapTimer += dt;
        if (minimapTimer > 0.065) {
          minimapTimer = 0;
          drawMinimap();
        }
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
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(frameId);
      stateRef.current.shards.forEach((sh) => scene.remove(sh.mesh));
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const curLvlCfg = LEVELS[currentLevel - 1];

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-dark">
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* Top HUD */}
      {gameState === "playing" && (
        <div className="absolute top-16 left-0 right-0 px-4 sm:px-8 flex items-start justify-between pointer-events-none z-30 font-mono">
          {/* Level Info & Beacon */}
          <div className="bg-black/75 border border-primary/30 backdrop-blur-md px-4 py-2.5 rounded-sm">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10px] text-accent font-bold uppercase">
                LEVEL {currentLevel} / {LEVELS.length}
              </span>
              <span className="text-[10px] text-white/50">{curLvlCfg.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <span className="text-[10px] text-white/40 uppercase block">PORTAL BEACON</span>
                <span className="text-xl font-bold text-primary">{distanceToExit} M</span>
              </div>
              {totalShards > 0 && (
                <div className="border-l border-white/15 pl-3">
                  <span className="text-[10px] text-accent uppercase block">SHARDS</span>
                  <span className="text-xl font-bold text-white">
                    {shardsCollected}/{totalShards}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Speed Boost Notification */}
          {speedBoostActive && (
            <div className="hidden sm:inline-block px-3 py-1 bg-accent/20 border border-accent text-accent font-bold text-xs tracking-wider animate-pulse rounded-sm">
              SPEED BOOST ACTIVE [8S]
            </div>
          )}

          {/* Time & Total Campaign Score */}
          <div className="bg-black/75 border border-white/20 backdrop-blur-md px-4 py-2.5 rounded-sm text-right">
            <span className="text-[10px] text-white/40 uppercase block">
              SCORE: <span className="text-white font-bold">{totalScore.toLocaleString()}</span>
            </span>
            <span className="text-xl font-bold text-primary">
              {Math.floor(levelTime / 60)}:{(levelTime % 60).toString().padStart(2, "0")}
            </span>
          </div>
        </div>
      )}

      {/* Mini Radar / Map Overlay */}
      {gameState === "playing" && showMinimap && (
        <div className="absolute bottom-6 right-6 z-30 pointer-events-auto bg-black/85 border border-primary/40 p-2 rounded-sm backdrop-blur-md">
          <div className="flex items-center justify-between text-[9px] font-mono text-white/40 mb-1">
            <span>RADAR SCAN</span>
            <button
              type="button"
              onClick={() => setShowMinimap(false)}
              className="text-white/60 hover:text-white"
            >
              [X]
            </button>
          </div>
          <canvas
            ref={minimapCanvasRef}
            width={130}
            height={130}
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-sm border border-white/10"
          />
        </div>
      )}

      {/* Crosshair */}
      {gameState === "playing" && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20">
          <div className="w-2.5 h-2.5 border border-primary/70 rounded-full" />
        </div>
      )}

      {/* Flashlight & Map Toggle Bar */}
      {gameState === "playing" && (
        <div className="absolute bottom-6 left-6 z-30 pointer-events-auto hidden sm:flex items-center gap-2 font-mono text-[10px]">
          <button
            type="button"
            onClick={() => setFlashlightOn(!flashlightOn)}
            className={`px-3 py-1.5 rounded-sm border backdrop-blur-md ${
              flashlightOn
                ? "bg-primary/20 border-primary text-primary"
                : "bg-black/75 border-white/20 text-white/50"
            }`}
          >
            FLASHLIGHT [F]: {flashlightOn ? "ON" : "OFF"}
          </button>
          <button
            type="button"
            onClick={() => setShowMinimap(!showMinimap)}
            className="px-3 py-1.5 rounded-sm border bg-black/75 border-white/20 text-white/70 hover:text-white backdrop-blur-md"
          >
            MAP [M]
          </button>
        </div>
      )}

      {/* Start Menu */}
      {gameState === "menu" && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40 p-4">
          <div className="bg-dark/95 border border-primary/40 p-6 sm:p-10 max-w-md w-full text-center shadow-2xl rounded-sm">
            <div className="inline-block px-3 py-1 bg-primary/20 border border-primary/40 text-primary text-[11px] font-mono tracking-widest uppercase mb-3">
              5-LEVEL CAMPAIGN EXPEDITION
            </div>
            <h2
              className="text-4xl sm:text-6xl font-bold text-white tracking-wider mb-2"
              style={{ fontFamily: "Bebas Neue, sans-serif" }}
            >
              MAZE RUNNER
            </h2>
            <p className="text-white/50 text-xs sm:text-sm font-mono mb-6">
              Navigate 5 progressive 3D sci-fi sectors of increasing labyrinth complexity, collect speed shards, and extract at the beacon!
            </p>

            {/* Level Selector */}
            <div className="mb-6 text-left">
              <span className="text-[10px] font-mono text-white/40 uppercase block mb-1.5">
                SELECT STARTING LEVEL:
              </span>
              <div className="space-y-1.5 font-mono text-[11px]">
                {LEVELS.map((lvl) => (
                  <button
                    key={lvl.level}
                    type="button"
                    onClick={() => setCurrentLevel(lvl.level)}
                    className={`w-full py-2 px-3 border rounded-sm flex items-center justify-between transition-all ${
                      currentLevel === lvl.level
                        ? "bg-primary/20 border-primary text-primary font-bold"
                        : "bg-black/40 border-white/10 text-white/60 hover:text-white"
                    }`}
                  >
                    <span>
                      LEVEL {lvl.level}: {lvl.name}
                    </span>
                    <span className="text-[10px] text-white/40">{lvl.subname}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => startLevel(currentLevel)}
              className="w-full py-3.5 bg-primary hover:bg-primary/90 text-dark font-mono font-bold tracking-widest text-sm transition-transform active:scale-95 shadow-lg shadow-primary/20"
            >
              LAUNCH CAMPAIGN
            </button>
          </div>
        </div>
      )}

      {/* Level Complete Screen */}
      {gameState === "level_complete" && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-40 p-4 animate-in fade-in duration-200">
          <div className="bg-dark/95 border border-primary/50 p-6 sm:p-10 max-w-md w-full text-center shadow-2xl rounded-sm">
            <div className="inline-block px-3 py-1 bg-primary/20 border border-primary/40 text-primary text-[11px] font-mono tracking-widest uppercase mb-3">
              LEVEL {currentLevel} CLEARED
            </div>
            <h2
              className="text-4xl sm:text-5xl font-bold text-white tracking-wider mb-2"
              style={{ fontFamily: "Bebas Neue, sans-serif" }}
            >
              SECTOR SECURED!
            </h2>
            <p className="text-white/50 text-xs font-mono mb-6">
              Extraction successful. Prepare for the next sector.
            </p>

            <div className="bg-black/50 border border-white/10 p-4 mb-6 font-mono text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-white/40 uppercase">Time Elapsed</span>
                <span className="text-white font-bold">
                  {Math.floor(levelTime / 60)}:{(levelTime % 60).toString().padStart(2, "0")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40 uppercase">Shards Collected</span>
                <span className="text-accent font-bold">
                  {shardsCollected} / {totalShards}
                </span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2">
                <span className="text-white/40 uppercase">Level Score</span>
                <span className="text-primary font-bold">+{levelScoreGain.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40 uppercase">Total Campaign Score</span>
                <span className="text-white font-bold">{totalScore.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={nextLevel}
              className="w-full py-3.5 bg-primary hover:bg-primary/90 text-dark font-mono font-bold tracking-widest text-sm transition-transform active:scale-95 shadow-lg shadow-primary/20"
            >
              NEXT: LEVEL {currentLevel + 1} ({LEVELS[currentLevel]?.name})
            </button>
          </div>
        </div>
      )}

      {/* Campaign Victory Screen */}
      {gameState === "campaign_victory" && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-40 p-4 animate-in fade-in duration-200">
          <div className="bg-dark/95 border border-primary/60 p-6 sm:p-10 max-w-md w-full text-center shadow-2xl rounded-sm">
            <div className="inline-block px-3 py-1 bg-primary/20 border border-primary/40 text-primary text-[11px] font-mono tracking-widest uppercase mb-3">
              ALL 5 SECTORS CONQUERED
            </div>
            <h2
              className="text-4xl sm:text-6xl font-bold text-white tracking-wider mb-2"
              style={{ fontFamily: "Bebas Neue, sans-serif" }}
            >
              GRAND CHAMPION!
            </h2>
            <p className="text-white/60 text-xs font-mono mb-6">
              You navigated all 5 labyrinth sectors from Sector Alpha to the Titan Matrix Core!
            </p>

            <div className="bg-black/50 border border-white/10 p-4 mb-6 font-mono text-center">
              <span className="text-[10px] text-white/40 uppercase block mb-1">FINAL CAMPAIGN SCORE</span>
              <span className="text-3xl font-bold text-primary">{totalScore.toLocaleString()}</span>
            </div>

            <button
              type="button"
              onClick={() => startLevel(1)}
              className="w-full py-3.5 bg-primary hover:bg-primary/90 text-dark font-mono font-bold tracking-widest text-sm transition-transform active:scale-95 shadow-lg shadow-primary/20"
            >
              REPLAY CAMPAIGN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
