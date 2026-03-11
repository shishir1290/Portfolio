import {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
  RefObject,
} from "react";
import * as THREE from "three";

export interface WeatherConfig {
  name: string;
  sky: string;
  fogNear: number;
  fogFar: number;
  ambientIntensity: number;
  sunIntensity: number;
  sunColor: string;
  rain: boolean;
  snow: boolean;
  lightning: boolean;
  groundColor: string;
}

export interface Orb {
  id: number;
  x: number;
  z: number;
  collected: boolean;
}

export interface PlayerPos {
  x: number;
  y: number;
  z: number;
  ry: number;
}

export interface Activity {
  id: number;
  type: "campfire" | "well" | "chest" | "signpost";
  x: number;
  z: number;
  interacted: boolean;
  message?: string;
}

export interface Block {
  id: string;
  x: number;
  y: number;
  z: number;
  type: "wood" | "stone";
}

export interface RemotePlayer {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  z: number;
  ry: number;
  moving: boolean;
  sprinting: boolean;
  score: number;
}

export interface LeaderEntry {
  name: string;
  score: number;
  color: string;
}

export interface JoyInput {
  x: number;
  y: number;
}

export const WEATHERS: WeatherConfig[] = [
  {
    name: "CLEAR",
    sky: "#0a1628",
    fogNear: 25,
    fogFar: 80,
    ambientIntensity: 0.5,
    sunIntensity: 1.2,
    sunColor: "#ffe4b5",
    rain: false,
    snow: false,
    lightning: false,
    groundColor: "#0d1f10",
  },
  {
    name: "OVERCAST",
    sky: "#1a1f2e",
    fogNear: 15,
    fogFar: 50,
    ambientIntensity: 0.7,
    sunIntensity: 0.4,
    sunColor: "#c8d8e8",
    rain: false,
    snow: false,
    lightning: false,
    groundColor: "#0f1a0f",
  },
  {
    name: "RAIN",
    sky: "#0d1520",
    fogNear: 10,
    fogFar: 35,
    ambientIntensity: 0.4,
    sunIntensity: 0.2,
    sunColor: "#8899aa",
    rain: true,
    snow: false,
    lightning: false,
    groundColor: "#0b1408",
  },
  {
    name: "STORM",
    sky: "#060c14",
    fogNear: 8,
    fogFar: 25,
    ambientIntensity: 0.25,
    sunIntensity: 0.1,
    sunColor: "#6677aa",
    rain: true,
    snow: false,
    lightning: true,
    groundColor: "#080e08",
  },
  {
    name: "SNOW",
    sky: "#1e2535",
    fogNear: 12,
    fogFar: 40,
    ambientIntensity: 0.8,
    sunIntensity: 0.6,
    sunColor: "#ddeeff",
    rain: false,
    snow: true,
    lightning: false,
    groundColor: "#c8d8e0",
  },
  {
    name: "DUSK",
    sky: "#1a0e22",
    fogNear: 18,
    fogFar: 55,
    ambientIntensity: 0.35,
    sunIntensity: 0.9,
    sunColor: "#ff6030",
    rain: false,
    snow: false,
    lightning: false,
    groundColor: "#1a0d08",
  },
];

export const WEATHER_COLORS: Record<string, string> = {
  CLEAR: "#00f5d4",
  OVERCAST: "#aabbcc",
  RAIN: "#44aaff",
  STORM: "#ff4455",
  SNOW: "#c8e8ff",
  DUSK: "#ffaa33",
};

export const WEATHER_ICONS: Record<string, string> = {
  CLEAR: "☀",
  OVERCAST: "☁",
  RAIN: "🌧",
  STORM: "⛈",
  SNOW: "❄",
  DUSK: "🌅",
};

export const WEATHER_DESC: Record<string, string> = {
  CLEAR: "Clear night sky",
  OVERCAST: "Heavy cloud cover",
  RAIN: "Steady rainfall",
  STORM: "Violent thunderstorm",
  SNOW: "Silent snowfall",
  DUSK: "Golden hour dusk",
};

export const ORB_COLORS: Record<string, [string, string]> = {
  CLEAR: ["#00f5d4", "#00f5d4"],
  OVERCAST: ["#8888ff", "#6666dd"],
  RAIN: ["#44aaff", "#2288dd"],
  STORM: ["#ff4455", "#cc2233"],
  SNOW: ["#aaddff", "#88bbee"],
  DUSK: ["#ffaa33", "#ff6600"],
};

export const DAY_CYCLE = 120;
export const GRID_SIZE = 1.5;

export function interpolateColor(a: string, b: string, t: number): string {
  const parse = (h: string) => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
  const ca = parse(a),
    cb = parse(b);
  return `rgb(${Math.round(ca[0] + (cb[0] - ca[0]) * t)},${Math.round(ca[1] + (cb[1] - ca[1]) * t)},${Math.round(ca[2] + (cb[2] - ca[2]) * t)})`;
}

export function getSkyColor(t: number): string {
  if (t < 0.2) return interpolateColor("#020510", "#0a1628", t / 0.2);
  if (t < 0.28) return interpolateColor("#0a1628", "#ff8844", (t - 0.2) / 0.08);
  if (t < 0.4) return interpolateColor("#ff8844", "#87ceeb", (t - 0.28) / 0.12);
  if (t < 0.6) return interpolateColor("#87ceeb", "#4a90d9", (t - 0.4) / 0.2);
  if (t < 0.7) return interpolateColor("#4a90d9", "#ff6030", (t - 0.6) / 0.1);
  if (t < 0.78) return interpolateColor("#ff6030", "#1a0e22", (t - 0.7) / 0.08);
  return interpolateColor("#1a0e22", "#020510", (t - 0.78) / 0.22);
}

export function getSunPosition(t: number): [number, number, number] {
  const angle = (t - 0.25) * Math.PI * 2;
  return [Math.cos(angle) * 80, Math.sin(angle) * 80, -60];
}

export function getSunColor(t: number): string {
  if (t < 0.2 || t > 0.82) return "#2244aa";
  if (t < 0.28 || t > 0.75) return "#ff8833";
  if (t < 0.35 || t > 0.68) return "#ffcc66";
  return "#fffaee";
}

export function getSunIntensity(t: number): number {
  if (t < 0.22 || t > 0.8) return 0.05;
  if (t < 0.28 || t > 0.74) return 0.6;
  if (t < 0.35 || t > 0.67) return 1.0;
  return 1.4;
}

export function getAmbientIntensity(t: number): number {
  if (t < 0.2 || t > 0.82) return 0.08;
  if (t < 0.28 || t > 0.75) return 0.35;
  return 0.55;
}
