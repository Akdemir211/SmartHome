'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

const STRAND_POINTS = 60;
const HELIX_RADIUS = 0.08;
const HELIX_LENGTH = 2.5;
const HELIX_TURNS = 3;
const BRIDGE_COUNT = 14;

const pointVertex = /* glsl */ `
attribute float aAlpha;
varying float vAlpha;
void main() {
  vAlpha = aAlpha;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = 1.5 * (100.0 / -mv.z);
}
`;

const pointFragment = /* glsl */ `
precision highp float;
uniform vec3 uColor;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float shape = smoothstep(0.5, 0.1, d);
  gl_FragColor = vec4(uColor, shape * vAlpha);
}
`;

const lineVertex = /* glsl */ `
attribute float aAlpha;
varying float vAlpha;
void main() {
  vAlpha = aAlpha;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const lineFragment = /* glsl */ `
precision highp float;
varying float vAlpha;
uniform vec3 uColorA;
uniform vec3 uColorB;
void main() {
  vec3 color = mix(uColorA, uColorB, 0.5);
  gl_FragColor = vec4(color, vAlpha);
}
`;

function helixPoint(t: number, offset: number, radius: number): THREE.Vector3 {
  const angle = t * Math.PI * 2 * HELIX_TURNS + offset;
  const y = (t - 0.5) * HELIX_LENGTH;
  return new THREE.Vector3(
    Math.cos(angle) * radius,
    y,
    Math.sin(angle) * radius,
  );
}

function buildStrand(offset: number): { positions: Float32Array; alphas: Float32Array } {
  const positions = new Float32Array(STRAND_POINTS * 3);
  const alphas = new Float32Array(STRAND_POINTS);
  for (let i = 0; i < STRAND_POINTS; i++) {
    const t = i / (STRAND_POINTS - 1);
    const p = helixPoint(t, offset, HELIX_RADIUS);
    positions[i * 3] = p.x;
    positions[i * 3 + 1] = p.y;
    positions[i * 3 + 2] = p.z;
    const edge = Math.min(t, 1 - t) * 5;
    alphas[i] = Math.min(1, edge) * 0.45;
  }
  return { positions, alphas };
}

function buildBridges(): { positions: Float32Array; alphas: Float32Array } {
  const positions = new Float32Array(BRIDGE_COUNT * 2 * 3);
  const alphas = new Float32Array(BRIDGE_COUNT * 2);
  for (let i = 0; i < BRIDGE_COUNT; i++) {
    const t = (i + 1) / (BRIDGE_COUNT + 1);
    const a = helixPoint(t, 0, HELIX_RADIUS);
    const b = helixPoint(t, Math.PI, HELIX_RADIUS);
    positions[i * 6] = a.x;
    positions[i * 6 + 1] = a.y;
    positions[i * 6 + 2] = a.z;
    positions[i * 6 + 3] = b.x;
    positions[i * 6 + 4] = b.y;
    positions[i * 6 + 5] = b.z;
    const edge = Math.min(t, 1 - t) * 5;
    const alpha = Math.min(1, edge) * 0.25;
    alphas[i * 2] = alpha;
    alphas[i * 2 + 1] = alpha;
  }
  return { positions, alphas };
}

interface DnaMoleculeProps {
  position: [number, number, number];
  rotationZ: number;
  scale?: number;
}

function DnaMolecule({ position, rotationZ, scale = 1 }: DnaMoleculeProps) {
  const groupRef = useRef<THREE.Group>(null);

  const purple = useMemo(() => new THREE.Color('#7c3aed'), []);
  const cyan = useMemo(() => new THREE.Color('#06b6d4'), []);

  const strandA = useMemo(() => {
    const { positions, alphas } = buildStrand(0);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));
    return geo;
  }, []);

  const strandB = useMemo(() => {
    const { positions, alphas } = buildStrand(Math.PI);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));
    return geo;
  }, []);

  const bridges = useMemo(() => {
    const { positions, alphas } = buildBridges();
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.35;
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, 0, rotationZ]} scale={scale}>
      <points geometry={strandA}>
        <shaderMaterial
          uniforms={{ uColor: { value: purple } }}
          vertexShader={pointVertex}
          fragmentShader={pointFragment}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <points geometry={strandB}>
        <shaderMaterial
          uniforms={{ uColor: { value: cyan } }}
          vertexShader={pointVertex}
          fragmentShader={pointFragment}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <lineSegments geometry={bridges}>
        <shaderMaterial
          uniforms={{
            uColorA: { value: purple },
            uColorB: { value: cyan },
          }}
          vertexShader={lineVertex}
          fragmentShader={lineFragment}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}

export function DnaHelix() {
  return (
    <group>
      <DnaMolecule position={[-2.6, 0.2, -2]} rotationZ={0.25} scale={0.7} />
      <DnaMolecule position={[2.7, 0.3, -2.5]} rotationZ={-0.2} scale={0.6} />
    </group>
  );
}
