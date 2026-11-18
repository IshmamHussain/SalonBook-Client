'use client';

import { ContactShadows, Environment, Float, MeshTransmissionMaterial, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { WebGLErrorBoundary } from './WebGLErrorBoundary';

export type AtelierMood = 'terrace' | 'gilt' | 'bosquet';

const MOOD_CONFIG: Record<
  AtelierMood,
  { keyLight: string; rimLight: string; glassTint: string; metalColor: string; bg: string }
> = {
  terrace: {
    keyLight: '#FFF6E5',
    rimLight: '#9AC0AE',
    glassTint: '#DCE8E0',
    metalColor: '#C59A4B',
    bg: '#EDE6D8',
  },
  gilt: {
    keyLight: '#FFE2B3',
    rimLight: '#E8C482',
    glassTint: '#F2E2C4',
    metalColor: '#B5893D',
    bg: '#EFE7D6',
  },
  bosquet: {
    keyLight: '#E5F2EA',
    rimLight: '#C59A4B',
    glassTint: '#3D6E59',
    metalColor: '#D4B475',
    bg: '#E6ECE6',
  },
};

function MaisonFlaconSculpture({
  mood,
  reducedMotion,
}: {
  mood: AtelierMood;
  reducedMotion: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const palette = MOOD_CONFIG[mood];

  useFrame((_, delta) => {
    if (reducedMotion) return;
    const step = Math.min(delta, 0.05);
    if (groupRef.current) {
      groupRef.current.rotation.y += step * 0.28;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z -= step * 0.16;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.15, 0]}>
      <Float
        speed={reducedMotion ? 0 : 1.4}
        rotationIntensity={reducedMotion ? 0 : 0.18}
        floatIntensity={reducedMotion ? 0 : 0.35}
      >
        {/* Fluted crystal botanical salon flacon body */}
        <mesh castShadow receiveShadow position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.92, 0.96, 1.85, 16]} />
          <MeshTransmissionMaterial
            backside
            samples={6}
            resolution={256}
            thickness={1.2}
            roughness={0.1}
            ior={1.48}
            chromaticAberration={0.04}
            color={palette.glassTint}
          />
        </mesh>

        {/* Inner deep emerald essence core */}
        <mesh position={[0, -0.22, 0]}>
          <cylinderGeometry args={[0.64, 0.68, 1.32, 16]} />
          <meshStandardMaterial color="#1E3A2F" metalness={0.18} roughness={0.32} />
        </mesh>

        {/* Gilt-bronze engraved collar */}
        <mesh position={[0, 0.94, 0]}>
          <cylinderGeometry args={[0.38, 0.44, 0.36, 24]} />
          <meshStandardMaterial color={palette.metalColor} metalness={0.92} roughness={0.22} />
        </mesh>

        {/* Sculpted spherical gilt-bronze finial cap */}
        <mesh position={[0, 1.42, 0]}>
          <sphereGeometry args={[0.42, 28, 28]} />
          <meshStandardMaterial color={palette.metalColor} metalness={0.94} roughness={0.18} />
        </mesh>

        {/* Orbiting gilt-bronze architectural parterre ring */}
        <mesh ref={ringRef} rotation={[Math.PI / 2.6, 0.25, 0]}>
          <torusGeometry args={[1.82, 0.035, 20, 96]} />
          <meshStandardMaterial color={palette.metalColor} metalness={0.9} roughness={0.24} />
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
      style={{ backgroundColor: palette.bg }}
    >
      <div className="space-y-4">
        <div className="mx-auto flex h-32 w-24 flex-col items-center justify-end rounded-t-full border-2 border-[#B5893D] bg-[#1E3A2F] p-3 shadow-md">
          <div className="h-14 w-14 rounded-full border border-[#D6BC88]/60 bg-[#2C5343]" />
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#495A52]">
          Maison Botanical Elixir Study
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
    <div
      className="maison-card relative h-[360px] w-full overflow-hidden sm:h-[420px]"
      style={{ backgroundColor: palette.bg }}
    >
      <WebGLErrorBoundary fallback={<AtelierFallback mood={mood} />}>
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0.65, 5.2], fov: 40 }}
          fallback={<AtelierFallback mood={mood} />}
        >
          <color attach="background" args={[palette.bg]} />
          <ambientLight intensity={0.85} />
          <directionalLight position={[4, 6, 4]} intensity={1.9} color={palette.keyLight} />
          <pointLight position={[-4, 2, 3]} intensity={1.1} color={palette.rimLight} />
          <Suspense fallback={null}>
            <MaisonFlaconSculpture mood={mood} reducedMotion={reducedMotion} />
            <ContactShadows position={[0, -1.65, 0]} opacity={0.32} scale={7} blur={2.4} far={4} color="#16261F" />
            <Environment preset="apartment" />
          </Suspense>
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={!reducedMotion}
            autoRotateSpeed={0.55}
          />
        </Canvas>
      </WebGLErrorBoundary>
      <div className="pointer-events-none absolute bottom-3 left-5 right-5 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-[#495A52]">
        <span>Drag to Rotate</span>
        <span>3D Maison Elixir Flacon</span>
      </div>
    </div>
  );
}
