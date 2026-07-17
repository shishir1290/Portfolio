import { useEffect, useState, useCallback } from "react";
import { PlayerPos, RemotePlayer, LeaderEntry, Block } from "./types";
import { generateName } from "@/lib/nameGenerator";

export function useMultiplayer(
  playerPosRef: React.MutableRefObject<PlayerPos>,
  movingRef: React.MutableRefObject<boolean>,
  sprintingRef: React.MutableRefObject<boolean>,
  score: number,
) {
  const [myId] = useState("local-player");
  const [myName, setMyName] = useState("");
  const [myColor, setMyColor] = useState("#2244aa");
  const [others] = useState<Map<string, RemotePlayer>>(new Map());
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  const [placedBlocks, setPlacedBlocks] = useState<Block[]>([]);

  // Initialize identity locally
  useEffect(() => {
    const SHIRT_COLORS = ["#aa2244", "#225588", "#228844", "#886622", "#662288", "#228888", "#aa6622", "#446622"];
    const randomColor = SHIRT_COLORS[Math.floor(Math.random() * SHIRT_COLORS.length)];
    setMyColor(randomColor);
    setMyName(generateName());
  }, []);

  // Sync leaderboard with local score
  useEffect(() => {
    if (myName) {
      setLeaderboard([{ name: myName, score, color: myColor }]);
    }
  }, [score, myName, myColor]);

  const broadcastBlock = useCallback((block: Block) => {
    // Local placement only
    setPlacedBlocks((prev) => {
      if (prev.find((b) => b.id === block.id)) return prev;
      return [...prev, block];
    });
  }, []);

  return {
    myId,
    myName,
    myColor,
    others,
    leaderboard,
    placedBlocks,
    broadcastBlock,
  };
}

