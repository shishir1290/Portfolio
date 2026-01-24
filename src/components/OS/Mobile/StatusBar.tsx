/** @format */

import React, { useState, useEffect } from "react";
import { FaWifi, FaSignal, FaBatteryFull } from "react-icons/fa";

export const StatusBar: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
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

  return (
    <div className="w-full h-8 bg-black/20 backdrop-blur-md flex justify-between items-center px-4 text-white text-xs z-50 fixed top-0 left-0 right-0">
      <div className="font-medium">{formatTime(time)}</div>
      <div className="flex items-center space-x-2">
        <FaSignal />
        <FaWifi />
        <FaBatteryFull />
      </div>
    </div>
  );
};
