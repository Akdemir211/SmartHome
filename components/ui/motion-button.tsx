'use client'

import { FC, ButtonHTMLAttributes } from 'react'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MotionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  classes?: string
  isLoading?: boolean
  direction?: 'right' | 'left'
}

const MotionButton: FC<MotionButtonProps> = ({
  label,
  classes,
  isLoading,
  direction = 'right',
  ...rest
}) => {
  const isRight = direction === 'right'
  const Icon = isRight ? ArrowRight : ArrowLeft

  return (
    <button
      className={cn(
        'group relative h-14 w-56 cursor-pointer rounded-full bg-transparent p-1 outline-none',
        classes
      )}
      {...rest}
    >
      <span
        className={cn(
          'absolute top-1 bottom-1 block w-12 rounded-full bg-[#3b4872] transition-all duration-500 ease-in-out group-hover:w-[calc(100%-0.5rem)]',
          isRight ? 'left-1' : 'right-1 group-hover:right-1'
        )}
        aria-hidden="true"
      />
      <div
        className={cn(
          'absolute top-1/2 -translate-y-1/2 transition-transform duration-500',
          isRight
            ? 'left-[1.1rem] group-hover:translate-x-1'
            : 'right-[1.1rem] group-hover:-translate-x-1'
        )}
      >
        {isLoading ? (
          <span className="loader !w-5 !h-5 !border-2" />
        ) : (
          <Icon className="size-5 text-white" />
        )}
      </div>
      <span
        className={cn(
          'relative z-10 text-lg font-medium tracking-tight text-white transition-colors duration-500 group-hover:text-white',
          isRight ? 'ml-6' : 'mr-6'
        )}
      >
        {label}
      </span>
    </button>
  )
}

export default MotionButton
