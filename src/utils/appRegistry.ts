/** @format */

// App metadata and registry
export interface AppMetadata {
  id: string;
  name: string;
  icon: string;
  component: string;
  category: "personal" | "work" | "system";
  defaultSize: {
    width: number;
    height: number;
  };
  searchKeywords: string[];
  description: string;
}

export const appRegistry: AppMetadata[] = [
  {
    id: "about",
    name: "About Me",
    icon: "👤",
    component: "AboutMeApp",
    category: "personal",
    defaultSize: { width: 800, height: 600 },
    searchKeywords: [
      "about",
      "bio",
      "introduction",
      "education",
      "experience",
      "career",
    ],
    description: "Learn more about my background, education, and experience",
  },
  {
    id: "projects",
    name: "Projects",
    icon: "💼",
    component: "ProjectsApp",
    category: "work",
    defaultSize: { width: 900, height: 650 },
    searchKeywords: ["projects", "portfolio", "work", "code", "github"],
    description: "View my projects and development work",
  },
  {
    id: "skills",
    name: "Skills",
    icon: "⚡",
    component: "SkillsApp",
    category: "work",
    defaultSize: { width: 700, height: 500 },
    searchKeywords: [
      "skills",
      "technologies",
      "tools",
      "languages",
      "frameworks",
    ],
    description: "Explore my technical skills and expertise",
  },
  {
    id: "contact",
    name: "Contact",
    icon: "📧",
    component: "ContactApp",
    category: "personal",
    defaultSize: { width: 600, height: 550 },
    searchKeywords: ["contact", "email", "message", "reach", "connect"],
    description: "Get in touch with me",
  },
  {
    id: "resume",
    name: "Resume",
    icon: "📄",
    component: "ResumeApp",
    category: "work",
    defaultSize: { width: 800, height: 700 },
    searchKeywords: ["resume", "cv", "curriculum", "vitae", "download"],
    description: "View and download my resume",
  },
  {
    id: "gallery",
    name: "Gallery",
    icon: "🖼️",
    component: "GalleryApp",
    category: "work",
    defaultSize: { width: 850, height: 600 },
    searchKeywords: ["gallery", "works", "images", "showcase", "portfolio"],
    description: "Browse through my work gallery",
  },
  {
    id: "settings",
    name: "Settings",
    icon: "⚙️",
    component: "SettingsApp",
    category: "system",
    defaultSize: { width: 600, height: 500 },
    searchKeywords: ["settings", "config", "theme", "color", "preferences"],
    description: "Customize your OS experience",
  },
  {
    id: "clock",
    name: "Clock",
    icon: "⏰",
    component: "ClockApp",
    category: "system",
    defaultSize: { width: 400, height: 500 },
    searchKeywords: ["clock", "time", "date", "timer", "stopwatch"],
    description: "Check the time and date",
  },
  {
    id: "calendar",
    name: "Calendar",
    icon: "📅",
    component: "CalendarApp",
    category: "system",
    defaultSize: { width: 400, height: 450 },
    searchKeywords: ["calendar", "date", "schedule", "month", "year"],
    description: "View the calendar",
  },
  {
    id: "calculator",
    name: "Calculator",
    icon: "🧮",
    component: "CalculatorApp",
    category: "system",
    defaultSize: { width: 320, height: 480 },
    searchKeywords: ["calculator", "math", "calculate", "numbers"],
    description: "Perform basic calculations",
  },
  {
    id: "tictactoe",
    name: "Tic Tac Toe",
    icon: "⭕",
    component: "TicTacToeApp",
    category: "personal",
    defaultSize: { width: 400, height: 500 },
    searchKeywords: ["game", "play", "tic tac toe", "bot"],
    description: "Play Tic Tac Toe against a bot",
  },
  {
    id: "rps",
    name: "Rock Paper Scissors",
    icon: "✂️",
    component: "RPSApp",
    category: "personal",
    defaultSize: { width: 500, height: 600 },
    searchKeywords: ["game", "play", "rock paper scissors", "rps", "bot"],
    description: "Play Rock Paper Scissors against a bot",
  },
];

export const getAppById = (id: string): AppMetadata | undefined => {
  return appRegistry.find((app) => app.id === id);
};

export const searchApps = (query: string): AppMetadata[] => {
  const lowerQuery = query.toLowerCase().trim();

  if (!lowerQuery) return [];

  return appRegistry.filter((app) => {
    const nameMatch = app.name.toLowerCase().includes(lowerQuery);
    const keywordMatch = app.searchKeywords.some((keyword) =>
      keyword.toLowerCase().includes(lowerQuery)
    );
    const descMatch = app.description.toLowerCase().includes(lowerQuery);

    return nameMatch || keywordMatch || descMatch;
  });
};
