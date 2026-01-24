/** @format */

import React, { useState } from "react";
import { StatusBar } from "./StatusBar";
import { NavigationBar } from "./NavigationBar";
import { AppGrid } from "./AppGrid";
import { useOS } from "@/contexts/OSContext";
import { appRegistry } from "@/utils/appRegistry";

// Import app components
import { AboutMeApp } from "../Apps/AboutMeApp";
import { ProjectsApp } from "../Apps/ProjectsApp";
import { SkillsApp } from "../Apps/SkillsApp";
import { ContactApp } from "../Apps/ContactApp";
import { ResumeApp } from "../Apps/ResumeApp";
import { GalleryApp } from "../Apps/GalleryApp";
import { SettingsApp } from "../Apps/SettingsApp";
import { ClockApp } from "../Apps/ClockApp";
import { CalendarApp } from "../Apps/CalendarApp";
import { CalculatorApp } from "../Apps/CalculatorApp";
import { TicTacToeApp } from "../Apps/TicTacToeApp";
import { RPSApp } from "../Apps/RPSApp";
import { SnakeApp } from "../Apps/SnakeApp";
import { TetrisApp } from "../Apps/TetrisApp";
import { NotesApp } from "../Apps/NotesApp";

const appComponents: { [key: string]: React.FC } = {
  AboutMeApp,
  ProjectsApp,
  SkillsApp,
  ContactApp,
  ResumeApp,
  GalleryApp,
  SettingsApp,
  ClockApp,
  CalendarApp,
  CalculatorApp,
  TicTacToeApp,
  RPSApp,
  SnakeApp,
  TetrisApp,
  NotesApp,
};

interface MobileDesktopProps {
  backgroundImage: string;
}

export const MobileDesktop: React.FC<MobileDesktopProps> = ({
  backgroundImage,
}) => {
  const { windows, activeWindowId, closeWindow } = useOS();

  // Get the active window (simulating single-tasking mobile behavior for now, or z-index layering)
  // For mobile, we usually show the top-most window full screen.
  const activeWindow =
    windows.find((w) => w.id === activeWindowId) || windows[windows.length - 1];

  const handleHome = () => {
    // Minimize all or just go back to grid?
    // For simplicity, let's just close the active window or "minimize" it.
    // In a real OS, we'd keep state. Here, let's just show the grid if no window is active.
    if (activeWindow) {
      closeWindow(activeWindow.id);
    }
  };

  const handleBack = () => {
    if (activeWindow) {
      closeWindow(activeWindow.id);
    }
  };

  return (
    <div
      className="fixed inset-0 overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage: `url('${backgroundImage}')`,
      }}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20" />

      <StatusBar />

      {/* Main Content Area */}
      <div className="absolute inset-0 pt-8 pb-12 overflow-y-auto scrollbar-hide">
        {!activeWindow ? (
          <AppGrid />
        ) : (
          // Render Active App Full Screen
          <div className="w-full h-full bg-slate-900 text-white animate-in slide-in-from-bottom duration-300">
            {(() => {
              const app = appRegistry.find((a) => a.id === activeWindow.appId);
              const AppComponent = app ? appComponents[app.component] : null;
              return AppComponent ? <AppComponent /> : null;
            })()}
          </div>
        )}
      </div>

      <NavigationBar onHome={handleHome} onBack={handleBack} />
    </div>
  );
};
