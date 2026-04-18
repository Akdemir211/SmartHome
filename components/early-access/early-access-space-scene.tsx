'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import { useRef } from 'react';
import type { Group, Mesh } from 'three';

function HorizonRing() {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.z = t * 0.06;
    }
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(t * 0.4) * 0.08;
    }
  });

  return (
    <group ref={groupRef} position={[0, -1.15, -0.5]}>
      <Float speed={1.2} rotationIntensity={0.35} floatIntensity={0.4}>
        <mesh ref={meshRef} rotation={[1.25, 0.2, 0]}>
          <torusGeometry args={[2.2, 0.035, 48, 200]} />
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#38bdf8"
            emissiveIntensity={1.4}
            metalness={0.85}
            roughness={0.25}
          />
        </mesh>
      </Float>
    </group>
  );
}

export function EarlyAccessSpaceScene() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <Canvas
        className="h-full w-full"
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0.2, 4.2], fov: 45, near: 0.1, far: 100 }}
      >
        <color attach="background" args={['transparent']} />
        <ambientLight intensity={0.35} />
        <pointLight position={[0, 2, 2]} intensity={2.2} color="#e0f2fe" />
        <pointLight position={[0, -2, 3]} intensity={0.6} color="#38bdf8" />
        <Stars radius={80} depth={40} count={5000} factor={3} saturation={0} fade speed={0.3} />
        <HorizonRing />
      </Canvas>
    </div>
  );
}
