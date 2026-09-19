"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect } from "react";
import type { ComponentType } from "react";

const CarRacing = dynamic(() => import("@/components/games/CarRacing"), { ssr: false });
const TicTacToe = dynamic(() => import("@/components/games/TicTacToe"), { ssr: false });
const SpaceShooter = dynamic(() => import("@/components/games/SpaceShooter"), { ssr: false });
const WalkingExplorer = dynamic(() => import("@/components/games/WalkingExplorer"), { ssr: false });
const MazeRunner = dynamic(() => import("@/components/games/MazeRunner"), { ssr: false });
const BallBounce = dynamic(() => import("@/components/games/BallBounce"), { ssr: false });

function MobileControls({ slug }: { slug: string }) {
    const press = useCallback((key: string, down: boolean) => {
        window.dispatchEvent(
            new KeyboardEvent(down ? "keydown" : "keyup", { key, bubbles: true }),
        );
    }, []);

    if (slug === "tic-tac-toe") return null;

    const controls =
        slug === "car-racing"
            ? [
                  ["←", "ArrowLeft"],
                  ["↑", "ArrowUp"],
                  ["↓", "ArrowDown"],
                  ["→", "ArrowRight"],
              ]
            : [
                  ["W", "w"],
                  ["A", "a"],
                  ["S", "s"],
                  ["D", "d"],
              ];

    const Button = ({ index }: { index: number }) => {
        const label = controls[index][0];
        const key = controls[index][1];
        return (
            <button
                type="button"
                aria-label={"Move " + label}
                className="h-12 w-12 rounded-xl bg-black/70 border border-white/15 text-white text-lg backdrop-blur-md active:scale-90 touch-none select-none"
                onPointerDown={(e) => {
                    e.preventDefault();
                    e.currentTarget.setPointerCapture(e.pointerId);
                    press(key, true);
                }}
                onPointerUp={(e) => {
                    e.preventDefault();
                    press(key, false);
                }}
                onPointerCancel={() => press(key, false)}
            >
                {label}
            </button>
        );
    };

    return (
        <div className="fixed bottom-3 left-0 right-0 z-[60] flex items-end justify-between px-4 sm:hidden pointer-events-none select-none">
            <div className="pointer-events-auto grid grid-cols-3 gap-2 w-40">
                <span />
                <Button index={1} />
                <span />
                <Button index={0} />
                <Button index={2} />
                <Button index={3} />
            </div>

            {(slug === "space-shooter" || slug === "ball-bounce") && (
                <button
                    type="button"
                    aria-label={slug === "space-shooter" ? "Shoot" : "Launch"}
                    className="pointer-events-auto w-20 h-20 rounded-full bg-primary/20 border border-primary/50 text-primary font-bold text-xs backdrop-blur-md active:scale-90 touch-none select-none"
                    onPointerDown={(e) => {
                        e.preventDefault();
                        e.currentTarget.setPointerCapture(e.pointerId);
                        press(slug === "space-shooter" ? " " : "Enter", true);
                    }}
                    onPointerUp={(e) => {
                        e.preventDefault();
                        press(slug === "space-shooter" ? " " : "Enter", false);
                    }}
                    onPointerCancel={() =>
                        press(slug === "space-shooter" ? " " : "Enter", false)
                    }
                >
                    {slug === "space-shooter" ? "FIRE" : "LAUNCH"}
                </button>
            )}
        </div>
    );
}

const gameMap: Record<
    string,
    { component: ComponentType; title: string; description: string; controls: string }
> = {
    "car-racing": {
        component: CarRacing,
        title: "Car Racing",
        description: "Dodge obstacles on an endless highway at breakneck speed.",
        controls: "← → steer · ↑ ↓ speed · Dodge red obstacles",
    },
    "tic-tac-toe": {
        component: TicTacToe,
        title: "Tic Tac Toe",
        description: "Challenge an unbeatable AI on a 3D rotating board.",
        controls: "Click cell to play · Drag to rotate board",
    },
    "space-shooter": {
        component: SpaceShooter,
        title: "Space Shooter",
        description: "Blast through waves of enemies in deep space.",
        controls: "WASD move · Space to shoot · Survive waves",
    },
    "walking-explorer": {
        component: WalkingExplorer,
        title: "Walking Explorer",
        description: "Explore a first-person world and collect glowing orbs.",
        controls: "WASD + mouse look · Click to lock pointer · Collect orbs",
    },
    "maze-runner": {
        component: MazeRunner,
        title: "Maze Runner",
        description: "Navigate a procedural maze before time runs out.",
        controls: "WASD + mouse look · Click to lock pointer · Find the exit",
    },
    "ball-bounce": {
        component: BallBounce,
        title: "Ball Bounce",
        description: "Classic breakout — destroy all blocks with your paddle.",
        controls: "Mouse to move paddle · Click to launch ball",
    },
};

export default function GamePage() {
    const params = useParams();
    const slug = params.slug as string;
    const game = gameMap[slug];

    useEffect(() => {
        if (game) document.title = `${game.title} - Play Free Three.js Game`;
        return () => { document.title = "Games Arcade"; };
    }, [game, slug]);

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
        <div className="min-h-[100dvh] bg-dark relative overflow-hidden overscroll-none">
            <h1 className="sr-only">{game.title}</h1>

            {/* Game fills the viewport */}
            <div className="fixed inset-0 touch-none">
                <GameComponent />
            </div>

            <MobileControls slug={slug} />

            {/* HUD Overlay */}
            <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
                <div className="flex items-center justify-between px-3 sm:px-4 py-3">
                    <Link
                        href="/games"
                        className="pointer-events-auto flex items-center gap-2 px-3 py-2 min-h-10 bg-dark/80 backdrop-blur-md border border-primary/20 rounded-sm hover:border-primary/50 transition-colors"
                    >
                        <span
                            className="text-primary text-xs tracking-widest"
                            style={{ fontFamily: "Space Mono, monospace" }}
                        >
                            ← BACK
                        </span>
                    </Link>

                    <div className="hidden sm:block px-3 py-1.5 bg-dark/80 backdrop-blur-md border border-white/10 rounded-sm">
                        <span
                            className="text-white/80 text-xs tracking-wider"
                            style={{ fontFamily: "Space Mono, monospace" }}
                        >
                            {game.title}
                        </span>
                    </div>
                </div>

                {/* Controls hint */}
                <div className="hidden sm:block absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-dark/80 backdrop-blur-md border border-white/10 rounded-sm">
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
