/** @format */

import React from "react";
import { useOS } from "@/contexts/OSContext";
import { appRegistry } from "@/utils/appRegistry";
import Image from "next/image";

export const StartMenu: React.FC = () => {
  const { isStartMenuOpen, setStartMenuOpen, openWindow, shutdown } = useOS();

  if (!isStartMenuOpen) return null;

  const handleBackdropClick = () => {
    setStartMenuOpen(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[9998]" onClick={handleBackdropClick} />

      {/* Start Menu */}
      <div className="fixed bottom-12 left-4 w-80 bg-black/80 backdrop-blur-md rounded-lg border border-white/10 shadow-2xl text-white overflow-hidden z-[9999] animate-in slide-in-from-bottom-5 fade-in duration-200">
        {/* Profile Section */}
        <div
          className="p-4 border-b border-white/10 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors"
          onClick={() => {
            openWindow("about", "About Me", { width: 800, height: 600 });
            setStartMenuOpen(false);
          }}>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-500 relative">
            <Image
              src="/images/profile.jpg"
              alt="Profile"
              fill
              className="object-cover"
              onError={(e) => {
                // Fallback if image fails
                (e.target as HTMLImageElement).src =
                  "https://ui-avatars.com/api/?name=User&background=random";
              }}
            />
          </div>
          <div>
            <h3 className="font-medium text-sm">Shishir</h3>
            <p className="text-xs text-white/50">Full Stack Developer</p>
          </div>
        </div>

        {/* App Grid */}
        <div className="p-4 grid grid-cols-4 gap-4 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {appRegistry.map((app) => (
            <button
              key={app.id}
              className="flex flex-col items-center gap-2 group"
              onClick={() => {
                openWindow(app.id, app.name, app.defaultSize);
                setStartMenuOpen(false);
              }}>
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-2xl group-hover:bg-white/20 transition-colors">
                {app.icon}
              </div>
              <span className="text-[10px] text-white/70 group-hover:text-white text-center truncate w-full">
                {app.name}
              </span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 p-4">
          <div className="flex justify-between items-center">
            <button
              className="text-white/70 hover:text-white text-sm transition-colors flex items-center gap-2"
              onClick={() => {
                openWindow("settings", "Settings", { width: 600, height: 500 });
                setStartMenuOpen(false);
              }}>
              <span>⚙️</span> Settings
            </button>
            <button
              className="text-white/70 hover:text-white text-sm transition-colors flex items-center gap-2"
              onClick={() => {
                shutdown();
              }}>
              <span>🔌</span> Power
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
