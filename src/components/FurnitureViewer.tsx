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

        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#0A1A30');

        const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
        camera.position.set(0, 1.2, 4.5);

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        mountRef.current.appendChild(renderer.domElement);

        // Ambient + directional lights
        scene.add(new THREE.AmbientLight(0xfff8ec, 0.6));
        const dir = new THREE.DirectionalLight(0xfff8ec, 1.2);
        dir.position.set(4, 8, 5);
        dir.castShadow = true;
        scene.add(dir);
        const rimLight = new THREE.DirectionalLight(0xc2a24a, 0.4);
        rimLight.position.set(-4, 2, -3);
        scene.add(rimLight);

        // Simple modular kitchen placeholder geometry
        const woodMat = new THREE.MeshStandardMaterial({ color: 0xd4a96a, roughness: 0.7, metalness: 0.05 });
        const darkMat = new THREE.MeshStandardMaterial({ color: 0x102542, roughness: 0.4, metalness: 0.1 });
        const counterMat = new THREE.MeshStandardMaterial({ color: 0xe8e0d4, roughness: 0.3, metalness: 0.05 });
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xc2a24a, roughness: 0.3, metalness: 0.6 });

        const group = new THREE.Group();

        // Base cabinet
        const base = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.88, 0.6), woodMat);
        base.position.y = 0.44;
        base.castShadow = true;
        group.add(base);

        // Counter top
        const counter = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.06, 0.66), counterMat);
        counter.position.y = 0.9;
        group.add(counter);

        // Upper cabinet
        const upper = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.72, 0.35), darkMat);
        upper.position.set(0, 2, 0.125);
        upper.castShadow = true;
        group.add(upper);

        // Cabinet doors (lower) — 6 panels
        for (let i = 0; i < 6; i++) {
          const door = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.78, 0.02), woodMat);
          door.position.set(-1.4 + i * 0.58, 0.44, 0.31);
          group.add(door);
          // Handle
          const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.22, 8), goldMat);
          handle.rotation.z = Math.PI / 2;
          handle.position.set(-1.4 + i * 0.58, 0.54, 0.325);
          group.add(handle);
        }

        // Upper doors — 4 panels
        for (let i = 0; i < 4; i++) {
          const udoor = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.62, 0.02), darkMat);
          udoor.position.set(-1.26 + i * 0.86, 2, 0.3);
          group.add(udoor);
        }

        // Floor
        const floor = new THREE.Mesh(new THREE.BoxGeometry(6, 0.05, 5), new THREE.MeshStandardMaterial({ color: 0xf0ebe3, roughness: 0.9 }));
        floor.position.y = -0.025;
        floor.receiveShadow = true;
        group.add(floor);

        scene.add(group);
        setLoaded(true);

        // Mouse rotate
        let isDragging = false;
        let prevX = 0;
        let targetY = 0;

        const onDown = (e: MouseEvent | TouchEvent) => {
          isDragging = true;
          prevX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        };
        const onMove = (e: MouseEvent | TouchEvent) => {
          if (!isDragging) return;
          const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
          targetY += (x - prevX) * 0.008;
          prevX = x;
        };
        const onUp = () => { isDragging = false; };

        renderer.domElement.addEventListener('mousedown', onDown);
        renderer.domElement.addEventListener('mousemove', onMove);
        renderer.domElement.addEventListener('mouseup', onUp);
        renderer.domElement.addEventListener('touchstart', onDown as EventListener);
        renderer.domElement.addEventListener('touchmove', onMove as EventListener);
        renderer.domElement.addEventListener('touchend', onUp);

        const animate = () => {
          animId = requestAnimationFrame(animate);
          if (!isDragging) targetY += 0.003;
          group.rotation.y += (targetY - group.rotation.y) * 0.05;
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
        const canvas = mountRef.current.querySelector('canvas');
        canvas?.remove();
      }
    };
  }, [error]);

  if (error) {
    return (
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <img src={fallbackImage} alt={fallbackAlt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {!loaded && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: '#0A1A30', color: '#C2A24A',
          fontFamily: 'var(--font-body)', fontSize: '0.9rem',
        }}>
          Loading 3D viewer…
        </div>
      )}
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      {loaded && (
        <p style={{
          position: 'absolute', bottom: '12px', left: 0, right: 0, textAlign: 'center',
          color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem', pointerEvents: 'none',
        }}>
          Drag to rotate
        </p>
      )}
    </div>
  );
}
