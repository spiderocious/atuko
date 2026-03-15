import { HTMLAttributes } from 'react'

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string | number
  height?: string | number
}

export function Skeleton({
  width,
  height,
  className = '',
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={[
        'animate-pulse rounded-md bg-[var(--color-surface-raised)]',
        className,
      ].join(' ')}
      style={{ width, height, ...style }}
      {...props}
    />
  )
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={14}
          width={i === lines - 1 ? '65%' : '100%'}
        />
      ))}
    </div>
  )
}
