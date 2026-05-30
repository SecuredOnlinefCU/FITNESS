'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function randomSpherePoint(radius: number) {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  const r = radius * Math.cbrt(Math.random());
  return [r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi)] as const;
}

export default function HologramScene() {
  const pointsRef = useRef<THREE.Points>(null);
  const { pointer } = useThree();
  const target = useRef({ x: 0, y: 0 });

  const [positions, sizes] = useMemo(() => {
    const count = 25000;
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const [x, y, z] = randomSpherePoint(3.5 + Math.random() * 1.5);
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      sz[i] = 0.02 + Math.random() * 0.06;
    }
    return [pos, sz];
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      target.current.x = (e.clientX / window.innerWidth - 0.5) * 0.3;
      target.current.y = -(e.clientY / window.innerHeight - 0.5) * 0.3;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const t = state.clock.elapsedTime;

    pointsRef.current.rotation.x += (target.current.y - pointsRef.current.rotation.x) * 0.02;
    pointsRef.current.rotation.y += (target.current.x - pointsRef.current.rotation.y) * 0.02;

    const positions_ = pointsRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < positions_.length; i += 3) {
      const idx = i / 3;
      const seed = idx * 0.01;
      const wave = Math.sin(t * 0.4 + seed * 5) * 0.03;
      const baseX = positions[i];
      positions_[i] = baseX + wave;
    }
    (pointsRef.current.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;

    const colors = pointsRef.current.geometry.attributes.color?.array as Float32Array | undefined;
    if (colors) {
      const hueShift = Math.sin(t * 0.1) * 0.03;
      for (let i = 0; i < colors.length; i += 3) {
        const idx_ = i / 3;
        colors[i] = Math.min(1, 0.44 + hueShift + Math.sin(t * 0.3 + idx_ * 0.5) * 0.06);
        colors[i + 1] = 0.85 + Math.sin(t * 0.25 + idx_ * 0.4) * 0.1;
        colors[i + 2] = 0.55 + Math.cos(t * 0.2 + idx_ * 0.3) * 0.1;
      }
      (pointsRef.current.geometry.attributes.color as THREE.BufferAttribute).needsUpdate = true;
    }
  });

  return (
    <Points ref={pointsRef}>
      <PointMaterial
        size={0.04}
        sizeAttenuation
        transparent
        opacity={0.8}
        depthWrite={false}
        vertexColors
        blending={THREE.AdditiveBlending}
      />
      <bufferGeometry>
        <bufferAttribute args={[positions, 3]} attach="attributes-position" count={positions.length / 3} itemSize={3} />
        <bufferAttribute
          args={[new Float32Array(positions.length).map((_, i) => {
            const phi = Math.acos(2 * positions[i * 3] / 5 - 1);
            return 0.5 + 0.3 * Math.sin(phi);
          }), 3]}
          attach="attributes-color"
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
    </Points>
  );
}
