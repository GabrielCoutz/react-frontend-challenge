import { Skeleton } from '@/shared/ui/skeleton'

export function MovieDetailsSkeleton() {
  return (
    <div>
      <Skeleton className="h-48 sm:h-64 md:h-80 w-full rounded-none" />

      <div className="container mx-auto px-4 sm:px-6 py-6 space-y-6 sm:space-y-8">
        <Skeleton className="h-8 w-20" />

        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
          <Skeleton className="w-32 sm:w-48 aspect-[2/3] rounded-lg shrink-0" />
          <div className="space-y-3 flex-1">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-28" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-20 sm:h-24 w-full" />
            <Skeleton className="h-9 w-40" />
          </div>
        </div>

        <div className="space-y-3">
          <Skeleton className="h-6 w-24" />
          <div className="flex gap-3 sm:gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="shrink-0 w-20 sm:w-24 space-y-2 text-center">
                <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto" />
                <Skeleton className="h-3 w-16 mx-auto" />
                <Skeleton className="h-3 w-12 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
