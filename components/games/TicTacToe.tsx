"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";

/* ─── Types ─── */
type CellValue = "X" | "O" | null;
type Board = CellValue[];

/* ─── Minimax AI ─── */
function checkWinner(board: Board): CellValue | "draw" | null {
    const wins = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6],
    ];
    for (const [a, b, c] of wins) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
    }
    if (board.every((c) => c !== null)) return "draw";
    return null;
}

function minimax(board: Board, isMax: boolean): number {
    const result = checkWinner(board);
    if (result === "O") return 10;
    if (result === "X") return -10;
    if (result === "draw") return 0;

    if (isMax) {
        let best = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (!board[i]) {
                board[i] = "O";
                best = Math.max(best, minimax(board, false));
                board[i] = null;
            }
        }
        return best;
    } else {
        let best = Infinity;
        for (let i = 0; i < 9; i++) {
            if (!board[i]) {
                board[i] = "X";
                best = Math.min(best, minimax(board, true));
                board[i] = null;
            }
        }
        return best;
    }
}

function getBestMove(board: Board): number {
    let bestScore = -Infinity;
    let bestMove = -1;
    for (let i = 0; i < 9; i++) {
        if (!board[i]) {
            board[i] = "O";
            const score = minimax(board, false);
            board[i] = null;
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    return bestMove;
}

/* ─── 3D X Piece ─── */
function XPiece({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            <mesh rotation={[0, 0, Math.PI / 4]}>
                <boxGeometry args={[0.1, 0.7, 0.1]} />
                <meshStandardMaterial color="#00f5d4" emissive="#00f5d4" emissiveIntensity={0.5} />
            </mesh>
            <mesh rotation={[0, 0, -Math.PI / 4]}>
                <boxGeometry args={[0.1, 0.7, 0.1]} />
                <meshStandardMaterial color="#00f5d4" emissive="#00f5d4" emissiveIntensity={0.5} />
            </mesh>
        </group>
    );
}

/* ─── 3D O Piece ─── */
function OPiece({ position }: { position: [number, number, number] }) {
    return (
        <mesh position={position}>
            <torusGeometry args={[0.25, 0.05, 16, 32]} />
            <meshStandardMaterial color="#f72585" emissive="#f72585" emissiveIntensity={0.5} />
        </mesh>
    );
}

/* ─── Win Line ─── */
function WinLine({ start, end }: { start: [number, number, number]; end: [number, number, number] }) {
    const dir = new THREE.Vector3().subVectors(
        new THREE.Vector3(...end),
        new THREE.Vector3(...start)
    );
    const mid = new THREE.Vector3(...start).add(dir.clone().multiplyScalar(0.5));
    const len = dir.length();

    return (
        <mesh position={mid} rotation={[0, 0, Math.atan2(dir.y, dir.x)]}>
            <boxGeometry args={[len, 0.06, 0.06]} />
            <meshStandardMaterial color="#7209b7" emissive="#7209b7" emissiveIntensity={2} />
        </mesh>
    );
}

/* ─── Board Cell ─── */
function BoardCell({
    index,
    value,
    onClick,
}: {
    index: number;
    value: CellValue;
    onClick: () => void;
}) {
    const row = Math.floor(index / 3);
    const col = index % 3;
    const x = (col - 1) * 1.1;
    const y = (1 - row) * 1.1;
    const [hovered, setHovered] = useState(false);

    return (
        <group position={[x, y, 0]}>
            {/* Cell plane */}
            <mesh
                onClick={onClick}
                onPointerEnter={() => setHovered(true)}
                onPointerLeave={() => setHovered(false)}
            >
                <planeGeometry args={[1, 1]} />
                <meshStandardMaterial
                    color={hovered && !value ? "#0a1628" : "#0a0f1e"}
                    transparent
                    opacity={0.8}
                />
            </mesh>
            {/* Border */}
            <mesh position={[0, 0, -0.01]}>
                <planeGeometry args={[1.05, 1.05]} />
                <meshStandardMaterial color="#00f5d4" transparent opacity={0.15} />
            </mesh>
            {/* Piece */}
            {value === "X" && <XPiece position={[0, 0, 0.1]} />}
            {value === "O" && <OPiece position={[0, 0, 0.1]} />}
        </group>
    );
}

/* ─── Game Scene ─── */
function GameScene({
    board,
    onCellClick,
    winner,
}: {
    board: Board;
    onCellClick: (i: number) => void;
    winner: CellValue | "draw" | null;
}) {
    const { camera } = useThree();

    useEffect(() => {
        camera.position.set(0, 0, 4.5);
    }, [camera]);

    // Find winning line positions
    const winLinePositions = (() => {
        if (!winner || winner === "draw") return null;
        const wins = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6],
        ];
        for (const [a, , c] of wins) {
            if (board[a] && board[a] === board[Math.floor((a + c) / 2)] && board[a] === board[c]) {
                const getPos = (idx: number): [number, number, number] => {
                    const row = Math.floor(idx / 3);
                    const col = idx % 3;
                    return [(col - 1) * 1.1, (1 - row) * 1.1, 0.15];
                };
                return { start: getPos(a), end: getPos(c) };
            }
        }
        return null;
    })();

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[3, 3, 5]} intensity={1} color="#ffffff" />
            <pointLight position={[-3, -3, 5]} intensity={0.5} color="#7209b7" />

            <group>
                {board.map((val, i) => (
                    <BoardCell key={i} index={i} value={val} onClick={() => onCellClick(i)} />
                ))}
                {winLinePositions && (
                    <WinLine start={winLinePositions.start} end={winLinePositions.end} />
                )}
            </group>

            <OrbitControls
                enableZoom={false}
                enablePan={false}
                minPolarAngle={Math.PI / 4}
                maxPolarAngle={(3 * Math.PI) / 4}
            />
        </>
    );
}

/* ─── Main Component ─── */
export default function TicTacToe() {
    const [board, setBoard] = useState<Board>(Array(9).fill(null));
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [winner, setWinner] = useState<CellValue | "draw" | null>(null);
    const [stats, setStats] = useState({ wins: 0, losses: 0, draws: 0 });

    const handleClick = useCallback(
        (idx: number) => {
            if (board[idx] || winner || !isPlayerTurn) return;
            const newBoard = [...board];
            newBoard[idx] = "X";
            setBoard(newBoard);

            const result = checkWinner(newBoard);
            if (result) {
                setWinner(result);
                if (result === "X") setStats((s) => ({ ...s, wins: s.wins + 1 }));
                else if (result === "draw") setStats((s) => ({ ...s, draws: s.draws + 1 }));
                return;
            }
            setIsPlayerTurn(false);
        },
        [board, winner, isPlayerTurn]
    );

    // AI move
    useEffect(() => {
        if (isPlayerTurn || winner) return;
        const timer = setTimeout(() => {
            const newBoard = [...board];
            const move = getBestMove(newBoard);
            if (move >= 0) {
                newBoard[move] = "O";
                setBoard(newBoard);
                const result = checkWinner(newBoard);
                if (result) {
                    setWinner(result);
                    if (result === "O") setStats((s) => ({ ...s, losses: s.losses + 1 }));
                    else if (result === "draw") setStats((s) => ({ ...s, draws: s.draws + 1 }));
                }
            }
            setIsPlayerTurn(true);
        }, 400);
        return () => clearTimeout(timer);
    }, [isPlayerTurn, winner, board]);

    const restart = useCallback(() => {
        setBoard(Array(9).fill(null));
        setWinner(null);
        setIsPlayerTurn(true);
    }, []);

    return (
        <div className="relative w-full h-full">
            <Canvas>
                <GameScene board={board} onCellClick={handleClick} winner={winner} />
            </Canvas>

            {/* Stats HUD */}
            <div className="absolute top-16 right-4 z-10 px-3 py-2 bg-dark/80 backdrop-blur-md border border-primary/20 rounded-sm">
                <div className="flex gap-4">
                    <div className="text-center">
                        <p className="text-primary text-lg font-bold" style={{ fontFamily: "Bebas Neue, sans-serif" }}>
                            {stats.wins}
                        </p>
                        <p className="text-white/30 text-[10px]" style={{ fontFamily: "Space Mono, monospace" }}>
                            WINS
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-white/50 text-lg font-bold" style={{ fontFamily: "Bebas Neue, sans-serif" }}>
                            {stats.draws}
                        </p>
                        <p className="text-white/30 text-[10px]" style={{ fontFamily: "Space Mono, monospace" }}>
                            DRAWS
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-secondary text-lg font-bold" style={{ fontFamily: "Bebas Neue, sans-serif" }}>
                            {stats.losses}
                        </p>
                        <p className="text-white/30 text-[10px]" style={{ fontFamily: "Space Mono, monospace" }}>
                            LOSSES
                        </p>
                    </div>
                </div>
            </div>

            {/* Turn indicator */}
            <div className="absolute top-16 left-4 z-10 px-3 py-2 bg-dark/80 backdrop-blur-md border border-white/10 rounded-sm">
                <p className="text-white/60 text-xs" style={{ fontFamily: "Space Mono, monospace" }}>
                    {winner
                        ? winner === "draw"
                            ? "DRAW!"
                            : winner === "X"
                                ? "YOU WIN!"
                                : "AI WINS!"
                        : isPlayerTurn
                            ? "YOUR TURN (X)"
                            : "AI THINKING..."}
                </p>
            </div>

            {/* Win/Game-over overlay */}
            {winner && (
                <div className="absolute inset-0 flex items-center justify-center bg-dark/60 backdrop-blur-sm z-20 pointer-events-auto">
                    <div className="text-center">
                        <h2
                            className="text-5xl font-bold mb-2"
                            style={{
                                fontFamily: "Bebas Neue, sans-serif",
                                color: winner === "X" ? "#00f5d4" : winner === "O" ? "#f72585" : "#7209b7",
                            }}
                        >
                            {winner === "draw" ? "IT'S A DRAW!" : winner === "X" ? "YOU WIN!" : "AI WINS!"}
                        </h2>
                        <button onClick={restart} className="btn-primary mt-4">
                            <span>PLAY AGAIN</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
