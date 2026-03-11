import React from "react";
import {
  WEATHER_COLORS,
  WEATHER_ICONS,
  WEATHER_DESC,
  WEATHERS,
  LeaderEntry,
} from "./types";

// --- TimeDisplay ---
export const TimeDisplay = ({
  timeOfDay,
  paused,
  onToggle,
}: {
  timeOfDay: number;
  paused: boolean;
  onToggle: () => void;
}) => {
  const h = Math.floor(timeOfDay * 24),
    m = Math.floor((timeOfDay * 24 * 60) % 60);
  const phase =
    timeOfDay < 0.22
      ? "MIDNIGHT"
      : timeOfDay < 0.32
        ? "DAWN"
        : timeOfDay < 0.6
          ? "DAY"
          : timeOfDay < 0.78
            ? "DUSK"
            : "NIGHT";
  const phaseColors: Record<string, string> = {
    MIDNIGHT: "#4466ff",
    DAWN: "#ff8833",
    DAY: "#ffe066",
    DUSK: "#ff5522",
    NIGHT: "#6688cc",
  };
  const pc = phaseColors[phase] ?? "#fff";

  return (
    <div
      style={{
        position: "absolute",
        top: 68,
        left: 20,
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 20,
            fontWeight: "bold",
            color: pc,
            textShadow: `0 0 14px ${pc}`,
            letterSpacing: 2,
          }}
        >
          {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}
        </div>
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 8,
            color: `${pc}77`,
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          {phase}
        </div>
        <button
          onClick={onToggle}
          style={{
            fontFamily: "monospace",
            fontSize: 8,
            color: "rgba(255,255,255,0.28)",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 2,
            padding: "2px 6px",
            cursor: "pointer",
          }}
        >
          {paused ? "▶" : "⏸"}
        </button>
      </div>
      <div
        style={{
          width: 120,
          height: 3,
          background: "rgba(255,255,255,0.06)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${timeOfDay * 100}%`,
            background: `linear-gradient(to right,#4466ff,#ff8833,${pc},#ff5522,#4466ff)`,
          }}
        />
      </div>
    </div>
  );
};

// --- HUD ---
export const HUD = ({
  collected,
  total,
  weather,
  onWeatherChange,
  interactHint,
  activitiesDone,
  totalActivities,
  wood,
  stone,
  myName,
  myColor,
}: any) => {
  const pct = (collected % 10) * 10;
  const accent = WEATHER_COLORS[weather.name] ?? "#00f5d4";

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 58,
          background: "linear-gradient(to bottom,rgba(0,0,0,0.78),transparent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontFamily: "monospace",
            color: "rgba(255,255,255,0.4)",
            fontSize: 9,
            letterSpacing: 6,
          }}
        >
          EXPLORER III
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              fontFamily: "monospace",
              color: accent,
              fontSize: 11,
              letterSpacing: 2,
            }}
          >
            ◆ SCORE <b>{collected}</b>
          </div>
          <div
            style={{
              fontFamily: "monospace",
              color: "rgba(255,255,255,0.6)",
              fontSize: 10,
            }}
          >
            ◆<span style={{ color: accent }}>{collected}</span>/{total}
          </div>
          <div
            style={{
              fontFamily: "monospace",
              color: "rgba(255,255,255,0.6)",
              fontSize: 10,
            }}
          >
            ⚑<span style={{ color: "#ffaa33" }}>{activitiesDone}</span>/
            {totalActivities}
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 58,
          left: 0,
          right: 0,
          height: 2,
          background: "rgba(255,255,255,0.04)",
          zIndex: 10,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: accent,
            boxShadow: `0 0 8px ${accent}`,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          top: 75,
          right: 20,
          display: "flex",
          flexDirection: "column",
          gap: 4,
          zIndex: 10,
        }}
      >
        {WEATHERS.map((w, i) => (
          <button
            key={w.name}
            onClick={() => onWeatherChange(i)}
            style={{
              width: 30,
              height: 30,
              borderRadius: 4,
              background:
                weather.name === w.name
                  ? `${WEATHER_COLORS[w.name]}22`
                  : "rgba(0,0,0,0.45)",
              color:
                weather.name === w.name
                  ? WEATHER_COLORS[w.name]
                  : "rgba(255,255,255,0.32)",
              border: "1px solid rgba(255,255,255,0.07)",
              cursor: "pointer",
            }}
          >
            {WEATHER_ICONS[w.name]}
          </button>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            border: `1px solid ${accent}66`,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 4,
              height: 4,
              background: accent,
              borderRadius: "50%",
            }}
          />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 80,
          right: 60,
          display: "flex",
          flexDirection: "column",
          gap: 6,
          zIndex: 10,
        }}
      >
        <div
          style={{
            background: "rgba(0,0,0,0.5)",
            padding: "8px 12px",
            borderRadius: 4,
            color: "#fff",
            fontSize: 10,
            fontFamily: "monospace",
          }}
        >
          🪵 {wood} Wood
        </div>
        <div
          style={{
            background: "rgba(0,0,0,0.5)",
            padding: "8px 12px",
            borderRadius: 4,
            color: "#fff",
            fontSize: 10,
            fontFamily: "monospace",
          }}
        >
          🪨 {stone} Stone
        </div>
      </div>
      {interactHint && (
        <div
          style={{
            position: "absolute",
            bottom: 150,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.65)",
            color: "#fff",
            padding: "8px 20px",
            borderRadius: 3,
            fontSize: 10,
            zIndex: 10,
          }}
        >
          {interactHint}
        </div>
      )}

      {myName && (
        <div
          style={{
            position: "absolute",
            top: 10,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 15,
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 20,
            padding: "3px 12px 3px 8px",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: myColor,
            }}
          />
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 10,
              color: "#fff",
              letterSpacing: 1,
            }}
          >
            {myName}
          </span>
        </div>
      )}
    </>
  );
};

// --- Minimap ---
export const Minimap = ({
  playerPosRef,
  orbs,
  weatherName,
  activities,
  others,
}: any) => {
  const mapSize = 120;
  const worldSize = 200; // Total world reach (-100 to 100)
  const scale = mapSize / worldSize;
  const orbColor = WEATHER_COLORS[weatherName] ?? "#00f5d4";

  return (
    <div
      style={{
        position: "absolute",
        bottom: 24,
        right: 24,
        width: mapSize,
        height: mapSize,
        background: "rgba(2,6,16,0.92)",
        backdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 6,
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      }}
    >
      {/* Orbs */}
      {orbs.map(
        (o: any) =>
          !o.collected && (
            <div
              key={o.id}
              style={{
                position: "absolute",
                left: (o.x + 100) * scale,
                top: (o.z + 100) * scale,
                width: 3,
                height: 3,
                background: orbColor,
                borderRadius: "50%",
                boxShadow: `0 0 4px ${orbColor}`,
              }}
            />
          ),
      )}
      {/* Activities */}
      {activities.map(
        (a: any) =>
          !a.interacted && (
            <div
              key={a.id}
              style={{
                position: "absolute",
                left: (a.x + 100) * scale,
                top: (a.z + 100) * scale,
                width: 4,
                height: 4,
                background: "#ffaa33",
                border: "1px solid #fff",
                transform: "rotate(45deg)",
              }}
            />
          ),
      )}
      {/* Other Players */}
      {Array.from(others.values()).map((p: any) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: (p.x + 100) * scale,
            top: (p.z + 100) * scale,
            width: 5,
            height: 5,
            background: p.color || "#ff4455",
            borderRadius: "50%",
            border: "1px solid #fff",
          }}
        />
      ))}
      {/* Local Player */}
      <div
        style={{
          position: "absolute",
          left: (playerPosRef.current.x + 100) * scale,
          top: (playerPosRef.current.z + 100) * scale,
          width: 6,
          height: 6,
          background: "#fff",
          borderRadius: "50%",
          border: "1px solid #00f5d4",
          transform: "translate(-50%,-50%)",
          zIndex: 10,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -8,
            left: 2,
            width: 2,
            height: 8,
            background: "#00f5d4",
            transform: `rotate(${-playerPosRef.current.ry}rad)`,
            transformOrigin: "bottom center",
          }}
        />
      </div>
    </div>
  );
};

// --- Leaderboard ---
export const Leaderboard = ({
  entries,
  myName,
}: {
  entries: LeaderEntry[];
  myName: string;
}) => {
  if (entries.length === 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: 80,
        left: 20,
        zIndex: 15,
        background: "rgba(2,6,16,0.88)",
        padding: "10px 14px",
        borderRadius: 4,
        minWidth: 150,
      }}
    >
      {entries.map((e, i) => (
        <div
          key={e.name}
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 9,
            color: e.name === myName ? "#fff" : "#888",
          }}
        >
          <span>
            {i + 1}. {e.name}
          </span>
          <span>{e.score}</span>
        </div>
      ))}
    </div>
  );
};

// --- TouchControls ---
export const TouchControls = ({ moveJoyRef, lookJoyRef }: any) => {
  return null;
};
