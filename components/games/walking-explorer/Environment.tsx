import React, { useRef, useEffect, useState, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  WEATHERS,
  getSunPosition,
  getSunIntensity,
  getSunColor,
  getSkyColor,
  getAmbientIntensity,
  WEATHER_COLORS,
  ORB_COLORS,
} from "./types";

// --- DynamicSun ---
export const DynamicSun = ({
  timeRef,
  weatherName,
}: {
  timeRef: React.MutableRefObject<number>;
  weatherName: string;
}) => {
  const dirRef = useRef<THREE.DirectionalLight>(null);
  const sunRef = useRef<THREE.Mesh>(null);
  const moonRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const t = timeRef.current;
    const [sx, sy, sz] = getSunPosition(t);
    const baseInt = getSunIntensity(t);
    const intensity =
      weatherName === "STORM"
        ? 0.05
        : weatherName === "OVERCAST"
          ? baseInt * 0.3
          : weatherName === "RAIN"
            ? baseInt * 0.25
            : baseInt;
    const col = new THREE.Color(getSunColor(t));

    if (dirRef.current) {
      dirRef.current.position.set(sx, sy, sz);
      dirRef.current.intensity = intensity;
      dirRef.current.color = col;
    }
    if (sunRef.current) {
      sunRef.current.position.set(sx * 0.88, sy * 0.88, sz * 0.88);
      (sunRef.current.material as THREE.MeshStandardMaterial).emissive = col;
      (sunRef.current.material as THREE.MeshStandardMaterial).color = col;
      sunRef.current.visible = sy > -8;
    }
    if (moonRef.current) {
      moonRef.current.position.set(-sx * 0.82, -sy * 0.82, sz * 0.88);
      moonRef.current.visible = sy < 10;
    }
  });

  return (
    <>
      <directionalLight
        ref={dirRef}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={200}
        shadow-camera-near={0.5}
        shadow-camera-left={-70}
        shadow-camera-right={70}
        shadow-camera-top={70}
        shadow-camera-bottom={-70}
        shadow-bias={-0.0003}
      />
      <mesh ref={sunRef}>
        <sphereGeometry args={[3.5, 16, 16]} />
        <meshStandardMaterial emissiveIntensity={1.8} roughness={0} />
      </mesh>
      <mesh ref={moonRef}>
        <sphereGeometry args={[2.5, 16, 16]} />
        <meshStandardMaterial
          color="#e8e0d0"
          emissive="#b0a870"
          emissiveIntensity={0.3}
          roughness={0.95}
        />
      </mesh>
    </>
  );
};

// --- DynamicSky ---
export const DynamicSkyAmbient = ({
  timeRef,
  weatherName,
}: {
  timeRef: React.MutableRefObject<number>;
  weatherName: string;
}) => {
  const { scene } = useThree();
  const ambRef = useRef<THREE.AmbientLight>(null);
  const wConfig = WEATHERS.find((w) => w.name === weatherName);

  useFrame(() => {
    const t = timeRef.current;
    const skyHex = getSkyColor(t);
    const fog = scene.fog as THREE.Fog | null;
    if (fog) {
      fog.color.set(skyHex);
      fog.near = wConfig?.fogNear ?? 20;
      fog.far = wConfig?.fogFar ?? 70;
    } else {
      scene.fog = new THREE.Fog(
        skyHex,
        wConfig?.fogNear ?? 20,
        wConfig?.fogFar ?? 70,
      );
    }
    scene.background = new THREE.Color(skyHex);
    if (ambRef.current) {
      ambRef.current.intensity =
        weatherName === "STORM" ? 0.08 : getAmbientIntensity(t);
      ambRef.current.color = new THREE.Color(getSunColor(t));
    }
  });

  return (
    <>
      <ambientLight ref={ambRef} />
      <hemisphereLight args={["#87ceeb", "#0a1a08", 0.15]} />
    </>
  );
};

// --- Ground ---
export const Ground = React.memo(
  ({
    timeRef,
    weatherName,
  }: {
    timeRef: React.MutableRefObject<number>;
    weatherName: string;
  }) => {
    const ref = useRef<THREE.Mesh>(null);
    const baseColor =
      WEATHERS.find((w) => w.name === weatherName)?.groundColor ?? "#0d1f10";

    useFrame(() => {
      if (!ref.current) return;
      const t = timeRef.current;
      const bright =
        t < 0.22 || t > 0.8 ? 0.3 : t < 0.3 || t > 0.72 ? 0.65 : 1.0;
      (ref.current.material as THREE.MeshStandardMaterial).color
        .set(baseColor)
        .multiplyScalar(bright);
    });

    return (
      <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[220, 220, 100, 100]} />
        <meshStandardMaterial
          color={baseColor}
          roughness={0.95}
          metalness={0}
        />
      </mesh>
    );
  },
);
Ground.displayName = "Ground";

// --- Trees ---
export const Trees = React.memo(
  ({
    weatherName,
    data,
    harvested,
  }: {
    weatherName: string;
    data: any[];
    harvested: Set<number>;
  }) => {
    const isSnow = weatherName === "SNOW";
    const trunkGeom = useMemo(
      () => new THREE.CylinderGeometry(0.1, 0.2, 1, 7),
      [],
    );
    const pineGeom = useMemo(() => new THREE.ConeGeometry(1, 1, 8), []);
    const roundGeom = useMemo(() => new THREE.SphereGeometry(1, 7, 5), []);

    const trunkMat = useMemo(
      () =>
        new THREE.MeshStandardMaterial({
          color: isSnow ? "#4a3520" : "#2c1a0e",
          roughness: 1,
        }),
      [isSnow],
    );
    const pineMat = useMemo(
      () =>
        new THREE.MeshStandardMaterial({
          color: isSnow ? "#c8dde8" : "#0b3d1e",
          roughness: 0.9,
        }),
      [isSnow],
    );
    const roundMat = useMemo(
      () =>
        new THREE.MeshStandardMaterial({
          color: isSnow ? "#b8ccd8" : "#0c4020",
          roughness: 0.9,
        }),
      [isSnow],
    );

    const trunkRef = useRef<THREE.InstancedMesh>(null);
    const pineRef = useRef<THREE.InstancedMesh>(null);
    const roundRef = useRef<THREE.InstancedMesh>(null);

    useEffect(() => {
      if (!trunkRef.current || !pineRef.current || !roundRef.current) return;
      const dummy = new THREE.Object3D();
      let tIdx = 0,
        pIdx = 0,
        rIdx = 0;
      const visibleData = data.filter((t) => !harvested.has(t.id));

      visibleData.forEach((t) => {
        dummy.position.set(t.x, t.h * 0.25, t.z);
        dummy.scale.set(0.6 + t.r * 0.5, t.h * 0.5, 0.6 + t.r * 0.5);
        dummy.rotation.set(0, t.ry, 0);
        dummy.updateMatrix();
        trunkRef.current!.setMatrixAt(tIdx++, dummy.matrix);

        if (t.type === "pine") {
          for (let l = 0; l < t.layers; l++) {
            dummy.position.set(t.x, t.h * (0.45 + (l / t.layers) * 0.55), t.z);
            const s = t.r * (1 - (l / t.layers) * 0.5) * 0.9;
            dummy.scale.set(s, t.h * 0.35, s);
            dummy.updateMatrix();
            pineRef.current!.setMatrixAt(pIdx++, dummy.matrix);
          }
        } else {
          dummy.position.set(t.x, t.h * 0.75, t.z);
          dummy.scale.set(t.r * 0.8, t.r * 0.8, t.r * 0.8);
          dummy.updateMatrix();
          roundRef.current!.setMatrixAt(rIdx++, dummy.matrix);
        }
      });

      for (let i = tIdx; i < data.length; i++) {
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        trunkRef.current!.setMatrixAt(i, dummy.matrix);
      }
      for (let i = pIdx; i < data.length * 4; i++) {
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        pineRef.current!.setMatrixAt(i, dummy.matrix);
      }
      for (let i = rIdx; i < data.length; i++) {
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        roundRef.current!.setMatrixAt(i, dummy.matrix);
      }

      trunkRef.current.instanceMatrix.needsUpdate = true;
      pineRef.current.instanceMatrix.needsUpdate = true;
      roundRef.current.instanceMatrix.needsUpdate = true;
    }, [data, harvested]);

    return (
      <group>
        <instancedMesh
          ref={trunkRef}
          args={[trunkGeom, trunkMat, data.length]}
          castShadow
          receiveShadow
        />
        <instancedMesh
          ref={pineRef}
          args={[pineGeom, pineMat, data.length * 4]}
          castShadow
          receiveShadow
        />
        <instancedMesh
          ref={roundRef}
          args={[roundGeom, roundMat, data.length]}
          castShadow
          receiveShadow
        />
      </group>
    );
  },
);
Trees.displayName = "Trees";

// --- Rocks ---
export const Rocks = React.memo(
  ({ data, harvested }: { data: any[]; harvested: Set<number> }) => {
    const rockGeom = useMemo(() => new THREE.DodecahedronGeometry(1, 0), []);
    const rockMat = useMemo(
      () =>
        new THREE.MeshStandardMaterial({
          color: "#1a1e2a",
          roughness: 0.95,
          metalness: 0.05,
        }),
      [],
    );
    const ref = useRef<THREE.InstancedMesh>(null);

    useEffect(() => {
      if (!ref.current) return;
      const dummy = new THREE.Object3D();
      data.forEach((r, i) => {
        if (harvested.has(r.id)) {
          dummy.scale.set(0, 0, 0);
        } else {
          dummy.position.set(r.x, r.s * 0.38, r.z);
          dummy.rotation.set(r.rx, r.ry, 0);
          dummy.scale.set(r.s, r.s, r.s);
        }
        dummy.updateMatrix();
        ref.current!.setMatrixAt(i, dummy.matrix);
      });
      ref.current.instanceMatrix.needsUpdate = true;
    }, [data, harvested]);

    return (
      <instancedMesh
        ref={ref}
        args={[rockGeom, rockMat, data.length]}
        castShadow
        receiveShadow
      />
    );
  },
);
Rocks.displayName = "Rocks";

// --- Activities (Campfire, Well, etc.) ---
export const Campfire = ({ x, z, interacted }: any) => {
  const flameRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (flameRef.current && !interacted) {
      flameRef.current.scale.y = 0.8 + Math.sin(t * 8) * 0.3;
      flameRef.current.position.y = 0.5 + Math.sin(t * 10) * 0.05;
    }
    if (lightRef.current)
      lightRef.current.intensity = interacted ? 0 : 2.5 + Math.sin(t * 7) * 0.8;
  });
  return (
    <group position={[x, 0, z]}>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          position={[Math.cos(i * 2.1) * 0.22, 0.08, Math.sin(i * 2.1) * 0.22]}
          rotation={[0.2, i * 2.1, 0.3]}
          castShadow
        >
          <cylinderGeometry args={[0.05, 0.07, 0.55, 6]} />
          <meshStandardMaterial color="#2a1205" roughness={1} />
        </mesh>
      ))}
      {!interacted && (
        <mesh ref={flameRef} position={[0, 0.5, 0]}>
          <coneGeometry args={[0.18, 0.55, 8]} />
          <meshStandardMaterial
            color="#ff6600"
            emissive="#ff4400"
            emissiveIntensity={2}
            transparent
            opacity={0.85}
          />
        </mesh>
      )}
      <pointLight
        ref={lightRef}
        position={[0, 0.8, 0]}
        color="#ff8833"
        distance={14}
        castShadow
      />
    </group>
  );
};

export const Well = ({ x, z }: any) => (
  <group position={[x, 0, z]}>
    <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.62, 0.67, 0.8, 12]} />
      <meshStandardMaterial color="#4a4040" roughness={0.95} />
    </mesh>
    <mesh position={[0, 1.3, 0]} castShadow>
      <coneGeometry args={[0.85, 0.5, 4]} />
      <meshStandardMaterial color="#4a2810" roughness={0.9} />
    </mesh>
  </group>
);

export const Chest = ({ x, z, interacted }: any) => {
  const lidRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (lidRef.current) {
      const target = interacted ? -Math.PI * 0.72 : 0;
      lidRef.current.rotation.x += (target - lidRef.current.rotation.x) * 0.08;
    }
  });
  return (
    <group position={[x, 0.25, z]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.72, 0.5, 0.52]} />
        <meshStandardMaterial color="#5a3a10" roughness={0.9} />
      </mesh>
      <mesh ref={lidRef} position={[0, 0.26, -0.24]}>
        <boxGeometry args={[0.74, 0.16, 0.54]} />
        <meshStandardMaterial color="#6a4818" roughness={0.85} />
      </mesh>
    </group>
  );
};

export const Signpost = ({ x, z }: any) => (
  <group position={[x, 0, z]}>
    <mesh position={[0, 0.85, 0]} castShadow>
      <cylinderGeometry args={[0.045, 0.065, 1.7, 6]} />
      <meshStandardMaterial color="#3a2010" roughness={1} />
    </mesh>
    <mesh position={[0, 1.52, 0.04]} rotation={[0, 0.25, 0]} castShadow>
      <boxGeometry args={[0.65, 0.24, 0.065]} />
      <meshStandardMaterial color="#5a3a10" roughness={0.9} />
    </mesh>
  </group>
);

// --- Orbs ---
export const OrbMesh = React.memo(
  ({
    x,
    z,
    collected,
    weatherName,
  }: {
    x: number;
    z: number;
    collected: boolean;
    weatherName: string;
  }) => {
    const ref = useRef<THREE.Mesh>(null);
    const ringRef = useRef<THREE.Mesh>(null);
    const [emissive, color] = ORB_COLORS[weatherName] ?? ORB_COLORS.CLEAR;

    useFrame((state) => {
      if (!ref.current || collected) return;
      ref.current.position.y =
        1 + Math.sin(state.clock.elapsedTime * 1.8 + x) * 0.25;
      ref.current.rotation.y += 0.015;
      ref.current.rotation.x += 0.008;
      if (ringRef.current) {
        ringRef.current.position.y = ref.current.position.y;
        ringRef.current.rotation.y = state.clock.elapsedTime * 0.8;
        ringRef.current.rotation.x =
          Math.PI / 3 + Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      }
    });

    if (collected) return null;
    return (
      <group>
        <mesh ref={ref} position={[x, 1, z]} castShadow>
          <icosahedronGeometry args={[0.22, 1]} />
          <meshStandardMaterial
            color={color}
            emissive={emissive}
            emissiveIntensity={2}
            roughness={0.1}
            metalness={0.5}
            transparent
            opacity={0.95}
          />
        </mesh>
        <mesh ref={ringRef} position={[x, 1, z]}>
          <torusGeometry args={[0.38, 0.025, 8, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={emissive}
            emissiveIntensity={1.5}
            transparent
            opacity={0.6}
          />
        </mesh>
        <pointLight
          position={[x, 1, z]}
          intensity={0.8}
          color={emissive}
          distance={4}
        />
      </group>
    );
  },
);
OrbMesh.displayName = "OrbMesh";

// --- Weather Effects ---
export const Rain = ({
  active,
  intensity = 1,
}: {
  active: boolean;
  intensity?: number;
}) => {
  const ref = useRef<THREE.Points>(null);
  const count = Math.floor(3000 * intensity);
  const [positions] = useState(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 80;
      arr[i * 3 + 1] = Math.random() * 30;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    return arr;
  });
  useFrame((_, dt) => {
    if (!ref.current || !active) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] -= (18 + intensity * 10) * dt;
      pos[i * 3] -= intensity * 2 * dt;
      if (pos[i * 3 + 1] < 0) {
        pos[i * 3 + 1] = 30;
        pos[i * 3] = (Math.random() - 0.5) * 80;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 80;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });
  if (!active) return null;
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#8ab4d0"
        size={0.04}
        transparent
        opacity={0.55}
        sizeAttenuation
      />
    </points>
  );
};

export const Stars = ({
  timeRef,
}: {
  timeRef: React.MutableRefObject<number>;
}) => {
  const ref = useRef<THREE.Points>(null);
  const [positions] = useState(() => {
    const arr = new Float32Array(800 * 3);
    for (let i = 0; i < 800; i++) {
      const theta = Math.random() * Math.PI * 2,
        phi = Math.random() * Math.PI * 0.5;
      arr[i * 3] = Math.sin(phi) * Math.cos(theta) * 130;
      arr[i * 3 + 1] = Math.cos(phi) * 90 + 10;
      arr[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * 130;
    }
    return arr;
  });
  useFrame(() => {
    if (!ref.current) return;
    const t = timeRef.current;
    const alpha =
      t < 0.22
        ? 0.9
        : t < 0.3
          ? ((0.3 - t) / 0.08) * 0.9
          : t > 0.75
            ? ((t - 0.75) / 0.07) * 0.9
            : 0;
    (ref.current.material as THREE.PointsMaterial).opacity = Math.max(0, alpha);
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#ffffff"
        size={0.18}
        transparent
        opacity={0}
        sizeAttenuation
      />
    </points>
  );
};

export const Snow = ({ active }: { active: boolean }) => {
  const ref = useRef<THREE.Points>(null);
  const count = 2000;
  const [positions] = useState(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 80;
      arr[i * 3 + 1] = Math.random() * 25;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    return arr;
  });
  useFrame((state, dt) => {
    if (!ref.current || !active) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] -= 1.2 * dt;
      if (pos[i * 3 + 1] < 0) {
        pos[i * 3 + 1] = 25;
        pos[i * 3] = (Math.random() - 0.5) * 80;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 80;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });
  if (!active) return null;
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#e8f4ff"
        size={0.12}
        transparent
        opacity={0.75}
        sizeAttenuation
      />
    </points>
  );
};

export const Lightning = ({ active }: { active: boolean }) => {
  const [flash, setFlash] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      if (Math.random() < 0.08) {
        setFlash(1);
        setTimeout(() => setFlash(0.4), 80);
        setTimeout(() => setFlash(0), 220);
      }
    }, 500);
    return () => clearInterval(id);
  }, [active]);
  if (!active) return null;
  return (
    <pointLight
      position={[20, 40, -20]}
      intensity={flash * 80}
      color="#aac8ff"
      distance={200}
    />
  );
};
