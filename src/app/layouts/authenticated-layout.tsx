import { Suspense } from "react";
import { Outlet } from "@tanstack/react-router";
import { Navbar } from "@/widgets/navbar";
import { Skeleton } from "@/shared/ui/skeleton";

function PageSkeleton() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="flex gap-6">
        <Skeleton className="hidden sm:block w-48 aspect-[2/3] rounded-lg shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  );
}

export function AuthenticatedLayout() {
  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:rounded-md focus:border focus:border-border"
      >
        Pular para conteúdo principal
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
