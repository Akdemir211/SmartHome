'use client';

import { Canvas } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { VoiceOrb } from './voice-orb';
import { OrbBackground } from './orb-background';
import { PostEffects } from './post-effects';
import { CursorDistortion } from './cursor-distortion';
import { FloatingParticles } from './floating-particles';
import { GridFloor } from './grid-floor';
import { useFrequencyRef } from '@/hooks/use-frequency-data';
import { useAssistantStore } from '@/lib/store/assistant-store';
import type { AssistantState } from '@/types';

function stateToValue(state: AssistantState): number {
  switch (state) {
    case 'idleWakeListening':
    case 'boot':
    case 'permissionPending':
    case 'permissionDenied':
    case 'error':
      return 0;
    case 'activeSession':
      return 1;
    case 'speaking':
    case 'greeting':
      return 2;
    case 'thinking':
    case 'connecting':
      return 3;
    default:
      return 0;
  }
}

export function JarvisScene({ getAnalyser }: { getAnalyser: () => AnalyserNode | null }) {
  const frequencyRef = useFrequencyRef(getAnalyser);
  const state = useAssistantStore((s) => s.state);
  const stateRef = useRef<number>(stateToValue(state));

  useEffect(() => {
    stateRef.current = stateToValue(state);
  }, [state]);

  return (
    <Canvas
      className="absolute inset-0"
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 3.5], fov: 42, near: 0.1, far: 100 }}
    >
      <OrbBackground />
      <GridFloor />
      <FloatingParticles />
      <VoiceOrb frequencyRef={frequencyRef} stateValueRef={stateRef} />
      <CursorDistortion />
      <PostEffects state={state} />
    </Canvas>
  );
}
