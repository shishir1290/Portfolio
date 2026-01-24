/** @format */

import React from "react";
import { IoTriangle, IoEllipse, IoSquare } from "react-icons/io5";

interface NavigationBarProps {
  onHome: () => void;
  onBack: () => void;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  onHome,
  onBack,
}) => {
  return (
    <div className="w-full h-12 bg-black/80 backdrop-blur-md flex justify-around items-center text-white/70 z-50 fixed bottom-0 left-0 right-0">
      <button
        onClick={onBack}
        className="p-2 active:bg-white/10 rounded-full transition-colors transform -rotate-90">
        <IoTriangle size={18} />
      </button>
      <button
        onClick={onHome}
        className="p-2 active:bg-white/10 rounded-full transition-colors">
        <IoEllipse size={18} />
      </button>
      <button className="p-2 active:bg-white/10 rounded-full transition-colors">
        <IoSquare size={18} />
      </button>
    </div>
  );
};
