/** @format */

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useOS } from "@/contexts/OSContext";

interface LockScreenProps {
  onUnlock: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const { playSound } = useOS();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isUnlocking, setIsUnlocking] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleUnlock = () => {
    setIsUnlocking(true);
    playSound("login");
    setTimeout(() => {
      onUnlock();
    }, 500);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-cover bg-center transition-all duration-500 ${
        isUnlocking ? "opacity-0 scale-110" : "opacity-100 scale-100"
      }`}
      style={{
        backgroundImage: "url('/image/shishir.png')", // Using user image as background with blur
      }}
      onClick={handleUnlock}>
      {/* Backdrop Blur Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white space-y-8 animate-in fade-in zoom-in duration-500">
        {/* Time and Date */}
        <div className="text-center mb-12">
          <h1 className="text-8xl font-thin tracking-tighter mb-4 drop-shadow-lg">
            {formatTime(currentTime)}
          </h1>
          <p className="text-2xl font-light drop-shadow-md">
            {formatDate(currentTime)}
          </p>
        </div>

        {/* User Profile */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 rounded-full border-4 border-white/20 p-1 relative overflow-hidden shadow-2xl">
            <Image
              src="/image/shishir.png"
              alt="User"
              fill
              className="object-cover rounded-full"
            />
          </div>
          <h2 className="text-3xl font-medium tracking-wide drop-shadow-md">
            Shishir
          </h2>
          <p className="text-white/70 text-sm">Click to unlock</p>
        </div>
      </div>
    </div>
  );
};
