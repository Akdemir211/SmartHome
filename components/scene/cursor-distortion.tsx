'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform vec2 uMouse;
uniform float uTime;

void main() {
  vec2 p = vUv - 0.5;
  vec2 mouse = uMouse - 0.5;
  float dist = length(p - mouse);

  // Tek ince halka
  float ring = smoothstep(0.035, 0.025, dist) - smoothstep(0.025, 0.015, dist);

  // Çok küçük merkez noktası
  float dot = exp(-dist * dist * 3000.0) * 0.3;

  float pulse = 0.85 + 0.15 * sin(uTime * 3.0);
  float intensity = (ring * 0.15 + dot) * pulse;

  vec3 purple = vec3(0.69, 0.16, 1.0);
  vec3 cyan = vec3(0.0, 0.9, 1.0);
  vec3 color = mix(purple, cyan, smoothstep(0.3, 0.7, uMouse.x));

  gl_FragColor = vec4(color, intensity);
}
`;

export function CursorDistortion() {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const mouseTarget = useRef(new THREE.Vector2(0.5, 0.5));
  const mouseCurrent = useRef(new THREE.Vector2(0.5, 0.5));
  useThree();

  const uniforms = useMemo(
    () => ({
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uTime: { value: 0 },
    }),
    [],
  );

  useFrame((state, delta) => {
    if (!matRef.current) return;
    const u = matRef.current.uniforms;
    u.uTime.value += delta;

    const pointer = state.pointer;
    mouseTarget.current.set(
      (pointer.x + 1) * 0.5,
      (pointer.y + 1) * 0.5,
    );

    mouseCurrent.current.lerp(mouseTarget.current, 0.12);
    u.uMouse.value.copy(mouseCurrent.current);
  });

  return (
    <mesh renderOrder={1}>
      <planeGeometry args={[8, 8]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthTest={false}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
