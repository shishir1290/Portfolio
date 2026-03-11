import { useRef, useEffect, useState } from "react";
import socketioClient from "socket.io-client";
import { PlayerPos, RemotePlayer, LeaderEntry } from "./types";

export function useMultiplayer(
  playerPosRef: React.MutableRefObject<PlayerPos>,
  movingRef: React.MutableRefObject<boolean>,
  sprintingRef: React.MutableRefObject<boolean>,
  score: number,
) {
  const socketRef = useRef<any>(null);
  const [myId, setMyId] = useState("");
  const [myName, setMyName] = useState("");
  const [myColor, setMyColor] = useState("#2244aa");
  const [others, setOthers] = useState<Map<string, RemotePlayer>>(new Map());
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  const lastEmit = useRef(0);

  useEffect(() => {
    const socket = socketioClient("https://portfolio-6zko.onrender.com/", {
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("self:init", ({ id, name, color, x, z }: any) => {
      setMyId(id);
      setMyName(name);
      setMyColor(color);
      playerPosRef.current = { ...playerPosRef.current, x, z };
    });

    socket.on("players:snapshot", (list: RemotePlayer[]) =>
      setOthers(new Map(list.map((p) => [p.id, p]))),
    );
    socket.on("player:join", (p: RemotePlayer) =>
      setOthers((prev) => new Map(prev).set(p.id, p)),
    );
    socket.on("player:update", (data: any) =>
      setOthers((prev) => {
        const m = new Map(prev),
          ex = m.get(data.id);
        if (ex) m.set(data.id, { ...ex, ...data });
        return m;
      }),
    );
    socket.on("player:leave", (id: string) =>
      setOthers((prev) => {
        const m = new Map(prev);
        m.delete(id);
        return m;
      }),
    );
    socket.on("leaderboard", (list: LeaderEntry[]) => setLeaderboard(list));

    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastEmit.current < 48) return;
      lastEmit.current = now;
      const p = playerPosRef.current;
      socket.emit("player:update", {
        x: p.x,
        y: p.y,
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
  }, []);

  useEffect(() => {
    if (socketRef.current) socketRef.current.emit("player:score", score);
  }, [score]);

  return { myId, myName, myColor, others, leaderboard };
}
