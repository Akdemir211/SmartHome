'use client';

import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { BlendFunction, KernelSize, type BloomEffect } from 'postprocessing';
import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { AssistantState } from '@/types';

interface PostEffectsProps {
  state: AssistantState;
}

function targetIntensity(state: AssistantState): number {
  switch (state) {
    case 'speaking':
    case 'greeting':
      return 0.6;
    case 'thinking':
    case 'connecting':
      return 0.45;
    case 'activeSession':
      return 0.4;
    case 'error':
      return 0.2;
    default:
      return 0.35;
  }
}

export function PostEffects({ state }: PostEffectsProps) {
  const bloomRef = useRef<BloomEffect | null>(null);
  const targetRef = useRef<number>(targetIntensity(state));

  useEffect(() => {
    targetRef.current = targetIntensity(state);
  }, [state]);

  useFrame((_, delta) => {
    const bloom = bloomRef.current;
    if (!bloom) return;
    const current = bloom.intensity;
    const target = targetRef.current;
    bloom.intensity = current + (target - current) * Math.min(1, delta * 2);
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const refProp = bloomRef as any;

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        ref={refProp}
        intensity={targetIntensity(state)}
        luminanceThreshold={0.15}
        luminanceSmoothing={0.5}
        mipmapBlur
        kernelSize={KernelSize.LARGE}
      />
      <Vignette
        offset={0.25}
        darkness={0.85}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
}
