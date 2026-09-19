"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface Bullet {
  mesh: THREE.Mesh;
  x: number;
  y: number;
  isEnemy?: boolean;
}

interface Enemy {
  mesh: THREE.Group;
  x: number;
  y: number;
  speed: number;
  hp: number;
  maxHp: number;
  shootTimer: number;
  type: "scout" | "fighter" | "dreadnought";
}

export default function SpaceShooter() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<"menu" | "playing" | "gameover">("menu");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [shields, setShields] = useState(100);
  const [wave, setWave] = useState(1);

  const stateRef = useRef({
    gameState: "menu" as "menu" | "playing" | "gameover",
    score: 0,
    highScore: 0,
    shields: 100,
    wave: 1,
    playerX: 0,
    playerY: -3.2,
    keys: { left: false, right: false, up: false, down: false, fire: false },
    lastFire: 0,
  });

  useEffect(() => {
    stateRef.current.gameState = gameState;
  }, [gameState]);

  useEffect(() => {
    const saved = localStorage.getItem("spaceshooter_highscore");
    if (saved) {
      const val = parseInt(saved, 10);
      setHighScore(val);
      stateRef.current.highScore = val;
    }
  }, []);

  const startGame = () => {
    stateRef.current.score = 0;
    stateRef.current.shields = 100;
    stateRef.current.wave = 1;
    stateRef.current.playerX = 0;
    stateRef.current.playerY = -3.2;
    setScore(0);
    setShields(100);
    setWave(1);
    setGameState("playing");
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    /* ─── Three.js Scene Setup ─── */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x04060f);

    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    /* ─── Lighting ─── */
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xaaccff, 1.5);
    dirLight.position.set(5, 10, 10);
    scene.add(dirLight);

    /* ─── Parallax Starfield ─── */
    const starCount = 800;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 24;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 24;
      starPos[i * 3 + 2] = -Math.random() * 20;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.05,
      transparent: true,
      opacity: 0.8,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    /* ─── Player Ship Mesh ─── */
    const playerShip = new THREE.Group();

    // Fuselage
    const fuseGeo = new THREE.ConeGeometry(0.35, 1.1, 4);
    const fuseMat = new THREE.MeshStandardMaterial({
      color: 0x00f5d4,
      roughness: 0.2,
      metalness: 0.8,
      emissive: 0x00443d,
      emissiveIntensity: 0.4,
    });
    const fuse = new THREE.Mesh(fuseGeo, fuseMat);
    fuse.rotation.z = 0;
    playerShip.add(fuse);

    // Cockpit Canopy
    const canopyGeo = new THREE.BoxGeometry(0.2, 0.4, 0.2);
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0x111e38, metalness: 0.9, roughness: 0.1 });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.set(0, -0.1, 0.15);
    playerShip.add(canopy);

    // Swept Wings
    [-0.5, 0.5].forEach((s) => {
      const wingGeo = new THREE.BoxGeometry(0.4, 0.1, 0.4);
      const wingMat = new THREE.MeshStandardMaterial({ color: 0xb892ff, roughness: 0.3 });
      const wing = new THREE.Mesh(wingGeo, wingMat);
      wing.position.set(s * 0.7, -0.3, 0);
      wing.rotation.z = s * -0.2;
      playerShip.add(wing);
    });

    // Plasma Engine Thrusters
    const thrusterGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const thrusterMat = new THREE.MeshBasicMaterial({ color: 0xff007f });
    [-0.22, 0.22].forEach((tx) => {
      const th = new THREE.Mesh(thrusterGeo, thrusterMat);
      th.position.set(tx, -0.55, 0);
      playerShip.add(th);
    });

    scene.add(playerShip);

    /* ─── Bullets & Enemies Pooling ─── */
    const bullets: Bullet[] = [];
    const enemies: Enemy[] = [];

    const bulletGeo = new THREE.BoxGeometry(0.08, 0.35, 0.08);
    const playerBulletMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4 });
    const enemyBulletMat = new THREE.MeshBasicMaterial({ color: 0xff3366 });

    function firePlayerBullet(x: number, y: number) {
      [-0.22, 0.22].forEach((offset) => {
        const mesh = new THREE.Mesh(bulletGeo, playerBulletMat);
        mesh.position.set(x + offset, y + 0.5, 0);
        scene.add(mesh);
        bullets.push({ mesh, x: mesh.position.x, y: mesh.position.y, isEnemy: false });
      });
    }

    function fireEnemyBullet(x: number, y: number) {
      const mesh = new THREE.Mesh(bulletGeo, enemyBulletMat);
      mesh.position.set(x, y - 0.4, 0);
      scene.add(mesh);
      bullets.push({ mesh, x, y: mesh.position.y, isEnemy: true });
    }

    function createEnemyMesh(type: "scout" | "fighter" | "dreadnought") {
      const group = new THREE.Group();
      if (type === "scout") {
        const geo = new THREE.OctahedronGeometry(0.35, 0);
        const mat = new THREE.MeshStandardMaterial({
          color: 0xff0055,
          emissive: 0x550022,
          roughness: 0.3,
        });
        group.add(new THREE.Mesh(geo, mat));
      } else if (type === "fighter") {
        const geo = new THREE.ConeGeometry(0.4, 0.9, 4);
        const mat = new THREE.MeshStandardMaterial({
          color: 0xffa500,
          emissive: 0x442200,
          roughness: 0.3,
        });
        const m = new THREE.Mesh(geo, mat);
        m.rotation.z = Math.PI;
        group.add(m);
      } else {
        const body = new THREE.Mesh(
          new THREE.BoxGeometry(1.2, 0.6, 0.6),
          new THREE.MeshStandardMaterial({ color: 0x9900ee, emissive: 0x330055, roughness: 0.2 })
        );
        group.add(body);
      }
      return group;
    }

    function spawnEnemy() {
      const s = stateRef.current;
      const roll = Math.random();
      let type: "scout" | "fighter" | "dreadnought" = "scout";
      let hp = 1;
      let speed = 2.0 + Math.random() * 0.8;

      if (roll > 0.75) {
        type = "dreadnought";
        hp = 5 + s.wave;
        speed = 0.9;
      } else if (roll > 0.45) {
        type = "fighter";
        hp = 2;
        speed = 1.6;
      }

      const mesh = createEnemyMesh(type);
      const x = (Math.random() - 0.5) * 8.5;
      const y = 6.0;
      mesh.position.set(x, y, 0);
      scene.add(mesh);

      enemies.push({
        mesh,
        x,
        y,
        speed,
        hp,
        maxHp: hp,
        shootTimer: Math.random() * 2,
        type,
      });
    }

    /* ─── Explosion Particles ─── */
    const expCount = 200;
    const expGeo = new THREE.BufferGeometry();
    const expPos = new Float32Array(expCount * 3);
    const expVel = new Float32Array(expCount * 3);
    for (let i = 0; i < expCount; i++) {
      expPos[i * 3] = 0;
      expPos[i * 3 + 1] = 0;
      expPos[i * 3 + 2] = 0;
      expVel[i * 3] = (Math.random() - 0.5) * 6;
      expVel[i * 3 + 1] = (Math.random() - 0.5) * 6;
      expVel[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    expGeo.setAttribute("position", new THREE.BufferAttribute(expPos, 3));
    const expMat = new THREE.PointsMaterial({
      color: 0xffbe0b,
      size: 0.15,
      transparent: true,
      opacity: 0,
    });
    const explosion = new THREE.Points(expGeo, expMat);
    scene.add(explosion);

    let exploding = false;
    let explosionTimer = 0;

    function triggerExplosion(x: number, y: number, color = 0xffbe0b) {
      exploding = true;
      explosionTimer = 0.6;
      expMat.opacity = 1;
      expMat.color.setHex(color);
      const arr = expGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < expCount; i++) {
        arr[i * 3] = x;
        arr[i * 3 + 1] = y;
        arr[i * 3 + 2] = 0;
      }
      expGeo.attributes.position.needsUpdate = true;
    }

    /* ─── Input Listeners ─── */
    const onKeyDown = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") s.keys.left = true;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") s.keys.right = true;
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") s.keys.up = true;
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") s.keys.down = true;
      if (e.key === " " || e.key === "Enter") s.keys.fire = true;
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") s.keys.left = false;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") s.keys.right = false;
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") s.keys.up = false;
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") s.keys.down = false;
      if (e.key === " " || e.key === "Enter") s.keys.fire = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    /* ─── Game Loop ─── */
    let frameId: number;
    let lastTime = performance.now();
    let spawnTimer = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);

      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const s = stateRef.current;

      // Parallax Stars
      const sArr = starGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < starCount; i++) {
        sArr[i * 3 + 1] -= (s.gameState === "playing" ? 2.5 : 0.8) * dt;
        if (sArr[i * 3 + 1] < -12) sArr[i * 3 + 1] = 12;
      }
      starGeo.attributes.position.needsUpdate = true;

      if (s.gameState === "playing") {
        // Player Movement
        const speed = 7.5;
        let vx = 0;
        let vy = 0;
        if (s.keys.left) vx -= speed;
        if (s.keys.right) vx += speed;
        if (s.keys.up) vy += speed;
        if (s.keys.down) vy -= speed;

        s.playerX = Math.max(-4.5, Math.min(4.5, s.playerX + vx * dt));
        s.playerY = Math.max(-4.2, Math.min(4.0, s.playerY + vy * dt));

        playerShip.position.set(s.playerX, s.playerY, 0);
        playerShip.rotation.z = (vx / speed) * -0.4;

        // Player Fire
        if ((s.keys.fire || true) && now - s.lastFire > 180) {
          s.lastFire = now;
          firePlayerBullet(s.playerX, s.playerY);
        }

        // Move Bullets
        for (let i = bullets.length - 1; i >= 0; i--) {
          const b = bullets[i];
          b.y += (b.isEnemy ? -7.0 : 14.0) * dt;
          b.mesh.position.y = b.y;

          if (b.y > 6.5 || b.y < -6.5) {
            scene.remove(b.mesh);
            bullets.splice(i, 1);
            continue;
          }

          // Enemy bullet hits player
          if (b.isEnemy) {
            const dist = Math.hypot(b.x - s.playerX, b.y - s.playerY);
            if (dist < 0.5) {
              scene.remove(b.mesh);
              bullets.splice(i, 1);
              s.shields -= 15;
              setShields(Math.max(0, s.shields));
              triggerExplosion(s.playerX, s.playerY, 0xff0044);
              if (s.shields <= 0) {
                s.gameState = "gameover";
                setGameState("gameover");
                if (s.score > s.highScore) {
                  s.highScore = s.score;
                  setHighScore(s.score);
                  localStorage.setItem("spaceshooter_highscore", s.score.toString());
                }
              }
              continue;
            }
          }
        }

        // Move & Manage Enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
          const e = enemies[i];
          e.y -= e.speed * dt;
          e.mesh.position.y = e.y;
          e.mesh.rotation.y += dt * 2;

          // Enemy shooting
          e.shootTimer += dt;
          if (e.type !== "scout" && e.shootTimer > 1.8) {
            e.shootTimer = 0;
            fireEnemyBullet(e.x, e.y);
          }

          // Check hit by player bullets
          for (let j = bullets.length - 1; j >= 0; j--) {
            const b = bullets[j];
            if (b.isEnemy) continue;
            const dist = Math.hypot(b.x - e.x, b.y - e.y);
            if (dist < 0.6) {
              scene.remove(b.mesh);
              bullets.splice(j, 1);
              e.hp -= 1;
              if (e.hp <= 0) {
                triggerExplosion(e.x, e.y, e.type === "dreadnought" ? 0x9900ee : 0xffa500);
                scene.remove(e.mesh);
                enemies.splice(i, 1);
                s.score += e.type === "dreadnought" ? 500 : 150;
                setScore(s.score);
                break;
              }
            }
          }

          // Crash into player
          const pDist = Math.hypot(e.x - s.playerX, e.y - s.playerY);
          if (pDist < 0.7) {
            triggerExplosion(e.x, e.y, 0xff0044);
            scene.remove(e.mesh);
            enemies.splice(i, 1);
            s.shields -= 25;
            setShields(Math.max(0, s.shields));
            if (s.shields <= 0) {
              s.gameState = "gameover";
              setGameState("gameover");
            }
            continue;
          }

          // Offscreen removal
          if (e.y < -6.5) {
            scene.remove(e.mesh);
            enemies.splice(i, 1);
          }
        }

        // Spawn Enemies
        spawnTimer += dt;
        if (spawnTimer > Math.max(0.6, 1.4 - s.wave * 0.1)) {
          spawnTimer = 0;
          spawnEnemy();
        }

        // Wave progression
        if (s.score > s.wave * 1500) {
          s.wave += 1;
          setWave(s.wave);
          s.shields = Math.min(100, s.shields + 25);
          setShields(s.shields);
        }
      }

      // Explosion handling
      if (exploding) {
        explosionTimer -= dt;
        expMat.opacity = Math.max(0, explosionTimer / 0.6);
        const arr = expGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < expCount; i++) {
          arr[i * 3] += expVel[i * 3] * dt;
          arr[i * 3 + 1] += expVel[i * 3 + 1] * dt;
          arr[i * 3 + 2] += expVel[i * 3 + 2] * dt;
        }
        expGeo.attributes.position.needsUpdate = true;
        if (explosionTimer <= 0) exploding = false;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      cancelAnimationFrame(frameId);
      bullets.forEach((b) => scene.remove(b.mesh));
      enemies.forEach((e) => scene.remove(e.mesh));
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-dark">
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* Top HUD */}
      {gameState === "playing" && (
        <div className="absolute top-16 left-0 right-0 px-4 sm:px-8 flex items-start justify-between pointer-events-none z-30">
          {/* Shields Bar */}
          <div className="bg-black/75 border border-primary/30 backdrop-blur-md px-4 py-2.5 rounded-sm">
            <div className="flex items-center justify-between gap-4 mb-1">
              <span className="text-[10px] font-mono text-white/40 uppercase">SHIELDS</span>
              <span className="text-xs font-mono font-bold text-primary">{shields}%</span>
            </div>
            <div className="w-28 sm:w-36 h-2 bg-white/10 rounded-full overflow-hidden border border-white/20">
              <div
                className={`h-full transition-all duration-150 ${
                  shields > 40 ? "bg-primary" : "bg-red-500 animate-pulse"
                }`}
                style={{ width: `${shields}%` }}
              />
            </div>
          </div>

          {/* Wave & Score */}
          <div className="bg-black/75 border border-white/20 backdrop-blur-md px-4 py-2.5 rounded-sm text-right font-mono">
            <span className="text-[10px] text-accent tracking-widest block">WAVE {wave}</span>
            <span className="text-2xl sm:text-3xl font-bold text-white tracking-wider">
              {score.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Start Menu */}
      {gameState === "menu" && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40 p-4">
          <div className="bg-dark/95 border border-primary/40 p-6 sm:p-10 max-w-md w-full text-center shadow-2xl rounded-sm">
            <div className="inline-block px-3 py-1 bg-primary/20 border border-primary/40 text-primary text-[11px] font-mono tracking-widest uppercase mb-3">
              DEEP SPACE DEFENDER
            </div>
            <h2
              className="text-4xl sm:text-6xl font-bold text-white tracking-wider mb-2"
              style={{ fontFamily: "Bebas Neue, sans-serif" }}
            >
              SPACE SHOOTER
            </h2>
            <p className="text-white/50 text-xs sm:text-sm font-mono mb-6">
              Blast through incoming enemy squadrons and survive waves of deep-space combat!
            </p>

            <div className="bg-black/40 border border-white/10 p-3 mb-6 font-mono text-xs text-left">
              <div className="text-white/40 mb-1 uppercase text-[10px]">Controls:</div>
              <div className="text-primary font-bold">WASD / Arrow Keys to Move</div>
              <div className="text-accent font-bold">Auto-Fire Plasma Cannons</div>
            </div>

            {highScore > 0 && (
              <div className="mb-5 text-xs font-mono text-white/60">
                HIGH SCORE: <span className="text-accent font-bold">{highScore.toLocaleString()}</span>
              </div>
            )}

            <button
              type="button"
              onClick={startGame}
              className="w-full py-3.5 bg-primary hover:bg-primary/90 text-dark font-mono font-bold tracking-widest text-sm transition-transform active:scale-95 shadow-lg shadow-primary/20"
            >
              LAUNCH MISSION
            </button>
          </div>
        </div>
      )}

      {/* Game Over */}
      {gameState === "gameover" && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-40 p-4 animate-in fade-in duration-200">
          <div className="bg-dark/95 border border-red-500/50 p-6 sm:p-10 max-w-md w-full text-center shadow-2xl rounded-sm">
            <div className="inline-block px-3 py-1 bg-red-500/20 border border-red-500/40 text-red-400 text-[11px] font-mono tracking-widest uppercase mb-3">
              HULL BREACHED
            </div>
            <h2
              className="text-4xl sm:text-6xl font-bold text-white tracking-wider mb-4"
              style={{ fontFamily: "Bebas Neue, sans-serif" }}
            >
              GAME OVER
            </h2>

            <div className="bg-black/50 border border-white/10 p-4 mb-6 font-mono">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-white/40 uppercase">Final Score</span>
                <span className="text-xl font-bold text-white">{score.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-t border-white/10 pt-2">
                <span className="text-xs text-white/40 uppercase">High Score</span>
                <span className="text-xl font-bold text-accent">{highScore.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={startGame}
              className="w-full py-3.5 bg-primary hover:bg-primary/90 text-dark font-mono font-bold tracking-widest text-sm transition-transform active:scale-95"
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
