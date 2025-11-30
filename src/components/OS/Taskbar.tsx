/** @format */

import React, { useState, useEffect } from "react";
import { useOS } from "@/contexts/OSContext";
import {
  FaWindows,
  FaSearch,
  FaWifi,
  FaVolumeUp,
  FaBatteryFull,
} from "react-icons/fa";
import { appRegistry } from "@/utils/appRegistry";
import { CalendarPopup } from "./CalendarPopup";
import { VolumePopup } from "./VolumePopup";

export const Taskbar: React.FC = () => {
  const {
    toggleStartMenu,
    toggleSearch,
    windows,
    focusWindow,
    isStartMenuOpen,
    activeWindowId,
    minimizeWindow,
  } = useOS();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [showVolume, setShowVolume] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const minimizedWindows = windows.filter((w) => w.isMinimized);

  return (
    <>
      {/* Backdrop for closing popups */}
      {(showCalendar || showVolume) && (
        <div
          className="fixed inset-0 z-[9997]"
          onClick={() => {
            setShowCalendar(false);
            setShowVolume(false);
          }}
        />
      )}

      <div className="os-taskbar glass-dark z-[9998]">
        {/* ... (rest of taskbar content) */}
        {/* Left Section */}
        <div className="os-taskbar-left">
          <button
            className={`os-taskbar-btn ${isStartMenuOpen ? "active" : ""}`}
            onClick={toggleStartMenu}
            title="Start">
            <FaWindows />
          </button>

          <button
            className="os-taskbar-btn"
            onClick={toggleSearch}
            title="Search">
            <FaSearch />
          </button>
        </div>

        {/* Center Section - All Apps */}
        <div className="os-taskbar-center">
          {windows.map((window) => {
            const app = appRegistry.find((a) => a.id === window.appId);
            const isActive =
              window.id === activeWindowId && !window.isMinimized;

            return (
              <button
                key={window.id}
                className={`os-taskbar-btn ${isActive ? "active" : ""}`}
                onClick={() => {
                  if (isActive) {
                    minimizeWindow(window.id);
                  } else {
                    focusWindow(window.id);
                  }
                }}
                title={window.title}>
                <span>{app?.icon || "📱"}</span>
                <span className="hidden md:inline text-sm">{window.title}</span>
              </button>
            );
          })}
        </div>

        {/* Right Section - System Tray */}
        <div className="os-taskbar-right">
          <div className="os-system-tray hidden md:flex">
            <div className="os-system-icon" title="WiFi">
              <FaWifi />
            </div>
            <div
              className={`os-system-icon cursor-pointer ${
                showVolume ? "bg-white/20" : ""
              }`}
              title="Volume"
              onClick={() => {
                setShowVolume(!showVolume);
                setShowCalendar(false);
              }}>
              <FaVolumeUp />
            </div>
            <div className="os-system-icon" title="Battery">
              <FaBatteryFull />
            </div>
          </div>

          <div
            className={`os-clock cursor-pointer hover:bg-white/10 px-2 rounded ${
              showCalendar ? "bg-white/10" : ""
            }`}
            title="Date and Time"
            onClick={() => {
              setShowCalendar(!showCalendar);
              setShowVolume(false);
            }}>
            <div className="os-clock-time">{formatTime(currentTime)}</div>
            <div className="os-clock-date">{formatDate(currentTime)}</div>
          </div>
        </div>
      </div>

      {/* Popups */}
      {showCalendar && <CalendarPopup />}
      {showVolume && <VolumePopup />}
    </>
  );
};
