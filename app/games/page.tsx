"use client";

import Link from "next/link";
import { useState } from "react";

const games = [
    {
        slug: "car-racing",
        title: "Car Racing",
        emoji: "🏎️",
        description: "Dodge obstacles on an endless highway at breakneck speed.",
        controls: "← → steer · ↑ ↓ speed",
        color: "#f72585",
        gradient: "from-[#f72585] to-[#b5179e]",
    },
    {
        slug: "tic-tac-toe",
        title: "Tic Tac Toe",
        emoji: "⭕",
        description: "Challenge an unbeatable AI on a 3D rotating board.",
        controls: "Mouse click · Drag to rotate",
        color: "#00f5d4",
        gradient: "from-[#00f5d4] to-[#00bbf9]",
    },
    {
        slug: "space-shooter",
        title: "Space Shooter",
        emoji: "🚀",
        description: "Blast through waves of enemies in deep space.",
        controls: "WASD move · Space shoot",
        color: "#7209b7",
        gradient: "from-[#7209b7] to-[#560bad]",
    },
    {
        slug: "walking-explorer",
        title: "Walking Explorer",
        emoji: "🚶",
        description: "Explore a first-person world and collect glowing orbs.",
        controls: "WASD + mouse look · Collect orbs",
        color: "#4cc9f0",
        gradient: "from-[#4cc9f0] to-[#4361ee]",
    },
    {
        slug: "maze-runner",
        title: "Maze Runner",
        emoji: "🌀",
        description: "Navigate a procedural maze before time runs out.",
        controls: "WASD + mouse look · Find the exit",
        color: "#f77f00",
        gradient: "from-[#f77f00] to-[#e63946]",
    },
    {
        slug: "ball-bounce",
        title: "Ball Bounce",
        emoji: "🏓",
        description: "Classic breakout — destroy all blocks with your paddle.",
        controls: "Mouse paddle · Click to launch",
        color: "#06d6a0",
        gradient: "from-[#06d6a0] to-[#118ab2]",
    },
];

export default function GamesPage() {
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

    return (
        <div className="min-h-screen bg-dark noise grid-bg">
            {/* Header */}
            <header className="relative border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link
                        href="/"
                        className="flex items-center gap-3 group"
                    >
                        <div className="w-8 h-8 border border-primary/50 flex items-center justify-center group-hover:border-primary transition-colors">
                            <span
                                className="text-primary font-mono text-xs font-bold"
                                style={{ fontFamily: "Space Mono, monospace" }}
                            >
                                S
                            </span>
                        </div>
                        <span
                            className="text-white/80 text-sm font-medium tracking-widest group-hover:text-primary transition-colors"
                            style={{ fontFamily: "Space Mono, monospace" }}
                        >
                            SHISHIR
                        </span>
                    </Link>

                    <Link
                        href="/"
                        className="nav-link flex items-center gap-2"
                    >
                        ← BACK TO PORTFOLIO
                    </Link>
                </div>
            </header>

            {/* Hero */}
            <section className="relative py-20 overflow-hidden">
                {/* Glowing orbs */}
                <div
                    className="absolute top-0 right-1/4 w-96 h-96 rounded-full pointer-events-none"
                    style={{
                        background:
                            "radial-gradient(circle, rgba(114,9,183,0.12) 0%, transparent 70%)",
                        filter: "blur(60px)",
                    }}
                />
                <div
                    className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full pointer-events-none"
                    style={{
                        background:
                            "radial-gradient(circle, rgba(247,37,133,0.08) 0%, transparent 70%)",
                        filter: "blur(60px)",
                    }}
                />

                <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
                    <p
                        className="text-sm text-primary/60 tracking-[0.3em] mb-4"
                        style={{ fontFamily: "Space Mono, monospace" }}
                    >
                        INTERACTIVE PLAYGROUND
                    </p>
                    <h1
                        className="text-6xl sm:text-7xl lg:text-8xl font-bold gradient-text text-glow leading-none mb-6"
                        style={{ fontFamily: "Bebas Neue, sans-serif" }}
                    >
                        GAME ARCADE
                    </h1>
                    <p
                        className="text-white/40 max-w-xl mx-auto text-base leading-relaxed"
                    >
                        Six immersive Three.js games built from scratch — play them
                        right here in your browser. No downloads, no installs.
                    </p>
                </div>
            </section>

            {/* Game Grid */}
            <section className="relative pb-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {games.map((game, idx) => (
                            <Link
                                key={game.slug}
                                href={`/games/${game.slug}`}
                                className="group relative"
                                onMouseEnter={() => setHoveredIdx(idx)}
                                onMouseLeave={() => setHoveredIdx(null)}
                            >
                                <div
                                    className="glass-card rounded-lg overflow-hidden transition-all duration-500"
                                    style={{
                                        borderColor:
                                            hoveredIdx === idx
                                                ? `${game.color}60`
                                                : "rgba(0,245,212,0.1)",
                                        boxShadow:
                                            hoveredIdx === idx
                                                ? `0 0 40px ${game.color}20, inset 0 1px 0 ${game.color}20`
                                                : "none",
                                    }}
                                >
                                    {/* Card top gradient bar */}
                                    <div
                                        className={`h-1 w-full bg-gradient-to-r ${game.gradient} opacity-60 group-hover:opacity-100 transition-opacity`}
                                    />

                                    <div className="p-6">
                                        {/* Emoji + Title */}
                                        <div className="flex items-center gap-4 mb-4">
                                            <span className="text-4xl">{game.emoji}</span>
                                            <div>
                                                <h3
                                                    className="text-2xl font-bold text-white group-hover:text-primary transition-colors"
                                                    style={{ fontFamily: "Bebas Neue, sans-serif" }}
                                                >
                                                    {game.title}
                                                </h3>
                                                <p
                                                    className="text-xs tracking-wider mt-0.5"
                                                    style={{
                                                        fontFamily: "Space Mono, monospace",
                                                        color: game.color,
                                                        opacity: 0.7,
                                                    }}
                                                >
                                                    THREE.JS
                                                </p>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <p className="text-white/40 text-sm leading-relaxed mb-4">
                                            {game.description}
                                        </p>

                                        {/* Controls */}
                                        <div className="flex items-center gap-2 mb-5">
                                            <span
                                                className="text-[10px] text-white/20 tracking-widest uppercase"
                                                style={{ fontFamily: "Space Mono, monospace" }}
                                            >
                                                Controls:
                                            </span>
                                            <span
                                                className="text-xs text-white/50"
                                                style={{ fontFamily: "Space Mono, monospace" }}
                                            >
                                                {game.controls}
                                            </span>
                                        </div>

                                        {/* Play button */}
                                        <div
                                            className="flex items-center justify-center gap-2 py-2.5 border rounded-sm transition-all duration-300 group-hover:bg-primary/10"
                                            style={{
                                                borderColor: `${game.color}40`,
                                                color: game.color,
                                            }}
                                        >
                                            <span
                                                className="text-xs tracking-widest font-bold"
                                                style={{ fontFamily: "Space Mono, monospace" }}
                                            >
                                                ▶ PLAY NOW
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
