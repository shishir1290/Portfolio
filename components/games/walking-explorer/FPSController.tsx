import React, { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PlayerPos, JoyInput, Orb, Activity, Block, GRID_SIZE } from "./types";

interface FPSProps {
  orbs: Orb[];
  setOrbs: React.Dispatch<React.SetStateAction<Orb[]>>;
  setCollected: React.Dispatch<React.SetStateAction<number>>;
  activities: Activity[];
  setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
  playerPosRef: React.MutableRefObject<PlayerPos>;
  movingRef: React.MutableRefObject<boolean>;
  sprintingRef: React.MutableRefObject<boolean>;
  setInteractHint: (v: string) => void;
  moveJoyRef: React.RefObject<JoyInput>;
  lookJoyRef: React.RefObject<JoyInput>;
  trees: any[];
  setTrees: React.Dispatch<React.SetStateAction<any[]>>;
  rocks: any[];
  setRocks: React.Dispatch<React.SetStateAction<any[]>>;
  harvestedTrees: Set<number>;
  setHarvestedTrees: React.Dispatch<React.SetStateAction<Set<number>>>;
  harvestedRocks: Set<number>;
  setHarvestedRocks: React.Dispatch<React.SetStateAction<Set<number>>>;
  wood: number;
  setWood: React.Dispatch<React.SetStateAction<number>>;
  stone: number;
  setStone: React.Dispatch<React.SetStateAction<number>>;
  placedBlocks: Block[];
  setPlacedBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
}

export function FPSController({
  orbs,
  setOrbs,
  setCollected,
  activities,
  setActivities,
  playerPosRef,
  movingRef,
  sprintingRef,
  setInteractHint,
  moveJoyRef,
  lookJoyRef,
  trees,
  setTrees,
  rocks,
  setRocks,
  harvestedTrees,
  setHarvestedTrees,
  harvestedRocks,
  setHarvestedRocks,
  wood,
  setWood,
  stone,
  setStone,
  placedBlocks,
  setPlacedBlocks,
}: FPSProps) {
  const { camera, gl } = useThree();
  const keys = useRef<Set<string>>(new Set());
  const yawRef = useRef(0);
  const pitchRef = useRef(0);
  const isLocked = useRef(false);
  const frontViewRef = useRef(false);
  const eWasDown = useRef(false);
  const qWasDown = useRef(false);

  const yRef = useRef(0);
  const vyRef = useRef(0);
  const onGround = useRef(true);
  const gravity = -24;
  const jumpStrength = 9;
  const CAM_DIST = 4.2; // Slightly further back
  const CAM_H = 2.4; // Slightly higher

  useEffect(() => {
    const dn = (e: KeyboardEvent) => {
      keys.current.add(e.key.toLowerCase());
      if (e.key === "c") frontViewRef.current = true;
    };
    const up = (e: KeyboardEvent) => {
      keys.current.delete(e.key.toLowerCase());
      if (e.key === "c") frontViewRef.current = false;
    };
    window.addEventListener("keydown", dn);
    window.addEventListener("keyup", up);
    const onClick = () => gl.domElement.requestPointerLock();
    const onLock = () =>
      (isLocked.current = document.pointerLockElement === gl.domElement);
    const onMove = (e: MouseEvent) => {
      if (!isLocked.current) return;
      // Reverse X movement for standard third person back view behavior
      yawRef.current -= e.movementX * 0.002;
      pitchRef.current -= e.movementY * 0.002;
      pitchRef.current = Math.max(-0.6, Math.min(0.6, pitchRef.current));
    };
    gl.domElement.addEventListener("click", onClick);
    document.addEventListener("pointerlockchange", onLock);
    document.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("keydown", dn);
      window.removeEventListener("keyup", up);
      gl.domElement.removeEventListener("click", onClick);
      document.removeEventListener("pointerlockchange", onLock);
      document.removeEventListener("mousemove", onMove);
    };
  }, [gl]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const mj = moveJoyRef.current;
    const lj = lookJoyRef.current;

    if (lj && (Math.abs(lj.x) > 0.05 || Math.abs(lj.y) > 0.05)) {
      yawRef.current -= lj.x * 0.055 * dt * 60;
      pitchRef.current -= lj.y * 0.038 * dt * 60;
      pitchRef.current = Math.max(-0.6, Math.min(0.6, pitchRef.current));
    }

    const yaw = yawRef.current;
    const sinY = Math.sin(yaw),
      cosY = Math.cos(yaw);
    const sprint = keys.current.has("shift");
    const speed = (sprint ? 11 : 6) * dt;
    const moving =
      keys.current.has("w") ||
      keys.current.has("s") ||
      keys.current.has("a") ||
      keys.current.has("d") ||
      (mj && (Math.abs(mj.x) > 0.08 || Math.abs(mj.y) > 0.08));

    const pp = playerPosRef.current;
    let nx = pp.x,
      nz = pp.z;

    // Fixed movement vectors to match "behind character" view
    if (keys.current.has("w")) {
      nx -= sinY * speed;
      nz -= cosY * speed;
    }
    if (keys.current.has("s")) {
      nx += sinY * speed * 0.8;
      nz += cosY * speed * 0.8;
    }
    if (keys.current.has("a")) {
      nx -= cosY * speed * 0.9;
      nz += sinY * speed * 0.9;
    }
    if (keys.current.has("d")) {
      nx += cosY * speed * 0.9;
      nz -= sinY * speed * 0.9;
    }

    if (mj && (Math.abs(mj.x) > 0.08 || Math.abs(mj.y) > 0.08)) {
      nx -= (sinY * -mj.y - cosY * mj.x) * speed * 1.1;
      nz -= (cosY * -mj.y + sinY * mj.x) * speed * 1.1;
    }

    if (keys.current.has(" ") && onGround.current) {
      vyRef.current = jumpStrength;
      onGround.current = false;
    }
    vyRef.current += gravity * dt;
    yRef.current += vyRef.current * dt;

    let groundHeight = 0;
    for (const b of placedBlocks) {
      if (
        Math.abs(nx - b.x) < GRID_SIZE * 0.6 &&
        Math.abs(nz - b.z) < GRID_SIZE * 0.6
      ) {
        if (yRef.current >= b.y + GRID_SIZE * 0.8)
          groundHeight = Math.max(groundHeight, b.y + GRID_SIZE);
      }
    }
    if (yRef.current <= groundHeight) {
      yRef.current = groundHeight;
      vyRef.current = 0;
      onGround.current = true;
    }

    const checkCollision = (tx: number, tz: number) => {
      if (tx < -100 || tx > 100 || tz < -100 || tz > 100) return true;
      for (const t of trees) {
        if (harvestedTrees.has(t.id)) continue;
        const dx = tx - t.x,
          dz = tz - t.z;
        if (dx * dx + dz * dz < Math.pow(0.5 + t.r * 0.3, 2)) return true;
      }
      for (const r of rocks) {
        if (harvestedRocks.has(r.id)) continue;
        const dx = tx - r.x,
          dz = tz - r.z;
        if (dx * dx + dz * dz < Math.pow(r.r * 0.75, 2)) return true;
      }
      for (const a of activities) {
        if (a.interacted) continue;
        const dx = tx - a.x,
          dz = tz - a.z;
        if (dx * dx + dz * dz < 1.0) return true;
      }
      for (const b of placedBlocks) {
        if (
          Math.abs(tx - b.x) < GRID_SIZE * 0.6 &&
          Math.abs(tz - b.z) < GRID_SIZE * 0.6
        ) {
          if (yRef.current < b.y + GRID_SIZE * 0.8 && yRef.current + 1.8 > b.y)
            return true;
        }
      }
      return false;
    };

    if (checkCollision(nx, nz)) {
      if (!checkCollision(nx, pp.z)) {
        nz = pp.z;
      } else if (!checkCollision(pp.x, nz)) {
        nx = pp.x;
      } else {
        nx = pp.x;
        nz = pp.z;
      }
    }

    // Correct Camera logic: Stay BEHIND the player looking FORWARD
    const sideOffset = frontViewRef.current ? 0 : 1.3;
    const camYaw = yaw + (frontViewRef.current ? Math.PI : 0);
    // Position camera BEHIND the player (add sinY/cosY instead of subtract, or vice-versa depending on coordinate system)
    // The previous math camTX = nx + Math.sin(yaw) * CAM_DIST was showing the front
    const camTX = nx + Math.sin(camYaw) * CAM_DIST + Math.cos(yaw) * sideOffset;
    const camTZ = nz + Math.cos(camYaw) * CAM_DIST - Math.sin(yaw) * sideOffset;
    const camTY =
      yRef.current +
      CAM_H +
      Math.sin(frontViewRef.current ? -0.1 : pitchRef.current) * CAM_DIST * 0.5;

    camera.position.x +=
      (camTX - camera.position.x) * (1 - Math.pow(0.00005, delta));
    camera.position.y += (camTY - camera.position.y) * 0.15;
    camera.position.z +=
      (camTZ - camera.position.z) * (1 - Math.pow(0.00005, delta));

    camera.lookAt(
      nx - Math.sin(yaw) * 5 + Math.cos(yaw) * sideOffset * 0.5,
      yRef.current + 1.5 - Math.sin(pitchRef.current) * 5,
      nz - Math.cos(yaw) * 5 - Math.sin(yaw) * sideOffset * 0.5,
    );

    playerPosRef.current = { x: nx, y: yRef.current, z: nz, ry: yaw };
    movingRef.current = !!moving;
    sprintingRef.current = !!sprint;

    setOrbs((prev) => {
      let changed = false;
      const next = prev.map((o) => {
        const dx = nx - o.x,
          dz = nz - o.z;
        if (dx * dx + dz * dz < 2.5) {
          changed = true;
          setCollected((c) => c + 1);
          return {
            ...o,
            x: (Math.random() - 0.5) * 140,
            z: (Math.random() - 0.5) * 140,
          };
        }
        return o;
      });
      return changed ? next : prev;
    });

    let nearAct: Activity | null = null;
    for (const a of activities) {
      const dx = nx - a.x,
        dz = nz - a.z;
      if (dx * dx + dz * dz < 5 && !a.interacted) {
        nearAct = a;
        break;
      }
    }
    let nearTree: any = null,
      nearRock: any = null;
    if (!nearAct) {
      for (const t of trees) {
        if (
          !harvestedTrees.has(t.id) &&
          Math.pow(nx - t.x, 2) + Math.pow(nz - t.z, 2) < 7
        ) {
          nearTree = t;
          break;
        }
      }
      if (!nearTree) {
        for (const r of rocks) {
          if (
            !harvestedRocks.has(r.id) &&
            Math.pow(nx - r.x, 2) + Math.pow(nz - r.z, 2) < 6
          ) {
            nearRock = r;
            break;
          }
        }
      }
    }

    let hint = "";
    if (nearAct)
      hint =
        nearAct.type === "campfire"
          ? "[E] Extinguish"
          : nearAct.type === "well"
            ? "[E] Drink"
            : "[E] Interact";
    else if (nearTree) hint = "[E] Harvest Wood";
    else if (nearRock) hint = "[E] Harvest Stone";
    else if (wood > 0 || stone > 0) hint = "[Q] Place Block";
    setInteractHint(hint);

    const eDown = keys.current.has("e");
    if (eDown && !eWasDown.current) {
      if (nearAct)
        setActivities((prev) =>
          prev.map((a) =>
            a.id === nearAct!.id ? { ...a, interacted: true } : a,
          ),
        );
      else if (nearTree) {
        setHarvestedTrees((p) => new Set(p).add(nearTree.id));
        setWood((w) => w + 4);
        // Respawn Logic: Replace the harvested tree with a new one after 2 seconds
        setTimeout(() => {
          setTrees((prev) =>
            prev.map((t) =>
              t.id === nearTree.id
                ? {
                    ...t,
                    x: (Math.random() - 0.5) * 160,
                    z: (Math.random() - 0.5) * 160,
                  }
                : t,
            ),
          );
          setHarvestedTrees((p) => {
            const n = new Set(p);
            n.delete(nearTree.id);
            return n;
          });
        }, 3000);
      } else if (nearRock) {
        setHarvestedRocks((p) => new Set(p).add(nearRock.id));
        setStone((s) => s + 3);
        // Respawn Logic: Replace the harvested rock
        setTimeout(() => {
          setRocks((prev) =>
            prev.map((r) =>
              r.id === nearRock.id
                ? {
                    ...r,
                    x: (Math.random() - 0.5) * 160,
                    z: (Math.random() - 0.5) * 160,
                  }
                : r,
            ),
          );
          setHarvestedRocks((p) => {
            const n = new Set(p);
            n.delete(nearRock.id);
            return n;
          });
        }, 3000);
      }
    }
    eWasDown.current = eDown;

    const qDown = keys.current.has("q");
    if (qDown && !qWasDown.current && (wood > 0 || stone > 0)) {
      const type = wood > 0 ? "wood" : "stone";
      if (type === "wood") setWood((w) => w - 1);
      else setStone((s) => s - 1);
      const dist = 3.5;
      const targetX = nx - Math.sin(yaw) * dist;
      const targetZ = nz - Math.cos(yaw) * dist;
      const gx = Math.round(targetX / GRID_SIZE) * GRID_SIZE;
      const gz = Math.round(targetZ / GRID_SIZE) * GRID_SIZE;
      let gy = 0;
      for (const b of placedBlocks) {
        if (Math.abs(b.x - gx) < 0.1 && Math.abs(b.z - gz) < 0.1)
          gy = Math.max(gy, b.y + GRID_SIZE);
      }
      setPlacedBlocks((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substr(2, 9),
          x: gx,
          y: gy,
          z: gz,
          type,
        },
      ]);
    }
    qWasDown.current = qDown;
  });

  return null;
}
