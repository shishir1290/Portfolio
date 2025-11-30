/** @format */

import React from "react";
import { useWindowManager } from "@/hooks/useWindowManager";
import { useOS } from "@/contexts/OSContext";
import { Window } from "./Window";
import { Taskbar } from "./Taskbar";
import { StartMenu } from "./StartMenu";
import { SearchBar } from "./SearchBar";
import { LockScreen } from "./LockScreen";

import { BootScreen } from "./BootScreen";
import { DesktopIcon } from "./DesktopIcon";
import { ShutdownScreen } from "./ShutdownScreen";
import { appRegistry } from "@/utils/appRegistry";

// Import app components
import { AboutMeApp } from "./Apps/AboutMeApp";
import { ProjectsApp } from "./Apps/ProjectsApp";
import { SkillsApp } from "./Apps/SkillsApp";
import { ContactApp } from "./Apps/ContactApp";
import { ResumeApp } from "./Apps/ResumeApp";
import { GalleryApp } from "./Apps/GalleryApp";
import { SettingsApp } from "./Apps/SettingsApp";
import { ClockApp } from "./Apps/ClockApp";
import { CalendarApp } from "./Apps/CalendarApp";
import { CalculatorApp } from "./Apps/CalculatorApp";
import { TicTacToeApp } from "./Apps/TicTacToeApp";
import { RPSApp } from "./Apps/RPSApp";
import { SnakeApp } from "./Apps/SnakeApp";
import { TetrisApp } from "./Apps/TetrisApp";
import { NotesApp } from "./Apps/NotesApp";

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

interface DesktopProps {
  backgroundImage: string;
}

export const Desktop: React.FC<DesktopProps> = ({ backgroundImage }) => {
  const { getVisibleWindows } = useWindowManager();
  const {
    isBooting,
    isShuttingDown,
    setBooting,
    iconPositions,
    updateIconPosition,
    openWindow,
  } = useOS();
  const visibleWindows = getVisibleWindows();
  const [isLocked, setIsLocked] = React.useState(true);
  const [typewriterText, setTypewriterText] = React.useState("");
  const titles = ["Full Stack Developer", "UI/UX Designer", "Creative Coder"];

  React.useEffect(() => {
    let currentTitleIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let timeoutId: NodeJS.Timeout;

    const type = () => {
      const currentTitle = titles[currentTitleIndex];

      if (isDeleting) {
        setTypewriterText(currentTitle.substring(0, currentCharIndex - 1));
        currentCharIndex--;
      } else {
        setTypewriterText(currentTitle.substring(0, currentCharIndex + 1));
        currentCharIndex++;
      }

      let typeSpeed = 100;
      if (isDeleting) typeSpeed /= 2;

      if (!isDeleting && currentCharIndex === currentTitle.length) {
        typeSpeed = 2000; // Pause at end
        isDeleting = true;
      } else if (isDeleting && currentCharIndex === 0) {
        isDeleting = false;
        currentTitleIndex = (currentTitleIndex + 1) % titles.length;
        typeSpeed = 500; // Pause before new word
      }

      timeoutId = setTimeout(type, typeSpeed);
    };

    timeoutId = setTimeout(type, 1000);

    return () => clearTimeout(timeoutId);
  }, []);

  const handleBootComplete = () => {
    setBooting(false);
  };

  const handleUnlock = () => {
    setIsLocked(false);
  };

  // ... (handlers remain same)

  if (isShuttingDown) {
    return <ShutdownScreen />;
  }

  return (
    <>
      {/* Boot Screen */}
      {isBooting && <BootScreen onBootComplete={handleBootComplete} />}

      {/* Lock Screen */}
      {!isBooting && isLocked && <LockScreen onUnlock={handleUnlock} />}

      {/* Desktop Background */}
      <div
        className="os-desktop relative overflow-hidden"
        style={{
          // Removed user image from background as requested
          background:
            "linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)",
          backgroundSize: "cover",
        }}>
        {/* Overlay for better text visibility */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Split Layout Content */}
        <div className="absolute inset-0 flex items-center justify-between px-20 z-0 pointer-events-none">
          {/* Left Side: Text */}
          <div className="flex flex-col text-white space-y-4 max-w-2xl">
            <h1 className="text-8xl font-bold tracking-tighter drop-shadow-2xl animate-in slide-in-from-left-10 fade-in duration-1000">
              SHISHIR
            </h1>
            <div className="text-3xl font-light text-blue-300 h-10 flex items-center">
              <span className="typewriter-text">{typewriterText}</span>
              <span className="animate-pulse ml-1">|</span>
            </div>
          </div>

          {/* Right Side: Image - Increased size */}
          <div className="relative w-[700px] h-[800px] animate-in slide-in-from-right-10 fade-in duration-1000 delay-300">
            <div
              className="w-full h-full bg-contain bg-no-repeat bg-center drop-shadow-2xl"
              style={{ backgroundImage: "url('/image/shishir.png')" }}
            />
          </div>
        </div>
        <div className="relative z-10 w-full h-full">
          {visibleWindows.map((window) => {
            const app = appRegistry.find((a) => a.id === window.appId);
            const AppComponent = app ? appComponents[app.component] : null;

            return (
              <Window
                key={window.id}
                windowId={window.id}
                title={window.title}
                icon={app?.icon}>
                {AppComponent ? (
                  <AppComponent />
                ) : (
                  <div className="p-4">App not found</div>
                )}
              </Window>
            );
          })}
        </div>
      </div>

      {/* OS UI Components */}
      {!isLocked && !isBooting && (
        <>
          <Taskbar />
          <StartMenu />
          <SearchBar />
        </>
      )}
    </>
  );
};
