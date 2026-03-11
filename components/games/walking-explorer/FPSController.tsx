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
  rocks: any[];
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
  rocks,
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
  const CAM_DIST = 3.4;
  const CAM_H = 2.2;

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
      yawRef.current -= e.movementX * 0.0018;
      pitchRef.current -= e.movementY * 0.0018;
      pitchRef.current = Math.max(-0.55, Math.min(0.55, pitchRef.current));
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
    const lj = lookJoyRef.current;
    if (lj && (Math.abs(lj.x) > 0.05 || Math.abs(lj.y) > 0.05)) {
      yawRef.current -= lj.x * 0.055 * dt * 60;
      pitchRef.current -= lj.y * 0.038 * dt * 60;
      pitchRef.current = Math.max(-0.55, Math.min(0.55, pitchRef.current));
    }

    const yaw = yawRef.current;
    const sinY = Math.sin(yaw),
      cosY = Math.cos(yaw);
    const sprint = keys.current.has("shift");
    const speed = (sprint ? 10 : 5.5) * dt;
    const mj = moveJoyRef.current;
    const moving =
      keys.current.has("w") ||
      keys.current.has("s") ||
      keys.current.has("a") ||
      keys.current.has("d") ||
      (mj && (Math.abs(mj.x) > 0.08 || Math.abs(mj.y) > 0.08));

    const pp = playerPosRef.current;
    let nx = pp.x,
      nz = pp.z;

    // Movement direction (standard or front view)
    const moveDir = 1; // Simplified but can be frontViewRef.current ? -1 : 1

    if (keys.current.has("w")) {
      nx -= sinY * speed * moveDir;
      nz -= cosY * speed * moveDir;
    }
    if (keys.current.has("s")) {
      nx += sinY * speed * 0.8 * moveDir;
      nz += cosY * speed * 0.8 * moveDir;
    }
    if (keys.current.has("a")) {
      nx -= cosY * speed * 0.9 * moveDir;
      nz += sinY * speed * 0.9 * moveDir;
    }
    if (keys.current.has("d")) {
      nx += cosY * speed * 0.9 * moveDir;
      nz -= sinY * speed * 0.9 * moveDir;
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

    // Physics check for "ground" level
    let groundHeight = 0;
    for (const b of placedBlocks) {
      if (
        Math.abs(nx - b.x) < GRID_SIZE * 0.6 &&
        Math.abs(nz - b.z) < GRID_SIZE * 0.6
      ) {
        if (yRef.current >= b.y + GRID_SIZE * 0.9)
          groundHeight = Math.max(groundHeight, b.y + GRID_SIZE);
      }
    }
    if (yRef.current <= groundHeight) {
      yRef.current = groundHeight;
      vyRef.current = 0;
      onGround.current = true;
    }

    // Collision Detection Function
    const checkCollision = (tx: number, tz: number) => {
      if (tx < -90 || tx > 90 || tz < -90 || tz > 90) return true;
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
        if (dx * dx + dz * dz < Math.pow(r.s * 0.75, 2)) return true;
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
          if (yRef.current < b.y + GRID_SIZE * 0.9 && yRef.current + 1.8 > b.y)
            return true;
        }
      }
      return false;
    };

    // Sliding collision response
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

    // Camera calculation
    const sideOffset = frontViewRef.current ? 0 : 1.25;
    const camYawDelta = frontViewRef.current ? Math.PI : 0;
    const camTX =
      nx + Math.sin(yaw + camYawDelta) * CAM_DIST + Math.cos(yaw) * sideOffset;
    const camTZ =
      nz + Math.cos(yaw + camYawDelta) * CAM_DIST - Math.sin(yaw) * sideOffset;
    const camTY =
      yRef.current +
      CAM_H +
      Math.sin(frontViewRef.current ? -0.1 : pitchRef.current) * CAM_DIST * 0.6;

    const lerp = 1 - Math.pow(0.00005, delta);
    camera.position.x += (camTX - camera.position.x) * lerp;
    camera.position.y += (camTY - camera.position.y) * lerp;
    camera.position.z += (camTZ - camera.position.z) * lerp;
    camera.lookAt(
      nx + Math.cos(yaw) * sideOffset * 0.5,
      yRef.current + 1.25,
      nz - Math.sin(yaw) * sideOffset * 0.5,
    );

    playerPosRef.current = { x: nx, y: yRef.current, z: nz, ry: yaw };
    movingRef.current = !!moving;
    sprintingRef.current = !!sprint;

    // Orb Collection
    setOrbs((prev) => {
      let changed = false;
      const next = prev.map((o) => {
        const dx = nx - o.x,
          dz = nz - o.z;
        if (dx * dx + dz * dz < 2.2) {
          changed = true;
          setCollected((c) => c + 1);
          let rx: number, rz: number;
          do {
            rx = (Math.random() - 0.5) * 110;
            rz = (Math.random() - 0.5) * 110;
          } while ((rx - nx) * (rx - nx) + (rz - nz) * (rz - nz) < 100);
          return { ...o, x: rx, z: rz };
        }
        return o;
      });
      return changed ? next : prev;
    });

    // Interaction Hint Logic
    let nearAct: Activity | null = null;
    for (const a of activities) {
      if (nx * nx + nz * nz < 5 && !a.interacted) {
        const dx = nx - a.x,
          dz = nz - a.z;
        if (dx * dx + dz * dz < 5) {
          nearAct = a;
          break;
        }
      }
    }
    let nearTree: any = null,
      nearRock: any = null;
    if (!nearAct) {
      for (const t of trees) {
        if (
          !harvestedTrees.has(t.id) &&
          Math.pow(nx - t.x, 2) + Math.pow(nz - t.z, 2) < 6
        ) {
          nearTree = t;
          break;
        }
      }
      if (!nearTree) {
        for (const r of rocks) {
          if (
            !harvestedRocks.has(r.id) &&
            Math.pow(nx - r.x, 2) + Math.pow(nz - r.z, 2) < 5
          ) {
            nearRock = r;
            break;
          }
        }
      }
    }

    const labels: Record<string, string> = {
      campfire: "[E] Extinguish fire",
      well: "[E] Drink water",
      chest: "[E] Open chest",
      signpost: "[E] Read sign",
    };
    let hint = "";
    if (nearAct) hint = labels[nearAct.type] || "";
    else if (nearTree) hint = "[E] Harvest Wood";
    else if (nearRock) hint = "[E] Harvest Stone";
    else if (wood > 0 || stone > 0) hint = "[Q] Place Block";
    setInteractHint(hint);

    // E Key Action
    const eDown = keys.current.has("e");
    if (eDown && !eWasDown.current) {
      if (nearAct) {
        setActivities((prev) =>
          prev.map((a) =>
            a.id === nearAct!.id ? { ...a, interacted: true } : a,
          ),
        );
      } else if (nearTree) {
        setHarvestedTrees((prev) => new Set(prev).add(nearTree.id));
        setWood((w) => w + 5);
      } else if (nearRock) {
        setHarvestedRocks((prev) => new Set(prev).add(nearRock.id));
        setStone((s) => s + 3);
      }
    }
    eWasDown.current = eDown;

    // Q Key Action (Minecraft Style Grid Placement)
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
