import { useRef, useEffect, useState } from "react";
import socketioClient from "socket.io-client";
import { PlayerPos, RemotePlayer, LeaderEntry } from "./types";

type SioInstance = ReturnType<typeof socketioClient>;
const socketio = socketioClient as unknown as {
  io(url: string, opts?: Record<string, unknown>): SioInstance;
};

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
  const lastEmit = useRef(0);
  const lastScore = useRef(-1);

  useEffect(() => {
    const SERVER_URL = "https://portfolio-6zko.onrender.com/";
    const socket = socketio.io(SERVER_URL, {
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("self:init", ({ id, name, color, x, z }: any) => {
      setMyId(id);
      setMyName(name);
      setMyColor(color);
      // Update local ref so character starts at server-assigned position
      playerPosRef.current = { ...playerPosRef.current, x, z };
    });

    socket.on("players:snapshot", (list: RemotePlayer[]) => {
      setOthers(new Map(list.map((p) => [p.id, p])));
    });

    socket.on("player:join", (p: RemotePlayer) => {
      setOthers((prev) => new Map(prev).set(p.id, p));
    });

    socket.on(
      "player:update",
      (data: Partial<RemotePlayer> & { id: string }) => {
        setOthers((prev) => {
          const m = new Map(prev);
          const existing = m.get(data.id);
          if (existing) m.set(data.id, { ...existing, ...data });
          return m;
        });
      },
    );

    socket.on("player:leave", (id: string) => {
      setOthers((prev) => {
        const m = new Map(prev);
        m.delete(id);
        return m;
      });
    });

    socket.on("leaderboard", (list: LeaderEntry[]) => setLeaderboard(list));

    // Throttled position broadcast ~20×/sec
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastEmit.current < 50) return;
      lastEmit.current = now;
      const p = playerPosRef.current;
      socket.emit("player:update", {
        x: p.x,
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

  // Emit score whenever it changes
  useEffect(() => {
    if (score !== lastScore.current && socketRef.current) {
      lastScore.current = score;
      socketRef.current.emit("player:score", score);
    }
  }, [score]);

  return { myId, myName, myColor, others, leaderboard };
}
