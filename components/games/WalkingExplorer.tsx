"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/* ─── Web Audio Sound Effects Synthesizer ─── */
class ExplorerAudio {
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
    osc.frequency.setValueAtTime(80, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(25, this.ctx.currentTime + 0.07);
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.07);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.07);
  }

  playJump() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playCollect() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + i * 0.05);
      gain.gain.setValueAtTime(0.1, now + i * 0.05);
      gain.gain.linearRampToValueAtTime(0.001, now + i * 0.05 + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.1);
    });
  }
}

const explorerSfx = new ExplorerAudio();

interface CollectibleOrb {
  mesh: THREE.Group;
  light: THREE.PointLight;
  x: number;
  y: number;
  z: number;
  type: "cyan" | "violet" | "amber";
  name: string;
  collected: boolean;
}

const ORB_TYPES = [
  { type: "cyan" as const, color: 0x00f5d4, name: "QUANTUM CRYSTAL" },
  { type: "violet" as const, color: 0xb892ff, name: "NEBULA RELIC" },
  { type: "amber" as const, color: 0xffbe0b, name: "SOLAR POWER CORE" },
];

const SKIES = {
  nebula: { name: "DEEP SPACE NEBULA", fog: 0x060914, light: 0x38bdf8, ground: 0x0a1020 },
  sunset: { name: "CYBER DAWN", fog: 0x1f0b24, light: 0xff6b8b, ground: 0x180a1c },
  aurora: { name: "EMERALD AURORA", fog: 0x041410, light: 0x22c55e, ground: 0x06120e },
};

type SkyKey = keyof typeof SKIES;

export default function WalkingExplorer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const compassCanvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<"menu" | "playing" | "victory">("menu");
  const [orbsFound, setOrbsFound] = useState(0);
  const [totalOrbs] = useState(10);
  const [stamina, setStamina] = useState(100);
  const [distToNearest, setDistToNearest] = useState(0);
  const [skyKey, setSkyKey] = useState<SkyKey>("nebula");
  const [flashlightOn, setFlashlightOn] = useState(true);
  const [lastFoundLog, setLastFoundLog] = useState<string | null>(null);

  const stateRef = useRef({
    gameState: "menu" as "menu" | "playing" | "victory",
    skyKey: "nebula" as SkyKey,
    orbsFound: 0,
    totalOrbs: 10,
    stamina: 100,
    playerPos: new THREE.Vector3(0, 1.6, 0),
    playerVelY: 0,
    isGrounded: true,
    yaw: 0,
    pitch: 0,
    headBob: 0,
    stepDistance: 0,
    flashlightOn: true,
    keys: { w: false, a: false, s: false, d: false, shift: false, space: false },
    orbs: [] as CollectibleOrb[],
  });

  stateRef.current.skyKey = skyKey;
  stateRef.current.gameState = gameState;
  stateRef.current.flashlightOn = flashlightOn;

  const startExploring = () => {
    stateRef.current.orbsFound = 0;
    stateRef.current.playerPos.set(0, 1.6, 0);
    setOrbsFound(0);
    setLastFoundLog(null);
    setGameState("playing");
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    /* ─── Three.js Scene Setup ─── */
    const scene = new THREE.Scene();
    const curSky = SKIES[stateRef.current.skyKey];
    scene.background = new THREE.Color(curSky.fog);
    scene.fog = new THREE.FogExp2(curSky.fog, 0.022);

    const camera = new THREE.PerspectiveCamera(
      65,
      container.clientWidth / container.clientHeight,
      0.1,
      250
    );
    camera.position.set(0, 1.6, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    /* ─── Lighting ─── */
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xaaccff, 1.2);
    dirLight.position.set(30, 60, 30);
    scene.add(dirLight);

    // Player Spotlight Headlamp
    const spotLight = new THREE.SpotLight(0xffffff, 3.5, 25, Math.PI / 3.5, 0.3, 1.2);
    spotLight.position.set(0, 1.6, 0);
    scene.add(spotLight);
    scene.add(spotLight.target);

    // Player Ambient Glow Light
    const playerAura = new THREE.PointLight(0x00f5d4, 1.5, 8);
    scene.add(playerAura);

    /* ─── Cyber Grid Terrain with Procedural Elevation ─── */
    const terrainSize = 180;
    const terrainSegments = 60;
    const terrainGeo = new THREE.PlaneGeometry(terrainSize, terrainSize, terrainSegments, terrainSegments);

    // Add subtle undulating terrain hills
    const posAttr = terrainGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vy = posAttr.getY(i);
      const elevation = Math.sin(vx * 0.05) * Math.cos(vy * 0.05) * 1.8 + Math.sin(vx * 0.02) * 2.0;
      posAttr.setZ(i, elevation);
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      color: curSky.ground,
      roughness: 0.85,
      metalness: 0.15,
      wireframe: false,
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.rotation.x = -Math.PI / 2;
    scene.add(terrain);

    // Glowing Neon Grid Helper Overlay
    const gridHelper = new THREE.GridHelper(terrainSize, 90, 0x00f5d4, 0x13223e);
    gridHelper.position.y = 0.05;
    scene.add(gridHelper);

    /* ─── Cyber Monoliths, Pyramids & Pylons ─── */
    const structuresGroup = new THREE.Group();

    // 1. Monolith Towers
    const monoGeo = new THREE.BoxGeometry(3.0, 16, 3.0);
    const monoMat = new THREE.MeshStandardMaterial({
      color: 0x0e172a,
      roughness: 0.3,
      metalness: 0.8,
    });
    const beamGeo = new THREE.CylinderGeometry(0.12, 0.12, 30, 8);
    const beamMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4, transparent: true, opacity: 0.6 });

    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const radius = 30 + Math.random() * 50;
      const mx = Math.cos(angle) * radius;
      const mz = Math.sin(angle) * radius;

      const mono = new THREE.Mesh(monoGeo, monoMat);
      mono.position.set(mx, 8, mz);
      structuresGroup.add(mono);

      if (i % 3 === 0) {
        const beam = new THREE.Mesh(beamGeo, beamMat);
        beam.position.set(mx, 22, mz);
        structuresGroup.add(beam);
      }
    }

    // 2. Central Cyber Pyramid
    const pyrGeo = new THREE.ConeGeometry(8, 10, 4);
    const pyrMat = new THREE.MeshStandardMaterial({
      color: 0x141a2e,
      roughness: 0.2,
      metalness: 0.9,
    });
    const pyramid = new THREE.Mesh(pyrGeo, pyrMat);
    pyramid.position.set(0, 5, -45);
    pyramid.rotation.y = Math.PI / 4;
    structuresGroup.add(pyramid);

    scene.add(structuresGroup);

    /* ─── Ambient Cyber Particles ─── */
    const dustCount = 500;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * terrainSize;
      dustPos[i * 3 + 1] = Math.random() * 12 + 0.5;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * terrainSize;
    }
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0x00f5d4,
      size: 0.12,
      transparent: true,
      opacity: 0.75,
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    /* ─── Collectible Energy Orbs ─── */
    const orbs: CollectibleOrb[] = [];
    const orbCoreGeo = new THREE.OctahedronGeometry(0.55, 2);
    const ringGeo = new THREE.TorusGeometry(0.85, 0.05, 8, 24);

    for (let i = 0; i < 10; i++) {
      const typeConfig = ORB_TYPES[i % ORB_TYPES.length];
      const angle = (i / 10) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const dist = 22 + Math.random() * 52;
      const ox = Math.cos(angle) * dist;
      const oz = Math.sin(angle) * dist;

      const group = new THREE.Group();
      group.position.set(ox, 1.8, oz);

      const orbMat = new THREE.MeshStandardMaterial({
        color: typeConfig.color,
        emissive: typeConfig.color,
        emissiveIntensity: 1.2,
        roughness: 0.1,
      });
      const orbMesh = new THREE.Mesh(orbCoreGeo, orbMat);
      group.add(orbMesh);

      const rMat = new THREE.MeshBasicMaterial({ color: typeConfig.color, wireframe: true });
      const ring = new THREE.Mesh(ringGeo, rMat);
      group.add(ring);

      const orbLight = new THREE.PointLight(typeConfig.color, 3.0, 10);
      group.add(orbLight);

      scene.add(group);

      orbs.push({
        mesh: group,
        light: orbLight,
        x: ox,
        y: 1.8,
        z: oz,
        type: typeConfig.type,
        name: typeConfig.name,
        collected: false,
      });
    }
    stateRef.current.orbs = orbs;

    /* ─── Pointer Lock & Mouse Look ─── */
    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== container) return;
      const s = stateRef.current;
      s.yaw -= e.movementX * 0.0024;
      s.pitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, s.pitch - e.movementY * 0.0024));
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
      if (e.key === "f" || e.key === "F") {
        setFlashlightOn((prev) => !prev);
      }
      if (e.key === " " && s.isGrounded) {
        s.keys.space = true;
        s.playerVelY = 7.5;
        s.isGrounded = false;
        explorerSfx.playJump();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (e.key === "w" || e.key === "W" || e.key === "ArrowUp") s.keys.w = false;
      if (e.key === "s" || e.key === "S" || e.key === "ArrowDown") s.keys.s = false;
      if (e.key === "a" || e.key === "A" || e.key === "ArrowLeft") s.keys.a = false;
      if (e.key === "d" || e.key === "D" || e.key === "ArrowRight") s.keys.d = false;
      if (e.key === "Shift") s.keys.shift = false;
      if (e.key === " ") s.keys.space = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    /* ─── Compass Radar Drawing ─── */
    function drawCompassRadar() {
      const canvas = compassCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const cw = canvas.width;
      const ch = canvas.height;
      ctx.clearRect(0, 0, cw, ch);

      const center = cw / 2;
      const radarRadius = center - 6;

      // Radar Ring
      ctx.strokeStyle = "rgba(0, 245, 212, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(center, center, radarRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(0, 245, 212, 0.15)";
      ctx.beginPath();
      ctx.arc(center, center, radarRadius * 0.5, 0, Math.PI * 2);
      ctx.stroke();

      // Cross lines
      ctx.beginPath();
      ctx.moveTo(center, 6);
      ctx.lineTo(center, cw - 6);
      ctx.moveTo(6, center);
      ctx.lineTo(cw - 6, center);
      ctx.stroke();

      const s = stateRef.current;

      // Draw Uncollected Orbs on Radar
      orbs.forEach((orb) => {
        if (!orb.collected) {
          const dx = orb.x - s.playerPos.x;
          const dz = orb.z - s.playerPos.z;

          // Rotate by player yaw
          const rx = dx * Math.cos(-s.yaw) - dz * Math.sin(-s.yaw);
          const rz = dx * Math.sin(-s.yaw) + dz * Math.cos(-s.yaw);

          const scale = radarRadius / 75;
          const bx = center + rx * scale;
          const by = center + rz * scale;

          if (Math.hypot(bx - center, by - center) < radarRadius) {
            ctx.fillStyle = orb.type === "cyan" ? "#00f5d4" : orb.type === "violet" ? "#b892ff" : "#ffbe0b";
            ctx.beginPath();
            ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      // Player Pointer at Center
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(center, center - 6);
      ctx.lineTo(center - 4, center + 4);
      ctx.lineTo(center + 4, center + 4);
      ctx.closePath();
      ctx.fill();
    }

    /* ─── Game Loop ─── */
    let frameId: number;
    let lastTime = performance.now();
    let compassTimer = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);

      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const s = stateRef.current;
      const skyTheme = SKIES[s.skyKey];

      // Theme Sync
      scene.background = new THREE.Color(skyTheme.fog);
      if (scene.fog) scene.fog.color.setHex(skyTheme.fog);
      terrainMat.color.setHex(skyTheme.ground);

      // Animate Floating Orbs
      orbs.forEach((orb) => {
        if (!orb.collected) {
          orb.mesh.rotation.y += dt * 2.5;
          orb.mesh.position.y = 1.8 + Math.sin(now * 0.0035 + orb.x) * 0.35;
        }
      });

      if (s.gameState === "playing") {
        // Sprint & Stamina
        const isSprinting = s.keys.shift && s.stamina > 10;
        const moveSpeed = isSprinting ? 9.5 : 5.2;

        if (isSprinting && (s.keys.w || s.keys.a || s.keys.s || s.keys.d)) {
          s.stamina = Math.max(0, s.stamina - dt * 25);
        } else {
          s.stamina = Math.min(100, s.stamina + dt * 15);
        }
        setStamina(Math.round(s.stamina));

        // Movement Vector
        const forward = new THREE.Vector3(-Math.sin(s.yaw), 0, -Math.cos(s.yaw)).normalize();
        const right = new THREE.Vector3(Math.cos(s.yaw), 0, -Math.sin(s.yaw)).normalize();

        const moveVec = new THREE.Vector3();
        if (s.keys.w) moveVec.add(forward);
        if (s.keys.s) moveVec.sub(forward);
        if (s.keys.d) moveVec.add(right);
        if (s.keys.a) moveVec.sub(right);

        if (moveVec.lengthSq() > 0) {
          moveVec.normalize().multiplyScalar(moveSpeed * dt);
          s.playerPos.x = Math.max(-terrainSize / 2 + 3, Math.min(terrainSize / 2 - 3, s.playerPos.x + moveVec.x));
          s.playerPos.z = Math.max(-terrainSize / 2 + 3, Math.min(terrainSize / 2 - 3, s.playerPos.z + moveVec.z));

          s.headBob += dt * (isSprinting ? 14 : 9);
          s.stepDistance += dt * moveSpeed;
          if (s.stepDistance > 2.5) {
            s.stepDistance = 0;
            explorerSfx.playStep();
          }
        } else {
          s.headBob = 0;
        }

        // Gravity & Jump Physics
        if (!s.isGrounded) {
          s.playerVelY -= 19.0 * dt;
          s.playerPos.y += s.playerVelY * dt;
          if (s.playerPos.y <= 1.6) {
            s.playerPos.y = 1.6;
            s.playerVelY = 0;
            s.isGrounded = true;
          }
        }

        // Camera Orientation
        camera.position.x = s.playerPos.x;
        camera.position.y = s.playerPos.y + Math.sin(s.headBob) * 0.05;
        camera.position.z = s.playerPos.z;

        const euler = new THREE.Euler(s.pitch, s.yaw, 0, "YXZ");
        camera.quaternion.setFromEuler(euler);

        // Spotlight follows camera view direction
        spotLight.position.copy(camera.position);
        const dirVec = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        spotLight.target.position.copy(camera.position).add(dirVec);
        spotLight.intensity = s.flashlightOn ? 3.8 : 0;
        playerAura.position.copy(camera.position);

        // Check Orb Collection & Find Nearest
        let minDistance = 999;
        orbs.forEach((orb) => {
          if (!orb.collected) {
            const dist = Math.hypot(s.playerPos.x - orb.x, s.playerPos.z - orb.z);
            if (dist < minDistance) minDistance = dist;

            if (dist < 2.0) {
              orb.collected = true;
              scene.remove(orb.mesh);
              s.orbsFound += 1;
              setOrbsFound(s.orbsFound);
              setLastFoundLog(`ACQUIRED: ${orb.name}`);
              explorerSfx.playCollect();

              if (s.orbsFound >= s.totalOrbs) {
                s.gameState = "victory";
                setGameState("victory");
                if (document.pointerLockElement === container) {
                  document.exitPointerLock();
                }
              }
            }
          }
        });
        setDistToNearest(Math.round(minDistance));

        // Draw Radar Compass at 20fps
        compassTimer += dt;
        if (compassTimer > 0.05) {
          compassTimer = 0;
          drawCompassRadar();
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
      orbs.forEach((o) => scene.remove(o.mesh));
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
          {/* Orbs Collected */}
          <div className="bg-black/75 border border-primary/30 backdrop-blur-md px-4 py-2.5 rounded-sm">
            <span className="text-[10px] text-white/40 uppercase block">ORBS LOCATED</span>
            <span className="text-xl font-bold text-primary">
              {orbsFound} / {totalOrbs}
            </span>
          </div>

          {/* Last Collected Lore Log */}
          {lastFoundLog && (
            <div className="hidden sm:inline-block px-3 py-1.5 bg-primary/20 border border-primary text-primary font-bold text-xs tracking-wider animate-in fade-in slide-in-from-top-2 duration-200 rounded-sm">
              {lastFoundLog}
            </div>
          )}

          {/* Nearest Beacon Tracker */}
          <div className="bg-black/75 border border-white/20 backdrop-blur-md px-4 py-2.5 rounded-sm text-right">
            <span className="text-[10px] text-white/40 uppercase block">NEAREST ORB</span>
            <span className="text-xl font-bold text-accent">{distToNearest} M</span>
          </div>
        </div>
      )}

      {/* Crosshair */}
      {gameState === "playing" && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20">
          <div className="w-2.5 h-2.5 border border-primary/70 rounded-full" />
        </div>
      )}

      {/* Radar Compass Circle in Bottom Right */}
      {gameState === "playing" && (
        <div className="absolute bottom-6 right-6 z-30 pointer-events-none bg-black/80 border border-primary/40 p-2 rounded-full backdrop-blur-md">
          <canvas
            ref={compassCanvasRef}
            width={110}
            height={110}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full"
          />
        </div>
      )}

      {/* Flashlight Toggle & Controls in Bottom Left */}
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
        </div>
      )}

      {/* Bottom Stamina Bar */}
      {gameState === "playing" && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none font-mono">
          <div className="bg-black/80 border border-white/15 px-4 py-2 rounded-full backdrop-blur-md flex items-center gap-3">
            <span className="text-[10px] text-white/50 uppercase">STAMINA [SHIFT]</span>
            <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden border border-white/20">
              <div
                className="h-full bg-primary transition-all duration-100"
                style={{ width: `${stamina}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Atmosphere Selector Pill */}
      {gameState === "playing" && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-auto hidden md:flex items-center gap-1.5 bg-black/80 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
          {(Object.keys(SKIES) as SkyKey[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setSkyKey(k)}
              className={`text-[10px] font-mono uppercase px-2.5 py-1 rounded-full transition-all ${
                skyKey === k
                  ? "bg-primary text-black font-bold"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {SKIES[k].name}
            </button>
          ))}
        </div>
      )}

      {/* Start Menu */}
      {gameState === "menu" && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40 p-4">
          <div className="bg-dark/95 border border-primary/40 p-6 sm:p-10 max-w-md w-full text-center shadow-2xl rounded-sm">
            <div className="inline-block px-3 py-1 bg-primary/20 border border-primary/40 text-primary text-[11px] font-mono tracking-widest uppercase mb-3">
              FIRST-PERSON CYBER WORLD
            </div>
            <h2
              className="text-4xl sm:text-6xl font-bold text-white tracking-wider mb-2"
              style={{ fontFamily: "Bebas Neue, sans-serif" }}
            >
              WALKING EXPLORER
            </h2>
            <p className="text-white/50 text-xs sm:text-sm font-mono mb-6">
              Traverse undulating cyber terrain, follow the real-time radar compass, and locate all 10 ancient energy relics!
            </p>

            <div className="bg-black/40 border border-white/10 p-3 mb-6 font-mono text-xs text-left">
              <div className="text-white/40 mb-1 uppercase text-[10px]">Controls:</div>
              <div className="text-primary font-bold">WASD to Move · Shift to Sprint</div>
              <div className="text-primary font-bold">Space to Jump · Click to Lock Look · F Headlamp</div>
            </div>

            <button
              type="button"
              onClick={startExploring}
              className="w-full py-3.5 bg-primary hover:bg-primary/90 text-dark font-mono font-bold tracking-widest text-sm transition-transform active:scale-95 shadow-lg shadow-primary/20"
            >
              BEGIN EXPEDITION
            </button>
          </div>
        </div>
      )}

      {/* Victory Screen */}
      {gameState === "victory" && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-40 p-4 animate-in fade-in duration-200">
          <div className="bg-dark/95 border border-primary/50 p-6 sm:p-10 max-w-md w-full text-center shadow-2xl rounded-sm">
            <div className="inline-block px-3 py-1 bg-primary/20 border border-primary/40 text-primary text-[11px] font-mono tracking-widest uppercase mb-3">
              EXPEDITION COMPLETED
            </div>
            <h2
              className="text-4xl sm:text-6xl font-bold text-white tracking-wider mb-4"
              style={{ fontFamily: "Bebas Neue, sans-serif" }}
            >
              ALL ORBS SECURED
            </h2>

            <p className="text-white/60 text-xs font-mono mb-6">
              You explored the cyber terrain and collected all 10 ancient energy shards!
            </p>

            <button
              type="button"
              onClick={startExploring}
              className="w-full py-3.5 bg-primary hover:bg-primary/90 text-dark font-mono font-bold tracking-widest text-sm transition-transform active:scale-95 shadow-lg shadow-primary/20"
            >
              EXPLORE AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
