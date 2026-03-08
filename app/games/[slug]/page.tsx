"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";

const CarRacing = dynamic(() => import("@/components/games/CarRacing"), { ssr: false });
const TicTacToe = dynamic(() => import("@/components/games/TicTacToe"), { ssr: false });
const SpaceShooter = dynamic(() => import("@/components/games/SpaceShooter"), { ssr: false });
const WalkingExplorer = dynamic(() => import("@/components/games/WalkingExplorer"), { ssr: false });
const MazeRunner = dynamic(() => import("@/components/games/MazeRunner"), { ssr: false });
const BallBounce = dynamic(() => import("@/components/games/BallBounce"), { ssr: false });

const gameMap: Record<string, { component: React.ComponentType; title: string; controls: string }> = {
    "car-racing": { component: CarRacing, title: "🏎️ Car Racing", controls: "← → steer · ↑ ↓ speed · Dodge red obstacles" },
    "tic-tac-toe": { component: TicTacToe, title: "⭕ Tic Tac Toe", controls: "Click cell to play · Drag to rotate board" },
    "space-shooter": { component: SpaceShooter, title: "🚀 Space Shooter", controls: "WASD move · Space to shoot · Survive waves" },
    "walking-explorer": { component: WalkingExplorer, title: "🚶 Walking Explorer", controls: "WASD + mouse look · Click to lock pointer · Collect orbs" },
    "maze-runner": { component: MazeRunner, title: "🌀 Maze Runner", controls: "WASD + mouse look · Click to lock pointer · Find the exit" },
    "ball-bounce": { component: BallBounce, title: "🏓 Ball Bounce", controls: "Mouse to move paddle · Click to launch ball" },
};

export default function GamePage() {
    const params = useParams();
    const slug = params.slug as string;
    const game = gameMap[slug];

    if (!game) {
        return (
            <div className="min-h-screen bg-dark flex items-center justify-center">
                <div className="text-center">
                    <h1
                        className="text-5xl font-bold text-white mb-4"
                        style={{ fontFamily: "Bebas Neue, sans-serif" }}
                    >
                        GAME NOT FOUND
                    </h1>
                    <Link href="/games" className="nav-link text-primary">
                        ← Back to Arcade
                    </Link>
                </div>
            </div>
        );
    }

    const GameComponent = game.component;

    return (
        <div className="min-h-screen bg-dark relative">
            {/* Game fills the viewport */}
            <div className="fixed inset-0">
                <GameComponent />
            </div>

            {/* HUD Overlay */}
            <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
                <div className="flex items-center justify-between px-4 py-3">
                    <Link
                        href="/games"
                        className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 bg-dark/80 backdrop-blur-md border border-primary/20 rounded-sm hover:border-primary/50 transition-colors"
                    >
                        <span
                            className="text-primary text-xs tracking-widest"
                            style={{ fontFamily: "Space Mono, monospace" }}
                        >
                            ← BACK
                        </span>
                    </Link>

                    <div className="px-3 py-1.5 bg-dark/80 backdrop-blur-md border border-white/10 rounded-sm">
                        <span
                            className="text-white/80 text-xs tracking-wider"
                            style={{ fontFamily: "Space Mono, monospace" }}
                        >
                            {game.title}
                        </span>
                    </div>
                </div>

                {/* Controls hint */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-dark/80 backdrop-blur-md border border-white/10 rounded-sm">
                    <span
                        className="text-white/40 text-[10px] tracking-widest"
                        style={{ fontFamily: "Space Mono, monospace" }}
                    >
                        {game.controls}
                    </span>
                </div>
            </div>
        </div>
    );
}
