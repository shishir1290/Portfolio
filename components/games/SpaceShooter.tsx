"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* ─── Types ─── */
interface Bullet { id: number; x: number; y: number; }
interface Enemy { id: number; x: number; y: number; speed: number; }
interface Particle { id: number; x: number; y: number; vx: number; vy: number; life: number; color: string; }

/* ─── Starfield ─── */
function Starfield() {
    const ref = useRef<THREE.Points>(null);
    const [positions] = useState(() => {
        const arr = new Float32Array(600 * 3);
        for (let i = 0; i < 600; i++) {
            arr[i * 3] = (Math.random() - 0.5) * 30;
            arr[i * 3 + 1] = (Math.random() - 0.5) * 30;
            arr[i * 3 + 2] = -Math.random() * 20;
        }
        return arr;
    });

    useFrame(() => {
        if (!ref.current) return;
        const pos = ref.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < 600; i++) {
            pos[i * 3 + 1] += 0.02;
            if (pos[i * 3 + 1] > 15) pos[i * 3 + 1] = -15;
        }
        ref.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial size={0.05} color="#00f5d4" transparent opacity={0.6} sizeAttenuation />
        </points>
    );
}

/* ─── Player Ship ─── */
function PlayerShip({ x, y }: { x: number; y: number }) {
    return (
        <group position={[x, y, 0]}>
            {/* Body */}
            <mesh>
                <coneGeometry args={[0.3, 0.8, 4]} />
                <meshStandardMaterial color="#00f5d4" emissive="#00f5d4" emissiveIntensity={0.5} metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Wings */}
            {[-1, 1].map((s) => (
                <mesh key={s} position={[s * 0.35, -0.2, 0]} rotation={[0, 0, s * 0.3]}>
                    <boxGeometry args={[0.3, 0.1, 0.15]} />
                    <meshStandardMaterial color="#7209b7" emissive="#7209b7" emissiveIntensity={0.3} />
                </mesh>
            ))}
            {/* Engine glow */}
            <mesh position={[0, -0.5, 0]}>
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshStandardMaterial color="#f72585" emissive="#f72585" emissiveIntensity={3} />
            </mesh>
        </group>
    );
}

/* ─── Bullet ─── */
function BulletMesh({ x, y }: { x: number; y: number }) {
    return (
        <mesh position={[x, y, 0]}>
            <boxGeometry args={[0.06, 0.3, 0.06]} />
            <meshStandardMaterial color="#00f5d4" emissive="#00f5d4" emissiveIntensity={3} />
        </mesh>
    );
}

/* ─── Enemy ─── */
function EnemyMesh({ x, y }: { x: number; y: number }) {
    const ref = useRef<THREE.Mesh>(null);
    useFrame((_, dt) => {
        if (ref.current) ref.current.rotation.z += dt * 2;
    });
    return (
        <mesh ref={ref} position={[x, y, 0]}>
            <octahedronGeometry args={[0.3]} />
            <meshStandardMaterial color="#f72585" emissive="#f72585" emissiveIntensity={0.5} metalness={0.6} roughness={0.3} />
        </mesh>
    );
}

/* ─── Explosion Particles ─── */
function ExplosionParticles({ particles }: { particles: Particle[] }) {
    return (
        <>
            {particles.map((p) => (
                <mesh key={p.id} position={[p.x, p.y, 0]}>
                    <sphereGeometry args={[0.04, 4, 4]} />
                    <meshStandardMaterial
                        color={p.color}
                        emissive={p.color}
                        emissiveIntensity={2}
                        transparent
                        opacity={p.life}
                    />
                </mesh>
            ))}
        </>
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
        wave: number;
        gameOver: boolean;
        started: boolean;
    };
    setGameState: React.Dispatch<React.SetStateAction<typeof gameState>>;
}) {
    const playerPos = useRef({ x: 0, y: -4 });
    const [px, setPx] = useState(0);
    const [py, setPy] = useState(-4);
    const [bullets, setBullets] = useState<Bullet[]>([]);
    const [enemies, setEnemies] = useState<Enemy[]>([]);
    const [particles, setParticles] = useState<Particle[]>([]);
    const keys = useRef<Set<string>>(new Set());
    const bulletId = useRef(0);
    const enemyId = useRef(0);
    const particleId = useRef(0);
    const spawnTimer = useRef(0);
    const shootTimer = useRef(0);
    const waveKills = useRef(0);
    const { camera } = useThree();

    useEffect(() => {
        camera.position.set(0, 0, 10);
    }, [camera]);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            keys.current.add(e.key.toLowerCase());
            if (!gameState.started && !gameState.gameOver) {
                setGameState((s) => ({ ...s, started: true }));
            }
        };
        const up = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
        window.addEventListener("keydown", down);
        window.addEventListener("keyup", up);
        return () => {
            window.removeEventListener("keydown", down);
            window.removeEventListener("keyup", up);
        };
    }, [gameState.started, gameState.gameOver, setGameState]);

    useFrame((_, delta) => {
        if (!gameState.started || gameState.gameOver) return;
        const dt = Math.min(delta, 0.05);
        const speed = 8;

        // Player movement
        const p = playerPos.current;
        if (keys.current.has("w") || keys.current.has("arrowup")) p.y = Math.min(p.y + speed * dt, 5);
        if (keys.current.has("s") || keys.current.has("arrowdown")) p.y = Math.max(p.y - speed * dt, -5.5);
        if (keys.current.has("a") || keys.current.has("arrowleft")) p.x = Math.max(p.x - speed * dt, -6);
        if (keys.current.has("d") || keys.current.has("arrowright")) p.x = Math.min(p.x + speed * dt, 6);
        setPx(p.x);
        setPy(p.y);

        // Shooting
        shootTimer.current += dt;
        if (keys.current.has(" ") && shootTimer.current > 0.15) {
            shootTimer.current = 0;
            setBullets((prev) => [...prev, { id: bulletId.current++, x: p.x, y: p.y + 0.5 }]);
        }

        // Move bullets
        setBullets((prev) =>
            prev.map((b) => ({ ...b, y: b.y + 15 * dt })).filter((b) => b.y < 8)
        );

        // Spawn enemies
        spawnTimer.current += dt;
        const spawnRate = Math.max(0.5 - gameState.wave * 0.05, 0.15);
        if (spawnTimer.current > spawnRate) {
            spawnTimer.current = 0;
            setEnemies((prev) => [
                ...prev,
                {
                    id: enemyId.current++,
                    x: (Math.random() - 0.5) * 12,
                    y: 7,
                    speed: 1.5 + gameState.wave * 0.3 + Math.random(),
                },
            ]);
        }

        // Move enemies
        setEnemies((prev) => {
            const next = prev.map((e) => ({ ...e, y: e.y - e.speed * dt }));
            // Check if enemy passed bottom
            const alive = next.filter((e) => {
                if (e.y < -6) {
                    setGameState((s) => {
                        const newLives = s.lives - 1;
                        return { ...s, lives: newLives, gameOver: newLives <= 0 };
                    });
                    return false;
                }
                return true;
            });
            return alive;
        });

        // Collision: bullet → enemy
        setBullets((prevBullets) => {
            const survivingBullets: Bullet[] = [];
            const destroyedEnemyIds = new Set<number>();

            for (const b of prevBullets) {
                let hit = false;
                for (const e of enemies) {
                    if (!destroyedEnemyIds.has(e.id) && Math.abs(b.x - e.x) < 0.4 && Math.abs(b.y - e.y) < 0.4) {
                        hit = true;
                        destroyedEnemyIds.add(e.id);
                        // Spawn particles
                        const newP: Particle[] = Array.from({ length: 6 }).map(() => ({
                            id: particleId.current++,
                            x: e.x,
                            y: e.y,
                            vx: (Math.random() - 0.5) * 4,
                            vy: (Math.random() - 0.5) * 4,
                            life: 1,
                            color: Math.random() > 0.5 ? "#f72585" : "#00f5d4",
                        }));
                        setParticles((prev) => [...prev, ...newP]);
                        break;
                    }
                }
                if (!hit) survivingBullets.push(b);
            }

            if (destroyedEnemyIds.size > 0) {
                setEnemies((prev) => prev.filter((e) => !destroyedEnemyIds.has(e.id)));
                waveKills.current += destroyedEnemyIds.size;
                setGameState((s) => ({ ...s, score: s.score + destroyedEnemyIds.size * 100 }));
                // Wave progression
                if (waveKills.current >= 8 + gameState.wave * 3) {
                    waveKills.current = 0;
                    setGameState((s) => ({ ...s, wave: s.wave + 1 }));
                }
            }
            return survivingBullets;
        });

        // Collision: enemy → player
        for (const e of enemies) {
            if (Math.abs(e.x - p.x) < 0.5 && Math.abs(e.y - p.y) < 0.5) {
                setGameState((s) => {
                    const newLives = s.lives - 1;
                    return { ...s, lives: newLives, gameOver: newLives <= 0 };
                });
                setEnemies((prev) => prev.filter((en) => en.id !== e.id));
            }
        }

        // Update particles
        setParticles((prev) =>
            prev
                .map((p) => ({
                    ...p,
                    x: p.x + p.vx * dt,
                    y: p.y + p.vy * dt,
                    life: p.life - dt * 2,
                }))
                .filter((p) => p.life > 0)
        );
    });

    return (
        <>
            <ambientLight intensity={0.2} />
            <pointLight position={[0, 0, 5]} intensity={1} color="#7209b7" />

            <Starfield />
            <PlayerShip x={px} y={py} />
            {bullets.map((b) => (
                <BulletMesh key={b.id} x={b.x} y={b.y} />
            ))}
            {enemies.map((e) => (
                <EnemyMesh key={e.id} x={e.x} y={e.y} />
            ))}
            <ExplosionParticles particles={particles} />
        </>
    );
}

type GameState = {
    score: number;
    lives: number;
    wave: number;
    gameOver: boolean;
    started: boolean;
};

/* ─── Main Component ─── */
export default function SpaceShooter() {
    const [gameState, setGameState] = useState<GameState>({
        score: 0,
        lives: 3,
        wave: 1,
        gameOver: false,
        started: false,
    });

    const restart = useCallback(() => {
        setGameState({ score: 0, lives: 3, wave: 1, gameOver: false, started: true });
    }, []);

    return (
        <div className="relative w-full h-full">
            <Canvas>
                <GameScene gameState={gameState} setGameState={setGameState as any} />
            </Canvas>

            {/* HUD */}
            <div className="absolute top-16 left-4 z-10 flex gap-3">
                <div className="px-3 py-2 bg-dark/80 backdrop-blur-md border border-primary/20 rounded-sm">
                    <p className="text-primary text-lg font-bold" style={{ fontFamily: "Bebas Neue, sans-serif" }}>
                        SCORE: {gameState.score}
                    </p>
                </div>
                <div className="px-3 py-2 bg-dark/80 backdrop-blur-md border border-white/10 rounded-sm">
                    <p className="text-white/60 text-sm" style={{ fontFamily: "Space Mono, monospace" }}>
                        WAVE {gameState.wave}
                    </p>
                </div>
            </div>

            <div className="absolute top-16 right-4 z-10 px-3 py-2 bg-dark/80 backdrop-blur-md border border-secondary/20 rounded-sm">
                <p className="text-secondary text-sm" style={{ fontFamily: "Space Mono, monospace" }}>
                    {"♥".repeat(gameState.lives)}
                    {"♡".repeat(Math.max(0, 3 - gameState.lives))}
                </p>
            </div>

            {/* Start overlay */}
            {!gameState.started && (
                <div className="absolute inset-0 flex items-center justify-center bg-dark/70 backdrop-blur-sm z-20">
                    <div className="text-center">
                        <h2 className="text-5xl font-bold gradient-text mb-4" style={{ fontFamily: "Bebas Neue, sans-serif" }}>
                            SPACE SHOOTER
                        </h2>
                        <p className="text-white/40 text-sm mb-6" style={{ fontFamily: "Space Mono, monospace" }}>
                            Press any key to start
                        </p>
                        <div className="flex gap-2 justify-center mb-2">
                            {["W", "A", "S", "D"].map((k) => (
                                <span key={k} className="w-10 h-10 flex items-center justify-center border border-primary/30 text-primary text-sm rounded" style={{ fontFamily: "Space Mono, monospace" }}>
                                    {k}
                                </span>
                            ))}
                            <span className="w-20 h-10 flex items-center justify-center border border-primary/30 text-primary text-xs rounded ml-2" style={{ fontFamily: "Space Mono, monospace" }}>
                                SPACE
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Game Over */}
            {gameState.gameOver && (
                <div className="absolute inset-0 flex items-center justify-center bg-dark/80 backdrop-blur-sm z-20">
                    <div className="text-center">
                        <h2 className="text-5xl font-bold text-secondary mb-2" style={{ fontFamily: "Bebas Neue, sans-serif" }}>
                            GAME OVER
                        </h2>
                        <p className="text-3xl text-primary mb-1" style={{ fontFamily: "Bebas Neue, sans-serif" }}>
                            SCORE: {gameState.score}
                        </p>
                        <p className="text-white/40 text-sm mb-6" style={{ fontFamily: "Space Mono, monospace" }}>
                            WAVE {gameState.wave}
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
