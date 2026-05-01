'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

const STAR_COUNT = 1500

const starVertexShader = /* glsl */ `
attribute float aSize;
attribute float aSpeed;
varying float vAlpha;

void main() {
  vAlpha = aSize;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aSize * (60.0 / -mv.z);
}
`

const starFragmentShader = /* glsl */ `
precision highp float;
varying float vAlpha;

void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float core = smoothstep(0.5, 0.0, d);
  core = pow(core, 2.0);
  float alpha = core * vAlpha * 0.5;
  gl_FragColor = vec4(0.6, 0.7, 1.0, alpha);
}
`

function SpaceStars() {
  const ref = useRef<THREE.Points>(null)
  const speedsRef = useRef<Float32Array | null>(null)

  const geometry = useMemo(() => {
    const positions = new Float32Array(STAR_COUNT * 3)
    const sizes = new Float32Array(STAR_COUNT)
    const speeds = new Float32Array(STAR_COUNT)

    for (let i = 0; i < STAR_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = -2 - Math.random() * 25

      sizes[i] = 0.15 + Math.random() * 0.6
      speeds[i] = 0.005 + Math.random() * 0.02
    }

    speedsRef.current = speeds

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
    return geo
  }, [])

  useFrame((_, delta) => {
    if (!ref.current || !speedsRef.current) return
    const posAttr = ref.current.geometry.attributes.position as THREE.BufferAttribute
    const pos = posAttr.array as Float32Array
    const spd = speedsRef.current

    for (let i = 0; i < STAR_COUNT; i++) {
      pos[i * 3 + 2] += spd[i] * delta * 60

      if (pos[i * 3 + 2] > -2) {
        pos[i * 3] = (Math.random() - 0.5) * 30
        pos[i * 3 + 1] = (Math.random() - 0.5) * 20
        pos[i * 3 + 2] = -27
      }
    }
    posAttr.needsUpdate = true
  })

  return (
    <points ref={ref} geometry={geometry}>
      <shaderMaterial
        vertexShader={starVertexShader}
        fragmentShader={starFragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export function FloatingElements() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <SpaceStars />

        <EffectComposer>
          <Bloom
            intensity={0.8}
            luminanceThreshold={0.1}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
