/** @format */

import React, { useRef, useState, useEffect, ReactNode } from "react";
import { useWindowManager } from "@/hooks/useWindowManager";

interface WindowProps {
  windowId: string;
  title: string;
  children: ReactNode;
  icon?: string;
}

export const Window: React.FC<WindowProps> = ({
  windowId,
  title,
  children,
  icon,
}) => {
  const {
    getWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    focusWindow,
    updateWindowPosition,
    updateWindowSize,
    isWindowActive,
  } = useWindowManager();

  const windowRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState("");
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  const windowState = getWindow(windowId);
  const isActive = isWindowActive(windowId);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!windowState || windowState.isMinimized) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMobile) return;

    focusWindow(windowId);
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - windowState.position.x,
      y: e.clientY - windowState.position.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || isMobile) return;

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    // Constrain to viewport
    const maxX = window.innerWidth - 200;
    const maxY = window.innerHeight - 100;
    const minX = -windowState.size.width + 200;
    const minY = 0;

    const constrainedX = Math.max(minX, Math.min(maxX, newX));
    const constrainedY = Math.max(minY, Math.min(maxY, newY));

    updateWindowPosition(windowId, { x: constrainedX, y: constrainedY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleResizeMouseDown = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    setDragOffset({ x: e.clientX, y: e.clientY });
    if (windowState) {
      setInitialSize(windowState.size);
      setInitialPos(windowState.position);
    }
  };

  const handleResizeMouseMove = (e: MouseEvent) => {
    if (!isResizing || !windowState) return;

    const deltaX = e.clientX - dragOffset.x;
    const deltaY = e.clientY - dragOffset.y;

    let newWidth = initialSize.width;
    let newHeight = initialSize.height;
    let newX = initialPos.x;
    let newY = initialPos.y;

    if (resizeDirection.includes("e")) {
      newWidth = Math.max(300, initialSize.width + deltaX);
    }
    if (resizeDirection.includes("s")) {
      newHeight = Math.max(200, initialSize.height + deltaY);
    }
    if (resizeDirection.includes("w")) {
      const w = Math.max(300, initialSize.width - deltaX);
      newWidth = w;
      newX = initialPos.x + (initialSize.width - w);
    }
    if (resizeDirection.includes("n")) {
      const h = Math.max(200, initialSize.height - deltaY);
      newHeight = h;
      newY = initialPos.y + (initialSize.height - h);
    }

    updateWindowSize(windowId, { width: newWidth, height: newHeight });
    if (resizeDirection.includes("w") || resizeDirection.includes("n")) {
      updateWindowPosition(windowId, { x: newX, y: newY });
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
    if (isResizing) {
      document.addEventListener("mousemove", handleResizeMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleResizeMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset, initialSize, initialPos]);

  const handleWindowClick = () => {
    if (!isActive) {
      focusWindow(windowId);
    }
  };

  const windowStyle: React.CSSProperties = isMobile
    ? {
        top: 0,
        left: 0,
        width: "100vw",
        height: "calc(100vh - 70px)",
        zIndex: windowState.zIndex,
      }
    : windowState.isMaximized
    ? {
        top: 0,
        left: 0,
        width: "100vw",
        height: "calc(100vh - 60px)",
        zIndex: windowState.zIndex,
      }
    : {
        top: windowState.position.y,
        left: windowState.position.x,
        width: windowState.size.width,
        height: windowState.size.height,
        zIndex: windowState.zIndex,
      };

  return (
    <div
      ref={windowRef}
      className={`os-window ${isActive ? "active" : ""} ${
        windowState.isMaximized ? "maximized" : ""
      } ${isMobile ? "mobile-fullscreen" : ""} window-opening`}
      style={windowStyle}
      onClick={handleWindowClick}>
      {/* Title Bar */}
      <div
        className="os-window-titlebar"
        onMouseDown={handleMouseDown}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}>
        <div className="os-window-title">
          {icon && <span>{icon}</span>}
          <span>{title}</span>
        </div>
        <div className="os-window-controls">
          <button
            className="os-window-btn minimize"
            onClick={(e) => {
              e.stopPropagation();
              minimizeWindow(windowId);
            }}
            title="Minimize"
          />
          <button
            className="os-window-btn maximize"
            onClick={(e) => {
              e.stopPropagation();
              maximizeWindow(windowId);
            }}
            title="Maximize"
          />
          <button
            className="os-window-btn close"
            onClick={(e) => {
              e.stopPropagation();
              closeWindow(windowId);
            }}
            title="Close"
          />
        </div>
      </div>

      {/* Content */}
      <div className="os-window-content">{children}</div>

      {/* Resize Handles */}
      {!windowState.isMaximized && !isMobile && (
        <>
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-50"
            onMouseDown={(e) => handleResizeMouseDown(e, "se")}
          />
          <div
            className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize z-50"
            onMouseDown={(e) => handleResizeMouseDown(e, "sw")}
          />
          <div
            className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize z-50"
            onMouseDown={(e) => handleResizeMouseDown(e, "ne")}
          />
          <div
            className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize z-50"
            onMouseDown={(e) => handleResizeMouseDown(e, "nw")}
          />
          <div
            className="absolute bottom-0 left-4 right-4 h-2 cursor-s-resize z-50"
            onMouseDown={(e) => handleResizeMouseDown(e, "s")}
          />
          <div
            className="absolute right-0 top-4 bottom-4 w-2 cursor-e-resize z-50"
            onMouseDown={(e) => handleResizeMouseDown(e, "e")}
          />
          <div
            className="absolute left-0 top-4 bottom-4 w-2 cursor-w-resize z-50"
            onMouseDown={(e) => handleResizeMouseDown(e, "w")}
          />
          <div
            className="absolute top-0 left-4 right-4 h-2 cursor-n-resize z-50"
            onMouseDown={(e) => handleResizeMouseDown(e, "n")}
          />
        </>
      )}
    </div>
  );
};
