'use client'

import { Suspense, lazy, useCallback, useRef, useImperativeHandle, forwardRef } from 'react'
import type { Application } from '@splinetool/runtime'

const Spline = lazy(() => import('@splinetool/react-spline'))

export interface SplineSceneHandle {
  resize: () => void
}

interface SplineSceneProps {
  scene: string
  className?: string
}

export const SplineScene = forwardRef<SplineSceneHandle, SplineSceneProps>(
  function SplineScene({ scene, className }, ref) {
    const appRef = useRef<Application | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const handleLoad = useCallback((splineApp: Application) => {
      appRef.current = splineApp
    }, [])

    useImperativeHandle(ref, () => ({
      resize() {
        if (!appRef.current || !containerRef.current) return
        const { offsetWidth, offsetHeight } = containerRef.current
        appRef.current.setSize(offsetWidth, offsetHeight)
      },
    }), [])

    return (
      <div ref={containerRef} className={className}>
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center">
              <span className="loader"></span>
            </div>
          }
        >
          <Spline
            scene={scene}
            className="w-full h-full"
            onLoad={handleLoad}
          />
        </Suspense>
      </div>
    )
  }
)
