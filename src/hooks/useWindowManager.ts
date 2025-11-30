/** @format */

import { useOS } from "@/contexts/OSContext";

export const useWindowManager = () => {
  const {
    windows,
    activeWindowId,
    openWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    focusWindow,
    updateWindowPosition,
    updateWindowSize,
  } = useOS();

  const getWindow = (windowId: string) => {
    return windows.find((w) => w.id === windowId);
  };

  const isWindowActive = (windowId: string) => {
    return activeWindowId === windowId;
  };

  const getVisibleWindows = () => {
    return windows.filter((w) => !w.isMinimized);
  };

  const getMinimizedWindows = () => {
    return windows.filter((w) => w.isMinimized);
  };

  return {
    windows,
    activeWindowId,
    openWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    focusWindow,
    updateWindowPosition,
    updateWindowSize,
    getWindow,
    isWindowActive,
    getVisibleWindows,
    getMinimizedWindows,
  };
};
