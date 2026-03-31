"use client";

import { useRef, useState, useEffect, useCallback, RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { io, Socket } from "socket.io-client";
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
    const timeRef = useRef(0.42);
    const [timeOfDay, setTimeOfDay] = useState(0.42);
    const [paused, setPaused] = useState(true); // always day by default

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
    name?: string;
    color?: string;
}

function Character({ playerPosRef, movingRef, sprintingRef, name, color }: CharacterProps) {
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

        // Character sits at player position (camera is behind, showing back)
        const lerpFactor = 1 - Math.pow(0.0001, delta); // Frame-rate independent lerp
        groupRef.current.position.x += (pp.x - groupRef.current.position.x) * lerpFactor;
        groupRef.current.position.z += (pp.z - groupRef.current.position.z) * lerpFactor;

        // Smoothly rotate to face movement direction
        let targetRY = pp.ry;
        groupRef.current.rotation.y += (targetRY - groupRef.current.rotation.y) * lerpFactor;

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
                    <meshStandardMaterial color={color || shirt} roughness={0.85} />
                    {name && (
                        <Text
                            position={[0, 0, -0.115]}
                            rotation={[0, Math.PI, 0]}
                            fontSize={0.07}
                            color="#ffffff"
                            anchorX="center"
                            anchorY="middle"
                        >
                            {name}
                        </Text>
                    )}
                </mesh>

                {/* Head */}
                <group ref={headRef} position={[0, 0.47, 0]}>
                    <mesh castShadow>
                        <boxGeometry args={[0.32, 0.33, 0.3]} />
                        <meshStandardMaterial color={skin} roughness={0.8} />
                    </mesh>
                    {/* Hair - top and back */}
                    <mesh position={[0, 0.15, -0.01]} castShadow>
                        <boxGeometry args={[0.34, 0.1, 0.31]} />
                        <meshStandardMaterial color={hair} roughness={0.95} />
                    </mesh>
                    {/* Back hair detail */}
                    <mesh position={[0, 0.03, -0.152]}>
                        <boxGeometry args={[0.3, 0.18, 0.02]} />
                        <meshStandardMaterial color={hair} roughness={0.95} />
                    </mesh>
                    {/* Ear left */}
                    <mesh position={[-0.17, 0.02, 0]}>
                        <boxGeometry args={[0.02, 0.08, 0.06]} />
                        <meshStandardMaterial color={skin} roughness={0.8} />
                    </mesh>
                    {/* Ear right */}
                    <mesh position={[0.17, 0.02, 0]}>
                        <boxGeometry args={[0.02, 0.08, 0.06]} />
                        <meshStandardMaterial color={skin} roughness={0.8} />
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
                shadow-mapSize={[2048, 2048]}
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

/* ══════════════════════════════════════════════════════
   INSTANCED TREES
══════════════════════════════════════════════════════ */
function Trees({ weatherName }: { weatherName: string }) {
    const isSnow = weatherName === "SNOW";
    const trunkGeom = useRef(new THREE.CylinderGeometry(0.1, 0.2, 1, 7));
    const pineGeom = useRef(new THREE.ConeGeometry(1, 1, 8));
    const roundGeom = useRef(new THREE.SphereGeometry(1, 7, 5));

    const trunkMat = useRef(new THREE.MeshStandardMaterial({ color: isSnow ? "#4a3520" : "#2c1a0e", roughness: 1 }));
    const pineMat = useRef(new THREE.MeshStandardMaterial({ color: isSnow ? "#c8dde8" : "#0b3d1e", roughness: 0.9 }));
    const roundMat = useRef(new THREE.MeshStandardMaterial({ color: isSnow ? "#b8ccd8" : "#0c4020", roughness: 0.9 }));

    const [instancedData] = useState(() => {
        const trees = Array.from({ length: 85 }).map((_, i) => ({
            x: (Math.random() - 0.5) * 160, z: (Math.random() - 0.5) * 160,
            h: 2.5 + Math.random() * 5, r: 0.8 + Math.random() * 0.8,
            layers: 2 + Math.floor(Math.random() * 3),
            type: Math.random() > 0.4 ? "pine" : "round",
            ry: Math.random() * Math.PI * 2
        }));
        return trees;
    });

    const trunkRef = useRef<THREE.InstancedMesh>(null);
    const pineRef = useRef<THREE.InstancedMesh>(null);
    const roundRef = useRef<THREE.InstancedMesh>(null);

    useEffect(() => {
        if (!trunkRef.current || !pineRef.current || !roundRef.current) return;
        const dummy = new THREE.Object3D();
        let trunkIdx = 0, pineIdx = 0, roundIdx = 0;

        instancedData.forEach(t => {
            // Trunk
            dummy.position.set(t.x, t.h * 0.25, t.z);
            dummy.scale.set(0.6 + t.r * 0.5, t.h * 0.5, 0.6 + t.r * 0.5);
            dummy.rotation.set(0, t.ry, 0);
            dummy.updateMatrix();
            trunkRef.current!.setMatrixAt(trunkIdx++, dummy.matrix);

            if (t.type === "pine") {
                for (let l = 0; l < t.layers; l++) {
                    dummy.position.set(t.x, t.h * (0.45 + (l / t.layers) * 0.55), t.z);
                    const scale = t.r * (1 - (l / t.layers) * 0.5) * 0.9;
                    dummy.scale.set(scale, t.h * 0.35, scale);
                    dummy.updateMatrix();
                    pineRef.current!.setMatrixAt(pineIdx++, dummy.matrix);
                }
            } else {
                dummy.position.set(t.x, t.h * 0.75, t.z);
                dummy.scale.set(t.r * 0.8, t.r * 0.8, t.r * 0.8);
                dummy.updateMatrix();
                roundRef.current!.setMatrixAt(roundIdx++, dummy.matrix);
            }
        });
        trunkRef.current.instanceMatrix.needsUpdate = true;
        pineRef.current.instanceMatrix.needsUpdate = true;
        roundRef.current.instanceMatrix.needsUpdate = true;
    }, [instancedData]);

    return (
        <group>
            <instancedMesh ref={trunkRef} args={[trunkGeom.current, trunkMat.current, instancedData.length]} castShadow receiveShadow />
            <instancedMesh ref={pineRef} args={[pineGeom.current, pineMat.current, instancedData.length * 4]} castShadow receiveShadow />
            <instancedMesh ref={roundRef} args={[roundGeom.current, roundMat.current, instancedData.length]} castShadow receiveShadow />
        </group>
    );
}

/* ══════════════════════════════════════════════════════
   ROCKS
══════════════════════════════════════════════════════ */
/* ══════════════════════════════════════════════════════
   INSTANCED ROCKS
══════════════════════════════════════════════════════ */
function Rocks() {
    const rockGeom = useRef(new THREE.DodecahedronGeometry(1, 0));
    const rockMat = useRef(new THREE.MeshStandardMaterial({ color: "#1a1e2a", roughness: 0.95, metalness: 0.05 }));
    const [rockData] = useState(() =>
        Array.from({ length: 50 }).map(() => ({
            x: (Math.random() - 0.5) * 150, z: (Math.random() - 0.5) * 150,
            s: 0.2 + Math.random() * 1.1, ry: Math.random() * Math.PI, rx: Math.random() * 0.4,
        }))
    );
    const ref = useRef<THREE.InstancedMesh>(null);

    useEffect(() => {
        if (!ref.current) return;
        const dummy = new THREE.Object3D();
        rockData.forEach((r, i) => {
            dummy.position.set(r.x, r.s * 0.38, r.z);
            dummy.rotation.set(r.rx, r.ry, 0);
            dummy.scale.set(r.s, r.s, r.s);
            dummy.updateMatrix();
            ref.current!.setMatrixAt(i, dummy.matrix);
        });
        ref.current.instanceMatrix.needsUpdate = true;
    }, [rockData]);

    return <instancedMesh ref={ref} args={[rockGeom.current, rockMat.current, rockData.length]} castShadow receiveShadow />;
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
interface JoyInput { x: number; y: number; }

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
    moveJoyRef: React.RefObject<JoyInput>;
    lookJoyRef: React.RefObject<JoyInput>;
}

function FPSController({ orbs, setOrbs, setCollected, activities, setActivities, playerPosRef, movingRef, sprintingRef, setInteractHint, moveJoyRef, lookJoyRef }: FPSProps) {
    const { camera, gl } = useThree();
    const keys = useRef<Set<string>>(new Set());
    const yawRef = useRef(0);
    const pitchRef = useRef(0);
    const isLocked = useRef(false);
    const bobTime = useRef(0);
    const frontViewRef = useRef(false);
    const eWasDown = useRef(false);
    const CAM_DIST = 3.4;
    const CAM_H = 1.6;

    useEffect(() => {
        const dn = (e: KeyboardEvent) => {
            keys.current.add(e.key.toLowerCase());
            if (e.key.toLowerCase() === "c") frontViewRef.current = true;
        };
        const up = (e: KeyboardEvent) => {
            keys.current.delete(e.key.toLowerCase());
            if (e.key.toLowerCase() === "c") frontViewRef.current = false;
        };
        window.addEventListener("keydown", dn); window.addEventListener("keyup", up);
        const onClick = () => gl.domElement.requestPointerLock();
        const onLock = () => { isLocked.current = document.pointerLockElement === gl.domElement; };
        const onMove = (e: MouseEvent) => {
            if (!isLocked.current) return;
            yawRef.current -= e.movementX * 0.0018;
            pitchRef.current -= e.movementY * 0.0018;
            pitchRef.current = Math.max(-0.55, Math.min(0.55, pitchRef.current));
        };
        gl.domElement.addEventListener("click", onClick);
        document.addEventListener("pointerlockchange", onLock);
        document.addEventListener("mousemove", onMove);
        return () => {
            window.removeEventListener("keydown", dn); window.removeEventListener("keyup", up);
            gl.domElement.removeEventListener("click", onClick);
            document.removeEventListener("pointerlockchange", onLock);
            document.removeEventListener("mousemove", onMove);
        };
    }, [gl]);

    useFrame((_, delta) => {
        const dt = Math.min(delta, 0.05);
        const lj = lookJoyRef.current;
        if (lj && (Math.abs(lj.x) > 0.05 || Math.abs(lj.y) > 0.05)) {
            yawRef.current -= lj.x * 0.055 * dt * 60;
            pitchRef.current -= lj.y * 0.038 * dt * 60;
            pitchRef.current = Math.max(-0.55, Math.min(0.55, pitchRef.current));
        }
        const yaw = yawRef.current;
        const sinY = Math.sin(yaw), cosY = Math.cos(yaw);
        const sprint = keys.current.has("shift");
        const speed = (sprint ? 10 : 5.5) * dt;
        const mj = moveJoyRef.current;
        const jMoving = mj ? Math.abs(mj.x) > 0.08 || Math.abs(mj.y) > 0.08 : false;
        const kMoving = keys.current.has("w") || keys.current.has("s") || keys.current.has("a") || keys.current.has("d");
        const moving = kMoving || jMoving;

        const pp = playerPosRef.current;
        let nx = pp.x, nz = pp.z;
        if (keys.current.has("w")) { nx -= sinY * speed; nz -= cosY * speed; }
        if (keys.current.has("s")) { nx += sinY * speed * 0.8; nz += cosY * speed * 0.8; }
        if (keys.current.has("a")) { nx -= cosY * speed * 0.9; nz += sinY * speed * 0.9; }
        if (keys.current.has("d")) { nx += cosY * speed * 0.9; nz -= sinY * speed * 0.9; }
        if (mj && jMoving) {
            nx -= (sinY * (-mj.y) - cosY * mj.x) * speed * 1.1;
            nz -= (cosY * (-mj.y) + sinY * mj.x) * speed * 1.1;
        }
        nx = Math.max(-90, Math.min(90, nx));
        nz = Math.max(-90, Math.min(90, nz));
        if (moving) bobTime.current += dt * (sprint ? 14 : 9);

        // Third-person camera behavior
        let camDistDelta = CAM_DIST;
        let camYawDelta = 0;
        let finalPitch = pitchRef.current;

        if (frontViewRef.current) {
            camYawDelta = Math.PI; // Flip to front
            finalPitch = -0.1; // Slight tilt up to see face
        }

        const camTX = nx + Math.sin(yaw + camYawDelta) * camDistDelta;
        const camTZ = nz + Math.cos(yaw + camYawDelta) * camDistDelta;
        const camTY = CAM_H + Math.sin(finalPitch) * camDistDelta * 0.6;

        const camLerp = 1 - Math.pow(0.00005, delta);
        camera.position.x += (camTX - camera.position.x) * camLerp;
        camera.position.y += (camTY - camera.position.y) * camLerp;
        camera.position.z += (camTZ - camera.position.z) * camLerp;

        if (frontViewRef.current) {
            camera.lookAt(nx, 1.2, nz); // Look more at the head/face
        } else {
            camera.lookAt(nx, 1.05, nz);
        }

        playerPosRef.current = { x: nx, z: nz, ry: yaw };
        movingRef.current = moving;
        sprintingRef.current = sprint;

        setOrbs(prev => {
            let changed = false;
            const next = prev.map(o => {
                const dx = nx - o.x, dz = nz - o.z;
                if (dx * dx + dz * dz < 2.2) {
                    changed = true;
                    setCollected(c => c + 1);
                    // Respawn orb at new random position far from player
                    let rx: number, rz: number;
                    do { rx = (Math.random() - 0.5) * 110; rz = (Math.random() - 0.5) * 110; }
                    while ((rx - nx) * (rx - nx) + (rz - nz) * (rz - nz) < 100);
                    return { ...o, x: rx, z: rz };
                }
                return o;
            });
            return changed ? next : prev;
        });

        let nearAct: Activity | null = null;
        for (const a of activities) {
            const dx = nx - a.x, dz = nz - a.z;
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
function CameraTracker({ playerPosRef }: { playerPosRef: React.MutableRefObject<PlayerPos> }) {
    const { gl } = useThree();
    useFrame(() => {
        if (gl.domElement) {
            gl.domElement.dataset.px = playerPosRef.current.x.toFixed(1);
            gl.domElement.dataset.pz = playerPosRef.current.z.toFixed(1);
        }
    });
    return null;
}

/* ══════════════════════════════════════════════════════
   MINIMAP
══════════════════════════════════════════════════════ */
function Minimap({ playerPosRef, orbs, weatherName, activities, others }: { playerPosRef: React.MutableRefObject<PlayerPos>; orbs: Orb[]; weatherName: string; activities: Activity[]; others: Map<string, RemotePlayer> }) {
    const scale = 0.5;
    const orbColor = WEATHER_COLORS[weatherName] ?? "#00f5d4";
    const playerIconRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let raf: number;
        const sync = () => {
            if (playerIconRef.current) {
                const pp = playerPosRef.current;
                playerIconRef.current.style.left = `${50 + pp.x * scale}%`;
                playerIconRef.current.style.top = `${50 + pp.z * scale}%`;
                playerIconRef.current.style.transform = `translate(-50%,-50%) rotate(${pp.ry}rad)`;
            }
            raf = requestAnimationFrame(sync);
        };
        raf = requestAnimationFrame(sync);
        return () => cancelAnimationFrame(raf);
    }, [playerPosRef, scale]);

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
                <div ref={playerIconRef} style={{
                    position: "absolute",
                    left: `50%`, top: `50%`,
                    width: 0, height: 0, zIndex: 3,
                    borderLeft: "4px solid transparent", borderRight: "4px solid transparent",
                    borderBottom: "10px solid #fff",
                    filter: "drop-shadow(0 0 5px rgba(255,255,255,0.95))"
                }} />
                {/* Other players - simplified for minimap performance if needed, but currently Map.map */}
                {Array.from(others.values()).map(p => (
                    <div key={p.id} style={{
                        position: "absolute", width: 4, height: 4, borderRadius: "50%",
                        background: p.color, border: "1px solid #fff",
                        left: `${50 + p.x * scale}%`, top: `${50 + p.z * scale}%`, transform: "translate(-50%,-50%)",
                        zIndex: 2
                    }} />
                ))}
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
    const pct = (collected % 10) * 10; // progress bar fills every 10 orbs collected
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
                        ◆ SCORE <span style={{ fontWeight: "bold" }}>{collected}</span>
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
                <div>E — INTERACT &nbsp;&nbsp; C — FRONT VIEW (HOLD)</div>
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
   MULTIPLAYER TYPES
══════════════════════════════════════════════════════ */
interface RemotePlayer {
    id: string; name: string; color: string;
    x: number; z: number; ry: number;
    moving: boolean; sprinting: boolean; score: number;
}
interface LeaderEntry { name: string; score: number; color: string; }

/* ══════════════════════════════════════════════════════
   MULTIPLAYER HOOK
══════════════════════════════════════════════════════ */
function useMultiplayer(
    playerPosRef: React.MutableRefObject<PlayerPos>,
    movingRef: React.MutableRefObject<boolean>,
    sprintingRef: React.MutableRefObject<boolean>,
    score: number,
) {
    const socketRef = useRef<Socket | null>(null);
    const [myId, setMyId] = useState<string>("");
    const [myName, setMyName] = useState<string>("");
    const [myColor, setMyColor] = useState<string>("#2244aa");
    const [others, setOthers] = useState<Map<string, RemotePlayer>>(new Map());
    const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
    const lastEmit = useRef(0);
    const lastScore = useRef(-1);

    useEffect(() => {
        const socket = io(window.location.origin, {
            transports: ["websocket", "polling"],
        });
        socketRef.current = socket;

        socket.on("self:init", ({ id, name, color, x, z }: { id: string; name: string; color: string; x: number; z: number }) => {
            setMyId(id); setMyName(name); setMyColor(color);
            // Update local ref so character starts at server-assigned position
            playerPosRef.current = { ...playerPosRef.current, x, z };
        });

        socket.on("players:snapshot", (list: RemotePlayer[]) => {
            setOthers(new Map(list.map(p => [p.id, p])));
        });

        socket.on("player:join", (p: RemotePlayer) => {
            setOthers(prev => new Map(prev).set(p.id, p));
        });

        socket.on("player:update", (data: Partial<RemotePlayer> & { id: string }) => {
            setOthers(prev => {
                const m = new Map(prev);
                const existing = m.get(data.id);
                if (existing) m.set(data.id, { ...existing, ...data });
                return m;
            });
        });

        socket.on("player:leave", (id: string) => {
            setOthers(prev => { const m = new Map(prev); m.delete(id); return m; });
        });

        socket.on("leaderboard", (list: LeaderEntry[]) => setLeaderboard(list));

        // Throttled position broadcast ~20×/sec
        const interval = setInterval(() => {
            const now = Date.now();
            if (now - lastEmit.current < 48) return;
            lastEmit.current = now;
            const p = playerPosRef.current;
            socket.emit("player:update", { x: p.x, z: p.z, ry: p.ry, moving: movingRef.current, sprinting: sprintingRef.current });
        }, 50);

        return () => { clearInterval(interval); socket.disconnect(); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Emit score whenever it changes
    useEffect(() => {
        if (score !== lastScore.current && socketRef.current) {
            lastScore.current = score;
            socketRef.current.emit("player:score", score);
        }
    }, [score]);

    return { myId, myName, myColor, others, leaderboard };
}

/* ══════════════════════════════════════════════════════
   OTHER PLAYER 3D CHARACTER
══════════════════════════════════════════════════════ */
function OtherPlayer({ player }: { player: RemotePlayer }) {
    const groupRef = useRef<THREE.Group>(null);
    const lLegRef = useRef<THREE.Group>(null);
    const rLegRef = useRef<THREE.Group>(null);
    const lArmRef = useRef<THREE.Group>(null);
    const rArmRef = useRef<THREE.Group>(null);
    const bobRef = useRef(0);

    useFrame((_, delta) => {
        if (!groupRef.current) return;
        const dt = Math.min(delta, 0.05);
        const lerpFactor = 1 - Math.pow(0.001, delta);
        // Smooth position
        groupRef.current.position.x += (player.x - groupRef.current.position.x) * lerpFactor;
        groupRef.current.position.z += (player.z - groupRef.current.position.z) * lerpFactor;
        // Smooth rotation
        const targetRY = player.ry;
        groupRef.current.rotation.y += (targetRY - groupRef.current.rotation.y) * lerpFactor;
        // Walk cycle
        const spd = player.sprinting ? 16 : 9;
        if (player.moving) bobRef.current += dt * spd;
        const swing = player.moving ? Math.sin(bobRef.current) * 0.65 : 0;
        if (lLegRef.current) lLegRef.current.rotation.x += (swing - lLegRef.current.rotation.x) * 0.25;
        if (rLegRef.current) rLegRef.current.rotation.x += (-swing - rLegRef.current.rotation.x) * 0.25;
        const armSwing = player.moving ? Math.sin(bobRef.current) * 0.55 : 0;
        if (lArmRef.current) lArmRef.current.rotation.x += (-armSwing - 0.1 - lArmRef.current.rotation.x) * 0.25;
        if (rArmRef.current) rArmRef.current.rotation.x += (armSwing - 0.1 - rArmRef.current.rotation.x) * 0.25;
    });

    const skin = "#f5c89a"; const pants = "#1a3a1a"; const shoe = "#1a1008"; const hair = "#2a1505";
    const shirt = player.color;

    return (
        <group ref={groupRef} position={[player.x, 0, player.z]} castShadow>
            {/* Torso */}
            <group position={[0, 0.98, 0]}>
                <mesh castShadow>
                    <boxGeometry args={[0.46, 0.54, 0.22]} />
                    <meshStandardMaterial color={shirt} roughness={0.85} />
                    <Text
                        position={[0, 0, -0.115]}
                        rotation={[0, Math.PI, 0]}
                        fontSize={0.07}
                        color="#ffffff"
                        anchorX="center"
                        anchorY="middle"
                    >
                        {player.name}
                    </Text>
                </mesh>
                {/* Head */}
                <group position={[0, 0.47, 0]}>
                    <mesh castShadow><boxGeometry args={[0.32, 0.33, 0.3]} /><meshStandardMaterial color={skin} roughness={0.8} /></mesh>
                    <mesh position={[0, 0.15, -0.01]}><boxGeometry args={[0.34, 0.1, 0.31]} /><meshStandardMaterial color={hair} roughness={0.95} /></mesh>
                </group>
                {/* Arms */}
                <group ref={lArmRef} position={[-0.31, 0.24, 0]}>
                    <mesh position={[0, -0.2, 0]} castShadow><boxGeometry args={[0.14, 0.42, 0.14]} /><meshStandardMaterial color={shirt} /></mesh>
                    <mesh position={[0, -0.44, 0]}><boxGeometry args={[0.12, 0.2, 0.12]} /><meshStandardMaterial color={skin} /></mesh>
                </group>
                <group ref={rArmRef} position={[0.31, 0.24, 0]}>
                    <mesh position={[0, -0.2, 0]} castShadow><boxGeometry args={[0.14, 0.42, 0.14]} /><meshStandardMaterial color={shirt} /></mesh>
                    <mesh position={[0, -0.44, 0]}><boxGeometry args={[0.12, 0.2, 0.12]} /><meshStandardMaterial color={skin} /></mesh>
                </group>
            </group>
            {/* Legs */}
            <group ref={lLegRef} position={[-0.12, 0.7, 0]}>
                <mesh position={[0, -0.22, 0]} castShadow><boxGeometry args={[0.18, 0.46, 0.18]} /><meshStandardMaterial color={pants} /></mesh>
                <mesh position={[0, -0.66, 0.04]}><boxGeometry args={[0.18, 0.1, 0.24]} /><meshStandardMaterial color={shoe} /></mesh>
            </group>
            <group ref={rLegRef} position={[0.12, 0.7, 0]}>
                <mesh position={[0, -0.22, 0]} castShadow><boxGeometry args={[0.18, 0.46, 0.18]} /><meshStandardMaterial color={pants} /></mesh>
                <mesh position={[0, -0.66, 0.04]}><boxGeometry args={[0.18, 0.1, 0.24]} /><meshStandardMaterial color={shoe} /></mesh>
            </group>
        </group>
    );
}

/* ══════════════════════════════════════════════════════
   LEADERBOARD OVERLAY
══════════════════════════════════════════════════════ */
function Leaderboard({ entries, myName }: { entries: LeaderEntry[]; myName: string }) {
    if (entries.length === 0) return null;
    return (
        <div style={{
            position: "absolute", top: 80, left: 20, zIndex: 15,
            background: "rgba(2,6,16,0.88)", backdropFilter: "blur(14px)",
            border: "1px solid rgba(255,255,255,0.07)", borderRadius: 4,
            padding: "10px 14px", minWidth: 180,
            boxShadow: "0 0 30px rgba(0,0,0,0.8)",
        }}>
            <div style={{ fontFamily: "'Courier New',monospace", fontSize: 7, letterSpacing: 5, color: "rgba(255,255,255,0.3)", marginBottom: 8, textTransform: "uppercase" }}>
                ⚑ Leaderboard
            </div>
            {entries.map((e, i) => {
                const isMe = e.name === myName;
                return (
                    <div key={e.name} style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "3px 0",
                        borderBottom: i < entries.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                        background: isMe ? "rgba(255,255,255,0.05)" : "transparent",
                        borderRadius: 2, paddingLeft: isMe ? 4 : 0,
                    }}>
                        <span style={{ fontFamily: "monospace", fontSize: 8, color: "rgba(255,255,255,0.3)", width: 14, textAlign: "right" }}>
                            {i + 1}.
                        </span>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: e.color, flexShrink: 0 }} />
                        <span style={{
                            fontFamily: "monospace", fontSize: 9,
                            color: isMe ? "#fff" : "rgba(255,255,255,0.65)",
                            fontWeight: isMe ? "bold" : "normal",
                            flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>{e.name}</span>
                        <span style={{ fontFamily: "monospace", fontSize: 9, color: e.color, fontWeight: "bold" }}>{e.score}</span>
                    </div>
                );
            })}
        </div>
    );
}

/* ══════════════════════════════════════════════════════
   TOUCH JOYSTICK CONTROLS
══════════════════════════════════════════════════════ */
function TouchControls({ moveJoyRef, lookJoyRef }: { moveJoyRef: React.RefObject<JoyInput>; lookJoyRef: React.RefObject<JoyInput>; }) {
    const [isMobile] = useState(() => typeof window !== "undefined" && navigator.maxTouchPoints > 0);
    const [mBase, setMBase] = useState<{ x: number; y: number } | null>(null);
    const [lBase, setLBase] = useState<{ x: number; y: number } | null>(null);
    const [mk, setMk] = useState({ x: 0, y: 0 });
    const [lk, setLk] = useState({ x: 0, y: 0 });
    const mId = useRef<number | null>(null);
    const lId = useRef<number | null>(null);
    const mC = useRef({ x: 0, y: 0 });
    const lC = useRef({ x: 0, y: 0 });
    const R = 46;
    useEffect(() => {
        if (!isMobile) return;
        const clamp = (v: number) => Math.max(-R, Math.min(R, v));
        const onStart = (e: TouchEvent) => {
            for (const t of Array.from(e.changedTouches)) {
                const left = t.clientX < window.innerWidth / 2;
                if (left && mId.current === null) { mId.current = t.identifier; mC.current = { x: t.clientX, y: t.clientY }; setMBase({ x: t.clientX, y: t.clientY }); }
                else if (!left && lId.current === null) { lId.current = t.identifier; lC.current = { x: t.clientX, y: t.clientY }; setLBase({ x: t.clientX, y: t.clientY }); }
            }
        };
        const onMove = (e: TouchEvent) => {
            e.preventDefault();
            for (const t of Array.from(e.changedTouches)) {
                if (t.identifier === mId.current) {
                    const dx = clamp(t.clientX - mC.current.x), dy = clamp(t.clientY - mC.current.y);
                    if (moveJoyRef.current) { moveJoyRef.current.x = dx / R; moveJoyRef.current.y = dy / R; }
                    setMk({ x: dx, y: dy });
                }
                if (t.identifier === lId.current) {
                    const dx = clamp(t.clientX - lC.current.x), dy = clamp(t.clientY - lC.current.y);
                    if (lookJoyRef.current) { lookJoyRef.current.x = dx / R; lookJoyRef.current.y = dy / R; }
                    setLk({ x: dx, y: dy });
                }
            }
        };
        const onEnd = (e: TouchEvent) => {
            for (const t of Array.from(e.changedTouches)) {
                if (t.identifier === mId.current) { mId.current = null; if (moveJoyRef.current) { moveJoyRef.current.x = moveJoyRef.current.y = 0; } setMk({ x: 0, y: 0 }); setMBase(null); }
                if (t.identifier === lId.current) { lId.current = null; if (lookJoyRef.current) { lookJoyRef.current.x = lookJoyRef.current.y = 0; } setLk({ x: 0, y: 0 }); setLBase(null); }
            }
        };
        window.addEventListener("touchstart", onStart, { passive: false });
        window.addEventListener("touchmove", onMove, { passive: false });
        window.addEventListener("touchend", onEnd);
        window.addEventListener("touchcancel", onEnd);
        return () => {
            window.removeEventListener("touchstart", onStart);
            window.removeEventListener("touchmove", onMove);
            window.removeEventListener("touchend", onEnd);
            window.removeEventListener("touchcancel", onEnd);
        };
    }, [isMobile, moveJoyRef, lookJoyRef]);
    if (!isMobile) return null;
    const Stick = ({ base, knob }: { base: { x: number; y: number } | null; knob: { x: number; y: number } }) => base ? (
        <div style={{ position: "fixed", left: base.x - 46, top: base.y - 46, width: 92, height: 92, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.22)", backdropFilter: "blur(6px)", pointerEvents: "none", zIndex: 25 }}>
            <div style={{ position: "absolute", left: `calc(50% + ${knob.x}px)`, top: `calc(50% + ${knob.y}px)`, width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.28)", border: "1px solid rgba(255,255,255,0.45)", transform: "translate(-50%,-50%)" }} />
        </div>
    ) : null;
    return (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 20, touchAction: "none" }}>
            <Stick base={mBase} knob={mk} />
            <Stick base={lBase} knob={lk} />
            <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", fontFamily: "monospace", fontSize: 9, color: "rgba(255,255,255,0.18)", letterSpacing: 2, whiteSpace: "nowrap" }}>LEFT: MOVE &nbsp;·&nbsp; RIGHT: LOOK</div>
        </div>
    );
}

export default function RealisticExplorer() {
    const [weatherIdx, setWeatherIdx] = useState(0);
    const weather = WEATHERS[weatherIdx];

    const [orbs, setOrbs] = useState<Orb[]>(() =>
        Array.from({ length: 18 }).map((_, i) => ({
            id: i, x: (Math.random() - 0.5) * 110, z: (Math.random() - 0.5) * 110, collected: false,
        }))
    );

    const [collected, setCollected] = useState(0);
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
    const moveJoyRef = useRef<JoyInput>({ x: 0, y: 0 });
    const lookJoyRef = useRef<JoyInput>({ x: 0, y: 0 });

    const { timeOfDay, timeRef, paused, setPaused } = useDayNight();
    const { myName, myColor, others, leaderboard } = useMultiplayer(playerPosRef, movingRef, sprintingRef, collected);

    const total = orbs.length;
    const activitiesDone = activities.filter(a => a.interacted).length;

    const handleRestart = useCallback(() => {
        setOrbs(Array.from({ length: 18 }).map((_, i) => ({
            id: i + Date.now(), x: (Math.random() - 0.5) * 110, z: (Math.random() - 0.5) * 110, collected: false,
        })));
        setCollected(0);
        setActivities(prev => prev.map(a => ({ ...a, interacted: false })));
    }, []);

    return (
        <div ref={canvasRef} style={{ position: "relative", width: "100%", height: "100%", background: "#000", overflow: "hidden" }}>
            <Canvas shadows={{ type: THREE.PCFSoftShadowMap }} dpr={[1, 1.5]} camera={{ fov: 62, near: 0.1, far: 220 }}>
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

                <Character playerPosRef={playerPosRef} movingRef={movingRef} sprintingRef={sprintingRef} name={myName} color={myColor} />

                {/* Other players */}
                {Array.from(others.values()).map(p => <OtherPlayer key={p.id} player={p} />)}

                <FPSController
                    orbs={orbs} setOrbs={setOrbs} setCollected={setCollected}
                    activities={activities} setActivities={setActivities}
                    playerPosRef={playerPosRef} movingRef={movingRef} sprintingRef={sprintingRef}
                    setInteractHint={setInteractHint}
                    moveJoyRef={moveJoyRef} lookJoyRef={lookJoyRef}
                />
                <CameraTracker playerPosRef={playerPosRef} />
            </Canvas>

            <HUD
                collected={collected} total={total} weather={weather} onWeatherChange={setWeatherIdx}
                interactHint={interactHint} activitiesDone={activitiesDone} totalActivities={activities.length}
            />
            <TimeDisplay timeOfDay={timeOfDay} paused={paused} onToggle={() => setPaused(p => !p)} />
            <Minimap playerPosRef={playerPosRef} orbs={orbs} weatherName={weather.name} activities={activities} others={others} />
            <Leaderboard entries={leaderboard} myName={myName} />
            {/* Own name + color badge top-center */}
            {myName && (
                <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", zIndex: 15, display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "3px 12px 3px 8px" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: myColor }} />
                    <span style={{ fontFamily: "monospace", fontSize: 10, color: "#fff", letterSpacing: 1 }}>{myName}</span>
                </div>
            )}
            <TouchControls moveJoyRef={moveJoyRef} lookJoyRef={lookJoyRef} />

        </div>
    );
}