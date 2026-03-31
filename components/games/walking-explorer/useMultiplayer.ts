import { useRef, useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { PlayerPos, RemotePlayer, LeaderEntry, Block } from "./types";

type SioInstance = Socket;

export function useMultiplayer(
  playerPosRef: React.MutableRefObject<PlayerPos>,
  movingRef: React.MutableRefObject<boolean>,
  sprintingRef: React.MutableRefObject<boolean>,
  score: number,
) {
  const socketRef = useRef<SioInstance | null>(null);
  const [myId, setMyId] = useState("");
  const [myName, setMyName] = useState("");
  const [myColor, setMyColor] = useState("#2244aa");
  const [others, setOthers] = useState<Map<string, RemotePlayer>>(new Map());
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  const [placedBlocks, setPlacedBlocks] = useState<Block[]>([]);
  const lastEmit = useRef(0);
  const lastScore = useRef(-1);

  useEffect(() => {
    // Connect natively to current host instead of Render URL
    const SERVER_URL = window.location.origin;
    const socket = io(SERVER_URL, { transports: ["websocket", "polling"] });

    socketRef.current = socket;

    socket.on("connect", () =>
      console.log("MULTIPLAYER CONNECTED:", socket.id),
    );

    socket.on("self:init", ({ id, name, color, x, z }: any) => {
      setMyId(id);
      setMyName(name);
      setMyColor(color);
      // Ensure y is initialized if using it locally
      playerPosRef.current = { ...playerPosRef.current, x, z };
    });

    socket.on("players:snapshot", (list: any[]) => {
      // Sanitize coordinates on intake
      const sanitized = list.map((p) => ({
        ...p,
        y: p.y || 0,
        ry: p.ry || 0,
      }));
      setOthers(new Map(sanitized.map((p) => [p.id, p])));
    });

    socket.on("player:join", (p: any) => {
      setOthers((prev) => new Map(prev).set(p.id, { ...p, y: p.y || 0 }));
    });

    socket.on("player:update", (data: any) => {
      setOthers((prev) => {
        const m = new Map(prev);
        const existing = m.get(data.id);
        if (existing) {
          m.set(data.id, {
            ...existing,
            ...data,
            y: data.y !== undefined ? data.y : existing.y || 0,
          });
        }
        return m;
      });
    });

    socket.on("player:leave", (id: string) => {
      setOthers((prev) => {
        const m = new Map(prev);
        m.delete(id);
        return m;
      });
    });

    socket.on("leaderboard", (list: LeaderEntry[]) => setLeaderboard(list));

    socket.on("blocks:snapshot", (list: Block[]) => setPlacedBlocks(list));

    socket.on("block:place", (block: Block) => {
      setPlacedBlocks((prev) => {
        if (prev.find((b) => b.id === block.id)) return prev;
        return [...prev, block];
      });
    });

    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastEmit.current < 50) return;
      lastEmit.current = now;
      const p = playerPosRef.current;

      // Emit position - including y just in case server uses it for character height
      socket.emit("player:update", {
        x: p.x,
        y: p.y || 0,
        z: p.z,
        ry: p.ry,
        moving: movingRef.current,
        sprinting: sprintingRef.current,
      });
    }, 50);

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (score !== lastScore.current && socketRef.current) {
      lastScore.current = score;
      socketRef.current.emit("player:score", score);
    }
  }, [score]);

  const broadcastBlock = useCallback((block: Block) => {
    if (socketRef.current) {
      socketRef.current.emit("block:place", block);
    }
    // Optimistically update local state
    setPlacedBlocks((prev) => [...prev, block]);
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
