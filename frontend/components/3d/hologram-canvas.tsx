'use client';

import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr, AdaptiveEvents } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Suspense, lazy } from 'react';

const HologramScene = lazy(() => import('./hologram-scene'));

export default function HologramCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 50 }}
      dpr={[1, 1.5]}
      frameloop="demand"
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
      <Suspense fallback={null}>
        <HologramScene />
      </Suspense>
      <EffectComposer>
        <Bloom luminanceThreshold={0.8} luminanceSmoothing={0.08} intensity={0.4} />
      </EffectComposer>
    </Canvas>
  );
}
