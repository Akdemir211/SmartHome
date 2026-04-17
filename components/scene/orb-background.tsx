'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

const vertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const fragment = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform vec3 uCenter;
uniform vec3 uEdge;
void main() {
  vec2 p = vUv - 0.5;
  float d = length(p) * 1.4;
  float t = smoothstep(0.0, 1.0, d);
  t = t * t; // daha hızlı kararma
  vec3 col = mix(uCenter, uEdge, t);
  gl_FragColor = vec4(col, 1.0);
}
`;

export function OrbBackground() {
  const { geometry, material } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(2, 2);
    const mat = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uCenter: { value: new THREE.Color('#080d21') },
        uEdge:   { value: new THREE.Color('#03050a') },
      },
      depthTest: false,
      depthWrite: false,
    });
    return { geometry: geo, material: mat };
  }, []);

  return (
    <mesh
      geometry={geometry}
      material={material}
      frustumCulled={false}
      renderOrder={-2}
    />
  );
}
