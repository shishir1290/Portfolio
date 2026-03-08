"use client";

import { useRef, useState, useEffect, useCallback, RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* ══════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════ */
interface WeatherConfig {
    name: string;
    sky: string;
    fogNear: number;
    fogFar: number;
    ambientIntensity: number;
    sunIntensity: number;
    sunColor: string;
    rain: boolean;
    snow: boolean;
    lightning: boolean;
    groundColor: string;
}

interface Orb {
    id: number;
    x: number;
    z: number;
    collected: boolean;
}

interface PlayerPos {
    x: number;
    z: number;
    ry: number;
}

interface Activity {
    id: number;
    type: "campfire" | "well" | "chest" | "signpost";
    x: number;
    z: number;
    interacted: boolean;
}

/* ══════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════ */
const WEATHERS: WeatherConfig[] = [
    { name: "CLEAR", sky: "#0a1628", fogNear: 25, fogFar: 80, ambientIntensity: 0.5, sunIntensity: 1.2, sunColor: "#ffe4b5", rain: false, snow: false, lightning: false, groundColor: "#0d1f10" },
    { name: "OVERCAST", sky: "#1a1f2e", fogNear: 15, fogFar: 50, ambientIntensity: 0.7, sunIntensity: 0.4, sunColor: "#c8d8e8", rain: false, snow: false, lightning: false, groundColor: "#0f1a0f" },
    { name: "RAIN", sky: "#0d1520", fogNear: 10, fogFar: 35, ambientIntensity: 0.4, sunIntensity: 0.2, sunColor: "#8899aa", rain: true, snow: false, lightning: false, groundColor: "#0b1408" },
    { name: "STORM", sky: "#060c14", fogNear: 8, fogFar: 25, ambientIntensity: 0.25, sunIntensity: 0.1, sunColor: "#6677aa", rain: true, snow: false, lightning: true, groundColor: "#080e08" },
    { name: "SNOW", sky: "#1e2535", fogNear: 12, fogFar: 40, ambientIntensity: 0.8, sunIntensity: 0.6, sunColor: "#ddeeff", rain: false, snow: true, lightning: false, groundColor: "#c8d8e0" },
    { name: "DUSK", sky: "#1a0e22", fogNear: 18, fogFar: 55, ambientIntensity: 0.35, sunIntensity: 0.9, sunColor: "#ff6030", rain: false, snow: false, lightning: false, groundColor: "#1a0d08" },
];

const WEATHER_COLORS: Record<string, string> = {
    CLEAR: "#00f5d4", OVERCAST: "#aabbcc", RAIN: "#44aaff",
    STORM: "#ff4455", SNOW: "#c8e8ff", DUSK: "#ffaa33",
};
const WEATHER_ICONS: Record<string, string> = {
    CLEAR: "☀", OVERCAST: "☁", RAIN: "🌧", STORM: "⛈", SNOW: "❄", DUSK: "🌅",
};
const WEATHER_DESC: Record<string, string> = {
    CLEAR: "Clear night sky", OVERCAST: "Heavy cloud cover",
    RAIN: "Steady rainfall", STORM: "Violent thunderstorm",
    SNOW: "Silent snowfall", DUSK: "Golden hour dusk",
};
const ORB_COLORS: Record<string, [string, string]> = {
    CLEAR: ["#00f5d4", "#00f5d4"], OVERCAST: ["#8888ff", "#6666dd"],
    RAIN: ["#44aaff", "#2288dd"], STORM: ["#ff4455", "#cc2233"],
    SNOW: ["#aaddff", "#88bbee"], DUSK: ["#ffaa33", "#ff6600"],
};

const DAY_CYCLE = 120; // seconds per full day

/* ══════════════════════════════════════════════════════
   DAY/NIGHT HELPERS
══════════════════════════════════════════════════════ */
function interpolateColor(a: string, b: string, t: number): string {
    const parse = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    const ca = parse(a), cb = parse(b);
    return `rgb(${Math.round(ca[0] + (cb[0] - ca[0]) * t)},${Math.round(ca[1] + (cb[1] - ca[1]) * t)},${Math.round(ca[2] + (cb[2] - ca[2]) * t)})`;
}

function getSkyColor(t: number): string {
    if (t < 0.2) return interpolateColor("#020510", "#0a1628", t / 0.2);
    if (t < 0.28) return interpolateColor("#0a1628", "#ff8844", (t - 0.2) / 0.08);
    if (t < 0.4) return interpolateColor("#ff8844", "#87ceeb", (t - 0.28) / 0.12);
    if (t < 0.6) return interpolateColor("#87ceeb", "#4a90d9", (t - 0.4) / 0.2);
    if (t < 0.7) return interpolateColor("#4a90d9", "#ff6030", (t - 0.6) / 0.1);
    if (t < 0.78) return interpolateColor("#ff6030", "#1a0e22", (t - 0.7) / 0.08);
    return interpolateColor("#1a0e22", "#020510", (t - 0.78) / 0.22);
}

function getSunPosition(t: number): [number, number, number] {
    const angle = (t - 0.25) * Math.PI * 2;
    return [Math.cos(angle) * 80, Math.sin(angle) * 80, -60];
}

function getSunColor(t: number): string {
    if (t < 0.2 || t > 0.82) return "#2244aa";
    if (t < 0.28 || t > 0.75) return "#ff8833";
    if (t < 0.35 || t > 0.68) return "#ffcc66";
    return "#fffaee";
}

function getSunIntensity(t: number): number {
    if (t < 0.22 || t > 0.80) return 0.05;
    if (t < 0.28 || t > 0.74) return 0.6;
    if (t < 0.35 || t > 0.67) return 1.0;
    return 1.4;
}

function getAmbientIntensity(t: number): number {
    if (t < 0.2 || t > 0.82) return 0.08;
    if (t < 0.28 || t > 0.75) return 0.35;
    return 0.55;
}

/* ══════════════════════════════════════════════════════
   DAY/NIGHT HOOK
══════════════════════════════════════════════════════ */
function useDayNight() {
    const timeRef = useRef(0.28);
    const [timeOfDay, setTimeOfDay] = useState(0.28);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        let last = performance.now();
        let raf: number;
        const tick = (now: number) => {
            if (!paused) {
                timeRef.current = (timeRef.current + (now - last) / 1000 / DAY_CYCLE) % 1;
                setTimeOfDay(timeRef.current);
            }
            last = now;
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [paused]);

    return { timeOfDay, timeRef, paused, setPaused };
}

/* ══════════════════════════════════════════════════════
   ANIMATED CHARACTER
══════════════════════════════════════════════════════ */
interface CharacterProps {
    playerPosRef: RefObject<PlayerPos>;
    movingRef: RefObject<boolean>;
    sprintingRef: RefObject<boolean>;
}

function Character({ playerPosRef, movingRef, sprintingRef }: CharacterProps) {
    const groupRef = useRef<THREE.Group>(null);
    const bodyRef = useRef<THREE.Group>(null);
    const headRef = useRef<THREE.Group>(null);
    const lArmRef = useRef<THREE.Group>(null);
    const rArmRef = useRef<THREE.Group>(null);
    const lLegRef = useRef<THREE.Group>(null);
    const rLegRef = useRef<THREE.Group>(null);
    const bobRef = useRef(0);

    useFrame((state, delta) => {
        if (!groupRef.current || !playerPosRef.current) return;
        const pp = playerPosRef.current;
        const moving = movingRef.current ?? false;
        const sprint = sprintingRef.current ?? false;
        const spd = sprint ? 16 : 9;

        // Follow player position (slightly behind camera)
        const behindX = pp.x - Math.sin(pp.ry) * 0.5;
        const behindZ = pp.z - Math.cos(pp.ry) * 0.5;
        groupRef.current.position.x += (behindX - groupRef.current.position.x) * 0.2;
        groupRef.current.position.z += (behindZ - groupRef.current.position.z) * 0.2;

        // Smoothly rotate to face movement direction
        let targetRY = pp.ry;
        groupRef.current.rotation.y += (targetRY - groupRef.current.rotation.y) * 0.15;

        // Bob cycle
        if (moving) bobRef.current += delta * spd;

        const swing = moving ? Math.sin(bobRef.current) : 0;

        // Legs
        const legTarget = swing * 0.65;
        if (lLegRef.current) lLegRef.current.rotation.x += (legTarget - lLegRef.current.rotation.x) * 0.25;
        if (rLegRef.current) rLegRef.current.rotation.x += (-legTarget - rLegRef.current.rotation.x) * 0.25;

        // Arms (counter-swing)
        const armSwing = moving ? Math.sin(bobRef.current) * (sprint ? 0.9 : 0.55) : 0;
        if (lArmRef.current) {
            lArmRef.current.rotation.x += (-armSwing - 0.1 - lArmRef.current.rotation.x) * 0.25;
            lArmRef.current.rotation.z += (-0.1 - lArmRef.current.rotation.z) * 0.1;
        }
        if (rArmRef.current) {
            rArmRef.current.rotation.x += (armSwing - 0.1 - rArmRef.current.rotation.x) * 0.25;
            rArmRef.current.rotation.z += (0.1 - rArmRef.current.rotation.z) * 0.1;
        }

        // Head idle sway + movement nod
        if (headRef.current) {
            headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.38) * 0.07;
            const nodTarget = moving ? Math.sin(bobRef.current * 2) * 0.05 - 0.04 : 0;
            headRef.current.rotation.x += (nodTarget - headRef.current.rotation.x) * 0.12;
        }

        // Body lean when sprinting
        if (bodyRef.current) {
            const leanTarget = sprint ? -0.18 : moving ? -0.06 : 0;
            bodyRef.current.rotation.x += (leanTarget - bodyRef.current.rotation.x) * 0.12;
        }

        // Vertical bob of whole character
        const yTarget = moving ? Math.abs(Math.sin(bobRef.current)) * 0.04 : 0;
        groupRef.current.position.y += (yTarget - groupRef.current.position.y) * 0.15;
    });

    const skin = "#f5c89a";
    const shirt = "#2244aa";
    const pants = "#1a3a1a";
    const shoe = "#1a1008";
    const hair = "#2a1505";

    return (
        <group ref={groupRef} castShadow>
            {/* Torso */}
            <group ref={bodyRef} position={[0, 0.98, 0]}>
                <mesh castShadow receiveShadow>
                    <boxGeometry args={[0.46, 0.54, 0.22]} />
                    <meshStandardMaterial color={shirt} roughness={0.85} />
                </mesh>

                {/* Head */}
                <group ref={headRef} position={[0, 0.47, 0]}>
                    <mesh castShadow>
                        <boxGeometry args={[0.32, 0.33, 0.3]} />
                        <meshStandardMaterial color={skin} roughness={0.8} />
                    </mesh>
                    {/* Hair */}
                    <mesh position={[0, 0.15, -0.01]} castShadow>
                        <boxGeometry args={[0.34, 0.1, 0.31]} />
                        <meshStandardMaterial color={hair} roughness={0.95} />
                    </mesh>
                    {/* Eyes */}
                    <mesh position={[-0.09, 0.04, 0.151]}>
                        <boxGeometry args={[0.07, 0.05, 0.02]} />
                        <meshStandardMaterial color="#111" />
                    </mesh>
                    <mesh position={[0.09, 0.04, 0.151]}>
                        <boxGeometry args={[0.07, 0.05, 0.02]} />
                        <meshStandardMaterial color="#111" />
                    </mesh>
                    {/* Nose */}
                    <mesh position={[0, -0.04, 0.16]}>
                        <boxGeometry args={[0.04, 0.04, 0.04]} />
                        <meshStandardMaterial color="#e8a870" />
                    </mesh>
                    {/* Mouth */}
                    <mesh position={[0, -0.1, 0.152]}>
                        <boxGeometry args={[0.1, 0.025, 0.02]} />
                        <meshStandardMaterial color="#b06040" />
                    </mesh>
                </group>

                {/* Left Arm */}
                <group ref={lArmRef} position={[-0.31, 0.24, 0]}>
                    <mesh position={[0, -0.2, 0]} castShadow>
                        <boxGeometry args={[0.14, 0.42, 0.14]} />
                        <meshStandardMaterial color={shirt} roughness={0.85} />
                    </mesh>
                    {/* Forearm */}
                    <mesh position={[0, -0.44, 0]} castShadow>
                        <boxGeometry args={[0.12, 0.2, 0.12]} />
                        <meshStandardMaterial color={skin} roughness={0.8} />
                    </mesh>
                    {/* Hand */}
                    <mesh position={[0, -0.58, 0.01]} castShadow>
                        <boxGeometry args={[0.13, 0.13, 0.1]} />
                        <meshStandardMaterial color={skin} roughness={0.8} />
                    </mesh>
                </group>

                {/* Right Arm */}
                <group ref={rArmRef} position={[0.31, 0.24, 0]}>
                    <mesh position={[0, -0.2, 0]} castShadow>
                        <boxGeometry args={[0.14, 0.42, 0.14]} />
                        <meshStandardMaterial color={shirt} roughness={0.85} />
                    </mesh>
                    <mesh position={[0, -0.44, 0]} castShadow>
                        <boxGeometry args={[0.12, 0.2, 0.12]} />
                        <meshStandardMaterial color={skin} roughness={0.8} />
                    </mesh>
                    <mesh position={[0, -0.58, 0.01]} castShadow>
                        <boxGeometry args={[0.13, 0.13, 0.1]} />
                        <meshStandardMaterial color={skin} roughness={0.8} />
                    </mesh>
                </group>
            </group>

            {/* Left Leg */}
            <group ref={lLegRef} position={[-0.12, 0.7, 0]}>
                <mesh position={[0, -0.22, 0]} castShadow>
                    <boxGeometry args={[0.18, 0.46, 0.18]} />
                    <meshStandardMaterial color={pants} roughness={0.9} />
                </mesh>
                {/* Shin */}
                <mesh position={[0, -0.5, 0]} castShadow>
                    <boxGeometry args={[0.16, 0.22, 0.17]} />
                    <meshStandardMaterial color={pants} roughness={0.9} />
                </mesh>
                {/* Shoe */}
                <mesh position={[0, -0.66, 0.04]} castShadow>
                    <boxGeometry args={[0.18, 0.1, 0.24]} />
                    <meshStandardMaterial color={shoe} roughness={0.9} />
                </mesh>
            </group>

            {/* Right Leg */}
            <group ref={rLegRef} position={[0.12, 0.7, 0]}>
                <mesh position={[0, -0.22, 0]} castShadow>
                    <boxGeometry args={[0.18, 0.46, 0.18]} />
                    <meshStandardMaterial color={pants} roughness={0.9} />
                </mesh>
                <mesh position={[0, -0.5, 0]} castShadow>
                    <boxGeometry args={[0.16, 0.22, 0.17]} />
                    <meshStandardMaterial color={pants} roughness={0.9} />
                </mesh>
                <mesh position={[0, -0.66, 0.04]} castShadow>
                    <boxGeometry args={[0.18, 0.1, 0.24]} />
                    <meshStandardMaterial color={shoe} roughness={0.9} />
                </mesh>
            </group>
        </group>
    );
}

/* ══════════════════════════════════════════════════════
   DYNAMIC SUN + SHADOW LIGHT
══════════════════════════════════════════════════════ */
function DynamicSun({ timeRef, weatherName }: { timeRef: React.MutableRefObject<number>; weatherName: string }) {
    const dirRef = useRef<THREE.DirectionalLight>(null);
    const sunRef = useRef<THREE.Mesh>(null);
    const moonRef = useRef<THREE.Mesh>(null);

    useFrame(() => {
        const t = timeRef.current;
        const [sx, sy, sz] = getSunPosition(t);
        const baseInt = getSunIntensity(t);
        const intensity =
            weatherName === "STORM" ? 0.05 :
                weatherName === "OVERCAST" ? baseInt * 0.3 :
                    weatherName === "RAIN" ? baseInt * 0.25 : baseInt;
        const col = new THREE.Color(getSunColor(t));

        if (dirRef.current) {
            dirRef.current.position.set(sx, sy, sz);
            dirRef.current.intensity = intensity;
            dirRef.current.color = col;
        }
        if (sunRef.current) {
            sunRef.current.position.set(sx * 0.88, sy * 0.88, sz * 0.88);
            const mat = sunRef.current.material as THREE.MeshStandardMaterial;
            mat.emissive = col; mat.color = col;
            sunRef.current.visible = sy > -8;
        }
        if (moonRef.current) {
            moonRef.current.position.set(-sx * 0.82, -sy * 0.82, sz * 0.88);
            moonRef.current.visible = sy < 10;
        }
    });

    return (
        <>
            <directionalLight
                ref={dirRef}
                castShadow
                shadow-mapSize={[4096, 4096]}
                shadow-camera-far={200}
                shadow-camera-near={0.5}
                shadow-camera-left={-70}
                shadow-camera-right={70}
                shadow-camera-top={70}
                shadow-camera-bottom={-70}
                shadow-bias={-0.0003}
            />
            <mesh ref={sunRef}>
                <sphereGeometry args={[3.5, 16, 16]} />
                <meshStandardMaterial emissiveIntensity={1.8} roughness={0} />
            </mesh>
            <mesh ref={moonRef}>
                <sphereGeometry args={[2.5, 16, 16]} />
                <meshStandardMaterial color="#e8e0d0" emissive="#b0a870" emissiveIntensity={0.3} roughness={0.95} />
            </mesh>
        </>
    );
}

/* ══════════════════════════════════════════════════════
   DYNAMIC SKY + AMBIENT
══════════════════════════════════════════════════════ */
function DynamicSkyAmbient({ timeRef, weatherName }: { timeRef: React.MutableRefObject<number>; weatherName: string }) {
    const { scene } = useThree();
    const ambRef = useRef<THREE.AmbientLight>(null);
    const wConfig = WEATHERS.find(w => w.name === weatherName);

    useFrame(() => {
        const t = timeRef.current;
        const skyHex = getSkyColor(t);
        const fog = scene.fog as THREE.Fog | null;
        if (fog) {
            fog.color.set(skyHex);
            fog.near = wConfig?.fogNear ?? 20;
            fog.far = wConfig?.fogFar ?? 70;
        } else {
            scene.fog = new THREE.Fog(skyHex, wConfig?.fogNear ?? 20, wConfig?.fogFar ?? 70);
        }
        scene.background = new THREE.Color(skyHex);
        if (ambRef.current) {
            ambRef.current.intensity = weatherName === "STORM" ? 0.08 : getAmbientIntensity(t);
            ambRef.current.color = new THREE.Color(getSunColor(t));
        }
    });

    return (
        <>
            <ambientLight ref={ambRef} />
            <hemisphereLight args={["#87ceeb" as THREE.ColorRepresentation, "#0a1a08" as THREE.ColorRepresentation, 0.15]} />
        </>
    );
}

/* ══════════════════════════════════════════════════════
   STARS
══════════════════════════════════════════════════════ */
function Stars({ timeRef }: { timeRef: React.MutableRefObject<number> }) {
    const ref = useRef<THREE.Points>(null);
    const [positions] = useState<Float32Array>(() => {
        const arr = new Float32Array(800 * 3);
        for (let i = 0; i < 800; i++) {
            const theta = Math.random() * Math.PI * 2, phi = Math.random() * Math.PI * 0.5;
            arr[i * 3] = Math.sin(phi) * Math.cos(theta) * 130;
            arr[i * 3 + 1] = Math.cos(phi) * 90 + 10;
            arr[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * 130;
        }
        return arr;
    });

    useFrame(() => {
        if (!ref.current) return;
        const t = timeRef.current;
        const alpha = t < 0.22 ? 0.9 : t < 0.3 ? (0.3 - t) / 0.08 * 0.9 : t > 0.75 ? (t - 0.75) / 0.07 * 0.9 : 0;
        (ref.current.material as THREE.PointsMaterial).opacity = Math.max(0, alpha);
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial color="#ffffff" size={0.18} transparent opacity={0} sizeAttenuation />
        </points>
    );
}

/* ══════════════════════════════════════════════════════
   GROUND
══════════════════════════════════════════════════════ */
function Ground({ timeRef, weatherName, color }: { timeRef: React.MutableRefObject<number>; weatherName: string; color: string }) {
    const ref = useRef<THREE.Mesh>(null);
    const baseColor = WEATHERS.find(w => w.name === weatherName)?.groundColor ?? "#0d1f10";

    useFrame(() => {
        if (!ref.current) return;
        const t = timeRef.current;
        const bright = (t < 0.22 || t > 0.8) ? 0.3 : (t < 0.3 || t > 0.72) ? 0.65 : 1.0;
        (ref.current.material as THREE.MeshStandardMaterial).color.set(baseColor).multiplyScalar(bright);
    });

    return (
        <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[220, 220, 100, 100]} />
            <meshStandardMaterial color={baseColor} roughness={0.95} metalness={0} />
        </mesh>
    );
}

/* ══════════════════════════════════════════════════════
   TREES
══════════════════════════════════════════════════════ */
interface TreeData {
    x: number; z: number; h: number; r: number;
    layers: number; type: "pine" | "round"; leanX: number; leanZ: number;
}

function Trees({ weatherName }: { weatherName: string }) {
    const isSnow = weatherName === "SNOW";
    const [trees] = useState<TreeData[]>(() =>
        Array.from({ length: 80 }).map(() => ({
            x: (Math.random() - 0.5) * 150, z: (Math.random() - 0.5) * 150,
            h: 2.5 + Math.random() * 5, r: 0.8 + Math.random() * 0.8,
            layers: 2 + Math.floor(Math.random() * 3),
            type: Math.random() > 0.4 ? "pine" : "round",
            leanX: (Math.random() - 0.5) * 0.05,
            leanZ: (Math.random() - 0.5) * 0.05,
        }))
    );
    return (
        <>
            {trees.map((t, i) => (
                <group key={i} position={[t.x, 0, t.z]} rotation={[t.leanX, i * 0.7, t.leanZ]}>
                    <mesh position={[0, t.h * 0.25, 0]} castShadow receiveShadow>
                        <cylinderGeometry args={[0.06 + t.r * 0.05, 0.14 + t.r * 0.08, t.h * 0.5, 7]} />
                        <meshStandardMaterial color={isSnow ? "#4a3520" : "#2c1a0e"} roughness={1} />
                    </mesh>
                    {t.type === "pine" && Array.from({ length: t.layers }).map((_, l) => (
                        <mesh key={l} position={[0, t.h * (0.45 + (l / t.layers) * 0.55), 0]} castShadow receiveShadow>
                            <coneGeometry args={[t.r * (1 - (l / t.layers) * 0.5) * 0.9, t.h * 0.35, 8]} />
                            <meshStandardMaterial color={isSnow ? "#c8dde8" : l % 2 === 0 ? "#0b3d1e" : "#0d4f28"} roughness={0.9} />
                        </mesh>
                    ))}
                    {t.type === "round" && (
                        <mesh position={[0, t.h * 0.75, 0]} castShadow receiveShadow>
                            <sphereGeometry args={[t.r * 0.8, 7, 5]} />
                            <meshStandardMaterial color={isSnow ? "#b8ccd8" : "#0c4020"} roughness={0.9} />
                        </mesh>
                    )}
                </group>
            ))}
        </>
    );
}

/* ══════════════════════════════════════════════════════
   ROCKS
══════════════════════════════════════════════════════ */
function Rocks() {
    const [rocks] = useState(() =>
        Array.from({ length: 40 }).map(() => ({
            x: (Math.random() - 0.5) * 140, z: (Math.random() - 0.5) * 140,
            s: 0.2 + Math.random() * 1.1, ry: Math.random() * Math.PI, rx: Math.random() * 0.4,
        }))
    );
    const cols = ["#1a1e2a", "#151922", "#202533", "#181c24", "#222030"];
    return (
        <>
            {rocks.map((r, i) => (
                <mesh key={i} position={[r.x, r.s * 0.38, r.z]} rotation={[r.rx, r.ry, 0]} castShadow receiveShadow>
                    <dodecahedronGeometry args={[r.s, 0]} />
                    <meshStandardMaterial color={cols[i % cols.length]} roughness={0.95} metalness={0.05} />
                </mesh>
            ))}
        </>
    );
}

/* ══════════════════════════════════════════════════════
   CAMPFIRE
══════════════════════════════════════════════════════ */
function Campfire({ x, z, interacted }: { x: number; z: number; interacted: boolean }) {
    const flameRef = useRef<THREE.Mesh>(null);
    const lightRef = useRef<THREE.PointLight>(null);
    const embersRef = useRef<THREE.Points>(null);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (flameRef.current && !interacted) {
            flameRef.current.scale.y = 0.8 + Math.sin(t * 8) * 0.3;
            flameRef.current.scale.x = 0.8 + Math.sin(t * 6 + 1) * 0.2;
            flameRef.current.position.y = 0.5 + Math.sin(t * 10) * 0.05;
        }
        if (lightRef.current) {
            lightRef.current.intensity = interacted ? 0 : (2.5 + Math.sin(t * 7) * 0.8);
        }
        if (embersRef.current && !interacted) {
            const pos = embersRef.current.geometry.attributes.position.array as Float32Array;
            for (let i = 0; i < 15; i++) {
                pos[i * 3 + 1] += 0.01 + Math.sin(t + i) * 0.005;
                pos[i * 3] += Math.sin(t * 0.5 + i) * 0.005;
                if (pos[i * 3 + 1] > 1.5) { pos[i * 3 + 1] = 0.3; pos[i * 3] = (Math.random() - 0.5) * 0.3; pos[i * 3 + 2] = (Math.random() - 0.5) * 0.3; }
            }
            embersRef.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    const [emberPositions] = useState(() => {
        const arr = new Float32Array(15 * 3);
        for (let i = 0; i < 15; i++) { arr[i * 3] = (Math.random() - 0.5) * 0.3; arr[i * 3 + 1] = Math.random() * 0.5 + 0.2; arr[i * 3 + 2] = (Math.random() - 0.5) * 0.3; }
        return arr;
    });

    return (
        <group position={[x, 0, z]}>
            {[0, 1, 2].map(i => (
                <mesh key={i} position={[Math.cos(i * 2.1) * 0.22, 0.08, Math.sin(i * 2.1) * 0.22]} rotation={[0.2, i * 2.1, 0.3]} castShadow>
                    <cylinderGeometry args={[0.05, 0.07, 0.55, 6]} />
                    <meshStandardMaterial color="#2a1205" roughness={1} />
                </mesh>
            ))}
            {/* Stone ring */}
            {Array.from({ length: 8 }).map((_, i) => (
                <mesh key={i} position={[Math.cos(i / 8 * Math.PI * 2) * 0.38, 0.06, Math.sin(i / 8 * Math.PI * 2) * 0.38]} castShadow>
                    <dodecahedronGeometry args={[0.08, 0]} />
                    <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
                </mesh>
            ))}
            {!interacted && (
                <>
                    <mesh ref={flameRef} position={[0, 0.5, 0]}>
                        <coneGeometry args={[0.18, 0.55, 8]} />
                        <meshStandardMaterial color="#ff6600" emissive="#ff4400" emissiveIntensity={2} transparent opacity={0.85} />
                    </mesh>
                    {/* Inner flame */}
                    <mesh position={[0, 0.55, 0]}>
                        <coneGeometry args={[0.1, 0.4, 8]} />
                        <meshStandardMaterial color="#ffdd00" emissive="#ffaa00" emissiveIntensity={2.5} transparent opacity={0.7} />
                    </mesh>
                    {/* Embers */}
                    <points ref={embersRef}>
                        <bufferGeometry>
                            <bufferAttribute attach="attributes-position" args={[emberPositions, 3]} />
                        </bufferGeometry>
                        <pointsMaterial color="#ffaa00" size={0.04} transparent opacity={0.9} sizeAttenuation />
                    </points>
                </>
            )}
            <pointLight ref={lightRef} position={[0, 0.8, 0]} color="#ff8833" distance={14} castShadow />
            {/* Interact ring */}
            <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[1.2, 1.38, 32]} />
                <meshStandardMaterial color="#ff8833" transparent opacity={interacted ? 0 : 0.15} />
            </mesh>
        </group>
    );
}

/* ══════════════════════════════════════════════════════
   WELL
══════════════════════════════════════════════════════ */
function Well({ x, z }: { x: number; z: number }) {
    return (
        <group position={[x, 0, z]}>
            <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.62, 0.67, 0.8, 12]} />
                <meshStandardMaterial color="#4a4040" roughness={0.95} />
            </mesh>
            <mesh position={[0, 0.3, 0]}>
                <cylinderGeometry args={[0.5, 0.5, 0.62, 12, 1, true]} />
                <meshStandardMaterial color="#1a2820" roughness={1} side={THREE.BackSide} />
            </mesh>
            <mesh position={[0, 1.1, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.04, 0.04, 1.5, 6]} />
                <meshStandardMaterial color="#3a2010" roughness={1} />
            </mesh>
            {[-0.7, 0.7].map((px, i) => (
                <mesh key={i} position={[px, 0.65, 0]} castShadow>
                    <cylinderGeometry args={[0.055, 0.065, 1.3, 6]} />
                    <meshStandardMaterial color="#3a2010" roughness={1} />
                </mesh>
            ))}
            {/* Roof */}
            <mesh position={[0, 1.3, 0]} castShadow>
                <coneGeometry args={[0.85, 0.5, 4]} />
                <meshStandardMaterial color="#4a2810" roughness={0.9} />
            </mesh>
            {/* Interact ring */}
            <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[1.1, 1.25, 32]} />
                <meshStandardMaterial color="#44aaff" transparent opacity={0.12} />
            </mesh>
        </group>
    );
}

/* ══════════════════════════════════════════════════════
   CHEST
══════════════════════════════════════════════════════ */
function Chest({ x, z, interacted }: { x: number; z: number; interacted: boolean }) {
    const lidRef = useRef<THREE.Mesh>(null);
    useFrame(() => {
        if (lidRef.current) {
            const target = interacted ? -Math.PI * 0.72 : 0;
            lidRef.current.rotation.x += (target - lidRef.current.rotation.x) * 0.08;
        }
    });
    return (
        <group position={[x, 0.25, z]}>
            <mesh castShadow receiveShadow>
                <boxGeometry args={[0.72, 0.5, 0.52]} />
                <meshStandardMaterial color="#5a3a10" roughness={0.9} metalness={0.12} />
            </mesh>
            {/* Metal bands */}
            {[-0.18, 0.18].map((bx, i) => (
                <mesh key={i} position={[bx, 0, 0]}>
                    <boxGeometry args={[0.05, 0.52, 0.54]} />
                    <meshStandardMaterial color="#3a3010" metalness={0.6} roughness={0.5} />
                </mesh>
            ))}
            <mesh ref={lidRef} position={[0, 0.26, -0.24]}>
                <boxGeometry args={[0.74, 0.16, 0.54]} />
                <meshStandardMaterial color="#6a4818" roughness={0.85} metalness={0.1} />
            </mesh>
            {interacted && (
                <>
                    <pointLight position={[0, 0.6, 0]} color="#ffd700" intensity={4} distance={8} />
                    {/* Gold glow */}
                    <mesh position={[0, 0.3, 0]}>
                        <sphereGeometry args={[0.15, 8, 8]} />
                        <meshStandardMaterial color="#ffd700" emissive="#ffaa00" emissiveIntensity={3} transparent opacity={0.6} />
                    </mesh>
                </>
            )}
            <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[1.0, 1.15, 32]} />
                <meshStandardMaterial color="#ffd700" transparent opacity={interacted ? 0 : 0.14} />
            </mesh>
        </group>
    );
}

/* ══════════════════════════════════════════════════════
   SIGNPOST
══════════════════════════════════════════════════════ */
function Signpost({ x, z }: { x: number; z: number }) {
    return (
        <group position={[x, 0, z]}>
            <mesh position={[0, 0.85, 0]} castShadow>
                <cylinderGeometry args={[0.045, 0.065, 1.7, 6]} />
                <meshStandardMaterial color="#3a2010" roughness={1} />
            </mesh>
            <mesh position={[0, 1.52, 0.04]} rotation={[0, 0.25, 0]} castShadow>
                <boxGeometry args={[0.65, 0.24, 0.065]} />
                <meshStandardMaterial color="#5a3a10" roughness={0.9} />
            </mesh>
            <mesh position={[0.34, 1.52, 0.04]} rotation={[0, 0.25, 0]}>
                <boxGeometry args={[0.12, 0.24, 0.065]} />
                <meshStandardMaterial color="#5a3a10" roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[1.0, 1.12, 32]} />
                <meshStandardMaterial color="#aabbcc" transparent opacity={0.1} />
            </mesh>
        </group>
    );
}

/* ══════════════════════════════════════════════════════
   ORB MESH
══════════════════════════════════════════════════════ */
function OrbMesh({ x, z, collected, weatherName }: { x: number; z: number; collected: boolean; weatherName: string }) {
    const ref = useRef<THREE.Mesh>(null);
    const ringRef = useRef<THREE.Mesh>(null);
    const [emissive, color] = ORB_COLORS[weatherName] ?? ORB_COLORS.CLEAR;

    useFrame((state) => {
        if (!ref.current || collected) return;
        ref.current.position.y = 1 + Math.sin(state.clock.elapsedTime * 1.8 + x) * 0.25;
        ref.current.rotation.y += 0.015; ref.current.rotation.x += 0.008;
        if (ringRef.current) {
            ringRef.current.position.y = ref.current.position.y;
            ringRef.current.rotation.y = state.clock.elapsedTime * 0.8;
            ringRef.current.rotation.x = Math.PI / 3 + Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
        }
    });

    if (collected) return null;
    return (
        <group>
            <mesh ref={ref} position={[x, 1, z]} castShadow>
                <icosahedronGeometry args={[0.22, 1]} />
                <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={2} roughness={0.1} metalness={0.5} transparent opacity={0.95} />
            </mesh>
            <mesh ref={ringRef} position={[x, 1, z]}>
                <torusGeometry args={[0.38, 0.025, 8, 32]} />
                <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={1.5} transparent opacity={0.6} />
            </mesh>
            <pointLight position={[x, 1, z]} intensity={0.8} color={emissive} distance={4} />
        </group>
    );
}

/* ══════════════════════════════════════════════════════
   RAIN
══════════════════════════════════════════════════════ */
function Rain({ active, intensity = 1 }: { active: boolean; intensity?: number }) {
    const ref = useRef<THREE.Points>(null);
    const count = Math.floor(3000 * intensity);
    const [positions] = useState<Float32Array>(() => {
        const arr = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) { arr[i * 3] = (Math.random() - 0.5) * 80; arr[i * 3 + 1] = Math.random() * 30; arr[i * 3 + 2] = (Math.random() - 0.5) * 80; }
        return arr;
    });
    useFrame((_, dt) => {
        if (!ref.current || !active) return;
        const pos = ref.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < count; i++) {
            pos[i * 3 + 1] -= (18 + intensity * 10) * dt; pos[i * 3] -= intensity * 2 * dt;
            if (pos[i * 3 + 1] < 0) { pos[i * 3 + 1] = 30; pos[i * 3] = (Math.random() - 0.5) * 80; pos[i * 3 + 2] = (Math.random() - 0.5) * 80; }
        }
        ref.current.geometry.attributes.position.needsUpdate = true;
    });
    if (!active) return null;
    return (
        <points ref={ref}>
            <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
            <pointsMaterial color="#8ab4d0" size={0.04} transparent opacity={0.55} sizeAttenuation />
        </points>
    );
}

/* ══════════════════════════════════════════════════════
   SNOW
══════════════════════════════════════════════════════ */
function Snow({ active }: { active: boolean }) {
    const ref = useRef<THREE.Points>(null);
    const count = 2000;
    const offsets = useRef<number[]>(Array.from({ length: count }, () => Math.random() * Math.PI * 2));
    const [positions] = useState<Float32Array>(() => {
        const arr = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) { arr[i * 3] = (Math.random() - 0.5) * 80; arr[i * 3 + 1] = Math.random() * 25; arr[i * 3 + 2] = (Math.random() - 0.5) * 80; }
        return arr;
    });
    useFrame((state, dt) => {
        if (!ref.current || !active) return;
        const pos = ref.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < count; i++) {
            pos[i * 3 + 1] -= 1.2 * dt;
            pos[i * 3] += Math.sin(state.clock.elapsedTime * 0.5 + offsets.current[i]) * 0.005;
            if (pos[i * 3 + 1] < 0) { pos[i * 3 + 1] = 25; pos[i * 3] = (Math.random() - 0.5) * 80; pos[i * 3 + 2] = (Math.random() - 0.5) * 80; }
        }
        ref.current.geometry.attributes.position.needsUpdate = true;
    });
    if (!active) return null;
    return (
        <points ref={ref}>
            <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
            <pointsMaterial color="#e8f4ff" size={0.12} transparent opacity={0.75} sizeAttenuation />
        </points>
    );
}

/* ══════════════════════════════════════════════════════
   LIGHTNING
══════════════════════════════════════════════════════ */
function Lightning({ active }: { active: boolean }) {
    const [flash, setFlash] = useState(0);
    useEffect(() => {
        if (!active) return;
        const id = setInterval(() => {
            if (Math.random() < 0.08) {
                setFlash(1); setTimeout(() => setFlash(0.4), 80);
                setTimeout(() => setFlash(0.8), 150); setTimeout(() => setFlash(0), 220);
            }
        }, 500);
        return () => clearInterval(id);
    }, [active]);
    if (!active) return null;
    return <pointLight position={[20, 40, -20]} intensity={flash * 80} color="#aac8ff" distance={200} />;
}

/* ══════════════════════════════════════════════════════
   FPS CONTROLLER
══════════════════════════════════════════════════════ */
interface FPSProps {
    orbs: Orb[];
    setOrbs: React.Dispatch<React.SetStateAction<Orb[]>>;
    setCollected: React.Dispatch<React.SetStateAction<number>>;
    activities: Activity[];
    setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
    playerPosRef: React.MutableRefObject<PlayerPos>;
    movingRef: React.MutableRefObject<boolean>;
    sprintingRef: React.MutableRefObject<boolean>;
    setInteractHint: (v: string) => void;
}

function FPSController({ orbs, setOrbs, setCollected, activities, setActivities, playerPosRef, movingRef, sprintingRef, setInteractHint }: FPSProps) {
    const { camera, gl } = useThree();
    const keys = useRef<Set<string>>(new Set());
    const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));
    const isLocked = useRef(false);
    const bobTime = useRef(0);
    const eWasDown = useRef(false);

    useEffect(() => {
        camera.position.set(0, 1.72, 0);
        const down = (e: KeyboardEvent) => keys.current.add(e.key.toLowerCase());
        const up = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
        window.addEventListener("keydown", down); window.addEventListener("keyup", up);
        const onClick = () => gl.domElement.requestPointerLock();
        const onLock = () => { isLocked.current = document.pointerLockElement === gl.domElement; };
        const onMove = (e: MouseEvent) => {
            if (!isLocked.current) return;
            euler.current.setFromQuaternion(camera.quaternion);
            euler.current.y -= e.movementX * 0.0018; euler.current.x -= e.movementY * 0.0018;
            euler.current.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, euler.current.x));
            camera.quaternion.setFromEuler(euler.current);
        };
        gl.domElement.addEventListener("click", onClick);
        document.addEventListener("pointerlockchange", onLock);
        document.addEventListener("mousemove", onMove);
        return () => {
            window.removeEventListener("keydown", down); window.removeEventListener("keyup", up);
            gl.domElement.removeEventListener("click", onClick);
            document.removeEventListener("pointerlockchange", onLock);
            document.removeEventListener("mousemove", onMove);
        };
    }, [camera, gl]);

    useFrame((_, delta) => {
        const sprint = keys.current.has("shift");
        const speed = (sprint ? 10 : 5.5) * delta;
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir); dir.y = 0; dir.normalize();
        const right = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0));
        const moving = keys.current.has("w") || keys.current.has("s") || keys.current.has("a") || keys.current.has("d");

        if (keys.current.has("w")) camera.position.addScaledVector(dir, speed);
        if (keys.current.has("s")) camera.position.addScaledVector(dir, -speed * 0.8);
        if (keys.current.has("a")) camera.position.addScaledVector(right, -speed * 0.9);
        if (keys.current.has("d")) camera.position.addScaledVector(right, speed * 0.9);

        if (moving) { bobTime.current += delta * (sprint ? 14 : 9); camera.position.y = 1.72 + Math.sin(bobTime.current) * 0.04; }
        else { camera.position.y += (1.72 - camera.position.y) * 0.15; }
        camera.position.x = Math.max(-90, Math.min(90, camera.position.x));
        camera.position.z = Math.max(-90, Math.min(90, camera.position.z));

        playerPosRef.current = { x: camera.position.x, z: camera.position.z, ry: euler.current.y };
        movingRef.current = moving;
        sprintingRef.current = sprint;

        // Orbs
        setOrbs(prev => {
            let changed = false;
            const next = prev.map(o => {
                if (!o.collected) {
                    const dx = camera.position.x - o.x, dz = camera.position.z - o.z;
                    if (dx * dx + dz * dz < 2.2) { changed = true; setCollected(c => c + 1); return { ...o, collected: true }; }
                }
                return o;
            });
            return changed ? next : prev;
        });

        // Activities
        let nearAct: Activity | null = null;
        for (const a of activities) {
            const dx = camera.position.x - a.x, dz = camera.position.z - a.z;
            if (dx * dx + dz * dz < 5 && !a.interacted) { nearAct = a; break; }
        }
        const labels: Record<string, string> = { campfire: "[E] Extinguish fire", well: "[E] Drink water", chest: "[E] Open chest", signpost: "[E] Read sign" };
        setInteractHint(nearAct ? labels[nearAct.type] ?? "" : "");

        const eDown = keys.current.has("e");
        if (eDown && !eWasDown.current && nearAct && !nearAct.interacted) {
            setActivities(prev => prev.map(a => a.id === nearAct!.id ? { ...a, interacted: true } : a));
        }
        eWasDown.current = eDown;
    });

    return null;
}

/* ══════════════════════════════════════════════════════
   CAMERA TRACKER
══════════════════════════════════════════════════════ */
function CameraTracker({ canvasRef }: { canvasRef: RefObject<HTMLDivElement | null> }) {
    const { camera, gl } = useThree();
    useFrame(() => {
        if (gl.domElement) {
            gl.domElement.dataset.px = camera.position.x.toFixed(1);
            gl.domElement.dataset.pz = camera.position.z.toFixed(1);
        }
    });
    return null;
}

/* ══════════════════════════════════════════════════════
   MINIMAP
══════════════════════════════════════════════════════ */
function Minimap({ playerPos, orbs, weatherName, activities }: { playerPos: PlayerPos; orbs: Orb[]; weatherName: string; activities: Activity[] }) {
    const scale = 0.5;
    const orbColor = WEATHER_COLORS[weatherName] ?? "#00f5d4";
    return (
        <div style={{
            position: "absolute", bottom: 24, right: 24, width: 152, height: 152,
            background: "rgba(2,6,16,0.92)", backdropFilter: "blur(14px)",
            border: "1px solid rgba(255,255,255,0.07)", borderRadius: 3,
            overflow: "hidden", boxShadow: "0 0 40px rgba(0,0,0,0.85)"
        }}>
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
                <div style={{
                    position: "absolute", inset: 0,
                    backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 15px,rgba(255,255,255,0.018) 15px,rgba(255,255,255,0.018) 16px),repeating-linear-gradient(90deg,transparent,transparent 15px,rgba(255,255,255,0.018) 15px,rgba(255,255,255,0.018) 16px)"
                }} />
                {activities.map(a => {
                    const aColors: Record<string, string> = { campfire: "#ff8833", well: "#44aaff", chest: "#ffd700", signpost: "#aabbcc" };
                    return (
                        <div key={a.id} style={{
                            position: "absolute", width: 5, height: 5, borderRadius: 1,
                            background: a.interacted ? "#333" : aColors[a.type] ?? "#888",
                            opacity: a.interacted ? 0.3 : 0.9,
                            left: `${50 + a.x * scale}%`, top: `${50 + a.z * scale}%`, transform: "translate(-50%,-50%)"
                        }} />
                    );
                })}
                {orbs.filter(o => !o.collected).map(o => (
                    <div key={o.id} style={{
                        position: "absolute", width: 4, height: 4, borderRadius: "50%",
                        background: orbColor, boxShadow: `0 0 3px ${orbColor}`,
                        left: `${50 + o.x * scale}%`, top: `${50 + o.z * scale}%`, transform: "translate(-50%,-50%)"
                    }} />
                ))}
                {/* Player arrow */}
                <div style={{
                    position: "absolute",
                    left: `${50 + playerPos.x * scale}%`, top: `${50 + playerPos.z * scale}%`,
                    transform: `translate(-50%,-50%) rotate(${playerPos.ry}rad)`,
                    width: 0, height: 0, zIndex: 3,
                    borderLeft: "4px solid transparent", borderRight: "4px solid transparent",
                    borderBottom: "10px solid #fff",
                    filter: "drop-shadow(0 0 5px rgba(255,255,255,0.95))"
                }} />
                <div style={{ position: "absolute", top: 4, left: 7, fontSize: 7, color: "rgba(255,255,255,0.22)", fontFamily: "monospace", letterSpacing: 2 }}>MAP</div>
                {/* Legend */}
                <div style={{ position: "absolute", bottom: 4, left: 5, display: "flex", flexDirection: "column", gap: 1 }}>
                    {[["#ff8833", "fire"], ["#44aaff", "well"], ["#ffd700", "chest"], ["#aabbcc", "sign"]].map(([c, l]) => (
                        <div key={l} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                            <div style={{ width: 4, height: 4, background: c, borderRadius: 1 }} />
                            <span style={{ fontSize: 6, color: "rgba(255,255,255,0.18)", fontFamily: "monospace" }}>{l}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════
   TIME DISPLAY
══════════════════════════════════════════════════════ */
function TimeDisplay({ timeOfDay, paused, onToggle }: { timeOfDay: number; paused: boolean; onToggle: () => void }) {
    const h = Math.floor(timeOfDay * 24);
    const m = Math.floor((timeOfDay * 24 * 60) % 60);
    const phase = timeOfDay < 0.22 ? "MIDNIGHT" : timeOfDay < 0.32 ? "DAWN" : timeOfDay < 0.6 ? "DAY" : timeOfDay < 0.78 ? "DUSK" : "NIGHT";
    const phaseColors: Record<string, string> = { MIDNIGHT: "#4466ff", DAWN: "#ff8833", DAY: "#ffe066", DUSK: "#ff5522", NIGHT: "#6688cc" };
    const pc = phaseColors[phase] ?? "#fff";
    const progress = timeOfDay;

    return (
        <div style={{ position: "absolute", top: 68, left: 20, zIndex: 10, display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                    fontFamily: "'Courier New',monospace", fontSize: 20, fontWeight: "bold",
                    color: pc, textShadow: `0 0 14px ${pc}`, letterSpacing: 2
                }}>
                    {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}
                </div>
                <div style={{ fontFamily: "monospace", fontSize: 8, color: `${pc}77`, letterSpacing: 3, textTransform: "uppercase" }}>{phase}</div>
                <button onClick={onToggle} style={{
                    fontFamily: "monospace", fontSize: 8, color: "rgba(255,255,255,0.28)",
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 2, padding: "2px 6px", cursor: "pointer", letterSpacing: 1
                }}>
                    {paused ? "▶" : "⏸"}
                </button>
            </div>
            {/* Day cycle bar */}
            <div style={{ width: 120, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{
                    height: "100%", width: `${progress * 100}%`,
                    background: `linear-gradient(to right,#4466ff,#ff8833,${pc},#ff5522,#4466ff)`, borderRadius: 2
                }} />
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════
   HUD
══════════════════════════════════════════════════════ */
interface HUDProps {
    collected: number; total: number;
    weather: WeatherConfig; onWeatherChange: (i: number) => void;
    interactHint: string;
    activitiesDone: number; totalActivities: number;
}

function HUD({ collected, total, weather, onWeatherChange, interactHint, activitiesDone, totalActivities }: HUDProps) {
    const pct = total > 0 ? (collected / total) * 100 : 0;
    const accent = WEATHER_COLORS[weather.name] ?? "#00f5d4";

    return (
        <>
            {/* Top bar */}
            <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 58,
                background: "linear-gradient(to bottom,rgba(0,0,0,0.78),transparent)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0 20px", pointerEvents: "none", zIndex: 10
            }}>
                <div style={{ fontFamily: "'Courier New',monospace", color: "rgba(255,255,255,0.4)", fontSize: 9, letterSpacing: 6, textTransform: "uppercase" }}>
                    EXPLORER III
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ fontFamily: "monospace", color: accent, fontSize: 11, letterSpacing: 2, textShadow: `0 0 8px ${accent}` }}>
                        {WEATHER_ICONS[weather.name]} {weather.name}
                    </div>
                    <div style={{ width: 1, height: 12, background: "rgba(255,255,255,0.1)" }} />
                    <div style={{ fontFamily: "monospace", color: "rgba(255,255,255,0.6)", fontSize: 10, letterSpacing: 2 }}>
                        ◆ <span style={{ color: accent, fontWeight: "bold" }}>{collected}</span>/{total}
                    </div>
                    <div style={{ width: 1, height: 12, background: "rgba(255,255,255,0.1)" }} />
                    <div style={{ fontFamily: "monospace", color: "rgba(255,255,255,0.6)", fontSize: 10, letterSpacing: 2 }}>
                        ⚑ <span style={{ color: "#ffaa33", fontWeight: "bold" }}>{activitiesDone}</span>/{totalActivities}
                    </div>
                </div>
            </div>

            {/* Progress bar */}
            <div style={{ position: "absolute", top: 58, left: 0, right: 0, height: 2, background: "rgba(255,255,255,0.04)", zIndex: 10 }}>
                <div style={{
                    height: "100%", width: `${pct}%`,
                    background: `linear-gradient(to right,${accent},${accent}88)`,
                    transition: "width 0.3s ease", boxShadow: `0 0 8px ${accent}`
                }} />
            </div>

            {/* Weather switcher */}
            <div style={{ position: "absolute", top: 75, right: 20, display: "flex", flexDirection: "column", gap: 4, zIndex: 10 }}>
                {WEATHERS.map((w, i) => {
                    const wc = WEATHER_COLORS[w.name] ?? "#fff";
                    const act = weather.name === w.name;
                    return (
                        <button key={w.name} onClick={() => onWeatherChange(i)} style={{
                            width: 30, height: 30, borderRadius: 4, fontSize: 13,
                            border: act ? `1px solid ${wc}` : "1px solid rgba(255,255,255,0.07)",
                            background: act ? `${wc}22` : "rgba(0,0,0,0.45)",
                            backdropFilter: "blur(8px)", cursor: "pointer", transition: "all 0.2s",
                            boxShadow: act ? `0 0 10px ${wc}55` : "none",
                            color: act ? wc : "rgba(255,255,255,0.32)",
                            display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                            {WEATHER_ICONS[w.name]}
                        </button>
                    );
                })}
            </div>

            {/* Crosshair */}
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 10 }}>
                <div style={{ position: "relative", width: 22, height: 22 }}>
                    <div style={{ position: "absolute", left: "50%", top: 2, bottom: 2, width: 1, background: `${accent}66`, transform: "translateX(-50%)" }} />
                    <div style={{ position: "absolute", top: "50%", left: 2, right: 2, height: 1, background: `${accent}66`, transform: "translateY(-50%)" }} />
                    <div style={{
                        position: "absolute", left: "50%", top: "50%", width: 3, height: 3, borderRadius: "50%",
                        background: accent, transform: "translate(-50%,-50%)", boxShadow: `0 0 6px ${accent}`
                    }} />
                </div>
            </div>

            {/* Interact hint */}
            {interactHint && (
                <div style={{
                    position: "absolute", bottom: 150, left: "50%", transform: "translateX(-50%)",
                    fontFamily: "monospace", fontSize: 10, letterSpacing: 3, color: "#fff",
                    background: "rgba(0,0,0,0.65)", backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 3,
                    padding: "8px 20px", zIndex: 10, pointerEvents: "none",
                    textShadow: "0 0 12px rgba(255,255,255,0.5)",
                    animation: "pulse 1.5s ease-in-out infinite"
                }}>
                    {interactHint}
                </div>
            )}

            {/* Bottom controls */}
            <div style={{
                position: "absolute", bottom: 24, left: 24, zIndex: 10,
                fontFamily: "monospace", fontSize: 8, color: "rgba(255,255,255,0.18)", lineHeight: 2.2, letterSpacing: 1
            }}>
                <div>WASD — MOVE &nbsp;&nbsp; SHIFT — SPRINT</div>
                <div>E — INTERACT &nbsp;&nbsp; CLICK — LOOK</div>
            </div>

            {/* Weather label */}
            <div style={{
                position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)",
                fontFamily: "monospace", fontSize: 7, letterSpacing: 5, color: "rgba(255,255,255,0.16)",
                textTransform: "uppercase", zIndex: 10, pointerEvents: "none"
            }}>
                {WEATHER_DESC[weather.name]}
            </div>

            <style>{`@keyframes pulse{0%,100%{opacity:0.8}50%{opacity:1}}`}</style>
        </>
    );
}

/* ══════════════════════════════════════════════════════
   WIN SCREEN
══════════════════════════════════════════════════════ */
function WinScreen({ onRestart, weatherName }: { onRestart: () => void; weatherName: string }) {
    const color = WEATHER_COLORS[weatherName] ?? "#00f5d4";
    return (
        <div style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.8)", backdropFilter: "blur(20px)", zIndex: 30
        }}>
            <div style={{
                textAlign: "center", padding: "54px 76px",
                border: `1px solid ${color}33`, background: "rgba(0,0,0,0.55)", borderRadius: 2
            }}>
                <div style={{ fontFamily: "'Courier New',monospace", fontSize: 8, letterSpacing: 10, color: `${color}77`, marginBottom: 14, textTransform: "uppercase" }}>
                    mission complete
                </div>
                <div style={{ fontFamily: "Georgia,serif", fontSize: 46, color, textShadow: `0 0 40px ${color}`, marginBottom: 8, fontStyle: "italic" }}>
                    All Orbs Found
                </div>
                <div style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(255,255,255,0.28)", marginBottom: 36, letterSpacing: 2 }}>
                    the world is yours
                </div>
                <button onClick={onRestart}
                    style={{
                        fontFamily: "'Courier New',monospace", fontSize: 10, letterSpacing: 6, textTransform: "uppercase",
                        color, border: `1px solid ${color}55`, background: `${color}12`,
                        padding: "13px 38px", cursor: "pointer", transition: "all 0.2s", borderRadius: 2
                    }}
                    onMouseEnter={e => { (e.currentTarget).style.background = `${color}28`; (e.currentTarget).style.boxShadow = `0 0 24px ${color}44`; }}
                    onMouseLeave={e => { (e.currentTarget).style.background = `${color}12`; (e.currentTarget).style.boxShadow = "none"; }}>
                    EXPLORE AGAIN
                </button>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════ */
export default function RealisticExplorer() {
    const [weatherIdx, setWeatherIdx] = useState(0);
    const weather = WEATHERS[weatherIdx];

    const [orbs, setOrbs] = useState<Orb[]>(() =>
        Array.from({ length: 18 }).map((_, i) => ({
            id: i, x: (Math.random() - 0.5) * 110, z: (Math.random() - 0.5) * 110, collected: false,
        }))
    );
    const [collected, setCollected] = useState(0);
    const [playerPos, setPlayerPos] = useState<PlayerPos>({ x: 0, z: 0, ry: 0 });
    const [interactHint, setInteractHint] = useState("");
    const [activities, setActivities] = useState<Activity[]>([
        { id: 1, type: "campfire", x: -15, z: -12, interacted: false },
        { id: 2, type: "campfire", x: 22, z: 30, interacted: false },
        { id: 3, type: "well", x: 8, z: -25, interacted: false },
        { id: 4, type: "well", x: -30, z: 20, interacted: false },
        { id: 5, type: "chest", x: 18, z: 8, interacted: false },
        { id: 6, type: "chest", x: -20, z: -30, interacted: false },
        { id: 7, type: "signpost", x: 0, z: -8, interacted: false },
        { id: 8, type: "signpost", x: 35, z: -18, interacted: false },
    ]);

    const canvasRef = useRef<HTMLDivElement>(null);
    const playerPosRef = useRef<PlayerPos>({ x: 0, z: 0, ry: 0 });
    const movingRef = useRef<boolean>(false);
    const sprintingRef = useRef<boolean>(false);

    const { timeOfDay, timeRef, paused, setPaused } = useDayNight();

    const total = orbs.length;
    const activitiesDone = activities.filter(a => a.interacted).length;

    useEffect(() => {
        const id = setInterval(() => {
            const c = canvasRef.current?.querySelector("canvas") as HTMLCanvasElement | null;
            if (c) {
                setPlayerPos({
                    x: parseFloat(c.dataset.px ?? "0"),
                    z: parseFloat(c.dataset.pz ?? "0"),
                    ry: playerPosRef.current.ry,
                });
            }
        }, 80);
        return () => clearInterval(id);
    }, []);

    const handleRestart = useCallback(() => {
        setOrbs(Array.from({ length: 18 }).map((_, i) => ({
            id: i + Date.now(), x: (Math.random() - 0.5) * 110, z: (Math.random() - 0.5) * 110, collected: false,
        })));
        setCollected(0);
        setActivities(prev => prev.map(a => ({ ...a, interacted: false })));
    }, []);

    return (
        <div ref={canvasRef} style={{ position: "relative", width: "100%", height: "100%", background: "#000", overflow: "hidden" }}>
            <Canvas shadows={{ type: THREE.PCFSoftShadowMap }} camera={{ fov: 72, near: 0.1, far: 250 }}>
                <DynamicSkyAmbient timeRef={timeRef} weatherName={weather.name} />
                <DynamicSun timeRef={timeRef} weatherName={weather.name} />
                <Stars timeRef={timeRef} />
                <Lightning active={weather.lightning} />

                <Ground color={weather.groundColor} timeRef={timeRef} weatherName={weather.name} />
                <Trees weatherName={weather.name} />
                <Rocks />
                <Rain active={weather.rain} intensity={weather.name === "STORM" ? 1.8 : 1} />
                <Snow active={weather.snow} />

                {activities.map(a => {
                    if (a.type === "campfire") return <Campfire key={a.id} x={a.x} z={a.z} interacted={a.interacted} />;
                    if (a.type === "well") return <Well key={a.id} x={a.x} z={a.z} />;
                    if (a.type === "chest") return <Chest key={a.id} x={a.x} z={a.z} interacted={a.interacted} />;
                    if (a.type === "signpost") return <Signpost key={a.id} x={a.x} z={a.z} />;
                    return null;
                })}

                {orbs.map(o => (
                    <OrbMesh key={o.id} x={o.x} z={o.z} collected={o.collected} weatherName={weather.name} />
                ))}

                <Character playerPosRef={playerPosRef} movingRef={movingRef} sprintingRef={sprintingRef} />

                <FPSController
                    orbs={orbs} setOrbs={setOrbs} setCollected={setCollected}
                    activities={activities} setActivities={setActivities}
                    playerPosRef={playerPosRef} movingRef={movingRef} sprintingRef={sprintingRef}
                    setInteractHint={setInteractHint}
                />
                <CameraTracker canvasRef={canvasRef} />
            </Canvas>

            <HUD
                collected={collected} total={total} weather={weather} onWeatherChange={setWeatherIdx}
                interactHint={interactHint} activitiesDone={activitiesDone} totalActivities={activities.length}
            />
            <TimeDisplay timeOfDay={timeOfDay} paused={paused} onToggle={() => setPaused(p => !p)} />
            <Minimap playerPos={playerPos} orbs={orbs} weatherName={weather.name} activities={activities} />

            {collected === total && total > 0 && (
                <WinScreen onRestart={handleRestart} weatherName={weather.name} />
            )}
        </div>
    );
}