/** @format */

// App metadata and registry
import React from "react";
import {
  FaUser,
  FaBriefcase,
  FaBolt,
  FaEnvelope,
  FaFileAlt,
  FaImages,
  FaCog,
  FaClock,
  FaCalendarAlt,
  FaCalculator,
  FaGamepad,
  FaHandRock,
  FaStickyNote,
} from "react-icons/fa";
import { MdGames } from "react-icons/md";
import { GiSnake } from "react-icons/gi";
import { BsGrid3X3GapFill } from "react-icons/bs";

// App metadata and registry
export interface AppMetadata {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
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
    icon: FaUser,
    component: "AboutMeApp",
    category: "personal",
    defaultSize: { width: 700, height: 550 },
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
    icon: FaBriefcase,
    component: "ProjectsApp",
    category: "work",
    defaultSize: { width: 800, height: 600 },
    searchKeywords: ["projects", "portfolio", "work", "code", "github"],
    description: "View my projects and development work",
  },
  {
    id: "skills",
    name: "Skills",
    icon: FaBolt,
    component: "SkillsApp",
    category: "work",
    defaultSize: { width: 650, height: 480 },
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
    icon: FaEnvelope,
    component: "ContactApp",
    category: "personal",
    defaultSize: { width: 550, height: 500 },
    searchKeywords: ["contact", "email", "message", "reach", "connect"],
    description: "Get in touch with me",
  },
  {
    id: "resume",
    name: "Resume",
    icon: FaFileAlt,
    component: "ResumeApp",
    category: "work",
    defaultSize: { width: 700, height: 600 },
    searchKeywords: ["resume", "cv", "curriculum", "vitae", "download"],
    description: "View and download my resume",
  },
  {
    id: "gallery",
    name: "Gallery",
    icon: FaImages,
    component: "GalleryApp",
    category: "work",
    defaultSize: { width: 750, height: 550 },
    searchKeywords: ["gallery", "works", "images", "showcase", "portfolio"],
    description: "Browse through my work gallery",
  },
  {
    id: "settings",
    name: "Settings",
    icon: FaCog,
    component: "SettingsApp",
    category: "system",
    defaultSize: { width: 550, height: 480 },
    searchKeywords: ["settings", "config", "theme", "color", "preferences"],
    description: "Customize your OS experience",
  },
  {
    id: "clock",
    name: "Clock",
    icon: FaClock,
    component: "ClockApp",
    category: "system",
    defaultSize: { width: 380, height: 480 },
    searchKeywords: ["clock", "time", "date", "timer", "stopwatch"],
    description: "Check the time and date",
  },
  {
    id: "calendar",
    name: "Calendar",
    icon: FaCalendarAlt,
    component: "CalendarApp",
    category: "system",
    defaultSize: { width: 380, height: 420 },
    searchKeywords: ["calendar", "date", "schedule", "month", "year"],
    description: "View the calendar",
  },
  {
    id: "calculator",
    name: "Calculator",
    icon: FaCalculator,
    component: "CalculatorApp",
    category: "system",
    defaultSize: { width: 320, height: 480 },
    searchKeywords: ["calculator", "math", "calculate", "numbers"],
    description: "Perform basic calculations",
  },
  {
    id: "tictactoe",
    name: "Tic Tac Toe",
    icon: BsGrid3X3GapFill,
    component: "TicTacToeApp",
    category: "personal",
    defaultSize: { width: 450, height: 550 },
    searchKeywords: ["game", "play", "tic tac toe", "bot"],
    description: "Play Tic Tac Toe against a bot",
  },
  {
    id: "rps",
    name: "Rock Paper Scissors",
    icon: FaHandRock,
    component: "RPSApp",
    category: "personal",
    defaultSize: { width: 480, height: 580 },
    searchKeywords: ["game", "play", "rock paper scissors", "rps", "bot"],
    description: "Play Rock Paper Scissors against a bot",
  },
  {
    id: "snake",
    name: "Snake",
    icon: GiSnake,
    component: "SnakeApp",
    category: "personal",
    defaultSize: { width: 500, height: 600 },
    searchKeywords: ["game", "play", "snake", "classic"],
    description: "Play the classic Snake game",
  },
  {
    id: "tetris",
    name: "Tetris",
    icon: MdGames,
    component: "TetrisApp",
    category: "personal",
    defaultSize: { width: 380, height: 680 },
    searchKeywords: ["game", "play", "tetris", "blocks"],
    description: "Play Tetris",
  },
  {
    id: "notes",
    name: "Notes",
    icon: FaStickyNote,
    component: "NotesApp",
    category: "personal",
    defaultSize: { width: 480, height: 550 },
    searchKeywords: ["notes", "write", "text", "pad"],
    description: "Take quick notes",
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
      keyword.toLowerCase().includes(lowerQuery),
    );
    const descMatch = app.description.toLowerCase().includes(lowerQuery);

    return nameMatch || keywordMatch || descMatch;
  });
};
