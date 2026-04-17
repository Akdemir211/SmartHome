'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

const PARTICLE_COUNT = 80;

const vertexShader = /* glsl */ `
attribute float aSize;
attribute float aAlpha;
varying float vAlpha;
void main() {
  vAlpha = aAlpha;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aSize * (100.0 / -mv.z);
}
`;

const fragmentShader = /* glsl */ `
precision highp float;
uniform vec3 uColor;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float shape = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(uColor, shape * vAlpha * 0.4);
}
`;

export function FloatingParticles() {
  const ref = useRef<THREE.Points>(null);
  const velocities = useRef<Float32Array | null>(null);

  const { geometry, uniforms } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const alphas = new Float32Array(PARTICLE_COUNT);
    const vels = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4 - 1;
      sizes[i] = 0.5 + Math.random() * 2;
      alphas[i] = 0.2 + Math.random() * 0.6;
      vels[i * 3] = (Math.random() - 0.5) * 0.02;
      vels[i * 3 + 1] = 0.005 + Math.random() * 0.015;
      vels[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
    }

    velocities.current = vels;

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));

    const uni = { uColor: { value: new THREE.Color('#4f46e5') } };
    return { geometry: geo, uniforms: uni };
  }, []);

  useFrame((_, delta) => {
    if (!ref.current || !velocities.current) return;
    const posAttr = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const pos = posAttr.array as Float32Array;
    const vel = velocities.current;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3] += vel[i * 3] * delta * 60;
      pos[i * 3 + 1] += vel[i * 3 + 1] * delta * 60;
      pos[i * 3 + 2] += vel[i * 3 + 2] * delta * 60;

      // Sınırları aşınca resetle
      if (pos[i * 3 + 1] > 3) {
        pos[i * 3 + 1] = -3;
        pos[i * 3] = (Math.random() - 0.5) * 8;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
