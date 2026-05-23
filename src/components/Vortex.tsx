import { useRef, useEffect, useMemo, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Dark-theme vortex colors — deeper, richer purples
const vortexColors = [
  '#8b5cf6',  // Neon purple
  '#7c3aed',  // Violet
  '#a78bfa',  // Purple light
  '#6d28d9',  // Deep purple
  '#c084fc',  // Soft violet
  '#5b21b6',  // Purple dark
];

interface BandProps {
  radius: number;
  instanceCount: number;
  instanceScale: number;
  colors: string[];
  spinDirection: number;
  spinAngle: React.RefObject<{ value: number }>;
  scrollProgress: React.RefObject<number>;
}

const Band = memo(function Band({
  radius,
  instanceCount,
  instanceScale,
  colors,
  spinDirection,
  spinAngle,
  scrollProgress,
}: BandProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        roughness: 0.3,
        metalness: 0.2,
        emissive: '#2e1065',
        emissiveIntensity: 0.15,
        transparent: true,
        opacity: 0.85,
      }),
    []
  );

  useEffect(() => {
    if (!meshRef.current) return;

    const matrix = new THREE.Matrix4();
    const color = new THREE.Color();

    for (let i = 0; i < instanceCount; i++) {
      const t = (i / instanceCount) * Math.PI * 2;
      const x = Math.cos(t) * radius;
      const y = (i / instanceCount) * 13 - 5;
      const z = Math.sin(t) * radius;

      matrix.makeRotationY(t);
      matrix.setPosition(x, y, z);
      matrix.scale(new THREE.Vector3(instanceScale, instanceScale, instanceScale));

      meshRef.current.setMatrixAt(i, matrix);

      color.set(colors[i % colors.length]);
      meshRef.current.setColorAt(i, color);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [radius, instanceCount, colors, instanceScale]);

  useFrame(() => {
    if (!meshRef.current || !spinAngle.current || scrollProgress.current === undefined) return;

    const rot =
      spinAngle.current.value +
      scrollProgress.current * Math.PI * 2 * 1.5 * spinDirection;

    meshRef.current.rotation.set(0, 0, rot);
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, instanceCount]}
      castShadow
      receiveShadow
    />
  );
});

interface VortexProps {
  scrollProgress: React.RefObject<number>;
}

function VortexScene({ scrollProgress }: VortexProps) {
  const groupRef = useRef<THREE.Group>(null);
  const spinAngle = useRef({ value: 0 });

  useFrame((state, delta) => {
    spinAngle.current.value += delta * 0.15;

    if (groupRef.current && scrollProgress.current !== undefined) {
      const cameraZ = -2.5 + scrollProgress.current * 18;
      state.camera.position.set(0, 0, cameraZ);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Ambient point lights for glow */}
      <pointLight position={[0, 0, 0]} intensity={0.3} color="#8b5cf6" distance={10} />
      <pointLight position={[5, 5, -2]} intensity={0.2} color="#c084fc" distance={8} />
      <pointLight position={[-5, -5, -2]} intensity={0.2} color="#7c3aed" distance={8} />

      <Band
        radius={1.2}
        instanceCount={60}
        instanceScale={0.18}
        colors={vortexColors.slice(0, 3)}
        spinDirection={1}
        spinAngle={spinAngle}
        scrollProgress={scrollProgress}
      />
      <Band
        radius={1.8}
        instanceCount={80}
        instanceScale={0.14}
        colors={vortexColors.slice(1, 5)}
        spinDirection={-1}
        spinAngle={spinAngle}
        scrollProgress={scrollProgress}
      />
      <Band
        radius={2.5}
        instanceCount={100}
        instanceScale={0.10}
        colors={vortexColors.slice(2, 6)}
        spinDirection={1}
        spinAngle={spinAngle}
        scrollProgress={scrollProgress}
      />
    </group>
  );
}

export function VortexCanvas({ scrollProgress }: VortexProps) {
  return (
    <Canvas
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
      camera={{ position: [0, 0, -2.5], fov: 45 }}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      }}
      onCreated={({ gl }) => {
        gl.setClearColor('#0a0a0f', 1);
      }}
    >
      <color attach="background" args={['#0a0a0f']} />
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.6} color="#a78bfa" />
      <pointLight position={[-10, -10, -5]} intensity={0.4} color="#6d28d9" />
      <VortexScene scrollProgress={scrollProgress} />
    </Canvas>
  );
}
