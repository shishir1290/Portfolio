const { createServer } = require("http");
const { Server } = require("socket.io");
const { generateName, releaseName } = require("./nameGenerator");

const port = parseInt(process.env.PORT || "3001", 10);

// ── In-memory player store ────────────────────────────────────────────────────
/** @type {Map<string, {name:string, x:number, z:number, ry:number, moving:boolean, sprinting:boolean, score:number, color:string}>} */
const players = new Map();

// A small palette of shirt colors so remote players are distinguishable
const SHIRT_COLORS = [
  "#aa2244",
  "#225588",
  "#228844",
  "#886622",
  "#662288",
  "#228888",
  "#aa6622",
  "#446622",
];
let colorIdx = 0;

function getLeaderboard() {
  return [...players.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(({ name, score, color }) => ({ name, score, color }));
}

const httpServer = createServer((req, res) => {
  res.writeHead(200);
  res.end("Walking Explorer Server Running");
});

const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  transports: ["websocket", "polling"],
});

io.on("connection", (socket) => {
  const name = generateName();
  const color = SHIRT_COLORS[colorIdx++ % SHIRT_COLORS.length];
  const x = Math.floor(Math.random() * 161) - 80;
  const z = Math.floor(Math.random() * 161) - 80;

  players.set(socket.id, {
    name,
    x,
    z,
    ry: 0,
    moving: false,
    sprinting: false,
    score: 0,
    color,
  });

  // Send this player their identity and spawn position
  socket.emit("self:init", { id: socket.id, name, color, x, z });

  // Send existing players to the newcomer
  const others = [...players.entries()]
    .filter(([id]) => id !== socket.id)
    .map(([id, p]) => ({ id, ...p }));
  socket.emit("players:snapshot", others);

  // Announce newcomer to everyone else
  socket.broadcast.emit("player:join", {
    id: socket.id,
    name,
    color,
    x,
    z,
    ry: 0,
    moving: false,
    sprinting: false,
    score: 0,
  });

  // Broadcast leaderboard to all
  io.emit("leaderboard", getLeaderboard());

  // ── Position update ──────────────────────────────────────────────────
  socket.on("player:update", (data) => {
    const p = players.get(socket.id);
    if (!p) return;
    p.x = data.x ?? p.x;
    p.z = data.z ?? p.z;
    p.ry = data.ry ?? p.ry;
    p.moving = data.moving ?? p.moving;
    p.sprinting = data.sprinting ?? p.sprinting;
    socket.broadcast.emit("player:update", {
      id: socket.id,
      x: p.x,
      z: p.z,
      ry: p.ry,
      moving: p.moving,
      sprinting: p.sprinting,
    });
  });

  // ── Score update ─────────────────────────────────────────────────────
  socket.on("player:score", (score) => {
    const p = players.get(socket.id);
    if (!p) return;
    p.score = score;
    io.emit("leaderboard", getLeaderboard());
  });

  // ── Disconnect ───────────────────────────────────────────────────────
  socket.on("disconnect", () => {
    const p = players.get(socket.id);
    if (p) {
      releaseName(p.name);
      players.delete(socket.id);
    }
    io.emit("player:leave", socket.id);
    io.emit("leaderboard", getLeaderboard());
  });
});

httpServer.listen(port, () => {
  console.log(`\n  ➜  Walking Explorer Server ready on port ${port}\n`);
});
