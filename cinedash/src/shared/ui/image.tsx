import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface ImageProps {
  src: string | null | undefined
  alt: string
  className?: string
  skeletonClassName?: string
  fallbackClassName?: string
}

export function Image({ src, alt, className, skeletonClassName, fallbackClassName }: ImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(src ? 'loading' : 'error')

  if (!src || status === 'error') {
    return (
      <div className={cn('flex items-center justify-center bg-muted text-muted-foreground', fallbackClassName ?? className)}>
        <ImageOff className="h-1/4 w-1/4 opacity-30" />
      </div>
    )
  }

  return (
    <>
      {status === 'loading' && (
        <Skeleton className={cn(skeletonClassName ?? className, 'absolute inset-0')} />
      )}
      <img
        src={src}
        alt={alt}
        className={cn(className, status === 'loading' && 'opacity-0')}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        loading="lazy"
      />
    </>
  )
}
