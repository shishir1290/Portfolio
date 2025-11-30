/** @format */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import {
  loadIconPositions,
  saveIconPositions,
  getDefaultIconPositions,
  IconPosition,
} from "@/utils/iconPositions";
import { appRegistry } from "@/utils/appRegistry";

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}

interface OSContextType {
  windows: WindowState[];
  activeWindowId: string | null;
  isStartMenuOpen: boolean;
  isSearchOpen: boolean;
  isBooting: boolean;
  isShuttingDown: boolean;
  theme: "light" | "dark";
  accentColor: string;
  iconPositions: { [appId: string]: { x: number; y: number } };
  openWindow: (
    appId: string,
    title: string,
    size?: { width: number; height: number }
  ) => void;
  closeWindow: (windowId: string) => void;
  minimizeWindow: (windowId: string) => void;
  maximizeWindow: (windowId: string) => void;
  focusWindow: (windowId: string) => void;
  updateWindowPosition: (
    windowId: string,
    position: { x: number; y: number }
  ) => void;
  updateWindowSize: (
    windowId: string,
    size: { width: number; height: number }
  ) => void;
  playSound: (soundName: string) => void;
  toggleStartMenu: () => void;
  toggleSearch: () => void;
  setStartMenuOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setBooting: (booting: boolean) => void;
  shutdown: () => void;
  turnOn: () => void;
  setTheme: (theme: "light" | "dark") => void;
  setAccentColor: (color: string) => void;
  updateIconPosition: (appId: string, x: number, y: number) => void;
  resetIconPositions: () => void;
  volume: number;
  setVolume: (volume: number) => void;
}

const OSContext = createContext<OSContextType | undefined>(undefined);

let nextZIndex = 100;
let windowCounter = 0;

export const OSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const [isShuttingDown, setIsShuttingDown] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [accentColor, setAccentColor] = useState<string>("#3b82f6"); // Default blue
  const [volume, setVolume] = useState<number>(50);
  const [iconPositions, setIconPositions] = useState<{
    [appId: string]: { x: number; y: number };
  }>({});

  // Initialize icon positions from localStorage or default
  useEffect(() => {
    const appIds = appRegistry.map((app) => app.id);
    const savedPositions = loadIconPositions();

    if (savedPositions) {
      // Convert array to object
      const positionsMap: { [appId: string]: { x: number; y: number } } = {};
      savedPositions.forEach((pos) => {
        positionsMap[pos.appId] = { x: pos.x, y: pos.y };
      });
      setIconPositions(positionsMap);
    } else {
      // Use default positions
      const defaultPositions = getDefaultIconPositions(appIds);
      const positionsMap: { [appId: string]: { x: number; y: number } } = {};
      defaultPositions.forEach((pos) => {
        positionsMap[pos.appId] = { x: pos.x, y: pos.y };
      });
      setIconPositions(positionsMap);
      saveIconPositions(defaultPositions);
    }
  }, []);

  // Apply theme and accent color
  useEffect(() => {
    const root = document.documentElement;

    // Apply theme
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Apply accent color
    root.style.setProperty("--accent-color", accentColor);
  }, [theme, accentColor]);

  const playSound = useCallback(
    (soundName: string) => {
      if (volume === 0) return;
      const audio = new Audio(`/sounds/${soundName}.mp3`);
      audio.volume = volume / 100;
      audio.play().catch((e) => console.log("Audio play failed:", e));
    },
    [volume]
  );

  const openWindow = useCallback(
    (appId: string, title: string, size = { width: 800, height: 600 }) => {
      playSound("click");
      // Check if window with this appId already exists
      const existingWindow = windows.find(
        (w) => w.appId === appId && !w.isMinimized
      );

      if (existingWindow) {
        // Focus existing window
        focusWindow(existingWindow.id);
        return;
      }

      // Check if there's a minimized window for this app
      const minimizedWindow = windows.find(
        (w) => w.appId === appId && w.isMinimized
      );

      if (minimizedWindow) {
        // Restore minimized window
        setWindows((prev) =>
          prev.map((w) =>
            w.id === minimizedWindow.id
              ? { ...w, isMinimized: false, zIndex: nextZIndex++ }
              : w
          )
        );
        setActiveWindowId(minimizedWindow.id);
        return;
      }

      const windowId = `window-${windowCounter++}`;
      const newWindow: WindowState = {
        id: windowId,
        appId,
        title,
        isMinimized: false,
        isMaximized: false,
        position: {
          x: 100 + windows.length * 30,
          y: 80 + windows.length * 30,
        },
        size,
        zIndex: nextZIndex++,
      };

      setWindows((prev) => [...prev, newWindow]);
      setActiveWindowId(windowId);
      playSound("open");
    },
    [windows, playSound]
  );

  const closeWindow = useCallback(
    (windowId: string) => {
      setWindows((prev) => prev.filter((w) => w.id !== windowId));
      setActiveWindowId((prev) => (prev === windowId ? null : prev));
      playSound("close");
    },
    [playSound]
  );

  const minimizeWindow = useCallback(
    (windowId: string) => {
      setWindows((prev) =>
        prev.map((w) => (w.id === windowId ? { ...w, isMinimized: true } : w))
      );
      setActiveWindowId(null);
      playSound("minimize");
    },
    [playSound]
  );

  const maximizeWindow = useCallback(
    (windowId: string) => {
      setWindows((prev) =>
        prev.map((w) =>
          w.id === windowId ? { ...w, isMaximized: !w.isMaximized } : w
        )
      );
      playSound("maximize");
    },
    [playSound]
  );

  const focusWindow = useCallback((windowId: string) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === windowId
          ? { ...w, zIndex: nextZIndex++, isMinimized: false }
          : w
      )
    );
    setActiveWindowId(windowId);
  }, []);

  const updateWindowPosition = useCallback(
    (windowId: string, position: { x: number; y: number }) => {
      setWindows((prev) =>
        prev.map((w) => (w.id === windowId ? { ...w, position } : w))
      );
    },
    []
  );

  const updateWindowSize = useCallback(
    (windowId: string, size: { width: number; height: number }) => {
      setWindows((prev) =>
        prev.map((w) => (w.id === windowId ? { ...w, size } : w))
      );
    },
    []
  );

  const toggleStartMenu = useCallback(() => {
    setIsStartMenuOpen((prev) => {
      if (!prev) playSound("click");
      return !prev;
    });
    setIsSearchOpen(false);
  }, [playSound]);

  const toggleSearch = useCallback(() => {
    setIsSearchOpen((prev) => {
      if (!prev) playSound("click");
      return !prev;
    });
    setIsStartMenuOpen(false);
  }, [playSound]);

  const setStartMenuOpen = useCallback((open: boolean) => {
    setIsStartMenuOpen(open);
  }, []);

  const setSearchOpen = useCallback((open: boolean) => {
    setIsSearchOpen(open);
  }, []);

  const setBooting = useCallback(
    (booting: boolean) => {
      setIsBooting(booting);
      if (!booting) playSound("startup");
    },
    [playSound]
  );

  const shutdown = useCallback(() => {
    setIsShuttingDown(true);
    setIsStartMenuOpen(false);
    // Close all windows
    setWindows([]);
    playSound("shutdown");
  }, [playSound]);

  const turnOn = useCallback(() => {
    setIsShuttingDown(false);
    setBooting(true);
  }, []);

  const updateIconPosition = useCallback(
    (appId: string, x: number, y: number) => {
      setIconPositions((prev) => {
        const updated = { ...prev, [appId]: { x, y } };

        // Save to localStorage
        const positionsArray: IconPosition[] = Object.entries(updated).map(
          ([id, pos]) => ({
            appId: id,
            x: pos.x,
            y: pos.y,
          })
        );
        saveIconPositions(positionsArray);

        return updated;
      });
    },
    []
  );

  const resetIconPositions = useCallback(() => {
    const appIds = appRegistry.map((app) => app.id);
    const defaultPositions = getDefaultIconPositions(appIds);
    const positionsMap: { [appId: string]: { x: number; y: number } } = {};
    defaultPositions.forEach((pos) => {
      positionsMap[pos.appId] = { x: pos.x, y: pos.y };
    });
    setIconPositions(positionsMap);
    saveIconPositions(defaultPositions);
  }, []);

  return (
    <OSContext.Provider
      value={{
        windows,
        activeWindowId,
        isStartMenuOpen,
        isSearchOpen,
        isBooting,
        isShuttingDown,
        theme,
        accentColor,
        iconPositions,
        openWindow,
        closeWindow,
        minimizeWindow,
        maximizeWindow,
        focusWindow,
        updateWindowPosition,
        updateWindowSize,
        playSound,
        toggleStartMenu,
        toggleSearch,
        setStartMenuOpen,
        setSearchOpen,
        setBooting,
        shutdown,
        turnOn,
        setTheme,
        setAccentColor,
        updateIconPosition,
        resetIconPositions,
        volume,
        setVolume,
      }}>
      {children}
    </OSContext.Provider>
  );
};

export const useOS = () => {
  const context = useContext(OSContext);
  if (!context) {
    throw new Error("useOS must be used within OSProvider");
  }
  return context;
};
