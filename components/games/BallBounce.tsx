"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/* ─── Web Audio Sound Effects Synthesizer ─── */
class SoundFX {
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

  playBounce(pitch = 440) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(pitch * 1.5, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playBrickHit(colorPitch = 600) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(colorPitch, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(colorPitch * 0.5, this.ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  playPowerup() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + i * 0.05);
      gain.gain.setValueAtTime(0.12, now + i * 0.05);
      gain.gain.linearRampToValueAtTime(0.01, now + i * 0.05 + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.1);
    });
  }

  playLaser() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(900, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playLose() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }
}

const sfx = new SoundFX();

/* ─── Types & Layouts ─── */
interface Block {
  mesh: THREE.Mesh;
  x: number;
  y: number;
  color: number;
  hp: number;
  maxHp: number;
  alive: boolean;
  powerup?: "multi" | "wide" | "laser" | "shield";
}

interface BallObj {
  mesh: THREE.Mesh;
  light: THREE.PointLight;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  active: boolean;
}

interface PowerupCapsule {
  mesh: THREE.Mesh;
  type: "multi" | "wide" | "laser" | "shield";
  x: number;
  y: number;
}

interface LaserShot {
  mesh: THREE.Mesh;
  x: number;
  y: number;
}

const BLOCK_COLORS = [0xff0055, 0xff7700, 0xffd700, 0x00f5d4, 0xb892ff];

const LEVEL_LAYOUTS = [
  // Level 1: Classic Wall
  {
    name: "CYBER WALL",
    rows: 5,
    cols: 8,
    pattern: (r: number, c: number) => true,
  },
  // Level 2: Diamond Pattern
  {
    name: "NEON DIAMOND",
    rows: 6,
    cols: 8,
    pattern: (r: number, c: number) => {
      const midC = 3.5;
      const midR = 2.5;
      return Math.abs(c - midC) + Math.abs(r - midR) <= 3.2;
    },
  },
  // Level 3: Space Invader
  {
    name: "SPACE INVADER",
    rows: 6,
    cols: 8,
    pattern: (r: number, c: number) => {
      if (r === 0) return c >= 2 && c <= 5;
      if (r === 1) return c === 1 || c === 2 || c === 5 || c === 6;
      if (r === 2) return true;
      if (r === 3) return c === 0 || c === 2 || c === 3 || c === 4 || c === 5 || c === 7;
      if (r === 4) return c === 0 || c === 7;
      return c === 1 || c === 6;
    },
  },
  // Level 4: Fortress
  {
    name: "TITAN FORTRESS",
    rows: 7,
    cols: 8,
    pattern: (r: number, c: number) => (r + c) % 2 === 0 || r === 0 || r === 6,
  },
];

export default function BallBounce() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<"menu" | "playing" | "gameover" | "victory">("menu");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(1);
  const [activePower, setActivePower] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState(true);

  const stateRef = useRef({
    gameState: "menu" as "menu" | "playing" | "gameover" | "victory",
    score: 0,
    highScore: 0,
    lives: 3,
    level: 1,
    combo: 1,
    comboTimer: 0,
    paddleX: 0,
    paddleWidth: 2.2,
    hasLaser: false,
    hasShield: false,
    laserTimer: 0,
    wideTimer: 0,
    balls: [] as BallObj[],
    blocks: [] as Block[],
    capsules: [] as PowerupCapsule[],
    lasers: [] as LaserShot[],
    ballLaunched: false,
    keys: { left: false, right: false, fire: false },
    lastLaserFire: 0,
  });

  useEffect(() => {
    stateRef.current.gameState = gameState;
  }, [gameState]);

  useEffect(() => {
    sfx.enabled = soundOn;
  }, [soundOn]);

  useEffect(() => {
    const saved = localStorage.getItem("ballbounce_highscore");
    if (saved) {
      const val = parseInt(saved, 10);
      setHighScore(val);
      stateRef.current.highScore = val;
    }
  }, []);

  const startGame = (lvl = 1) => {
    stateRef.current.score = lvl === 1 ? 0 : stateRef.current.score;
    stateRef.current.lives = 3;
    stateRef.current.level = lvl;
    stateRef.current.combo = 1;
    stateRef.current.ballLaunched = false;
    stateRef.current.paddleX = 0;
    stateRef.current.paddleWidth = 2.2;
    stateRef.current.hasLaser = false;
    stateRef.current.hasShield = false;
    setActivePower(null);
    setScore(stateRef.current.score);
    setLives(3);
    setLevel(lvl);
    setCombo(1);
    setGameState("playing");
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    /* ─── Three.js Scene Setup ─── */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040612);

    const camera = new THREE.PerspectiveCamera(
      48,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 13);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    /* ─── Lighting ─── */
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xaaccff, 1.4);
    dirLight.position.set(5, 12, 10);
    scene.add(dirLight);

    /* ─── Arena Walls ─── */
    const FIELD_W = 9.4;
    const FIELD_H = 11.6;

    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x12182b,
      roughness: 0.3,
      metalness: 0.8,
    });
    const neonRailMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4 });

    // Top Wall
    const topWall = new THREE.Mesh(new THREE.BoxGeometry(FIELD_W + 0.6, 0.4, 0.6), wallMat);
    topWall.position.set(0, FIELD_H / 2 + 0.2, 0);
    scene.add(topWall);

    const topNeon = new THREE.Mesh(new THREE.BoxGeometry(FIELD_W, 0.08, 0.65), neonRailMat);
    topNeon.position.set(0, FIELD_H / 2 + 0.05, 0);
    scene.add(topNeon);

    // Left Wall
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, FIELD_H + 0.6, 0.6), wallMat);
    leftWall.position.set(-FIELD_W / 2 - 0.2, 0, 0);
    scene.add(leftWall);

    // Right Wall
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, FIELD_H + 0.6, 0.6), wallMat);
    rightWall.position.set(FIELD_W / 2 + 0.2, 0, 0);
    scene.add(rightWall);

    // Bottom Shield Barrier Mesh
    const shieldGeo = new THREE.BoxGeometry(FIELD_W, 0.15, 0.4);
    const shieldMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0 });
    const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    shieldMesh.position.set(0, -FIELD_H / 2 + 0.1, 0);
    scene.add(shieldMesh);

    /* ─── Paddle Mesh ─── */
    const paddleGeo = new THREE.BoxGeometry(2.2, 0.38, 0.6);
    const paddleMat = new THREE.MeshStandardMaterial({
      color: 0x00f5d4,
      emissive: 0x00443d,
      roughness: 0.2,
      metalness: 0.8,
    });
    const paddle = new THREE.Mesh(paddleGeo, paddleMat);
    paddle.position.set(0, -FIELD_H / 2 + 0.9, 0);
    scene.add(paddle);

    // Paddle Cannon Barrels (for Laser powerup)
    const barrelGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.3, 8);
    const barrelMat = new THREE.MeshBasicMaterial({ color: 0xff0055, transparent: true, opacity: 0 });
    const leftBarrel = new THREE.Mesh(barrelGeo, barrelMat);
    leftBarrel.position.set(-0.9, 0.2, 0);
    const rightBarrel = new THREE.Mesh(barrelGeo, barrelMat);
    rightBarrel.position.set(0.9, 0.2, 0);
    paddle.add(leftBarrel);
    paddle.add(rightBarrel);

    /* ─── Balls Management ─── */
    const ballGeo = new THREE.SphereGeometry(0.22, 16, 16);
    const ballMat = new THREE.MeshStandardMaterial({
      color: 0xff007f,
      emissive: 0xff007f,
      emissiveIntensity: 0.9,
      roughness: 0.1,
    });

    function createBall(x: number, y: number, vx: number, vy: number): BallObj {
      const mesh = new THREE.Mesh(ballGeo, ballMat);
      mesh.position.set(x, y, 0);
      const light = new THREE.PointLight(0xff007f, 1.2, 4);
      mesh.add(light);
      scene.add(mesh);

      return {
        mesh,
        light,
        pos: new THREE.Vector3(x, y, 0),
        vel: new THREE.Vector3(vx, vy, 0),
        active: true,
      };
    }

    const initialBall = createBall(0, -FIELD_H / 2 + 1.25, 0, 0);
    stateRef.current.balls = [initialBall];

    /* ─── Blocks Generation ─── */
    let blocks: Block[] = [];
    const blockGeo = new THREE.BoxGeometry(0.98, 0.42, 0.45);

    function buildLevelBlocks(lvlIdx: number) {
      blocks.forEach((b) => scene.remove(b.mesh));
      blocks = [];

      const currentLvl = LEVEL_LAYOUTS[(lvlIdx - 1) % LEVEL_LAYOUTS.length];
      const startY = FIELD_H / 2 - 1.2;
      const startX = -FIELD_W / 2 + 0.82;
      const stepX = 1.12;
      const stepY = 0.54;

      for (let r = 0; r < currentLvl.rows; r++) {
        const color = BLOCK_COLORS[r % BLOCK_COLORS.length];
        const hp = r === 0 && lvlIdx > 1 ? 2 : 1;

        const mat = new THREE.MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity: 0.35,
          roughness: 0.3,
          metalness: 0.4,
        });

        for (let c = 0; c < currentLvl.cols; c++) {
          if (!currentLvl.pattern(r, c)) continue;

          const mesh = new THREE.Mesh(blockGeo, mat.clone());
          const bx = startX + c * stepX;
          const by = startY - r * stepY;
          mesh.position.set(bx, by, 0);
          scene.add(mesh);

          // Random powerup chance (20%)
          let powerup: "multi" | "wide" | "laser" | "shield" | undefined;
          if (Math.random() < 0.22) {
            const types: ("multi" | "wide" | "laser" | "shield")[] = ["multi", "wide", "laser", "shield"];
            powerup = types[Math.floor(Math.random() * types.length)];
          }

          blocks.push({
            mesh,
            x: bx,
            y: by,
            color,
            hp,
            maxHp: hp,
            alive: true,
            powerup,
          });
        }
      }
      stateRef.current.blocks = blocks;
    }

    buildLevelBlocks(1);

    /* ─── Powerup Capsules & Lasers ─── */
    const capsuleGeo = new THREE.CapsuleGeometry(0.18, 0.35, 8, 16);
    const powerColors = {
      multi: 0xffbe0b,
      wide: 0x00f5d4,
      laser: 0xff0055,
      shield: 0x38bdf8,
    };

    function spawnPowerupCapsule(x: number, y: number, type: "multi" | "wide" | "laser" | "shield") {
      const mat = new THREE.MeshStandardMaterial({
        color: powerColors[type],
        emissive: powerColors[type],
        emissiveIntensity: 0.8,
      });
      const mesh = new THREE.Mesh(capsuleGeo, mat);
      mesh.rotation.z = Math.PI / 2;
      mesh.position.set(x, y, 0);
      scene.add(mesh);
      stateRef.current.capsules.push({ mesh, type, x, y });
    }

    const laserGeo = new THREE.BoxGeometry(0.1, 0.45, 0.1);
    const laserMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });

    function fireLasers() {
      const s = stateRef.current;
      [-s.paddleWidth / 2 + 0.2, s.paddleWidth / 2 - 0.2].forEach((offset) => {
        const mesh = new THREE.Mesh(laserGeo, laserMat);
        mesh.position.set(s.paddleX + offset, -FIELD_H / 2 + 1.2, 0);
        scene.add(mesh);
        s.lasers.push({ mesh, x: mesh.position.x, y: mesh.position.y });
      });
      sfx.playLaser();
    }

    /* ─── Shatter Particles Pool ─── */
    const shatterCount = 200;
    const shatterGeo = new THREE.BufferGeometry();
    const shatterPos = new Float32Array(shatterCount * 3);
    const shatterVel = new Float32Array(shatterCount * 3);
    for (let i = 0; i < shatterCount; i++) {
      shatterPos[i * 3] = 0;
      shatterPos[i * 3 + 1] = 0;
      shatterPos[i * 3 + 2] = 0;
      shatterVel[i * 3] = (Math.random() - 0.5) * 6;
      shatterVel[i * 3 + 1] = (Math.random() - 0.5) * 6;
      shatterVel[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    shatterGeo.setAttribute("position", new THREE.BufferAttribute(shatterPos, 3));
    const shatterMat = new THREE.PointsMaterial({
      color: 0x00f5d4,
      size: 0.15,
      transparent: true,
      opacity: 0,
    });
    const shatter = new THREE.Points(shatterGeo, shatterMat);
    scene.add(shatter);

    let shattering = false;
    let shatterTimer = 0;

    function triggerShatter(x: number, y: number, color: number) {
      shattering = true;
      shatterTimer = 0.5;
      shatterMat.opacity = 1;
      shatterMat.color.setHex(color);
      const arr = shatterGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < shatterCount; i++) {
        arr[i * 3] = x;
        arr[i * 3 + 1] = y;
        arr[i * 3 + 2] = 0;
      }
      shatterGeo.attributes.position.needsUpdate = true;
    }

    /* ─── Controls & Pointer Listeners ─── */
    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const limit = FIELD_W / 2 - stateRef.current.paddleWidth / 2;
      stateRef.current.paddleX = Math.max(-limit, Math.min(limit, normX * limit * 1.05));
    };

    const onClick = () => {
      const s = stateRef.current;
      if (s.gameState === "playing") {
        if (!s.ballLaunched && s.balls.length > 0) {
          s.ballLaunched = true;
          const angle = (Math.random() - 0.5) * 0.7 + Math.PI / 2;
          const speed = 8.5;
          s.balls[0].vel.set(Math.cos(angle) * speed, Math.sin(angle) * speed, 0);
          sfx.playBounce(500);
        } else if (s.hasLaser && performance.now() - s.lastLaserFire > 220) {
          s.lastLaserFire = performance.now();
          fireLasers();
        }
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") s.keys.left = true;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") s.keys.right = true;
      if (e.key === " " || e.key === "Enter") onClick();
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") s.keys.left = false;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") s.keys.right = false;
    };

    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("click", onClick);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    /* ─── Game Loop ─── */
    let frameId: number;
    let lastTime = performance.now();

    const animate = () => {
      frameId = requestAnimationFrame(animate);

      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const s = stateRef.current;

      // Keyboard Paddle Movement
      const limit = FIELD_W / 2 - s.paddleWidth / 2;
      if (s.keys.left) s.paddleX = Math.max(-limit, s.paddleX - 12 * dt);
      if (s.keys.right) s.paddleX = Math.min(limit, s.paddleX + 12 * dt);

      paddle.position.x = s.paddleX;
      paddle.scale.x = s.paddleWidth / 2.2;

      // Laser Barrels Visibility
      barrelMat.opacity = s.hasLaser ? 1 : 0;
      shieldMat.opacity = s.hasShield ? 0.75 : 0;

      // Combo Decay Timer
      if (s.combo > 1) {
        s.comboTimer -= dt;
        if (s.comboTimer <= 0) {
          s.combo = 1;
          setCombo(1);
        }
      }

      // Powerup Timers
      if (s.hasLaser) {
        s.laserTimer -= dt;
        if (s.laserTimer <= 0) {
          s.hasLaser = false;
          setActivePower(null);
        }
      }

      if (s.paddleWidth > 2.2) {
        s.wideTimer -= dt;
        if (s.wideTimer <= 0) {
          s.paddleWidth = 2.2;
          setActivePower(null);
        }
      }

      if (s.gameState === "playing") {
        // Handle Inactive Ball attached to paddle
        if (!s.ballLaunched && s.balls.length > 0) {
          s.balls[0].pos.set(s.paddleX, -FIELD_H / 2 + 1.25, 0);
          s.balls[0].mesh.position.copy(s.balls[0].pos);
        }

        // Move Active Balls
        for (let i = s.balls.length - 1; i >= 0; i--) {
          const b = s.balls[i];
          if (!s.ballLaunched && i === 0) continue;

          b.pos.x += b.vel.x * dt;
          b.pos.y += b.vel.y * dt;
          b.mesh.position.copy(b.pos);

          const halfW = FIELD_W / 2 - 0.22;
          const halfH = FIELD_H / 2;

          // Wall Collisions
          if (b.pos.x < -halfW) {
            b.pos.x = -halfW;
            b.vel.x *= -1;
            sfx.playBounce(350);
          }
          if (b.pos.x > halfW) {
            b.pos.x = halfW;
            b.vel.x *= -1;
            sfx.playBounce(350);
          }
          if (b.pos.y > halfH) {
            b.pos.y = halfH;
            b.vel.y *= -1;
            sfx.playBounce(400);
          }

          // Shield Barrier Bounce
          if (s.hasShield && b.pos.y < -FIELD_H / 2 + 0.3 && b.vel.y < 0) {
            b.vel.y *= -1;
            s.hasShield = false;
            sfx.playBounce(600);
            setActivePower(null);
          }

          // Paddle Collision
          const paddleY = -FIELD_H / 2 + 0.9;
          if (
            b.pos.y <= paddleY + 0.38 &&
            b.pos.y >= paddleY - 0.1 &&
            Math.abs(b.pos.x - s.paddleX) < s.paddleWidth / 2 + 0.22 &&
            b.vel.y < 0
          ) {
            const hitOffset = (b.pos.x - s.paddleX) / (s.paddleWidth / 2);
            const bounceAngle = Math.PI / 2 - hitOffset * 1.05;
            const currentSpeed = Math.min(13, b.vel.length() * 1.01);
            b.vel.set(Math.cos(bounceAngle) * currentSpeed, Math.sin(bounceAngle) * currentSpeed, 0);
            b.pos.y = paddleY + 0.39;
            sfx.playBounce(480);
          }

          // Ball Fell Out
          if (b.pos.y < -FIELD_H / 2) {
            scene.remove(b.mesh);
            s.balls.splice(i, 1);

            if (s.balls.length === 0) {
              s.lives -= 1;
              setLives(s.lives);
              sfx.playLose();

              if (s.lives <= 0) {
                s.gameState = "gameover";
                setGameState("gameover");
                if (s.score > s.highScore) {
                  s.highScore = s.score;
                  setHighScore(s.score);
                  localStorage.setItem("ballbounce_highscore", s.score.toString());
                }
              } else {
                // Respawn single ball on paddle
                s.ballLaunched = false;
                const newBall = createBall(s.paddleX, -FIELD_H / 2 + 1.25, 0, 0);
                s.balls.push(newBall);
              }
            }
            continue;
          }

          // Brick Collisions
          let remainingAlive = 0;
          for (const blk of blocks) {
            if (!blk.alive) continue;
            remainingAlive++;

            const dx = Math.abs(b.pos.x - blk.x);
            const dy = Math.abs(b.pos.y - blk.y);

            if (dx < 0.62 && dy < 0.32) {
              blk.hp -= 1;
              if (blk.hp <= 0) {
                blk.alive = false;
                scene.remove(blk.mesh);
                triggerShatter(blk.x, blk.y, blk.color);
                sfx.playBrickHit(700 + s.combo * 50);

                // Check powerup drop
                if (blk.powerup) {
                  spawnPowerupCapsule(blk.x, blk.y, blk.powerup);
                }

                s.score += 100 * s.combo;
                s.combo = Math.min(10, s.combo + 1);
                s.comboTimer = 2.5;
                setCombo(s.combo);
                setScore(s.score);
              } else {
                (blk.mesh.material as THREE.MeshStandardMaterial).color.setHex(0xffffff);
                sfx.playBrickHit(450);
              }

              // Bounce
              if (dx > dy) {
                b.vel.x *= -1;
              } else {
                b.vel.y *= -1;
              }
              break;
            }
          }

          // Level Cleared
          if (remainingAlive === 0) {
            if (s.level < LEVEL_LAYOUTS.length) {
              s.level += 1;
              setLevel(s.level);
              buildLevelBlocks(s.level);
              s.ballLaunched = false;
              s.balls.forEach((ballObj) => scene.remove(ballObj.mesh));
              s.balls = [createBall(s.paddleX, -FIELD_H / 2 + 1.25, 0, 0)];
              sfx.playPowerup();
            } else {
              s.gameState = "victory";
              setGameState("victory");
            }
          }
        }

        // Powerup Capsules Falling & Collection
        for (let i = s.capsules.length - 1; i >= 0; i--) {
          const cap = s.capsules[i];
          cap.y -= 3.5 * dt;
          cap.mesh.position.y = cap.y;
          cap.mesh.rotation.y += dt * 3;

          // Paddle catch
          if (
            Math.abs(cap.x - s.paddleX) < s.paddleWidth / 2 + 0.3 &&
            Math.abs(cap.y - (-FIELD_H / 2 + 0.9)) < 0.45
          ) {
            sfx.playPowerup();
            scene.remove(cap.mesh);
            s.capsules.splice(i, 1);

            // Apply Powerup
            if (cap.type === "multi") {
              if (s.balls.length > 0) {
                const b0 = s.balls[0];
                const b1 = createBall(b0.pos.x, b0.pos.y, -5, 7);
                const b2 = createBall(b0.pos.x, b0.pos.y, 5, 7);
                s.balls.push(b1, b2);
              }
              setActivePower("MULTI-BALL x3");
            } else if (cap.type === "wide") {
              s.paddleWidth = 3.4;
              s.wideTimer = 10;
              setActivePower("EXPANDED PADDLE");
            } else if (cap.type === "laser") {
              s.hasLaser = true;
              s.laserTimer = 12;
              setActivePower("TWIN LASERS [CLICK/SPACE]");
            } else if (cap.type === "shield") {
              s.hasShield = true;
              setActivePower("SAFETY BARRIER");
            }
            continue;
          }

          if (cap.y < -FIELD_H / 2 - 1) {
            scene.remove(cap.mesh);
            s.capsules.splice(i, 1);
          }
        }

        // Laser Shots Movement & Hit
        for (let i = s.lasers.length - 1; i >= 0; i--) {
          const lz = s.lasers[i];
          lz.y += 14 * dt;
          lz.mesh.position.y = lz.y;

          if (lz.y > FIELD_H / 2) {
            scene.remove(lz.mesh);
            s.lasers.splice(i, 1);
            continue;
          }

          // Hit brick with laser
          for (const blk of blocks) {
            if (!blk.alive) continue;
            if (Math.abs(lz.x - blk.x) < 0.55 && Math.abs(lz.y - blk.y) < 0.25) {
              blk.alive = false;
              scene.remove(blk.mesh);
              scene.remove(lz.mesh);
              s.lasers.splice(i, 1);
              triggerShatter(blk.x, blk.y, blk.color);
              s.score += 150;
              setScore(s.score);
              break;
            }
          }
        }
      }

      // Shatter Particles Update
      if (shattering) {
        shatterTimer -= dt;
        shatterMat.opacity = Math.max(0, shatterTimer / 0.5);
        const arr = shatterGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < shatterCount; i++) {
          arr[i * 3] += shatterVel[i * 3] * dt;
          arr[i * 3 + 1] += shatterVel[i * 3 + 1] * dt;
          arr[i * 3 + 2] += shatterVel[i * 3 + 2] * dt;
        }
        shatterGeo.attributes.position.needsUpdate = true;
        if (shatterTimer <= 0) shattering = false;
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
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("click", onClick);
      cancelAnimationFrame(frameId);
      blocks.forEach((b) => scene.remove(b.mesh));
      stateRef.current.balls.forEach((b) => scene.remove(b.mesh));
      stateRef.current.capsules.forEach((c) => scene.remove(c.mesh));
      stateRef.current.lasers.forEach((l) => scene.remove(l.mesh));
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-dark">
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* Top HUD */}
      {gameState === "playing" && (
        <div className="absolute top-16 left-0 right-0 px-4 sm:px-8 flex items-start justify-between pointer-events-none z-30 font-mono">
          {/* Lives & Level */}
          <div className="bg-black/75 border border-primary/30 backdrop-blur-md px-4 py-2.5 rounded-sm">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10px] text-white/40 uppercase">LEVEL {level}</span>
              <span className="text-[10px] text-primary font-bold">
                {LEVEL_LAYOUTS[(level - 1) % LEVEL_LAYOUTS.length].name}
              </span>
            </div>
            <div className="flex gap-1.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i < lives ? "bg-primary shadow-[0_0_8px_#00f5d4]" : "bg-white/20"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Active Powerup Badge */}
          {activePower && (
            <div className="hidden sm:inline-block px-3 py-1 bg-accent/20 border border-accent text-accent font-bold text-xs tracking-wider animate-pulse rounded-sm">
              {activePower}
            </div>
          )}

          {/* Score & Combo */}
          <div className="bg-black/75 border border-white/20 backdrop-blur-md px-4 py-2.5 rounded-sm text-right">
            {combo > 1 && (
              <span className="text-xs text-accent font-bold tracking-widest block animate-bounce">
                COMBO x{combo}
              </span>
            )}
            <span className="text-2xl sm:text-3xl font-bold text-white tracking-wider">
              {score.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Sound Toggle Button */}
      <button
        type="button"
        onClick={() => setSoundOn(!soundOn)}
        className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-auto hidden md:block px-3 py-1 bg-black/80 border border-white/10 hover:border-primary/50 text-[10px] font-mono text-white/70 hover:text-white rounded-full backdrop-blur-md"
      >
        AUDIO: {soundOn ? "ON" : "MUTED"}
      </button>

      {/* Start Menu */}
      {gameState === "menu" && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40 p-4">
          <div className="bg-dark/95 border border-primary/40 p-6 sm:p-10 max-w-md w-full text-center shadow-2xl rounded-sm">
            <div className="inline-block px-3 py-1 bg-primary/20 border border-primary/40 text-primary text-[11px] font-mono tracking-widest uppercase mb-3">
              MULTI-LEVEL 3D BREAKOUT
            </div>
            <h2
              className="text-4xl sm:text-6xl font-bold text-white tracking-wider mb-2"
              style={{ fontFamily: "Bebas Neue, sans-serif" }}
            >
              BALL BOUNCE
            </h2>
            <p className="text-white/50 text-xs sm:text-sm font-mono mb-6">
              Shatter neon blocks, grab falling powerup capsules (Multi-Ball, Lasers, Wide Paddle, Shields), and clear 4 progressive levels!
            </p>

            <div className="grid grid-cols-2 gap-2 bg-black/40 border border-white/10 p-3 mb-6 font-mono text-xs text-left">
              <div>
                <span className="text-white/30 block text-[10px]">STEER PADDLE</span>
                <span className="text-primary font-bold">Mouse / A-D / Touch</span>
              </div>
              <div>
                <span className="text-white/30 block text-[10px]">LAUNCH / LASERS</span>
                <span className="text-primary font-bold">Click / Space</span>
              </div>
            </div>

            {highScore > 0 && (
              <div className="mb-5 text-xs font-mono text-white/60">
                HIGH SCORE: <span className="text-accent font-bold">{highScore.toLocaleString()}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => startGame(1)}
              className="w-full py-3.5 bg-primary hover:bg-primary/90 text-dark font-mono font-bold tracking-widest text-sm transition-transform active:scale-95 shadow-lg shadow-primary/20"
            >
              START CAMPAIGN
            </button>
          </div>
        </div>
      )}

      {/* Game Over */}
      {gameState === "gameover" && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-40 p-4 animate-in fade-in duration-200">
          <div className="bg-dark/95 border border-red-500/50 p-6 sm:p-10 max-w-md w-full text-center shadow-2xl rounded-sm">
            <div className="inline-block px-3 py-1 bg-red-500/20 border border-red-500/40 text-red-400 text-[11px] font-mono tracking-widest uppercase mb-3">
              ALL ENERGY ORBS LOST
            </div>
            <h2
              className="text-4xl sm:text-6xl font-bold text-white tracking-wider mb-4"
              style={{ fontFamily: "Bebas Neue, sans-serif" }}
            >
              GAME OVER
            </h2>

            <div className="bg-black/50 border border-white/10 p-4 mb-6 font-mono">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-white/40 uppercase">Final Score</span>
                <span className="text-xl font-bold text-white">{score.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-t border-white/10 pt-2">
                <span className="text-xs text-white/40 uppercase">High Score</span>
                <span className="text-xl font-bold text-accent">{highScore.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => startGame(1)}
              className="w-full py-3.5 bg-primary hover:bg-primary/90 text-dark font-mono font-bold tracking-widest text-sm transition-transform active:scale-95"
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}

      {/* Victory Screen */}
      {gameState === "victory" && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-40 p-4 animate-in fade-in duration-200">
          <div className="bg-dark/95 border border-primary/50 p-6 sm:p-10 max-w-md w-full text-center shadow-2xl rounded-sm">
            <div className="inline-block px-3 py-1 bg-primary/20 border border-primary/40 text-primary text-[11px] font-mono tracking-widest uppercase mb-3">
              ALL SECTORS CLEARED
            </div>
            <h2
              className="text-4xl sm:text-6xl font-bold text-white tracking-wider mb-4"
              style={{ fontFamily: "Bebas Neue, sans-serif" }}
            >
              CHAMPION!
            </h2>

            <div className="bg-black/50 border border-white/10 p-4 mb-6 font-mono">
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/40 uppercase">Grand Score</span>
                <span className="text-xl font-bold text-primary">{score.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => startGame(1)}
              className="w-full py-3.5 bg-primary hover:bg-primary/90 text-dark font-mono font-bold tracking-widest text-sm transition-transform active:scale-95 shadow-lg shadow-primary/20"
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
