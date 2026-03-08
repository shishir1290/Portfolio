import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Games Arcade",
    description:
        "Play 6 interactive Three.js games — Car Racing, Tic Tac Toe, Space Shooter, Walking Explorer, Maze Runner, and Ball Bounce.",
};

export default function GamesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
