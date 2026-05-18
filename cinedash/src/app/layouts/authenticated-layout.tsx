import { Outlet } from '@tanstack/react-router'
import { Navbar } from '@/widgets/navbar/ui/navbar'

export function AuthenticatedLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Outlet />
    </div>
  )
}
