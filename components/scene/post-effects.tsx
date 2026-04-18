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
      return 0.55;
    case 'thinking':
    case 'connecting':
      return 0.4;
    case 'activeSession':
      return 0.38;
    case 'error':
      return 0.15;
    default:
      return 0.28;
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

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        // @ts-expect-error Bloom forwards to postprocessing BloomEffect instance; package types expect the class
        ref={bloomRef}
        intensity={targetIntensity(state)}
        luminanceThreshold={0.12}
        luminanceSmoothing={0.6}
        mipmapBlur
        kernelSize={KernelSize.LARGE}
      />
      <Vignette
        offset={0.2}
        darkness={0.95}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
}
