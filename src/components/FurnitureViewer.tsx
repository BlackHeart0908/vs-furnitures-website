import { useEffect, useRef, useState } from 'react';

interface Props {
  fallbackImage?: string;
  fallbackAlt?: string;
}

export default function FurnitureViewer({
  fallbackImage = '/images/kitchen-hero.jpg',
  fallbackAlt = 'Modular kitchen by VS Furnitures Indore',
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (error) return;

    let renderer: import('three').WebGLRenderer | null = null;
    let animId: number;

    const init = async () => {
      try {
        const THREE = await import('three');
        if (!mountRef.current) return;

        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;

        // ── Scene ──────────────────────────────────────────────────────────
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#0A1A30');
        scene.fog = new THREE.Fog('#0A1A30', 10, 22);

        // ── Camera ─────────────────────────────────────────────────────────
        const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
        camera.position.set(4.5, 1.8, 4.5);
        camera.lookAt(0, 0.9, 0);

        // ── Renderer ───────────────────────────────────────────────────────
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        mountRef.current.appendChild(renderer.domElement);

        // ── Lights ─────────────────────────────────────────────────────────
        // Soft ambient fill
        scene.add(new THREE.AmbientLight(0x1a2f50, 2.4));

        // Main warm key light (top)
        const keyLight = new THREE.DirectionalLight(0xfff5e0, 4.0);
        keyLight.position.set(3, 6, 4);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.setScalar(1024);
        keyLight.shadow.camera.near = 0.5;
        keyLight.shadow.camera.far = 20;
        keyLight.shadow.camera.left = -5;
        keyLight.shadow.camera.right = 5;
        keyLight.shadow.camera.top = 5;
        keyLight.shadow.camera.bottom = -5;
        keyLight.shadow.bias = -0.001;
        scene.add(keyLight);

        // Gold orbiting point light — the centrepiece of the drama
        const orbitLight = new THREE.PointLight(0xc2a24a, 8, 8);
        orbitLight.castShadow = false;
        scene.add(orbitLight);

        // Cool blue-teal rim/back light
        const rimLight = new THREE.DirectionalLight(0x3a6a9a, 1.6);
        rimLight.position.set(-5, 3, -4);
        scene.add(rimLight);

        // Under-counter warm fill (simulates LED strip)
        const counterLight = new THREE.PointLight(0xffe0a0, 3, 3.5);
        counterLight.position.set(0, 0.6, 0.5);
        scene.add(counterLight);

        // ── Materials ──────────────────────────────────────────────────────
        const cabinetMat = new THREE.MeshStandardMaterial({
          color: 0x3d2b1a, roughness: 0.45, metalness: 0.08,
        });
        const upperMat = new THREE.MeshStandardMaterial({
          color: 0x102542, roughness: 0.35, metalness: 0.15,
        });
        const counterMat = new THREE.MeshStandardMaterial({
          color: 0xdad4c8, roughness: 0.12, metalness: 0.1,
        });
        const goldMat = new THREE.MeshStandardMaterial({
          color: 0xc2a24a, roughness: 0.18, metalness: 0.85,
        });
        const floorMat = new THREE.MeshStandardMaterial({
          color: 0x1a1412, roughness: 0.85, metalness: 0.05,
        });
        const wallMat = new THREE.MeshStandardMaterial({
          color: 0x0d1e35, roughness: 0.9, metalness: 0.0,
        });
        const backsplashMat = new THREE.MeshStandardMaterial({
          color: 0x6b8599, roughness: 0.2, metalness: 0.5,
        });

        // ── Kitchen geometry ───────────────────────────────────────────────
        const group = new THREE.Group();

        // Floor
        const floor = new THREE.Mesh(new THREE.BoxGeometry(9, 0.08, 7), floorMat);
        floor.position.y = -0.04;
        floor.receiveShadow = true;
        group.add(floor);

        // Back wall
        const backWall = new THREE.Mesh(new THREE.BoxGeometry(9, 5, 0.12), wallMat);
        backWall.position.set(0, 2.5, -1.8);
        backWall.receiveShadow = true;
        group.add(backWall);

        // Side wall (left)
        const sideWall = new THREE.Mesh(new THREE.BoxGeometry(0.12, 5, 7), wallMat);
        sideWall.position.set(-3.6, 2.5, 1.6);
        sideWall.receiveShadow = true;
        group.add(sideWall);

        // L-shaped base cabinets — main run
        const baseMain = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.86, 0.62), cabinetMat);
        baseMain.position.set(-0.7, 0.43, -1.5);
        baseMain.castShadow = true;
        baseMain.receiveShadow = true;
        group.add(baseMain);

        // L-shaped base cabinets — side run
        const baseSide = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.86, 2.4), cabinetMat);
        baseSide.position.set(-2.7, 0.43, -0.3);
        baseSide.castShadow = true;
        baseSide.receiveShadow = true;
        group.add(baseSide);

        // Countertop — main
        const counterMain = new THREE.Mesh(new THREE.BoxGeometry(3.85, 0.055, 0.68), counterMat);
        counterMain.position.set(-0.7, 0.885, -1.5);
        counterMain.castShadow = true;
        counterMain.receiveShadow = true;
        group.add(counterMain);

        // Countertop — side
        const counterSide = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.055, 2.45), counterMat);
        counterSide.position.set(-2.7, 0.885, -0.3);
        counterSide.castShadow = true;
        counterSide.receiveShadow = true;
        group.add(counterSide);

        // Backsplash — main
        const bsMain = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.55, 0.04), backsplashMat);
        bsMain.position.set(-0.7, 1.2, -1.79);
        group.add(bsMain);

        // Backsplash — side
        const bsSide = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.55, 2.4), backsplashMat);
        bsSide.position.set(-2.99, 1.2, -0.3);
        group.add(bsSide);

        // Upper cabinets — main run (4 units)
        const upperMain = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.75, 0.34), upperMat);
        upperMain.position.set(-0.7, 2.08, -1.63);
        upperMain.castShadow = true;
        group.add(upperMain);

        // Upper cabinets — side run
        const upperSide = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.75, 2.4), upperMat);
        upperSide.position.set(-2.83, 2.08, -0.3);
        upperSide.castShadow = true;
        group.add(upperSide);

        // Cabinet door panels on base (main) — 5 doors
        for (let i = 0; i < 5; i++) {
          const door = new THREE.Mesh(
            new THREE.BoxGeometry(0.7, 0.78, 0.02),
            new THREE.MeshStandardMaterial({ color: 0x4a341f, roughness: 0.4, metalness: 0.1 })
          );
          door.position.set(-2.1 + i * 0.75, 0.43, -1.18);
          group.add(door);

          // Gold handle
          const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.28, 12), goldMat);
          handle.rotation.z = Math.PI / 2;
          handle.position.set(-2.1 + i * 0.75, 0.56, -1.165);
          group.add(handle);
        }

        // Cabinet door panels on upper — 4 doors
        for (let i = 0; i < 4; i++) {
          const udoor = new THREE.Mesh(
            new THREE.BoxGeometry(0.88, 0.68, 0.02),
            new THREE.MeshStandardMaterial({ color: 0x0d1e35, roughness: 0.3, metalness: 0.2 })
          );
          udoor.position.set(-2.03 + i * 0.92, 2.08, -1.46);
          group.add(udoor);

          const uhandle = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 12), goldMat);
          uhandle.rotation.z = Math.PI / 2;
          uhandle.position.set(-2.03 + i * 0.92, 1.77, -1.445);
          group.add(uhandle);
        }

        // Sink (inset in counter)
        const sink = new THREE.Mesh(
          new THREE.BoxGeometry(0.52, 0.06, 0.38),
          new THREE.MeshStandardMaterial({ color: 0x8899aa, roughness: 0.05, metalness: 0.9 })
        );
        sink.position.set(0.8, 0.888, -1.5);
        group.add(sink);

        // Tap
        const tapBase = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.18, 10), goldMat);
        tapBase.position.set(0.8, 0.98, -1.62);
        group.add(tapBase);
        const tapArm = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.22, 10), goldMat);
        tapArm.rotation.z = Math.PI / 2;
        tapArm.position.set(0.8, 1.09, -1.55);
        group.add(tapArm);

        scene.add(group);

        // ── Scale-in entrance animation ────────────────────────────────────
        group.scale.setScalar(0.6);
        group.position.y = -0.4;
        let entranceDone = false;
        const entranceStart = performance.now();
        const ENTRANCE_MS = 900;

        setLoaded(true);

        // ── Drag to rotate ─────────────────────────────────────────────────
        let isDragging = false;
        let prevX = 0;
        let userAngle = 0;
        let userVelocity = 0;

        const onDown = (e: MouseEvent | TouchEvent) => {
          isDragging = true;
          prevX = 'touches' in e ? e.touches[0].clientX : e.clientX;
          userVelocity = 0;
        };
        const onMove = (e: MouseEvent | TouchEvent) => {
          if (!isDragging) return;
          const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
          const delta = (x - prevX) * 0.012;
          userAngle += delta;
          userVelocity = delta;
          prevX = x;
        };
        const onUp = () => { isDragging = false; };

        renderer.domElement.addEventListener('mousedown', onDown);
        renderer.domElement.addEventListener('mousemove', onMove);
        renderer.domElement.addEventListener('mouseup', onUp);
        renderer.domElement.addEventListener('touchstart', onDown as EventListener, { passive: true });
        renderer.domElement.addEventListener('touchmove', onMove as EventListener, { passive: true });
        renderer.domElement.addEventListener('touchend', onUp);

        // ── Render loop ────────────────────────────────────────────────────
        let time = 0;

        const animate = () => {
          animId = requestAnimationFrame(animate);
          time += 0.016;

          // Entrance
          if (!entranceDone) {
            const t = Math.min((performance.now() - entranceStart) / ENTRANCE_MS, 1);
            const ease = 1 - Math.pow(1 - t, 3); // cubic ease-out
            group.scale.setScalar(0.6 + 0.4 * ease);
            group.position.y = -0.4 + 0.4 * ease;
            if (t >= 1) entranceDone = true;
          }

          // Auto-rotation with momentum
          if (!isDragging) {
            userVelocity *= 0.94;
            userAngle += 0.010 + userVelocity;
          }

          // Camera orbit — circles the kitchen at a dramatic low angle
          const orbitRadius = 5.8;
          const orbitY = 1.75 + Math.sin(time * 0.18) * 0.18; // gentle float
          camera.position.x = Math.sin(userAngle) * orbitRadius;
          camera.position.z = Math.cos(userAngle) * orbitRadius;
          camera.position.y = orbitY;
          camera.lookAt(0, 0.85, 0);

          // Gold orbiting light sweeps around the kitchen at counter height
          const lightAngle = time * 0.7;
          orbitLight.position.set(
            Math.sin(lightAngle) * 2.4,
            1.05,
            Math.cos(lightAngle) * 2.0
          );
          // Subtle pulsing intensity
          orbitLight.intensity = 7 + Math.sin(time * 1.4) * 1.5;

          // Counter LED flicker (subtle)
          counterLight.intensity = 2.8 + Math.sin(time * 3.1) * 0.2;

          renderer!.render(scene, camera);
        };
        animate();

      } catch {
        setError(true);
      }
    };

    init();

    return () => {
      cancelAnimationFrame(animId);
      renderer?.dispose();
      if (mountRef.current) {
        mountRef.current.querySelector('canvas')?.remove();
      }
    };
  }, [error]);

  if (error) {
    return (
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <img
          src={fallbackImage}
          alt={fallbackAlt}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {!loaded && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: '#0A1A30',
          color: '#C2A24A', fontFamily: 'var(--font-body)', fontSize: '0.9rem',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          Loading…
        </div>
      )}
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      {loaded && (
        <p style={{
          position: 'absolute', bottom: '10px', left: 0, right: 0,
          textAlign: 'center', color: 'rgba(255,255,255,0.35)',
          fontSize: '0.72rem', pointerEvents: 'none', letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}>
          Drag to explore
        </p>
      )}
    </div>
  );
}
