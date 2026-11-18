'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { WebGLErrorBoundary } from './WebGLErrorBoundary';

const VERTEX_SHADER = `
  uniform float uTime;
  uniform vec2 uPointer;
  attribute float aScale;
  attribute float aPhase;
  varying float vElevation;
  varying float vWarmth;
  varying float vAlpha;

  void main() {
    vec3 pos = position;

    float waveA = sin(pos.x * 0.55 + uTime * 0.42 + aPhase) * 0.46;
    float waveB = cos(pos.z * 0.65 - uTime * 0.34 + pos.x * 0.25) * 0.38;
    float waveC = sin((pos.x + pos.z) * 0.35 + uTime * 0.28) * 0.28;

    vec2 pointerWorld = vec2(uPointer.x * 4.2, -uPointer.y * 2.8);
    float dist = length(pos.xz - pointerWorld);
    float ripple = exp(-dist * 0.42) * sin(dist * 2.2 - uTime * 1.4) * 0.42;

    pos.y += waveA + waveB + waveC + ripple;

    vElevation = pos.y;
    vWarmth = smoothstep(-0.35, 1.35, pos.x * 0.28 + pos.y * 0.55 - pos.z * 0.12);
    vAlpha = smoothstep(7.2, 1.4, length(pos.xz));

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = aScale * (210.0 / -mvPosition.z);
  }
`;

const FRAGMENT_SHADER = `
  varying float vElevation;
  varying float vWarmth;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;

    float strength = pow(1.0 - d * 2.0, 2.2);

    vec3 deepSlate = vec3(0.16, 0.28, 0.40);
    vec3 seaMist = vec3(0.55, 0.72, 0.85);
    vec3 salonCopper = vec3(0.88, 0.54, 0.37);
    vec3 brightEmber = vec3(0.96, 0.74, 0.58);

    vec3 coolMix = mix(deepSlate, seaMist, smoothstep(-0.8, 0.8, vElevation));
    vec3 warmMix = mix(salonCopper, brightEmber, smoothstep(0.0, 1.2, vElevation));
    vec3 finalColor = mix(coolMix, warmMix, smoothstep(0.45, 0.92, vWarmth));

    gl_FragColor = vec4(finalColor, strength * vAlpha * 0.82);
  }
`;

function SilkLightField({ reducedMotion }: { reducedMotion: boolean }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const smoothedPointer = useRef(new THREE.Vector2(0, 0));

  const { positions, scales, phases } = useMemo(() => {
    const cols = 108;
    const rows = 68;
    const count = cols * rows;
    const pos = new Float32Array(count * 3);
    const scl = new Float32Array(count);
    const phs = new Float32Array(count);

    let idx = 0;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const u = (i / (cols - 1) - 0.5) * 12.8;
        const v = (j / (rows - 1) - 0.5) * 7.6;

        pos[idx * 3] = u;
        pos[idx * 3 + 1] = 0;
        pos[idx * 3 + 2] = v;

        scl[idx] = 0.08 + ((i * 17 + j * 31) % 10) * 0.012;
        phs[idx] = (i * 0.09 + j * 0.14) % (Math.PI * 2);
        idx++;
      }
    }

    return { positions: pos, scales: scl, phases: phs };
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 1.6 },
      uPointer: { value: new THREE.Vector2(0, 0) },
    }),
    []
  );

  useFrame((state, delta) => {
    if (!materialRef.current) return;
    if (!reducedMotion) {
      materialRef.current.uniforms.uTime.value += Math.min(delta, 0.05);
      smoothedPointer.current.lerp(state.pointer, 0.045);
      materialRef.current.uniforms.uPointer.value.copy(smoothedPointer.current);
      if (pointsRef.current) {
        pointsRef.current.rotation.z = Math.sin(materialRef.current.uniforms.uTime.value * 0.12) * 0.04;
      }
    }
  });

  return (
    <points ref={pointsRef} position={[1.1, -0.35, 0]} rotation={[0.48, -0.22, -0.14]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aScale" args={[scales, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function StaticPortalFallback() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          'radial-gradient(ellipse 62% 54% at 74% 38%, rgba(224,138,94,0.34) 0%, rgba(42,67,89,0.42) 44%, rgba(11,15,20,0.98) 100%), radial-gradient(ellipse 46% 42% at 18% 76%, rgba(72,121,163,0.24) 0%, transparent 70%), #0B0F14',
      }}
    />
  );
}

export default function HeroPortalCanvas() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <StaticPortalFallback />
      <WebGLErrorBoundary fallback={<StaticPortalFallback />}>
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 1.4, 5.4], fov: 46 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          fallback={<StaticPortalFallback />}
          className="h-full w-full"
        >
          <Suspense fallback={null}>
            <SilkLightField reducedMotion={reducedMotion} />
          </Suspense>
        </Canvas>
      </WebGLErrorBoundary>
      {/* Vignette for guaranteed text contrast across the opening viewport */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(11,15,20,0.88) 0%, rgba(11,15,20,0.56) 54%, rgba(11,15,20,0.28) 100%), linear-gradient(180deg, rgba(11,15,20,0.52) 0%, rgba(11,15,20,0.12) 45%, rgba(11,15,20,0.92) 100%)',
        }}
      />
    </div>
  );
}
