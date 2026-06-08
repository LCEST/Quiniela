import BottomNav from '@/components/BottomNav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-24 md:pb-8">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
