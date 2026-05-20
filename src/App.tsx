import { Suspense } from 'react'
import { RouterProvider } from '@tanstack/react-router'
import { Providers } from '@/app/providers'
import { router } from '@/app/router'

export default function App() {
  return (
    <Providers>
      <Suspense>
        <RouterProvider router={router} />
      </Suspense>
    </Providers>
  )
}
