/** @format */

export interface IconPosition {
  appId: string;
  x: number;
  y: number;
}

const STORAGE_KEY = "desktop-icon-positions";
const ICON_WIDTH = 100;
const ICON_HEIGHT = 100;
const ICON_GAP = 20;
const DESKTOP_PADDING = 40;

/**
 * Calculate default grid positions for desktop icons
 */
export const getDefaultIconPositions = (
  appIds: string[],
  screenWidth: number = window.innerWidth,
  screenHeight: number = window.innerHeight
): IconPosition[] => {
  const positions: IconPosition[] = [];
  const maxColumns = Math.floor(
    (screenWidth - DESKTOP_PADDING * 2) / (ICON_WIDTH + ICON_GAP)
  );

  appIds.forEach((appId, index) => {
    const col = index % maxColumns;
    const row = Math.floor(index / maxColumns);

    positions.push({
      appId,
      x: DESKTOP_PADDING + col * (ICON_WIDTH + ICON_GAP),
      y: DESKTOP_PADDING + row * (ICON_HEIGHT + ICON_GAP),
    });
  });

  return positions;
};

/**
 * Save icon positions to localStorage
 */
export const saveIconPositions = (positions: IconPosition[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  } catch (error) {
    console.error("Failed to save icon positions:", error);
  }
};

/**
 * Load icon positions from localStorage
 */
export const loadIconPositions = (): IconPosition[] | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load icon positions:", error);
  }
  return null;
};

/**
 * Validate and constrain icon position to desktop bounds
 */
export const constrainPosition = (
  x: number,
  y: number,
  screenWidth: number = window.innerWidth,
  screenHeight: number = window.innerHeight
): { x: number; y: number } => {
  const taskbarHeight = 60;
  const maxX = screenWidth - ICON_WIDTH - DESKTOP_PADDING;
  const maxY = screenHeight - ICON_HEIGHT - taskbarHeight - DESKTOP_PADDING;

  return {
    x: Math.max(DESKTOP_PADDING, Math.min(maxX, x)),
    y: Math.max(DESKTOP_PADDING, Math.min(maxY, y)),
  };
};

/**
 * Reset icon positions to default grid
 */
export const resetIconPositions = (appIds: string[]): IconPosition[] => {
  const defaultPositions = getDefaultIconPositions(appIds);
  saveIconPositions(defaultPositions);
  return defaultPositions;
};
