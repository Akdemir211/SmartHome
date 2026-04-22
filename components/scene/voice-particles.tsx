'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  neuralNodeVertexShader,
  neuralNodeFragmentShader,
  neuralLineVertexShader,
  neuralLineFragmentShader,
} from './shaders';
import type { FrequencyBands } from '@/types';

interface VoiceParticlesProps {
  frequencyRef: React.MutableRefObject<FrequencyBands>;
  stateValueRef: React.MutableRefObject<number>;
}

const NODE_COUNT = 8000;
const CONNECTION_DISTANCE = 0.22;
const MAX_CONNECTIONS = 5000;

function simplex3Seed(x: number, y: number, z: number): number {
  let n = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  n = n - Math.floor(n);
  return n * 2 - 1;
}

function buildNeuralCloud(count: number) {
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    const nx = Math.sin(phi) * Math.cos(theta);
    const ny = Math.sin(phi) * Math.sin(theta);
    const nz = Math.cos(phi);

    const core = Math.pow(Math.random(), 0.85);
    let r = core * 0.75;

    const noiseScale = 2.5;
    const n1 = simplex3Seed(nx * noiseScale, ny * noiseScale, nz * noiseScale);
    const n2 = simplex3Seed(nx * noiseScale * 1.7 + 5.2, ny * noiseScale * 1.7 + 1.3, nz * noiseScale * 1.7 + 2.8);

    const tendril = Math.max(0, n1) * 0.4 + Math.max(0, n2) * 0.25;
    r += tendril * r * 0.6;

    const jitter = 0.04;
    positions[i * 3] = r * nx + (Math.random() - 0.5) * jitter;
    positions[i * 3 + 1] = r * ny * 0.85 + (Math.random() - 0.5) * jitter;
    positions[i * 3 + 2] = r * nz + (Math.random() - 0.5) * jitter;

    seeds[i] = Math.random();
    sizes[i] = 0.3 + Math.random() * 1.2;
  }

  return { positions, seeds, sizes };
}

function buildConnections(positions: Float32Array, count: number, maxDist: number, maxConns: number) {
  const linePositions: number[] = [];
  const lineAlphas: number[] = [];
  let connCount = 0;

  const MAX_PER_NODE_CENTER = 3;
  const MAX_PER_NODE_OUTER = 8;
  const CENTER_THRESHOLD = 0.35;

  const nodeDists = new Float32Array(count);
  const nodeConnCounts = new Uint8Array(count);
  for (let i = 0; i < count; i++) {
    const x = positions[i * 3];
    const y = positions[i * 3 + 1];
    const z = positions[i * 3 + 2];
    nodeDists[i] = Math.sqrt(x * x + y * y + z * z);
  }

  function maxConnsForNode(idx: number): number {
    const d = nodeDists[idx];
    if (d < CENTER_THRESHOLD) return MAX_PER_NODE_CENTER;
    const t = Math.min((d - CENTER_THRESHOLD) / (0.85 - CENTER_THRESHOLD), 1);
    return Math.round(MAX_PER_NODE_CENTER + t * (MAX_PER_NODE_OUTER - MAX_PER_NODE_CENTER));
  }

  const cellSize = maxDist;
  const grid = new Map<string, number[]>();

  for (let i = 0; i < count; i++) {
    const cx = Math.floor(positions[i * 3] / cellSize);
    const cy = Math.floor(positions[i * 3 + 1] / cellSize);
    const cz = Math.floor(positions[i * 3 + 2] / cellSize);
    const key = `${cx},${cy},${cz}`;
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key)!.push(i);
  }

  for (let i = 0; i < count && connCount < maxConns; i++) {
    if (nodeConnCounts[i] >= maxConnsForNode(i)) continue;

    const ax = positions[i * 3];
    const ay = positions[i * 3 + 1];
    const az = positions[i * 3 + 2];
    const cx = Math.floor(ax / cellSize);
    const cy = Math.floor(ay / cellSize);
    const cz = Math.floor(az / cellSize);

    for (let dx = -1; dx <= 1 && connCount < maxConns; dx++) {
      for (let dy = -1; dy <= 1 && connCount < maxConns; dy++) {
        for (let dz = -1; dz <= 1 && connCount < maxConns; dz++) {
          const key = `${cx + dx},${cy + dy},${cz + dz}`;
          const cell = grid.get(key);
          if (!cell) continue;

          for (const j of cell) {
            if (j <= i) continue;
            if (nodeConnCounts[i] >= maxConnsForNode(i)) break;
            if (nodeConnCounts[j] >= maxConnsForNode(j)) continue;

            const bx = positions[j * 3];
            const by = positions[j * 3 + 1];
            const bz = positions[j * 3 + 2];
            const distSq = (ax - bx) ** 2 + (ay - by) ** 2 + (az - bz) ** 2;

            if (distSq < maxDist * maxDist) {
              const dist = Math.sqrt(distSq);
              const alpha = 1.0 - dist / maxDist;

              linePositions.push(ax, ay, az, bx, by, bz);
              lineAlphas.push(alpha, alpha);
              nodeConnCounts[i]++;
              nodeConnCounts[j]++;
              connCount++;
              if (connCount >= maxConns) break;
            }
          }
        }
      }
    }
  }

  return {
    positions: new Float32Array(linePositions),
    alphas: new Float32Array(lineAlphas),
  };
}

function NeuralNodes({
  frequencyRef,
  stateValueRef,
  geometry,
  uniforms,
}: {
  frequencyRef: React.MutableRefObject<FrequencyBands>;
  stateValueRef: React.MutableRefObject<number>;
  geometry: THREE.BufferGeometry;
  uniforms: Record<string, THREE.IUniform>;
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((_, delta) => {
    if (!materialRef.current) return;
    const u = materialRef.current.uniforms;
    u.uTime.value += delta;

    const freq = frequencyRef.current;
    u.uLevel.value += (freq.level - u.uLevel.value) * 0.15;
    u.uLow.value += (freq.low - u.uLow.value) * 0.15;
    u.uMid.value += (freq.mid - u.uMid.value) * 0.15;
    u.uHigh.value += (freq.high - u.uHigh.value) * 0.15;
    u.uState.value += (stateValueRef.current - u.uState.value) * 0.05;
  });

  return (
    <points geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={neuralNodeVertexShader}
        fragmentShader={neuralNodeFragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function NeuralConnections({
  frequencyRef,
  lineGeo,
  lineUniforms,
}: {
  frequencyRef: React.MutableRefObject<FrequencyBands>;
  lineGeo: THREE.BufferGeometry;
  lineUniforms: Record<string, THREE.IUniform>;
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((_, delta) => {
    if (!materialRef.current) return;
    const u = materialRef.current.uniforms;
    u.uTime.value += delta;
    u.uLevel.value += (frequencyRef.current.level - u.uLevel.value) * 0.15;
  });

  return (
    <lineSegments geometry={lineGeo}>
      <shaderMaterial
        ref={materialRef}
        uniforms={lineUniforms}
        vertexShader={neuralLineVertexShader}
        fragmentShader={neuralLineFragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}

export function VoiceParticles({ frequencyRef, stateValueRef }: VoiceParticlesProps) {
  const groupRef = useRef<THREE.Group>(null);

  const { nodeGeo, nodeUniforms, lineGeo, lineUniforms } = useMemo(() => {
    const { positions, seeds, sizes } = buildNeuralCloud(NODE_COUNT);

    const nGeo = new THREE.BufferGeometry();
    nGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    nGeo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    nGeo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    const nUni = {
      uTime: { value: 0 },
      uLevel: { value: 0 },
      uLow: { value: 0 },
      uMid: { value: 0 },
      uHigh: { value: 0 },
      uState: { value: 0 },
    };

    const conns = buildConnections(positions, NODE_COUNT, CONNECTION_DISTANCE, MAX_CONNECTIONS);
    const lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute('position', new THREE.BufferAttribute(conns.positions, 3));
    lGeo.setAttribute('aAlpha', new THREE.BufferAttribute(conns.alphas, 1));

    const lUni = {
      uTime: { value: 0 },
      uLevel: { value: 0 },
    };

    return { nodeGeo: nGeo, nodeUniforms: nUni, lineGeo: lGeo, lineUniforms: lUni };
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const freq = frequencyRef.current;

    groupRef.current.rotation.y += delta * (0.12 + freq.level * 0.15);
    groupRef.current.rotation.x += delta * (0.02 + freq.mid * 0.04);

    const breathScale = 1 + Math.sin(Date.now() * 0.0003) * 0.008;
    const audioScale = 1 + freq.level * 0.06;
    groupRef.current.scale.setScalar(breathScale * audioScale);
  });

  return (
    <group ref={groupRef}>
      <NeuralConnections
        frequencyRef={frequencyRef}
        lineGeo={lineGeo}
        lineUniforms={lineUniforms}
      />
      <NeuralNodes
        frequencyRef={frequencyRef}
        stateValueRef={stateValueRef}
        geometry={nodeGeo}
        uniforms={nodeUniforms}
      />
    </group>
  );
}
