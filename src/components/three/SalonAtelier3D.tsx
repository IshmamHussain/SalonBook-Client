'use client';

import { Environment, Float, MeshTransmissionMaterial, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { WebGLErrorBoundary } from './WebGLErrorBoundary';

export type AtelierMood = 'copper' | 'mist' | 'evening';

const MOOD_CONFIG: Record<
  AtelierMood,
  { keyLight: string; rimLight: string; coreColor: string; ringColor: string }
> = {
  copper: {
    keyLight: '#F0A076',
    rimLight: '#8DB4D4',
    coreColor: '#E08A5E',
    ringColor: '#D49B6A',
  },
  mist: {
    keyLight: '#A8D0F0',
    rimLight: '#E08A5E',
    coreColor: '#8DB4D4',
    ringColor: '#B4C2CF',
  },
  evening: {
    keyLight: '#D47B53',
    rimLight: '#496E8F',
    coreColor: '#3B678C',
    ringColor: '#C98A5C',
  },
};

function AtelierSculpture({ mood, reducedMotion }: { mood: AtelierMood; reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const palette = MOOD_CONFIG[mood];

  useFrame((_, delta) => {
    if (reducedMotion) return;
    const step = Math.min(delta, 0.05);
    if (groupRef.current) {
      groupRef.current.rotation.y += step * 0.24;
    }
    if (ringRef.current) {
      ringRef.current.rotation.x += step * 0.18;
      ringRef.current.rotation.z -= step * 0.14;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={reducedMotion ? 0 : 1.5} rotationIntensity={reducedMotion ? 0 : 0.25} floatIntensity={reducedMotion ? 0 : 0.45}>
        {/* Fluted optical salon glass prism */}
        <mesh castShadow receiveShadow>
          <octahedronGeometry args={[1.28, 2]} />
          <MeshTransmissionMaterial
            backside
            samples={6}
            resolution={256}
            thickness={1.4}
            roughness={0.14}
            anisotropy={0.3}
            chromaticAberration={0.08}
            color={palette.coreColor}
          />
        </mesh>

        {/* Brushed copper studio orbit ring */}
        <mesh ref={ringRef} rotation={[Math.PI / 3.2, 0.2, 0]}>
          <torusGeometry args={[1.95, 0.045, 24, 96]} />
          <meshStandardMaterial color={palette.ringColor} metalness={0.92} roughness={0.22} />
        </mesh>

        {/* Secondary architectural halo */}
        <mesh rotation={[-Math.PI / 4, Math.PI / 5, 0]}>
          <torusGeometry args={[2.32, 0.02, 16, 96]} />
          <meshStandardMaterial color="#8DB4D4" metalness={0.85} roughness={0.28} />
        </mesh>
      </Float>
    </group>
  );
}

function AtelierFallback({ mood }: { mood: AtelierMood }) {
  const palette = MOOD_CONFIG[mood];
  return (
    <div
      className="flex h-full w-full items-center justify-center p-8 text-center"
      style={{
        background: `radial-gradient(circle at 50% 45%, ${palette.coreColor}33 0%, rgba(18,25,34,0.95) 68%)`,
      }}
    >
      <div className="space-y-3">
        <div
          className="mx-auto h-28 w-28 rounded-full border border-white/25"
          style={{
            background: `linear-gradient(135deg, ${palette.keyLight}66, ${palette.rimLight}44)`,
          }}
        />
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#B4C2CF]">
          SalonBook Spatial Studio Preview
        </p>
      </div>
    </div>
  );
}

export default function SalonAtelier3D({ mood }: { mood: AtelierMood }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const palette = MOOD_CONFIG[mood];

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return (
    <div className="relative h-[340px] w-full overflow-hidden border border-white/15 bg-[#0E141C] sm:h-[400px]">
      <WebGLErrorBoundary fallback={<AtelierFallback mood={mood} />}>
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0.4, 5.4], fov: 42 }}
          fallback={<AtelierFallback mood={mood} />}
        >
          <ambientLight intensity={0.45} />
          <directionalLight position={[4, 5, 4]} intensity={1.8} color={palette.keyLight} />
          <pointLight position={[-4, -3, 3]} intensity={1.4} color={palette.rimLight} />
          <Suspense fallback={null}>
            <AtelierSculpture mood={mood} reducedMotion={reducedMotion} />
            <Environment preset="studio" />
          </Suspense>
          <OrbitControls enableZoom={false} enablePan={false} autoRotate={!reducedMotion} autoRotateSpeed={0.6} />
        </Canvas>
      </WebGLErrorBoundary>
      <div className="pointer-events-none absolute bottom-3 left-4 right-4 flex items-center justify-between font-mono text-[11px] tracking-[0.14em] text-[#B4C2CF]/90">
        <span>DRAG TO INSPECT</span>
        <span>3D ATELIER LIGHT STUDY</span>
      </div>
    </div>
  );
}
