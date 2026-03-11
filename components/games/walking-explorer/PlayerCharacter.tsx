import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { PlayerPos } from "./types";

interface CharacterProps {
  playerPosRef: React.RefObject<PlayerPos>;
  movingRef: React.RefObject<boolean>;
  sprintingRef: React.RefObject<boolean>;
  name?: string;
  color?: string;
}

export const Character = React.memo(
  ({ playerPosRef, movingRef, sprintingRef, name, color }: CharacterProps) => {
    const groupRef = useRef<THREE.Group>(null);
    const bodyRef = useRef<THREE.Group>(null);
    const headRef = useRef<THREE.Group>(null);
    const lArmRef = useRef<THREE.Group>(null);
    const rArmRef = useRef<THREE.Group>(null);
    const lLegRef = useRef<THREE.Group>(null);
    const rLegRef = useRef<THREE.Group>(null);
    const bobRef = useRef(0);

    useFrame((state, delta) => {
      if (!groupRef.current || !playerPosRef.current) return;
      const pp = playerPosRef.current;
      const moving = movingRef.current ?? false;
      const sprint = sprintingRef.current ?? false;
      const spd = sprint ? 16 : 9;

      // Match player position exactly
      groupRef.current.position.set(pp.x, pp.y, pp.z);

      // Use yaw directly for rotation.
      // Movement vectors in FPSController move towards -Z when yaw=0.
      // So -Z is our "front".
      groupRef.current.rotation.y = pp.ry;

      if (moving) bobRef.current += delta * spd;
      const swing = moving ? Math.sin(bobRef.current) : 0;

      // Animations
      if (lLegRef.current) lLegRef.current.rotation.x = swing * 0.65;
      if (rLegRef.current) rLegRef.current.rotation.x = -swing * 0.65;

      const armSwing = moving
        ? Math.sin(bobRef.current) * (sprint ? 0.9 : 0.55)
        : 0;
      if (lArmRef.current) {
        lArmRef.current.rotation.x = -armSwing - 0.1;
        lArmRef.current.rotation.z = -0.1;
      }
      if (rArmRef.current) {
        rArmRef.current.rotation.x = armSwing - 0.1;
        rArmRef.current.rotation.z = 0.1;
      }

      if (headRef.current) {
        headRef.current.rotation.y =
          Math.sin(state.clock.elapsedTime * 0.38) * 0.07;
        headRef.current.rotation.x = moving
          ? Math.sin(bobRef.current * 2) * 0.05 - 0.04
          : 0;
      }

      if (bodyRef.current) {
        bodyRef.current.rotation.x = sprint ? -0.18 : moving ? -0.06 : 0;
      }
    });

    const skin = "#f5c89a";
    const shirt = color || "#2244aa";
    const pants = "#1a3a1a";
    const shoe = "#1a1008";
    const hair = "#2a1505";

    return (
      <group ref={groupRef}>
        <group ref={bodyRef} position={[0, 0.98, 0]}>
          {/* Main Body */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.46, 0.54, 0.22]} />
            <meshStandardMaterial color={shirt} roughness={0.85} />
            {name && (
              <Text
                position={[0, 0.45, -0.115]}
                fontSize={0.08}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
              >
                {name}
              </Text>
            )}
          </mesh>

          {/* Head */}
          <group ref={headRef} position={[0, 0.47, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.32, 0.33, 0.3]} />
              <meshStandardMaterial color={skin} roughness={0.8} />
            </mesh>
            {/* Eyes (Front side is -Z) */}
            <mesh position={[-0.08, 0.04, -0.155]}>
              <boxGeometry args={[0.06, 0.06, 0.02]} />
              <meshStandardMaterial color="#000" />
            </mesh>
            <mesh position={[0.08, 0.04, -0.155]}>
              <boxGeometry args={[0.06, 0.06, 0.02]} />
              <meshStandardMaterial color="#000" />
            </mesh>
            {/* Hair */}
            <mesh position={[0, 0.15, 0.01]} castShadow>
              <boxGeometry args={[0.34, 0.1, 0.31]} />
              <meshStandardMaterial color={hair} roughness={0.95} />
            </mesh>
            <mesh position={[0, 0.03, 0.152]}>
              <boxGeometry args={[0.3, 0.18, 0.02]} />
              <meshStandardMaterial color={hair} roughness={0.95} />
            </mesh>
          </group>

          {/* Arms */}
          <group ref={lArmRef} position={[-0.31, 0.24, 0]}>
            <mesh position={[0, -0.2, 0]} castShadow>
              <boxGeometry args={[0.14, 0.42, 0.14]} />
              <meshStandardMaterial color={shirt} roughness={0.85} />
            </mesh>
            <mesh position={[0, -0.44, 0]} castShadow>
              <boxGeometry args={[0.12, 0.2, 0.12]} />
              <meshStandardMaterial color={skin} roughness={0.8} />
            </mesh>
          </group>
          <group ref={rArmRef} position={[0.31, 0.24, 0]}>
            <mesh position={[0, -0.2, 0]} castShadow>
              <boxGeometry args={[0.14, 0.42, 0.14]} />
              <meshStandardMaterial color={shirt} roughness={0.85} />
            </mesh>
            <mesh position={[0, -0.44, 0]} castShadow>
              <boxGeometry args={[0.12, 0.2, 0.12]} />
              <meshStandardMaterial color={skin} roughness={0.8} />
            </mesh>
          </group>
        </group>

        {/* Legs & Shoes */}
        <group ref={lLegRef} position={[-0.12, 0.7, 0]}>
          <mesh position={[0, -0.22, 0]} castShadow>
            <boxGeometry args={[0.18, 0.46, 0.18]} />
            <meshStandardMaterial color={pants} roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.55, -0.04]} castShadow>
            <boxGeometry args={[0.18, 0.12, 0.26]} />
            <meshStandardMaterial color={shoe} roughness={0.9} />
          </mesh>
        </group>
        <group ref={rLegRef} position={[0.12, 0.7, 0]}>
          <mesh position={[0, -0.22, 0]} castShadow>
            <boxGeometry args={[0.18, 0.46, 0.18]} />
            <meshStandardMaterial color={pants} roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.55, -0.04]} castShadow>
            <boxGeometry args={[0.18, 0.12, 0.26]} />
            <meshStandardMaterial color={shoe} roughness={0.9} />
          </mesh>
        </group>
      </group>
    );
  },
);

Character.displayName = "Character";
