import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import BottomNav from '@/components/BottomNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="pb-24 md:pb-8">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
