/** @format */

import React, { useState } from "react";

export const CalendarPopup: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const renderCalendarDays = () => {
    const days = [];
    const totalDays = daysInMonth(currentDate);
    const firstDay = firstDayOfMonth(currentDate);
    const today = new Date();

    // Empty cells for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
    }

    // Days of the month
    for (let i = 1; i <= totalDays; i++) {
      const isToday =
        i === today.getDate() &&
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear();

      days.push(
        <div
          key={i}
          className={`w-8 h-8 flex items-center justify-center text-sm rounded-full cursor-pointer hover:bg-white/10 transition-colors ${
            isToday ? "bg-blue-500 text-white font-bold" : "text-white/90"
          }`}>
          {i}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="absolute bottom-14 right-0 w-80 bg-black/80 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl p-4 animate-in slide-in-from-bottom-5 fade-in duration-200 z-[9999]">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 text-white">
        <h3 className="font-medium text-lg">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className="flex gap-2">
          <button
            className="p-1 hover:bg-white/10 rounded"
            onClick={() =>
              setCurrentDate(
                new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
              )
            }>
            ←
          </button>
          <button
            className="p-1 hover:bg-white/10 rounded"
            onClick={() =>
              setCurrentDate(
                new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
              )
            }>
            →
          </button>
        </div>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 gap-1 mb-2 text-center">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} className="text-xs text-white/50 font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {renderCalendarDays()}
      </div>

      {/* Current Date Display */}
      <div className="mt-4 pt-4 border-t border-white/10 text-white">
        <div className="text-3xl font-light">
          {currentDate.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </div>
        <div className="text-blue-400 text-sm">
          {currentDate.toLocaleDateString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>
    </div>
  );
};
