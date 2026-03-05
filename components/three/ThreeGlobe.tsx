"use client";

import { useEffect, useRef } from "react";

export default function ThreeGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animationId: number;

    const init = async () => {
      try {
        const THREE = await import("three");

        const renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: true,
          alpha: true,
        });

        const width = canvas.parentElement?.clientWidth || 500;
        const height = canvas.parentElement?.clientHeight || 500;
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
        camera.position.z = 3;

        // Create icosahedron wireframe
        const geo = new THREE.IcosahedronGeometry(1.2, 3);
        const wireframeMat = new THREE.MeshBasicMaterial({
          color: 0x00f5d4,
          wireframe: true,
          transparent: true,
          opacity: 0.15,
        });
        const wireframe = new THREE.Mesh(geo, wireframeMat);
        scene.add(wireframe);

        // Inner sphere
        const innerGeo = new THREE.IcosahedronGeometry(1.0, 2);
        const innerMat = new THREE.MeshBasicMaterial({
          color: 0x7209b7,
          wireframe: true,
          transparent: true,
          opacity: 0.08,
        });
        const innerSphere = new THREE.Mesh(innerGeo, innerMat);
        scene.add(innerSphere);

        // Particle points on sphere
        const pointsCount = 200;
        const positions = new Float32Array(pointsCount * 3);
        const colors = new Float32Array(pointsCount * 3);

        for (let i = 0; i < pointsCount; i++) {
          const phi = Math.acos(-1 + (2 * i) / pointsCount);
          const theta = Math.sqrt(pointsCount * Math.PI) * phi;

          const x = 1.2 * Math.cos(theta) * Math.sin(phi);
          const y = 1.2 * Math.sin(theta) * Math.sin(phi);
          const z = 1.2 * Math.cos(phi);

          positions[i * 3] = x;
          positions[i * 3 + 1] = y;
          positions[i * 3 + 2] = z;

          // Alternate colors
          if (i % 3 === 0) {
            colors[i * 3] = 0; colors[i * 3 + 1] = 0.96; colors[i * 3 + 2] = 0.83;
          } else if (i % 3 === 1) {
            colors[i * 3] = 0.45; colors[i * 3 + 1] = 0.04; colors[i * 3 + 2] = 0.72;
          } else {
            colors[i * 3] = 0.97; colors[i * 3 + 1] = 0.15; colors[i * 3 + 2] = 0.51;
          }
        }

        const pointsGeo = new THREE.BufferGeometry();
        pointsGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        pointsGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

        const pointsMat = new THREE.PointsMaterial({
          size: 0.04,
          vertexColors: true,
          transparent: true,
          opacity: 0.8,
        });

        const points = new THREE.Points(pointsGeo, pointsMat);
        scene.add(points);

        // Ambient light glow
        const ambientLight = new THREE.AmbientLight(0x00f5d4, 0.5);
        scene.add(ambientLight);

        let mouseX = 0;
        let mouseY = 0;
        let targetX = 0;
        let targetY = 0;

        const handleMouseMove = (e: MouseEvent) => {
          const rect = canvas.getBoundingClientRect();
          mouseX = ((e.clientX - rect.left) / width - 0.5) * 2;
          mouseY = ((e.clientY - rect.top) / height - 0.5) * 2;
        };

        window.addEventListener("mousemove", handleMouseMove);

        const handleResize = () => {
          const w = canvas.parentElement?.clientWidth || 500;
          const h = canvas.parentElement?.clientHeight || 500;
          renderer.setSize(w, h);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        };

        window.addEventListener("resize", handleResize);

        const clock = new THREE.Clock();

        const animate = () => {
          animationId = requestAnimationFrame(animate);
          const elapsed = clock.getElapsedTime();

          targetX += (mouseX - targetX) * 0.02;
          targetY += (mouseY - targetY) * 0.02;

          wireframe.rotation.y = elapsed * 0.1 + targetX * 0.5;
          wireframe.rotation.x = elapsed * 0.05 + targetY * 0.3;

          innerSphere.rotation.y = -elapsed * 0.15;
          innerSphere.rotation.x = elapsed * 0.07;

          points.rotation.y = elapsed * 0.08 + targetX * 0.4;
          points.rotation.x = elapsed * 0.04 - targetY * 0.2;

          renderer.render(scene, camera);
        };

        animate();

        return () => {
          window.removeEventListener("mousemove", handleMouseMove);
          window.removeEventListener("resize", handleResize);
          cancelAnimationFrame(animationId);
          renderer.dispose();
        };
      } catch (e) {
        console.error("Three.js initialization failed", e);
      }
    };

    const cleanup = init();
    return () => {
      cleanup.then((fn) => fn?.());
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ opacity: 0.9 }}
    />
  );
}
