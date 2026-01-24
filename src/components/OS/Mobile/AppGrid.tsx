/** @format */

import React from "react";
import { appRegistry } from "@/utils/appRegistry";
import { useOS } from "@/contexts/OSContext";

export const AppGrid: React.FC = () => {
  const { openWindow } = useOS();

  return (
    <div className="grid grid-cols-4 gap-4 p-4 mt-8">
      {appRegistry.map((app) => {
        const IconComponent = app.icon;
        return (
          <div
            key={app.id}
            className="flex flex-col items-center space-y-2 cursor-pointer active:scale-95 transition-transform"
            onClick={() => openWindow(app.id, app.name)}>
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-3xl shadow-lg border border-white/20">
              <IconComponent />
            </div>
            <span className="text-xs text-white text-center font-medium drop-shadow-md truncate w-full">
              {app.name}
            </span>
          </div>
        );
      })}
    </div>
  );
};
