const { createServer } = require("http");
const { Server } = require("socket.io");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "7700", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// ── In-memory player store ────────────────────────────────────────────────────
/** @type {Map<string, {name:string, x:number, z:number, ry:number, moving:boolean, sprinting:boolean, score:number, color:string, y:number}>} */
const players = new Map();

// A small palette of shirt colors so remote players are distinguishable
const SHIRT_COLORS = ["#aa2244", "#225588", "#228844", "#886622", "#662288", "#228888", "#aa6622", "#446622"];
let colorIdx = 0;

function getLeaderboard() {
    return [...players.values()]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map(({ name, score, color }) => ({ name, score, color }));
}

// ── Name generator (inline — no TS import) ────────────────────────────────────
const ADJ = ["Swift", "Bold", "Brave", "Dark", "Lone", "Iron", "Free", "Wild", "Calm", "Keen", "Grim", "Jade", "Sage", "Neon"];
const NOUN = ["Fox", "Wolf", "Bear", "Hawk", "Deer", "Lynx", "Crow", "Owl", "Elk", "Raven", "Tiger", "Eagle", "Shark"];
const usedNames = new Set();
function generateName() {
    for (let i = 0; i < 200; i++) {
        const name = ADJ[Math.floor(Math.random() * ADJ.length)] + NOUN[Math.floor(Math.random() * NOUN.length)] + (Math.floor(Math.random() * 99) + 1);
        if (!usedNames.has(name)) { usedNames.add(name); return name; }
    }
    return "Player" + Date.now() % 10000;
}

// ── Placed Blocks in-memory store
const placedBlocks = [];

// ── Boot ──────────────────────────────────────────────────────────────────────
app.prepare().then(() => {
    const httpServer = createServer((req, res) => handle(req, res));

    const io = new Server(httpServer, {
        cors: { origin: "*", methods: ["GET", "POST"] },
        transports: ["websocket", "polling"],
    });

    io.on("connection", (socket) => {
        const name = generateName();
        const color = SHIRT_COLORS[colorIdx++ % SHIRT_COLORS.length];
        const x = Math.floor(Math.random() * 161) - 80;
        const z = Math.floor(Math.random() * 161) - 80;

        players.set(socket.id, { name, x, y: 0, z, ry: 0, moving: false, sprinting: false, score: 0, color });

        // Send this player their identity and spawn position
        socket.emit("self:init", { id: socket.id, name, color, x, z, y: 0 });

        // Send existing players to the newcomer
        const others = [...players.entries()]
            .filter(([id]) => id !== socket.id)
            .map(([id, p]) => ({ id, ...p }));
        socket.emit("players:snapshot", others);
        socket.emit("blocks:snapshot", placedBlocks);

        // Announce newcomer to everyone else
        socket.broadcast.emit("player:join", { id: socket.id, name, color, x, y: 0, z, ry: 0, moving: false, sprinting: false, score: 0 });

        // Broadcast leaderboard to all
        io.emit("leaderboard", getLeaderboard());

        // ── Position update ──────────────────────────────────────────────────
        socket.on("player:update", (data) => {
            const p = players.get(socket.id);
            if (!p) return;
            p.x = data.x ?? p.x;
            p.y = data.y ?? p.y;
            p.z = data.z ?? p.z;
            p.ry = data.ry ?? p.ry;
            p.moving = data.moving ?? p.moving;
            p.sprinting = data.sprinting ?? p.sprinting;
            socket.broadcast.emit("player:update", { id: socket.id, x: p.x, y: p.y, z: p.z, ry: p.ry, moving: p.moving, sprinting: p.sprinting });
        });

        // ── Score update ─────────────────────────────────────────────────────
        socket.on("player:score", (score) => {
            const p = players.get(socket.id);
            if (!p) return;
            p.score = score;
            io.emit("leaderboard", getLeaderboard());
        });

        // ── Block actions ────────────────────────────────────────────────────
        socket.on("block:place", (block) => {
            placedBlocks.push(block);
            socket.broadcast.emit("block:place", block);
        });

        // ── Disconnect ───────────────────────────────────────────────────────
        socket.on("disconnect", () => {
            usedNames.delete(players.get(socket.id)?.name);
            players.delete(socket.id);
            io.emit("player:leave", socket.id);
            io.emit("leaderboard", getLeaderboard());
        });
    });

    httpServer.listen(port, () => {
        console.log(`\n  ➜  Next.js + Socket.io ready on http://${hostname}:${port}\n`);
    });
});
