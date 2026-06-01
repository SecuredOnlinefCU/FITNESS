'use client';

import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { AdaptiveDpr, AdaptiveEvents, Float, Text } from '@react-three/drei';
import { Suspense } from 'react';
import * as THREE from 'three';

type BarDatum = { label: string; value: number; color: string; maxValue: number };

function Bar({ datum, index }: { datum: BarDatum; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetHeight = Math.max(0.1, (datum.value / datum.maxValue) * 3);
  const startDelay = index * 0.15;

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = Math.min(1, Math.max(0, (clock.elapsedTime - startDelay) / 0.8));
    const eased = 1 - Math.pow(1 - t, 3);
    meshRef.current.scale.y = eased;
  });

  const xPos = (index - 2) * 1.6;

  return (
    <group position={[xPos, 0, 0]}>
      <Float speed={0.5 + index * 0.1} floatIntensity={0.05}>
        <mesh ref={meshRef} position={[0, targetHeight / 2, 0]} scale-y={0}>
          <boxGeometry args={[0.6, targetHeight, 0.6]} />
          <meshStandardMaterial color={datum.color} roughness={0.3} metalness={0.1} transparent opacity={0.9} />
        </mesh>
      </Float>
      <mesh position={[0, targetHeight + 0.15, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color={datum.color} />
      </mesh>
      <Text position={[0, targetHeight + 0.45, 0]} fontSize={0.15} color="#f4f5ef" anchorX="center" anchorY="bottom">
        {datum.label}
      </Text>
    </group>
  );
}

function Scene({ data }: { data: BarDatum[] }) {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  const enriched = useMemo(
    () => data.map((d) => ({ ...d, maxValue })),
    [data, maxValue],
  );

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={0.8} />
      <directionalLight position={[-3, 4, -2]} intensity={0.3} />
      <group position={[0, -1.5, 0]}>
        {enriched.map((d, i) => (
          <Bar key={d.label} datum={d} index={i} />
        ))}
      </group>
    </>
  );
}

export default function AnalyticsBars3D({ data }: { data: BarDatum[] }) {
  const [errored, setErrored] = useState(false);

  if (data.length === 0) return null;
  if (errored) return <div className="flex h-64 w-full items-center justify-center rounded-2xl bg-muted"><p className="text-xs text-muted-foreground">3D visualization unavailable</p></div>;

  return (
    <div className="h-64 w-full overflow-hidden rounded-2xl bg-ink-900/60">
      <Canvas
        camera={{ position: [0, 2, 5.5], fov: 45 }}
        dpr={[1, 1.5]}
        frameloop="always"
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
        <Suspense fallback={null}>
          <Scene data={data} />
        </Suspense>
      </Canvas>
    </div>
  );
}
