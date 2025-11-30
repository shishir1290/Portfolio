/** @format */

import React, { useRef, useState, useEffect } from "react";
import { AppMetadata } from "@/utils/appRegistry";
import { constrainPosition } from "@/utils/iconPositions";

interface DesktopIconProps {
  app: AppMetadata;
  position: { x: number; y: number };
  onPositionChange: (appId: string, x: number, y: number) => void;
  onDoubleClick: () => void;
}

export const DesktopIcon: React.FC<DesktopIconProps> = ({
  app,
  position,
  onPositionChange,
  onDoubleClick,
}) => {
  const iconRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isSelected, setIsSelected] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only left click
    if (e.button !== 0) return;

    e.preventDefault();
    setIsSelected(true);
    setIsDragging(true);
    setHasMoved(false);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    // Check if actually moved to prevent micro-movements from blocking click
    if (Math.abs(newX - position.x) > 2 || Math.abs(newY - position.y) > 2) {
      setHasMoved(true);
    }

    const constrained = constrainPosition(newX, newY);
    onPositionChange(app.id, constrained.x, constrained.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (hasMoved) return; // Don't process click if dragged

    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime;

    if (timeSinceLastClick < 300) {
      // Double click detected
      onDoubleClick();
      setLastClickTime(0); // Reset
    } else {
      setLastClickTime(now);
    }

    setIsSelected(true);
    e.stopPropagation();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsSelected(true);
    setIsDragging(true);
    setHasMoved(false);
    setDragOffset({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    });
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    // e.preventDefault(); // Removing this might help with scrolling if needed, but for desktop icons usually we want to prevent scroll

    const touch = e.touches[0];
    const newX = touch.clientX - dragOffset.x;
    const newY = touch.clientY - dragOffset.y;

    if (Math.abs(newX - position.x) > 2 || Math.abs(newY - position.y) > 2) {
      setHasMoved(true);
    }

    const constrained = constrainPosition(newX, newY);
    onPositionChange(app.id, constrained.x, constrained.y);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [isDragging, dragOffset]);

  // Deselect when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (iconRef.current && !iconRef.current.contains(e.target as Node)) {
        setIsSelected(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={iconRef}
      className={`desktop-icon ${isSelected ? "selected" : ""} ${
        isDragging ? "dragging" : ""
      }`}
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onTouchStart={handleTouchStart}>
      <div className="desktop-icon-content">
        <div className="desktop-icon-emoji">{app.icon}</div>
        <div className="desktop-icon-name">{app.name}</div>
      </div>
    </div>
  );
};
