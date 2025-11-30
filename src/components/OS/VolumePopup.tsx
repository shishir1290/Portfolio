/** @format */

import React, { useState } from "react";
import {
  FaVolumeUp,
  FaVolumeMute,
  FaVolumeDown,
  FaVolumeOff,
} from "react-icons/fa";
import { useOS } from "@/contexts/OSContext";

export const VolumePopup: React.FC = () => {
  const { volume, setVolume } = useOS();

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
  };

  const getVolumeIcon = () => {
    if (volume === 0) return <FaVolumeMute />;
    if (volume < 30) return <FaVolumeOff />;
    if (volume < 70) return <FaVolumeDown />;
    return <FaVolumeUp />;
  };

  return (
    <div className="absolute bottom-14 right-12 w-20 h-64 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-4 flex flex-col items-center justify-between animate-in slide-in-from-bottom-5 fade-in duration-200 z-[9999] overflow-hidden group">
      {/* Volume Percentage */}
      <div className="text-white/90 font-medium text-sm mb-2">{volume}%</div>

      {/* Slider Container */}
      <div className="relative h-40 w-full flex items-center justify-center">
        {/* Background Track */}
        <div className="absolute w-2 h-full bg-white/10 rounded-full" />

        {/* Active Track (Visual only, height based on volume) */}
        <div
          className="absolute bottom-0 w-2 bg-blue-500 rounded-full transition-all duration-100 ease-out group-hover:bg-blue-400"
          style={{ height: `${volume}%` }}
        />

        {/* Hidden Input Range */}
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
          className="absolute w-40 h-20 -rotate-90 opacity-0 cursor-pointer"
          style={{ width: "160px", height: "40px" }} // Adjust dimensions to cover the visual track
        />
      </div>

      {/* Icon */}
      <div className="mt-4 text-white/90 text-xl transition-transform duration-200 group-hover:scale-110">
        {getVolumeIcon()}
      </div>
    </div>
  );
};
