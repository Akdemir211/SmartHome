'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

const vertexShader = /* glsl */ `
varying vec2 vUv;
varying vec3 vWorldPos;
void main() {
  vUv = uv;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorldPos = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const fragmentShader = /* glsl */ `
precision highp float;
varying vec2 vUv;
varying vec3 vWorldPos;
uniform float uTime;

void main() {
  // Grid çizgileri
  vec2 grid = abs(fract(vWorldPos.xz * 0.5) - 0.5);
  float line = min(grid.x, grid.y);
  float gridAlpha = 1.0 - smoothstep(0.0, 0.03, line);

  // Merkezden uzaklaştıkça kaybolsun
  float dist = length(vWorldPos.xz);
  float fade = 1.0 - smoothstep(1.0, 6.0, dist);

  // Hafif renk tonu
  vec3 color = mix(vec3(0.2, 0.1, 0.5), vec3(0.0, 0.5, 0.6), smoothstep(0.0, 5.0, dist));

  // Zaman bazlı dalgalanma
  float wave = sin(dist * 1.5 - uTime * 0.8) * 0.5 + 0.5;

  float alpha = gridAlpha * fade * 0.12 * (0.6 + wave * 0.4);
  gl_FragColor = vec4(color, alpha);
}
`;

export function GridFloor() {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({ uTime: { value: 0 } }),
    [],
  );

  useFrame((_, delta) => {
    if (!matRef.current) return;
    matRef.current.uniforms.uTime.value += delta;
  });

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -1.8, 0]}
      renderOrder={-1}
    >
      <planeGeometry args={[14, 14, 1, 1]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
