'use client';

import { Canvas } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { VoiceParticles } from './voice-particles';
import { StarField } from './star-field';
import { PostEffects } from './post-effects';
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
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 4], fov: 45, near: 0.1, far: 100 }}
      style={{ background: 'transparent' }}
    >
      <StarField />
      <VoiceParticles frequencyRef={frequencyRef} stateValueRef={stateRef} />
      <PostEffects state={state} />
    </Canvas>
  );
}
