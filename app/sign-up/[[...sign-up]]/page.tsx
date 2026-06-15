import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Quiniela Mundial 2026</h1>
          <p className="text-muted">Crea tu cuenta para participar</p>
        </div>
        <SignUp 
          signInUrl="/sign-in"
        />
      </div>
    </div>
  )
}
