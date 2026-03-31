"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* ─── Constants ─── */
const LANE_WIDTH = 2.4;
const LANES = [-LANE_WIDTH, 0, LANE_WIDTH];
const ROAD_SPEED_BASE = 0.22;

const WEATHERS = ["clear", "rain", "fog", "storm", "snow"];

const WEATHER_CONFIGS = {
  clear: {
    fogColor: "#87CEEB",
    fogNear: 30,
    fogFar: 120,
    ambientIntensity: 0.7,
    skyTop: "#0a1628",
    skyBottom: "#1a3a5c",
    roadColor: "#1c1c24",
    lineColor: "#ffffff",
    label: "☀️ CLEAR",
    particleColor: null,
    particleCount: 0,
  },
  rain: {
    fogColor: "#2a3540",
    fogNear: 15,
    fogFar: 60,
    ambientIntensity: 0.35,
    skyTop: "#0d1117",
    skyBottom: "#1a2030",
    roadColor: "#111318",
    lineColor: "#aaccff",
    label: "🌧️ RAIN",
    particleColor: "#88aaff",
    particleCount: 400,
  },
  fog: {
    fogColor: "#c8d4d8",
    fogNear: 8,
    fogFar: 35,
    ambientIntensity: 0.55,
    skyTop: "#8a9ba8",
    skyBottom: "#b8c8d0",
    roadColor: "#222228",
    lineColor: "#dddddd",
    label: "🌫️ FOG",
    particleColor: "#ddeeff",
    particleCount: 150,
  },
  storm: {
    fogColor: "#0a0d12",
    fogNear: 10,
    fogFar: 45,
    ambientIntensity: 0.15,
    skyTop: "#050810",
    skyBottom: "#0d1520",
    roadColor: "#0d0d10",
    lineColor: "#ff6622",
    label: "⛈️ STORM",
    particleColor: "#88aaff",
    particleCount: 600,
  },
  snow: {
    fogColor: "#dde8f0",
    fogNear: 12,
    fogFar: 50,
    ambientIntensity: 0.85,
    skyTop: "#6688aa",
    skyBottom: "#aac0d0",
    roadColor: "#2a2a35",
    lineColor: "#ffffff",
    label: "❄️ SNOW",
    particleColor: "#ffffff",
    particleCount: 300,
  },
};

/* ─── Types ─── */
type WeatherType = keyof typeof WEATHER_CONFIGS;

interface GameState {
  score: number;
  gameOver: boolean;
  started: boolean;
}

interface Obstacle {
  id: number;
  x: number;
  z: number;
  lane: number;
  variant: number;
}

/* ─── Utility ─── */
function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

/* ─── Weather Particles (Rain/Snow/Fog) ─── */
function WeatherParticles({ weather }: { weather: WeatherType }) {
  const cfg = WEATHER_CONFIGS[weather];
  const ref = useRef<THREE.Points>(null);
  const count = cfg.particleCount;

  const [positions, velocities] = useMemo(() => {
    const rand = seededRand(42);
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rand() - 0.5) * 24;
      pos[i * 3 + 1] = rand() * 20 - 2;
      pos[i * 3 + 2] = (rand() - 0.5) * 40 + 5;
      vel[i * 3] = weather === "storm" ? (rand() - 0.5) * 0.08 : 0;
      vel[i * 3 + 1] = -(weather === "snow"
        ? 0.04 + rand() * 0.03
        : 0.18 + rand() * 0.12);
      vel[i * 3 + 2] = 0;
    }
    return [pos, vel];
  }, [count, weather]);

  useFrame(() => {
    if (!ref.current || count === 0) return;
    const pos = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      pos[i * 3] += velocities[i * 3];
      pos[i * 3 + 1] += velocities[i * 3 + 1];
      pos[i * 3 + 2] += 0.22;
      if (pos[i * 3 + 1] < -2) pos[i * 3 + 1] = 18;
      if (pos[i * 3 + 2] > 25) pos[i * 3 + 2] -= 40;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  if (count === 0) return null;
  const colorStr = cfg.particleColor || "#ffffff";
  const color = new THREE.Color(colorStr);
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={weather === "snow" ? 0.09 : weather === "fog" ? 0.18 : 0.04}
        transparent
        opacity={weather === "fog" ? 0.25 : weather === "snow" ? 0.9 : 0.7}
        sizeAttenuation
      />
    </points>
  );
}

/* ─── Lightning Flash ─── */
function Lightning({ active }: { active: boolean }) {
  const ref = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.intensity = active
      ? Math.max(0, Math.sin(t * 12) * (Math.sin(t * 2.3) > 0.7 ? 8 : 0))
      : 0;
  });
  return (
    <pointLight
      ref={ref}
      position={[2, 20, -10]}
      color="#aaccff"
      distance={200}
    />
  );
}

/* ─── Sky Gradient Backdrop ─── */
function SkyBox({ weather }: { weather: WeatherType }) {
  const cfg = WEATHER_CONFIGS[weather];
  return (
    <mesh position={[0, 15, -80]}>
      <planeGeometry args={[200, 60]} />
      <meshBasicMaterial color={cfg.skyBottom} side={THREE.BackSide} />
    </mesh>
  );
}

/* ─── Road ─── */
function Road({ weather }: { weather: WeatherType }) {
  const cfg = WEATHER_CONFIGS[weather];
  const color = cfg.roadColor;
  return (
    <group>
      {/* Main road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[8.5, 300]} />
        <meshStandardMaterial color={color} roughness={0.85} metalness={0.05} />
      </mesh>
      {/* Sidewalks */}
      {[-1, 1].map((side, i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[side * 5.25, -0.48, 0]}
        >
          <planeGeometry args={[1.8, 300]} />
          <meshStandardMaterial color="#1a1a22" roughness={0.9} />
        </mesh>
      ))}
      {/* Kerb strips */}
      {[-1, 1].map((side, i) => (
        <mesh key={i} position={[side * 4.3, -0.3, 0]}>
          <boxGeometry args={[0.12, 0.35, 300]} />
          <meshStandardMaterial color="#cc3311" roughness={0.6} />
        </mesh>
      ))}
      {/* Lane dividers */}
      {[-LANE_WIDTH * 0.5, LANE_WIDTH * 0.5].map((x, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, -0.49, 0]}>
          <planeGeometry args={[0.08, 300]} />
          <meshStandardMaterial
            color={cfg.lineColor}
            opacity={0.25}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Dashed Center Lines ─── */
function CenterLines({
  speed,
  weather,
}: {
  speed: number;
  weather: WeatherType;
}) {
  const ref = useRef<THREE.Group>(null);
  const cfg = WEATHER_CONFIGS[weather];
  useFrame(() => {
    if (!ref.current) return;
    ref.current.children.forEach((c) => {
      c.position.z += speed;
      if (c.position.z > 18) c.position.z -= 160;
    });
  });
  return (
    <group ref={ref}>
      {Array.from({ length: 40 }).map((_, i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.488, -i * 4]}
        >
          <planeGeometry args={[0.1, 2.2]} />
          <meshStandardMaterial
            color={cfg.lineColor}
            opacity={0.5}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Wet Road Reflections ─── */
function RoadReflection({ weather }: { weather: WeatherType }) {
  if (weather !== "rain" && weather !== "storm") return null;
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.489, 5]}>
      <planeGeometry args={[8.4, 60]} />
      <meshStandardMaterial
        color="#1a2840"
        metalness={0.9}
        roughness={0.05}
        transparent
        opacity={0.35}
      />
    </mesh>
  );
}

/* ─── Street Lamps ─── */
function StreetLamps({
  speed,
  weather,
}: {
  speed: number;
  weather: WeatherType;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!ref.current) return;
    ref.current.children.forEach((c) => {
      c.position.z += speed;
      if (c.position.z > 18) c.position.z -= 180;
    });
  });

  const lamps: React.JSX.Element[] = [];
  for (let i = 0; i < 18; i++) {
    const z = -i * 10;
    [-1, 1].forEach((side, j) => {
      lamps.push(
        <group key={`${i}-${j}`} position={[side * 4.6, 0, z]}>
          {/* Pole */}
          <mesh position={[0, 1.8, 0]}>
            <cylinderGeometry args={[0.06, 0.08, 3.6, 8]} />
            <meshStandardMaterial
              color="#334455"
              metalness={0.8}
              roughness={0.3}
            />
          </mesh>
          {/* Arm */}
          <mesh
            position={[side * -0.3, 3.65, 0]}
            rotation={[0, 0, side * -0.3]}
          >
            <cylinderGeometry args={[0.04, 0.04, 0.8, 6]} />
            <meshStandardMaterial color="#334455" metalness={0.8} />
          </mesh>
          {/* Lamp head */}
          <mesh position={[side * -0.55, 3.7, 0]}>
            <boxGeometry args={[0.3, 0.12, 0.18]} />
            <meshStandardMaterial
              color="#ffeeaa"
              emissive="#ffcc44"
              emissiveIntensity={weather === "storm" ? 0.4 : 1.2}
            />
          </mesh>
        </group>,
      );
    });
  }
  return <group ref={ref}>{lamps}</group>;
}

/* ─── Buildings ─── */
interface BuildingData {
  h: number;
  side: number;
  xOff: number;
  w: number;
  d: number;
  z: number;
  windowRows: number;
  windowCols: number;
  seed: number;
}

function Buildings({
  speed,
  weather,
}: {
  speed: number;
  weather: WeatherType;
}) {
  const ref = useRef<THREE.Group>(null);
  const rand = useMemo(() => seededRand(99), []);

  const buildingData = useMemo(() => {
    const data: BuildingData[] = [];
    for (let i = 0; i < 28; i++) {
      const h = 3 + rand() * 9;
      const side = i % 2 === 0 ? -1 : 1;
      const xOff = 5.5 + rand() * 3;
      const w = 1.8 + rand() * 1.4;
      const d = 1.8 + rand() * 1.4;
      const z = -i * 7;
      const windowRows = Math.floor(h / 1.2);
      const windowCols = Math.floor(w / 0.6);
      data.push({
        h,
        side,
        xOff,
        w,
        d,
        z,
        windowRows,
        windowCols,
        seed: rand(),
      });
    }
    return data;
  }, []);

  useFrame(() => {
    if (!ref.current) return;
    ref.current.children.forEach((c) => {
      c.position.z += speed;
      if (c.position.z > 20) c.position.z -= 200;
    });
  });

  const isNight = weather === "storm" || weather === "rain";

  return (
    <group ref={ref}>
      {buildingData.map((b, i) => (
        <group key={i} position={[b.side * b.xOff, b.h / 2 - 0.5, b.z]}>
          <mesh>
            <boxGeometry args={[b.w, b.h, b.d]} />
            <meshStandardMaterial
              color={b.seed > 0.5 ? "#111620" : "#0d1018"}
              roughness={0.9}
              metalness={0.1}
              emissive={isNight ? "#223355" : "#000"}
              emissiveIntensity={isNight ? 0.04 : 0}
            />
          </mesh>
          {/* Windows */}
          {Array.from({ length: b.windowRows }).map((_, r) =>
            Array.from({ length: b.windowCols }).map((_, c) => {
              const lit = Math.sin(i * 7 + r * 3 + c * 11) > 0.1;
              return (
                <mesh
                  key={`${r}-${c}`}
                  position={[
                    -b.w / 2 + 0.35 + c * 0.6,
                    -b.h / 2 + 0.8 + r * 1.1,
                    b.d / 2 + 0.01,
                  ]}
                >
                  <planeGeometry args={[0.28, 0.42]} />
                  <meshStandardMaterial
                    color={lit ? "#ffdd88" : "#1a2030"}
                    emissive={lit ? "#ffaa22" : "#000"}
                    emissiveIntensity={lit ? (isNight ? 1.8 : 0.6) : 0}
                  />
                </mesh>
              );
            }),
          )}
        </group>
      ))}
    </group>
  );
}

/* ─── Player Car ─── */
function PlayerCar({ lane, speed }: { lane: number; speed: number }) {
  const ref = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const w1 = useRef<THREE.Group>(null);
  const w2 = useRef<THREE.Group>(null);
  const w3 = useRef<THREE.Group>(null);
  const w4 = useRef<THREE.Group>(null);
  const wheelRefs = [w1, w2, w3, w4];

  const targetX = LANES[lane] ?? 0;

  useFrame((_, delta) => {
    if (!ref.current) return;
    const dx = targetX - ref.current.position.x;
    ref.current.position.x += dx * 0.12;
    // Lean on lane change
    if (bodyRef.current) bodyRef.current.rotation.z = -dx * 0.18;
    // Wheel spin
    wheelRefs.forEach((w) => {
      if (w.current) w.current.rotation.x -= speed * 1.8;
    });
  });

  const wheelPositions: [number, number, number][] = [
    [-0.62, -0.08, -0.9],
    [0.62, -0.08, -0.9],
    [-0.62, -0.08, 0.85],
    [0.62, -0.08, 0.85],
  ];

  return (
    <group ref={ref} position={[targetX, 0.22, 7]}>
      <group ref={bodyRef}>
        {/* Main body */}
        <mesh position={[0, 0.28, 0]}>
          <boxGeometry args={[1.35, 0.38, 2.6]} />
          <meshStandardMaterial
            color="#cc2200"
            metalness={0.85}
            roughness={0.15}
          />
        </mesh>
        {/* Lower skirt */}
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[1.42, 0.12, 2.7]} />
          <meshStandardMaterial
            color="#880000"
            metalness={0.7}
            roughness={0.2}
          />
        </mesh>
        {/* Cabin */}
        <mesh position={[0, 0.56, 0.12]}>
          <boxGeometry args={[0.98, 0.38, 1.3]} />
          <meshStandardMaterial
            color="#0a0a12"
            metalness={0.4}
            roughness={0.2}
            transparent
            opacity={0.85}
          />
        </mesh>
        {/* Windshield */}
        <mesh position={[0, 0.55, -0.5]} rotation={[0.35, 0, 0]}>
          <planeGeometry args={[0.9, 0.35]} />
          <meshStandardMaterial
            color="#88aacc"
            metalness={0.1}
            roughness={0.05}
            transparent
            opacity={0.55}
          />
        </mesh>
        {/* Hood scoop */}
        <mesh position={[0, 0.49, -0.7]}>
          <boxGeometry args={[0.4, 0.1, 0.5]} />
          <meshStandardMaterial
            color="#990000"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
        {/* Spoiler */}
        <mesh position={[0, 0.6, 1.18]}>
          <boxGeometry args={[1.1, 0.08, 0.22]} />
          <meshStandardMaterial
            color="#770000"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        {/* Headlights */}
        {[-0.52, 0.52].map((x, i) => (
          <group key={i}>
            <mesh position={[x, 0.28, -1.32]}>
              <boxGeometry args={[0.22, 0.14, 0.06]} />
              <meshStandardMaterial
                color="#ffffee"
                emissive="#ffffaa"
                emissiveIntensity={3}
              />
            </mesh>
            <pointLight
              position={[x, 0.28, -2.5]}
              color="#ffffcc"
              intensity={1.5}
              distance={12}
            />
          </group>
        ))}
        {/* Tail lights */}
        {[-0.52, 0.52].map((x, i) => (
          <mesh key={i} position={[x, 0.28, 1.32]}>
            <boxGeometry args={[0.22, 0.14, 0.06]} />
            <meshStandardMaterial
              color="#ff2200"
              emissive="#ff2200"
              emissiveIntensity={2.5}
            />
          </mesh>
        ))}
        {/* Exhaust glow */}
        {[-0.3, 0.3].map((x, i) => (
          <pointLight
            key={i}
            position={[x, 0.1, 1.6]}
            color="#ff6600"
            intensity={0.6}
            distance={3}
          />
        ))}
      </group>
      {/* Wheels */}
      {wheelRefs.map((w, i) => (
        <group key={i} ref={w} position={wheelPositions[i]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.28, 0.28, 0.18, 16]} />
            <meshStandardMaterial color="#111111" roughness={0.9} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.16, 0.16, 0.2, 12]} />
            <meshStandardMaterial
              color="#888888"
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ─── Obstacle Car ─── */
function ObstacleCar({
  x,
  z,
  variant,
  speed,
}: {
  x: number;
  z: number;
  variant: number;
  speed: number;
}) {
  const w1 = useRef<THREE.Group>(null);
  const w2 = useRef<THREE.Group>(null);
  const w3 = useRef<THREE.Group>(null);
  const w4 = useRef<THREE.Group>(null);
  const wheelRefs = [w1, w2, w3, w4];

  const colors = ["#1a3a8a", "#2a6622", "#884400", "#333344", "#662288"];
  const color = colors[variant % colors.length];
  const darkColor = color.replace(/[0-9a-f]{2}/gi, (m) =>
    Math.max(0, parseInt(m, 16) - 0x22)
      .toString(16)
      .padStart(2, "0"),
  );

  const wheelPositions: [number, number, number][] = [
    [-0.58, -0.08, -0.82],
    [0.58, -0.08, -0.82],
    [-0.58, -0.08, 0.78],
    [0.58, -0.08, 0.78],
  ];

  useFrame(() => {
    wheelRefs.forEach((w) => {
      if (w.current) w.current.rotation.x -= speed * 1.5;
    });
  });

  return (
    <group position={[x, 0.22, z]}>
      <mesh position={[0, 0.26, 0]}>
        <boxGeometry args={[1.28, 0.36, 2.3]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[1.35, 0.12, 2.4]} />
        <meshStandardMaterial
          color={darkColor}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[0, 0.52, 0.1]}>
        <boxGeometry args={[0.9, 0.32, 1.1]} />
        <meshStandardMaterial
          color="#0a0a14"
          transparent
          opacity={0.8}
          roughness={0.2}
        />
      </mesh>
      {/* Tail lights */}
      {[-0.5, 0.5].map((ox, i) => (
        <mesh key={i} position={[ox, 0.26, 1.16]}>
          <boxGeometry args={[0.2, 0.12, 0.05]} />
          <meshStandardMaterial
            color="#ff3300"
            emissive="#ff3300"
            emissiveIntensity={1.8}
          />
        </mesh>
      ))}
      {/* Headlights */}
      {[-0.5, 0.5].map((ox, i) => (
        <mesh key={i} position={[ox, 0.26, -1.16]}>
          <boxGeometry args={[0.2, 0.12, 0.05]} />
          <meshStandardMaterial
            color="#ffeecc"
            emissive="#ffeecc"
            emissiveIntensity={2}
          />
        </mesh>
      ))}
      {/* Wheels */}
      {[w1, w2, w3, w4].map((w, i) => (
        <group key={i} ref={w} position={wheelPositions[i]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.26, 0.26, 0.16, 14]} />
            <meshStandardMaterial color="#111" roughness={0.9} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.14, 0.14, 0.18, 10]} />
            <meshStandardMaterial
              color="#777"
              metalness={0.85}
              roughness={0.15}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ─── Environment Lighting ─── */
function EnvLighting({ weather }: { weather: WeatherType }) {
  const cfg = WEATHER_CONFIGS[weather];
  const sunRef = useRef<THREE.DirectionalLight>(null);

  return (
    <>
      <ambientLight
        intensity={cfg.ambientIntensity}
        color={weather === "snow" ? "#cce0ff" : "#ffffff"}
      />
      <directionalLight
        ref={sunRef}
        position={weather === "clear" ? [8, 15, -10] : [2, 8, -5]}
        intensity={weather === "clear" ? 1.4 : weather === "storm" ? 0.1 : 0.5}
        color={
          weather === "clear"
            ? "#fff5e0"
            : weather === "snow"
              ? "#ddeeff"
              : "#8899bb"
        }
        castShadow
      />
      {/* Headlight fill */}
      <pointLight
        position={[0, 3, 10]}
        intensity={0.8}
        color="#ffffcc"
        distance={15}
      />
      {/* Street lamp glow */}
      <pointLight
        position={[-4.6, 4, 0]}
        intensity={0.4}
        color="#ffcc44"
        distance={12}
      />
      <pointLight
        position={[4.6, 4, 0]}
        intensity={0.4}
        color="#ffcc44"
        distance={12}
      />
      {weather === "storm" && <Lightning active={true} />}
    </>
  );
}

/* ─── Game Scene ─── */
function GameScene({
  gameState,
  setGameState,
  weather,
}: {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  weather: WeatherType;
}) {
  const [lane, setLane] = useState(1);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [speed, setSpeed] = useState(ROAD_SPEED_BASE);
  const obstacleId = useRef(0);
  const spawnTimer = useRef(0);
  const { camera } = useThree();
  const cfg = WEATHER_CONFIGS[weather];

  useEffect(() => {
    camera.position.set(0, 5.5, 14);
    camera.lookAt(0, 0, 3);
  }, [camera]);

  // Touch / swipe
  useEffect(() => {
    let startX = 0;
    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 30) {
        setLane((l) => (dx < 0 ? Math.max(0, l - 1) : Math.min(2, l + 1)));
      }
    };
    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  // Keyboard
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameState.gameOver) return;
      if (!gameState.started) setGameState((s) => ({ ...s, started: true }));
      switch (e.key.toLowerCase()) {
        case "arrowleft":
        case "a":
          setLane((l) => Math.max(0, l - 1));
          break;
        case "arrowright":
        case "d":
          setLane((l) => Math.min(2, l + 1));
          break;
        case "arrowup":
        case "w":
          setSpeed((s) => Math.min(s + 0.03, 0.55));
          break;
        case "arrowdown":
        case "s":
          setSpeed((s) => Math.max(s - 0.03, 0.1));
          break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameState.gameOver, gameState.started, setGameState]);

  // Gradually increase speed over time
  useFrame((_, delta) => {
    if (!gameState.started || gameState.gameOver) return;
    setSpeed((s) => Math.min(s + delta * 0.003, 0.65));

    spawnTimer.current += delta;
    const spawnInterval = 0.75 / (speed / ROAD_SPEED_BASE);
    if (spawnTimer.current > spawnInterval) {
      spawnTimer.current = 0;
      const l = Math.floor(Math.random() * 3);
      setObstacles((prev) => [
        ...prev,
        {
          id: obstacleId.current++,
          x: LANES[l],
          z: -65,
          lane: l,
          variant: Math.floor(Math.random() * 5),
        },
      ]);
    }

    setObstacles((prev) => {
      const next = prev
        .map((o) => ({ ...o, z: o.z + speed }))
        .filter((o) => o.z < 22);
      const playerX = LANES[lane];
      for (const o of next) {
        if (Math.abs(o.z - 7) < 1.9 && Math.abs(o.x - playerX) < 1.45) {
          setGameState((s) => ({ ...s, gameOver: true }));
          return prev;
        }
      }
      return next;
    });

    setGameState((s) => ({ ...s, score: s.score + 1 }));
  });

  return (
    <>
      <fog attach="fog" args={[cfg.fogColor, cfg.fogNear, cfg.fogFar]} />
      <color attach="background" args={[cfg.skyTop]} />
      <EnvLighting weather={weather} />
      <SkyBox weather={weather} />
      <Road weather={weather} />
      <RoadReflection weather={weather} />
      <CenterLines speed={speed} weather={weather} />
      <StreetLamps speed={speed} weather={weather} />
      <Buildings speed={speed} weather={weather} />
      <WeatherParticles weather={weather} />
      <PlayerCar lane={lane} speed={speed} />
      {obstacles.map((o) => (
        <ObstacleCar
          key={o.id}
          x={o.x}
          z={o.z}
          variant={o.variant}
          speed={speed}
        />
      ))}
      {/* Ground fill */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.51, 0]}>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color={cfg.roadColor} />
      </mesh>
    </>
  );
}

/* ─── Mobile Buttons ─── */
function MobileControls({
  onLeft,
  onRight,
}: {
  onLeft: () => void;
  onRight: () => void;
}) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 24,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "space-between",
        padding: "0 28px",
        zIndex: 30,
        pointerEvents: "auto",
      }}
    >
      {[
        { label: "◀", handler: onLeft },
        { label: "▶", handler: onRight },
      ].map(({ label, handler }) => (
        <button
          key={label}
          onPointerDown={handler}
          style={{
            width: 72,
            height: 72,
            borderRadius: 12,
            background: "rgba(255,255,255,0.07)",
            border: "1.5px solid rgba(255,255,255,0.18)",
            color: "#fff",
            fontSize: 24,
            backdropFilter: "blur(8px)",
            cursor: "pointer",
            userSelect: "none",
            WebkitUserSelect: "none",
            touchAction: "manipulation",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/* ─── HUD ─── */
function HUD({
  score,
  speed,
  weather,
  onWeatherChange,
}: {
  score: number;
  speed: number;
  weather: WeatherType;
  onWeatherChange: () => void;
}) {
  const cfg = WEATHER_CONFIGS[weather];
  const kmh = Math.round(80 + (speed / 0.65) * 200);
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        padding: "14px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        zIndex: 10,
        pointerEvents: "none",
        fontFamily: "'Rajdhani', 'Bebas Neue', Impact, sans-serif",
      }}
    >
      {/* Left: Weather cycle */}
      <div style={{ pointerEvents: "auto" }}>
        <button
          onClick={onWeatherChange}
          style={{
            background: "rgba(0,0,0,0.55)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#fff",
            fontSize: 13,
            padding: "6px 14px",
            borderRadius: 8,
            cursor: "pointer",
            backdropFilter: "blur(8px)",
            letterSpacing: "0.08em",
          }}
        >
          {cfg.label}
        </button>
      </div>
      {/* Right: Score + Speed */}
      <div style={{ textAlign: "right" }}>
        <div
          style={{
            background: "rgba(0,0,0,0.6)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 10,
            padding: "8px 16px",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              color: "#ffdd88",
              fontSize: 11,
              letterSpacing: "0.15em",
              opacity: 0.8,
            }}
          >
            SCORE
          </div>
          <div
            style={{
              color: "#fff",
              fontSize: 26,
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
            {Math.floor(score / 5)
              .toString()
              .padStart(5, "0")}
          </div>
          <div
            style={{
              color: "#88ccff",
              fontSize: 12,
              letterSpacing: "0.1em",
              marginTop: 4,
            }}
          >
            {kmh} <span style={{ opacity: 0.6, fontSize: 10 }}>KM/H</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Overlay Screens ─── */
function StartScreen() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(6px)",
        zIndex: 20,
        fontFamily: "'Bebas Neue', Impact, sans-serif",
      }}
    >
      <div
        style={{
          fontSize: 11,
          letterSpacing: "0.4em",
          color: "#888",
          marginBottom: 10,
        }}
      >
        TURBO DRIFT
      </div>
      <div
        style={{
          fontSize: 64,
          fontWeight: 900,
          color: "#fff",
          textShadow: "0 0 40px #cc2200, 0 2px 0 #880000",
          lineHeight: 1,
          marginBottom: 6,
        }}
      >
        ROAD
        <br />
        <span style={{ color: "#ff4422" }}>RUSH</span>
      </div>
      <div
        style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.4)",
          letterSpacing: "0.2em",
          marginTop: 18,
          marginBottom: 30,
          fontFamily: "'Courier New', monospace",
        }}
      >
        PRESS ARROW KEY TO START
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        {["←", "→", "↑", "↓"].map((k) => (
          <div
            key={k}
            style={{
              width: 42,
              height: 42,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 8,
              color: "#ccc",
              fontSize: 18,
            }}
          >
            {k}
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 18,
          fontSize: 11,
          color: "rgba(255,255,255,0.2)",
          letterSpacing: "0.15em",
        }}
      >
        CLICK WEATHER BUTTON TO CHANGE CONDITIONS
      </div>
    </div>
  );
}

function GameOverScreen({
  score,
  onRestart,
}: {
  score: number;
  onRestart: () => void;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.82)",
        backdropFilter: "blur(8px)",
        zIndex: 20,
        fontFamily: "'Bebas Neue', Impact, sans-serif",
      }}
    >
      <div
        style={{
          fontSize: 72,
          fontWeight: 900,
          color: "#ff2200",
          textShadow: "0 0 50px #ff0000",
          letterSpacing: "0.05em",
        }}
      >
        CRASH!
      </div>
      <div
        style={{
          fontSize: 18,
          color: "rgba(255,255,255,0.5)",
          letterSpacing: "0.2em",
          marginTop: -8,
        }}
      >
        GAME OVER
      </div>
      <div style={{ marginTop: 20, marginBottom: 32 }}>
        <div
          style={{
            fontSize: 13,
            color: "#888",
            letterSpacing: "0.2em",
            textAlign: "center",
          }}
        >
          FINAL SCORE
        </div>
        <div
          style={{
            fontSize: 52,
            color: "#ffdd88",
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          {Math.floor(score / 5)
            .toString()
            .padStart(5, "0")}
        </div>
      </div>
      <button
        onClick={onRestart}
        style={{
          background: "#cc2200",
          border: "none",
          color: "#fff",
          fontSize: 18,
          letterSpacing: "0.2em",
          padding: "14px 40px",
          borderRadius: 6,
          cursor: "pointer",
          fontFamily: "inherit",
          boxShadow: "0 0 30px rgba(204,34,0,0.5)",
          transition: "transform 0.1s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        PLAY AGAIN
      </button>
    </div>
  );
}

/* ─── Main Component ─── */
export default function CarRacing() {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    gameOver: false,
    started: false,
  });
  const [weather, setWeather] = useState<WeatherType>("clear");
  const [resetKey, setResetKey] = useState(0);
  const weatherIdx = useRef(0);

  const cycleWeather = useCallback(() => {
    weatherIdx.current = (weatherIdx.current + 1) % WEATHERS.length;
    setWeather(WEATHERS[weatherIdx.current] as WeatherType);
  }, []);

  const restart = useCallback(() => {
    setGameState({ score: 0, gameOver: false, started: true });
    setResetKey((k) => k + 1);
  }, []);

  const [speedVal, setSpeedVal] = useState(ROAD_SPEED_BASE);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "#000",
        overflow: "hidden",
      }}
    >
      {/* Google Font preload */}
      <link
        href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@600;700&display=swap"
        rel="stylesheet"
      />

      <Canvas
        camera={{ fov: 60 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        key={resetKey}
      >
        <GameScene
          gameState={gameState}
          setGameState={setGameState}
          weather={weather}
        />
      </Canvas>

      <HUD
        score={gameState.score}
        speed={ROAD_SPEED_BASE + gameState.score / 50000}
        weather={weather}
        onWeatherChange={cycleWeather}
      />

      {!gameState.started && <StartScreen />}
      {gameState.gameOver && (
        <GameOverScreen score={gameState.score} onRestart={restart} />
      )}

      {gameState.started && !gameState.gameOver && (
        <MobileControls onLeft={() => {}} onRight={() => {}} />
      )}
    </div>
  );
}
