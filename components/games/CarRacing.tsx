"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/* ─── Constants & Configurations ─── */
const LANE_WIDTH = 2.4;
const LANES = [-LANE_WIDTH, 0, LANE_WIDTH];

const WEATHER_THEMES = {
  neon: {
    name: "NEON NIGHT",
    fogColor: 0x070b19,
    fogNear: 25,
    fogFar: 140,
    skyColor: 0x050814,
    roadColor: 0x111322,
    lineColor: 0x00f5d4,
    lightColor: 0x00f5d4,
    ambient: 0.6,
  },
  rain: {
    name: "RAIN STORM",
    fogColor: 0x101520,
    fogNear: 15,
    fogFar: 80,
    skyColor: 0x0b0e17,
    roadColor: 0x0e1017,
    lineColor: 0x60a5fa,
    lightColor: 0x93c5fd,
    ambient: 0.35,
  },
  sunset: {
    name: "CYBER SUNSET",
    fogColor: 0x2d122d,
    fogNear: 20,
    fogFar: 120,
    skyColor: 0x1f0b24,
    roadColor: 0x1a0f26,
    lineColor: 0xff6b8b,
    lightColor: 0xffa07a,
    ambient: 0.7,
  },
  snow: {
    name: "ARCTIC BLIZZARD",
    fogColor: 0x1e293b,
    fogNear: 18,
    fogFar: 90,
    skyColor: 0x0f172a,
    roadColor: 0x1e2333,
    lineColor: 0xe2e8f0,
    lightColor: 0xffffff,
    ambient: 0.8,
  },
};

type WeatherKey = keyof typeof WEATHER_THEMES;

interface ObstacleObj {
  mesh: THREE.Group;
  lane: number;
  z: number;
  speed: number;
  isCoin?: boolean;
}

export default function CarRacing() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<"menu" | "playing" | "gameover">("menu");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speedKmH, setSpeedKmH] = useState(120);
  const [nitro, setNitro] = useState(100);
  const [weatherKey, setWeatherKey] = useState<WeatherKey>("neon");

  // Game internal state references
  const stateRef = useRef({
    gameState: "menu" as "menu" | "playing" | "gameover",
    score: 0,
    highScore: 0,
    speed: 0.7,
    baseSpeed: 0.7,
    nitro: 100,
    isNitro: false,
    playerX: 0,
    targetLane: 1, // 0: left, 1: center, 2: right
    weather: "neon" as WeatherKey,
    keys: { left: false, right: false, up: false, down: false, boost: false },
    shake: 0,
  });

  // Keep stateRef synced with UI changes
  useEffect(() => {
    stateRef.current.weather = weatherKey;
  }, [weatherKey]);

  useEffect(() => {
    stateRef.current.gameState = gameState;
  }, [gameState]);

  const startGame = () => {
    stateRef.current.score = 0;
    stateRef.current.targetLane = 1;
    stateRef.current.playerX = 0;
    stateRef.current.nitro = 100;
    stateRef.current.speed = 0.7;
    setScore(0);
    setNitro(100);
    setGameState("playing");
  };

  useEffect(() => {
    const saved = localStorage.getItem("carracing_highscore");
    if (saved) {
      const val = parseInt(saved, 10);
      setHighScore(val);
      stateRef.current.highScore = val;
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    /* ─── Three.js Scene Setup ─── */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(WEATHER_THEMES.neon.skyColor);
    scene.fog = new THREE.Fog(WEATHER_THEMES.neon.fogColor, 20, 130);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      300
    );
    camera.position.set(0, 3.2, 6.5);
    camera.lookAt(0, 1.2, -10);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    /* ─── Lighting ─── */
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    /* ─── Road Construction ─── */
    const roadGroup = new THREE.Group();
    scene.add(roadGroup);

    // Main asphalt
    const roadGeo = new THREE.PlaneGeometry(10, 300);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x111322,
      roughness: 0.8,
      metalness: 0.2,
    });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.set(0, -0.01, -100);
    roadGroup.add(roadMesh);

    // Curbs & Rails
    [-5.2, 5.2].forEach((x) => {
      const curbGeo = new THREE.BoxGeometry(0.3, 0.4, 300);
      const curbMat = new THREE.MeshStandardMaterial({
        color: 0xff3366,
        roughness: 0.4,
        emissive: 0xff0044,
        emissiveIntensity: 0.3,
      });
      const curb = new THREE.Mesh(curbGeo, curbMat);
      curb.position.set(x, 0.1, -100);
      roadGroup.add(curb);
    });

    // Dashed moving center lines
    const lineCount = 30;
    const linesGroup = new THREE.Group();
    const lineGeo = new THREE.PlaneGeometry(0.12, 3);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4 });

    for (let i = 0; i < lineCount; i++) {
      [-LANE_WIDTH / 2, LANE_WIDTH / 2].forEach((lx) => {
        const line = new THREE.Mesh(lineGeo, lineMat);
        line.rotation.x = -Math.PI / 2;
        line.position.set(lx, 0.01, -i * 10);
        linesGroup.add(line);
      });
    }
    roadGroup.add(linesGroup);

    // Distant Cyber Buildings & Neon Grid Horizon
    const buildingsGroup = new THREE.Group();
    for (let i = 0; i < 40; i++) {
      const h = 15 + Math.random() * 40;
      const w = 4 + Math.random() * 8;
      const bGeo = new THREE.BoxGeometry(w, h, w);
      const bMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0x0d1226 : 0x1a0f2e,
        roughness: 0.3,
      });
      const bMesh = new THREE.Mesh(bGeo, bMat);
      const side = i % 2 === 0 ? -1 : 1;
      bMesh.position.set(
        side * (16 + Math.random() * 30),
        h / 2 - 5,
        -10 - (i * 7)
      );
      buildingsGroup.add(bMesh);
    }
    scene.add(buildingsGroup);

    /* ─── Weather Particles (Rain / Snow / Dust) ─── */
    const particleCount = 600;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    const pVel = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 30;
      pPos[i * 3 + 1] = Math.random() * 20;
      pPos[i * 3 + 2] = -Math.random() * 80;

      pVel[i * 3] = 0;
      pVel[i * 3 + 1] = -0.5 - Math.random() * 0.5;
      pVel[i * 3 + 2] = 0.5;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xaaccff,
      size: 0.08,
      transparent: true,
      opacity: 0.6,
    });
    const weatherParticles = new THREE.Points(pGeo, pMat);
    scene.add(weatherParticles);

    /* ─── Player Car Model ─── */
    const playerCar = new THREE.Group();

    // Chassis
    const bodyGeo = new THREE.BoxGeometry(1.4, 0.45, 2.6);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x00f5d4,
      roughness: 0.2,
      metalness: 0.8,
      emissive: 0x004433,
      emissiveIntensity: 0.3,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.35;
    playerCar.add(body);

    // Cabin
    const cabinGeo = new THREE.BoxGeometry(1.0, 0.35, 1.3);
    const cabinMat = new THREE.MeshStandardMaterial({
      color: 0x0a0f1d,
      roughness: 0.1,
      metalness: 0.9,
    });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 0.65, -0.2);
    playerCar.add(cabin);

    // Headlights
    [-0.5, 0.5].forEach((hx) => {
      const hlGeo = new THREE.BoxGeometry(0.2, 0.1, 0.1);
      const hlMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const hl = new THREE.Mesh(hlGeo, hlMat);
      hl.position.set(hx, 0.35, -1.31);
      playerCar.add(hl);
    });

    // Taillights
    [-0.5, 0.5].forEach((tx) => {
      const tlGeo = new THREE.BoxGeometry(0.25, 0.08, 0.1);
      const tlMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });
      const tl = new THREE.Mesh(tlGeo, tlMat);
      tl.position.set(tx, 0.4, 1.31);
      playerCar.add(tl);
    });

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.2, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
    const wheelPositions = [
      [-0.75, 0.25, -0.8],
      [0.75, 0.25, -0.8],
      [-0.75, 0.25, 0.8],
      [0.75, 0.25, 0.8],
    ];
    wheelPositions.forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, wy, wz);
      playerCar.add(wheel);
    });

    // Exhaust Boost Flame
    const flameGeo = new THREE.ConeGeometry(0.15, 0.8, 8);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4, transparent: true, opacity: 0 });
    const leftFlame = new THREE.Mesh(flameGeo, flameMat);
    leftFlame.rotation.x = -Math.PI / 2;
    leftFlame.position.set(-0.35, 0.3, 1.7);
    const rightFlame = leftFlame.clone();
    rightFlame.position.x = 0.35;
    playerCar.add(leftFlame);
    playerCar.add(rightFlame);

    scene.add(playerCar);

    /* ─── Traffic & Obstacles Pooling ─── */
    const obstacles: ObstacleObj[] = [];
    const trafficColors = [0xff3366, 0xb892ff, 0xffbe0b, 0x3a86ff, 0xf15bb5];

    function createTrafficCar(color: number) {
      const car = new THREE.Group();
      const b = new THREE.Mesh(
        new THREE.BoxGeometry(1.35, 0.5, 2.5),
        new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.6 })
      );
      b.position.y = 0.35;
      car.add(b);

      const cab = new THREE.Mesh(
        new THREE.BoxGeometry(0.95, 0.35, 1.2),
        new THREE.MeshStandardMaterial({ color: 0x111122 })
      );
      cab.position.set(0, 0.65, -0.1);
      car.add(cab);

      // Red tail markers
      [-0.45, 0.45].forEach((tx) => {
        const marker = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 0.1, 0.05),
          new THREE.MeshBasicMaterial({ color: 0xff0033 })
        );
        marker.position.set(tx, 0.4, 1.26);
        car.add(marker);
      });

      return car;
    }

    function createEnergyCoin() {
      const group = new THREE.Group();
      const coinGeo = new THREE.OctahedronGeometry(0.4, 0);
      const coinMat = new THREE.MeshStandardMaterial({
        color: 0x00f5d4,
        emissive: 0x00f5d4,
        emissiveIntensity: 0.8,
        roughness: 0.1,
      });
      const coin = new THREE.Mesh(coinGeo, coinMat);
      coin.position.y = 0.6;
      group.add(coin);
      return group;
    }

    function spawnObstacle() {
      const laneIdx = Math.floor(Math.random() * 3);
      const isCoin = Math.random() < 0.28;
      const mesh = isCoin
        ? createEnergyCoin()
        : createTrafficCar(trafficColors[Math.floor(Math.random() * trafficColors.length)]);

      mesh.position.set(LANES[laneIdx], 0, -120 - Math.random() * 20);
      scene.add(mesh);
      obstacles.push({
        mesh,
        lane: laneIdx,
        z: mesh.position.z,
        speed: isCoin ? 0 : 0.15 + Math.random() * 0.1,
        isCoin,
      });
    }

    // Pre-populate some initial traffic
    for (let i = 0; i < 4; i++) {
      const laneIdx = i % 3;
      const mesh = createTrafficCar(trafficColors[i % trafficColors.length]);
      mesh.position.set(LANES[laneIdx], 0, -30 - i * 25);
      scene.add(mesh);
      obstacles.push({
        mesh,
        lane: laneIdx,
        z: mesh.position.z,
        speed: 0.15,
      });
    }

    /* ─── Particle Explosions on Crash ─── */
    const explosionGeo = new THREE.BufferGeometry();
    const expCount = 120;
    const expPos = new Float32Array(expCount * 3);
    const expVel = new Float32Array(expCount * 3);
    for (let i = 0; i < expCount; i++) {
      expPos[i * 3] = 0;
      expPos[i * 3 + 1] = 0.5;
      expPos[i * 3 + 2] = 0;
      expVel[i * 3] = (Math.random() - 0.5) * 0.6;
      expVel[i * 3 + 1] = Math.random() * 0.5 + 0.1;
      expVel[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
    }
    explosionGeo.setAttribute("position", new THREE.BufferAttribute(expPos, 3));
    const explosionMat = new THREE.PointsMaterial({
      color: 0xff4422,
      size: 0.2,
      transparent: true,
      opacity: 0,
    });
    const explosion = new THREE.Points(explosionGeo, explosionMat);
    scene.add(explosion);

    let exploding = false;
    let explosionTimer = 0;

    function triggerCrash(x: number, z: number) {
      exploding = true;
      explosionTimer = 1.0;
      explosionMat.opacity = 1;
      const arr = explosionGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < expCount; i++) {
        arr[i * 3] = x;
        arr[i * 3 + 1] = 0.5;
        arr[i * 3 + 2] = z;
      }
      explosionGeo.attributes.position.needsUpdate = true;
      stateRef.current.shake = 0.8;
    }

    /* ─── Keyboard & Controls ─── */
    const handleKeyDown = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        s.targetLane = Math.max(0, s.targetLane - 1);
        s.keys.left = true;
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        s.targetLane = Math.min(2, s.targetLane + 1);
        s.keys.right = true;
      }
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W" || e.key === " ") {
        s.keys.boost = true;
      }
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        s.keys.down = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") s.keys.left = false;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") s.keys.right = false;
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W" || e.key === " ") s.keys.boost = false;
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") s.keys.down = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    /* ─── Game Loop ─── */
    let animationFrameId: number;
    let lastTime = performance.now();
    let spawnTimer = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const s = stateRef.current;
      const theme = WEATHER_THEMES[s.weather];

      // Update theme colors dynamically if changed
      scene.fog?.color.setHex(theme.fogColor);
      scene.background = new THREE.Color(theme.skyColor);

      if (s.gameState === "playing") {
        // Boost / Nitro logic
        if (s.keys.boost && s.nitro > 0) {
          s.speed = 1.35;
          s.nitro = Math.max(0, s.nitro - dt * 25);
          s.isNitro = true;
          flameMat.opacity = 0.9;
        } else {
          s.speed = s.keys.down ? 0.4 : 0.75;
          s.nitro = Math.min(100, s.nitro + dt * 6);
          s.isNitro = false;
          flameMat.opacity = 0;
        }

        // Steer lerping
        const targetX = LANES[s.targetLane];
        s.playerX += (targetX - s.playerX) * 12 * dt;
        playerCar.position.x = s.playerX;

        // Banking tilt when steering
        const tilt = (targetX - s.playerX) * -0.25;
        playerCar.rotation.z = tilt;
        playerCar.rotation.y = (targetX - s.playerX) * -0.15;

        // Move road dashed lines
        linesGroup.children.forEach((c) => {
          c.position.z += s.speed * 80 * dt;
          if (c.position.z > 15) c.position.z -= 150;
        });

        // Move buildings slowly
        buildingsGroup.children.forEach((b) => {
          b.position.z += s.speed * 30 * dt;
          if (b.position.z > 20) b.position.z -= 180;
        });

        // Move obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
          const obs = obstacles[i];
          obs.mesh.position.z += (s.speed * 80 - obs.speed * 60) * dt;

          if (obs.isCoin) {
            obs.mesh.rotation.y += dt * 4;
            obs.mesh.rotation.x += dt * 2;
          }

          // Collision check with player (player is at z=0, width ~1.2, length ~2.4)
          const dz = Math.abs(obs.mesh.position.z - playerCar.position.z);
          const dx = Math.abs(obs.mesh.position.x - playerCar.position.x);

          if (dz < 1.8 && dx < 1.1) {
            if (obs.isCoin) {
              // Collected coin
              s.score += 250;
              s.nitro = Math.min(100, s.nitro + 30);
              scene.remove(obs.mesh);
              obstacles.splice(i, 1);
              continue;
            } else {
              // CRASH!
              triggerCrash(playerCar.position.x, playerCar.position.z);
              s.gameState = "gameover";
              setGameState("gameover");
              if (s.score > s.highScore) {
                s.highScore = s.score;
                setHighScore(s.score);
                localStorage.setItem("carracing_highscore", s.score.toString());
              }
              break;
            }
          }

          // Remove offscreen obstacles
          if (obs.mesh.position.z > 25) {
            scene.remove(obs.mesh);
            obstacles.splice(i, 1);
            s.score += 50;
          }
        }

        // Spawn new traffic / coins
        spawnTimer += dt;
        if (spawnTimer > (s.isNitro ? 0.6 : 0.95)) {
          spawnTimer = 0;
          spawnObstacle();
        }

        // Update score & distance
        s.score += Math.floor(s.speed * 10);
        setScore(s.score);
        setSpeedKmH(Math.floor(s.speed * 160));
        setNitro(Math.floor(s.nitro));
      } else {
        // Idle camera / lines animation in menu
        linesGroup.children.forEach((c) => {
          c.position.z += 0.3 * 80 * dt;
          if (c.position.z > 15) c.position.z -= 150;
        });
      }

      // Weather particles
      const pArr = pGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        pArr[i * 3 + 1] += pVel[i * 3 + 1];
        pArr[i * 3 + 2] += (s.gameState === "playing" ? s.speed * 50 : 15) * dt;
        if (pArr[i * 3 + 1] < 0) pArr[i * 3 + 1] = 20;
        if (pArr[i * 3 + 2] > 10) pArr[i * 3 + 2] = -80;
      }
      pGeo.attributes.position.needsUpdate = true;

      // Handle explosion particles
      if (exploding) {
        explosionTimer -= dt * 1.5;
        explosionMat.opacity = Math.max(0, explosionTimer);
        const expArr = explosionGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < expCount; i++) {
          expArr[i * 3] += expVel[i * 3];
          expArr[i * 3 + 1] += expVel[i * 3 + 1];
          expArr[i * 3 + 2] += expVel[i * 3 + 2];
        }
        explosionGeo.attributes.position.needsUpdate = true;
        if (explosionTimer <= 0) exploding = false;
      }

      // Camera dynamic FOV & shake
      if (s.shake > 0) {
        camera.position.x = (Math.random() - 0.5) * s.shake;
        camera.position.y = 3.2 + (Math.random() - 0.5) * s.shake;
        s.shake = Math.max(0, s.shake - dt * 3);
      } else {
        camera.position.x = s.playerX * 0.4;
        camera.position.y = 3.2;
      }

      camera.fov = s.isNitro ? 72 : 60;
      camera.updateProjectionMatrix();

      renderer.render(scene, camera);
    };

    animate();

    /* ─── Resize Handler ─── */
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    /* ─── Cleanup ─── */
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(animationFrameId);
      obstacles.forEach((o) => scene.remove(o.mesh));
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-dark">
      {/* 3D Canvas Mount */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* In-Game Top HUD Overlay */}
      {gameState === "playing" && (
        <div className="absolute top-16 left-0 right-0 px-4 sm:px-8 flex items-start justify-between pointer-events-none z-30">
          {/* Speed & Nitro Box */}
          <div className="bg-black/75 border border-primary/30 backdrop-blur-md px-4 py-2.5 rounded-sm">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-mono font-bold text-primary">{speedKmH}</span>
              <span className="text-xs font-mono text-white/50 tracking-wider">KM/H</span>
            </div>
            {/* Nitro Bar */}
            <div className="w-28 sm:w-36 h-2 bg-white/10 rounded-full mt-1.5 overflow-hidden border border-white/20">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-100"
                style={{ width: `${nitro}%` }}
              />
            </div>
            <span className="text-[9px] font-mono text-white/40 tracking-widest uppercase">
              NITRO [SPACE / UP]
            </span>
          </div>

          {/* Score Box */}
          <div className="bg-black/75 border border-white/20 backdrop-blur-md px-4 py-2.5 rounded-sm text-right">
            <span className="text-[10px] font-mono text-white/40 tracking-widest uppercase block">
              SCORE
            </span>
            <span className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-wider">
              {score.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Weather Selector Pill */}
      {gameState === "playing" && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-auto hidden md:flex items-center gap-1.5 bg-black/80 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
          {(Object.keys(WEATHER_THEMES) as WeatherKey[]).map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setWeatherKey(w)}
              className={`text-[10px] font-mono uppercase px-2.5 py-1 rounded-full transition-all ${
                weatherKey === w
                  ? "bg-primary text-black font-bold"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {WEATHER_THEMES[w].name}
            </button>
          ))}
        </div>
      )}

      {/* Start / Menu Overlay */}
      {gameState === "menu" && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40 p-4">
          <div className="bg-dark/95 border border-primary/40 p-6 sm:p-10 max-w-md w-full text-center shadow-2xl rounded-sm">
            <div className="inline-block px-3 py-1 bg-primary/20 border border-primary/40 text-primary text-[11px] font-mono tracking-widest uppercase mb-3">
              ENDLESS 3D HIGHWAY
            </div>
            <h2
              className="text-4xl sm:text-6xl font-bold text-white tracking-wider mb-2"
              style={{ fontFamily: "Bebas Neue, sans-serif" }}
            >
              CAR RACING
            </h2>
            <p className="text-white/50 text-xs sm:text-sm leading-relaxed mb-6 font-mono">
              Dodge highway traffic, collect glowing nitro crystals, and push for the high score!
            </p>

            {/* Controls Guide */}
            <div className="grid grid-cols-2 gap-2 text-left bg-black/40 border border-white/10 p-3 mb-6 font-mono text-[11px]">
              <div>
                <span className="text-white/30 block">STEER</span>
                <span className="text-primary font-bold">A / D or ← / →</span>
              </div>
              <div>
                <span className="text-white/30 block">NITRO BOOST</span>
                <span className="text-primary font-bold">SPACE / W / ↑</span>
              </div>
            </div>

            {highScore > 0 && (
              <div className="mb-5 text-xs font-mono text-white/60">
                BEST RECORD: <span className="text-accent font-bold">{highScore.toLocaleString()}</span>
              </div>
            )}

            <button
              type="button"
              onClick={startGame}
              className="w-full py-3.5 bg-primary hover:bg-primary/90 text-dark font-mono font-bold tracking-widest text-sm transition-transform active:scale-95 shadow-lg shadow-primary/20"
            >
              START RACE
            </button>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === "gameover" && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-40 p-4 animate-in fade-in duration-200">
          <div className="bg-dark/95 border border-red-500/50 p-6 sm:p-10 max-w-md w-full text-center shadow-2xl rounded-sm">
            <div className="inline-block px-3 py-1 bg-red-500/20 border border-red-500/40 text-red-400 text-[11px] font-mono tracking-widest uppercase mb-3">
              VEHICLE DESTROYED
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
              onClick={startGame}
              className="w-full py-3.5 bg-primary hover:bg-primary/90 text-dark font-mono font-bold tracking-widest text-sm transition-transform active:scale-95"
            >
              RACE AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
