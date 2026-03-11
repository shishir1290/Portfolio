"use client";

import React, { useState, useRef, useMemo, useCallback } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  WEATHERS,
  Orb,
  Activity,
  Block,
  PlayerPos,
  JoyInput,
  GRID_SIZE,
} from "./types";
import {
  DynamicSkyAmbient,
  DynamicSun,
  Ground,
  Trees,
  Rocks,
  Campfire,
  Well,
  Chest,
  Signpost,
  OrbMesh,
  Rain,
  Stars,
  Snow,
  Lightning,
} from "./Environment";
import { Character } from "./PlayerCharacter";
import { TimeDisplay, HUD, Minimap, Leaderboard } from "./UI";
import { FPSController } from "./FPSController";
import { useMultiplayer } from "./useMultiplayer";

function CameraTracker({
  playerPosRef,
}: {
  playerPosRef: React.MutableRefObject<PlayerPos>;
}) {
  const { gl } = useThree();
  useFrame(() => {
    if (gl.domElement) {
      gl.domElement.dataset.px = playerPosRef.current.x.toFixed(1);
      gl.domElement.dataset.pz = playerPosRef.current.z.toFixed(1);
    }
  });
  return null;
}

function useDayNight() {
  const timeRef = useRef(0.42);
  const [timeOfDay, setTimeOfDay] = useState(0.42);
  const [paused, setPaused] = useState(true);

  React.useEffect(() => {
    let last = performance.now();
    let raf: number;
    const tick = (now: number) => {
      if (!paused) {
        timeRef.current = (timeRef.current + (now - last) / 1000 / 120) % 1;
        setTimeOfDay(timeRef.current);
      }
      last = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused]);

  return { timeOfDay, timeRef, paused, setPaused };
}

export default function WalkingExplorer() {
  const [weatherIdx, setWeatherIdx] = useState(0);
  const weather = WEATHERS[weatherIdx];

  const [orbs, setOrbs] = useState<Orb[]>([]);
  const [collected, setCollected] = useState(0);
  const [interactHint, setInteractHint] = useState("");
  const [activities, setActivities] = useState<Activity[]>([
    { id: 0, type: "campfire", x: 10, z: 10, interacted: false },
    { id: 1, type: "well", x: -15, z: 20, interacted: false },
    { id: 2, type: "chest", x: 25, z: -5, interacted: false },
    {
      id: 3,
      type: "signpost",
      x: -20,
      z: -20,
      interacted: false,
      message: "Welcome to the wilderness!",
    },
  ]);
  const [wood, setWood] = useState(10); // Start with some wood for testing
  const [stone, setStone] = useState(0);
  const [harvestedTrees, setHarvestedTrees] = useState<Set<number>>(new Set());
  const [harvestedRocks, setHarvestedRocks] = useState<Set<number>>(new Set());
  const [placedBlocks, setPlacedBlocks] = useState<Block[]>([]);

  const treeData = useMemo(
    () =>
      Array.from({ length: 50 }).map((_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 160,
        z: (Math.random() - 0.5) * 160,
        h: 2.5 + Math.random() * 5,
        r: 0.8 + Math.random() * 0.8,
        layers: 2,
        type: "pine",
        ry: Math.random() * Math.PI * 2,
      })),
    [],
  );

  const rockData = useMemo(
    () =>
      Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 160,
        z: (Math.random() - 0.5) * 160,
        r: 0.5 + Math.random() * 1.5,
        type: "rock",
        ry: Math.random() * Math.PI * 2,
      })),
    [],
  );

  const playerPosRef = useRef<PlayerPos>({ x: 0, y: 0, z: 0, ry: 0 });
  const movingRef = useRef(false);
  const sprintingRef = useRef(false);
  const moveJoyRef = useRef<JoyInput>({ x: 0, y: 0 });
  const lookJoyRef = useRef<JoyInput>({ x: 0, y: 0 });

  const { timeOfDay, timeRef, paused, setPaused } = useDayNight();
  const { others } = useMultiplayer(
    playerPosRef,
    movingRef,
    sprintingRef,
    collected,
  );

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "#000",
        overflow: "hidden",
      }}
    >
      <Canvas shadows camera={{ fov: 62, near: 0.1, far: 220 }}>
        <DynamicSkyAmbient timeRef={timeRef} weatherName={weather.name} />
        <DynamicSun timeRef={timeRef} weatherName={weather.name} />
        <Stars timeRef={timeRef} />
        <Lightning active={weather.lightning} />
        <Rain active={weather.rain} />
        <Snow active={weather.snow} />
        <Ground timeRef={timeRef} weatherName={weather.name} />
        <Trees
          weatherName={weather.name}
          data={treeData}
          harvested={harvestedTrees}
        />
        <Rocks data={rockData} harvested={harvestedRocks} />

        {activities.map((a) => {
          if (a.type === "campfire") return <Campfire key={a.id} {...a} />;
          if (a.type === "well") return <Well key={a.id} {...a} />;
          if (a.type === "chest") return <Chest key={a.id} {...a} />;
          if (a.type === "signpost") return <Signpost key={a.id} {...a} />;
          return null;
        })}

        {orbs.map((o) => (
          <OrbMesh key={o.id} {...o} weatherName={weather.name} />
        ))}

        {placedBlocks.map((b) => (
          <mesh
            key={b.id}
            position={[b.x, b.y + GRID_SIZE / 2, b.z]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[GRID_SIZE, GRID_SIZE, GRID_SIZE]} />
            <meshStandardMaterial
              color={b.type === "wood" ? "#5d4037" : "#757575"}
            />
          </mesh>
        ))}

        <Character
          playerPosRef={playerPosRef}
          movingRef={movingRef}
          sprintingRef={sprintingRef}
        />
        {Array.from(others.values()).map((p) => (
          <Character
            key={p.id}
            playerPosRef={{ current: p } as any}
            movingRef={{ current: p.moving } as any}
            sprintingRef={{ current: p.sprinting } as any}
            name={p.name}
            color={p.color}
          />
        ))}

        <FPSController
          orbs={orbs}
          setOrbs={setOrbs}
          setCollected={setCollected}
          activities={activities}
          setActivities={setActivities}
          playerPosRef={playerPosRef}
          movingRef={movingRef}
          sprintingRef={sprintingRef}
          setInteractHint={setInteractHint}
          moveJoyRef={moveJoyRef}
          lookJoyRef={lookJoyRef}
          trees={treeData}
          rocks={rockData}
          harvestedTrees={harvestedTrees}
          setHarvestedTrees={setHarvestedTrees}
          harvestedRocks={harvestedRocks}
          setHarvestedRocks={setHarvestedRocks}
          wood={wood}
          setWood={setWood}
          stone={stone}
          setStone={setStone}
          placedBlocks={placedBlocks}
          setPlacedBlocks={setPlacedBlocks}
        />
        <CameraTracker playerPosRef={playerPosRef} />
      </Canvas>

      <TimeDisplay
        timeOfDay={timeOfDay}
        paused={paused}
        onToggle={() => setPaused(!paused)}
      />
      <HUD
        collected={collected}
        total={orbs.length}
        weather={weather}
        onWeatherChange={setWeatherIdx}
        interactHint={interactHint}
        activitiesDone={activities.filter((a) => a.interacted).length}
        totalActivities={activities.length}
        wood={wood}
        stone={stone}
      />
      <Minimap
        playerPosRef={playerPosRef}
        orbs={orbs}
        weatherName={weather.name}
        activities={activities}
        others={others}
      />
      <Leaderboard entries={[]} myName={""} />
    </div>
  );
}
