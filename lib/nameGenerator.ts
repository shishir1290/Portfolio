const ADJ = [
    "Swift", "Bold", "Brave", "Dark", "Lone", "Iron", "Free", "Wild", "Calm", "Keen",
    "Grim", "Jade", "Sage", "Neon", "Ash", "Void", "Dusk", "Dawn", "Rune", "Flux",
    "Frost", "Storm", "Blaze", "Nova", "Echo", "Vex", "Zeal", "Sly", "Keen", "Rift",
];
const NOUN = [
    "Fox", "Wolf", "Bear", "Hawk", "Deer", "Lynx", "Crow", "Owl", "Elk", "Raven",
    "Tiger", "Eagle", "Shark", "Cobra", "Dragon", "Ghost", "Ninja", "Rider", "Blade", "Scout",
    "Viper", "Puma", "Bison", "Rook", "Drake", "Wren", "Stag", "Pike", "Ogre", "Mage",
];

const used = new Set<string>();

export function generateName(): string {
    let attempts = 0;
    while (attempts < 100) {
        const adj = ADJ[Math.floor(Math.random() * ADJ.length)];
        const noun = NOUN[Math.floor(Math.random() * NOUN.length)];
        const num = Math.floor(Math.random() * 99) + 1;
        const name = `${adj}${noun}${num}`;
        if (!used.has(name)) { used.add(name); return name; }
        attempts++;
    }
    // fallback: timestamp suffix guarantees uniqueness
    return `Player${Date.now() % 10000}`;
}

export function releaseName(name: string) {
    used.delete(name);
}
