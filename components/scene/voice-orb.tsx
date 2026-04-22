'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  orbFragmentShader,
  orbVertexShader,
  glowFragmentShader,
  glowVertexShader,
} from './shaders';
import type { FrequencyBands } from '@/types';

interface VoiceOrbProps {
  frequencyRef: React.MutableRefObject<FrequencyBands>;
  stateValueRef: React.MutableRefObject<number>;
  radius?: number;
}

const COLOR_PURPLE = new THREE.Color('#b042ff');   // referans mor
const COLOR_CYAN   = new THREE.Color('#00e5ff');   // referans cyan

/**
 * UV Küre dağılımı — referans görseldeki gibi enlem/boylam çizgileri oluşturur.
 */
function buildUVSphere(segments: number, rings: number, radius: number): Float32Array {
  const count = segments * rings;
  const positions = new Float32Array(count * 3);
  let idx = 0;
  for (let r = 0; r < rings; r++) {
    const phi = Math.PI * (r + 0.5) / rings; 
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);
    for (let s = 0; s < segments; s++) {
      const theta = 2 * Math.PI * s / segments;
      positions[idx * 3]     = radius * sinPhi * Math.cos(theta);
      positions[idx * 3 + 1] = radius * cosPhi;
      positions[idx * 3 + 2] = radius * sinPhi * Math.sin(theta);
      idx++;
    }
  }
  return positions;
}

export function VoiceOrb({
  frequencyRef,
  stateValueRef,
  radius = 1.0,
}: VoiceOrbProps) {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { geometry, uniforms } = useMemo(() => {
    const segments = 80;  // Dikey çizgiler (boylam)
    const rings = 60;     // Yatay çizgiler (enlem)
    const particleCount = segments * rings; // 9600 nokta

    const geo = new THREE.BufferGeometry();
    const positions = buildUVSphere(segments, rings, radius);
    const seeds = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i += 1) seeds[i] = Math.random();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

    const uni = {
      uTime:        { value: 0 },
      uLevel:       { value: 0 },
      uLow:         { value: 0 },
      uMid:         { value: 0 },
      uHigh:        { value: 0 },
      uState:       { value: 0 },
      uColorPurple: { value: COLOR_PURPLE.clone() },
      uColorCyan:   { value: COLOR_CYAN.clone() },
    };
    return { geometry: geo, uniforms: uni };
  }, [radius]);

  useFrame((_, delta) => {
    if (!materialRef.current || !pointsRef.current || !groupRef.current) return;
    const u = materialRef.current.uniforms;
    u.uTime.value += delta;

    const freq = frequencyRef.current;
    u.uLevel.value += (freq.level - u.uLevel.value) * 0.2;
    u.uLow.value   += (freq.low   - u.uLow.value)   * 0.2;
    u.uMid.value   += (freq.mid   - u.uMid.value)    * 0.2;
    u.uHigh.value  += (freq.high  - u.uHigh.value)   * 0.2;
    u.uState.value += (stateValueRef.current - u.uState.value) * 0.05;

    // Küre dönüşü — yavaş ve zarif
    groupRef.current.rotation.y += delta * (0.04 + freq.level * 0.2);
    groupRef.current.rotation.x += delta * (0.015 + freq.mid * 0.08);

    // Nefes
    const breathScale = 1 + Math.sin(u.uTime.value * 0.55) * 0.012;
    const audioScale  = 1 + freq.level * 0.08;
    groupRef.current.scale.setScalar(breathScale * audioScale);

    // Glow disk logic removed
  });

  return (
    <group ref={groupRef}>
      {/* Partikül küresi */}
      <points ref={pointsRef} geometry={geometry}>
        <shaderMaterial
          ref={materialRef}
          uniforms={uniforms}
          vertexShader={orbVertexShader}
          fragmentShader={orbFragmentShader}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
