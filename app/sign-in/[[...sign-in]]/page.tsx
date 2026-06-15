import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Quiniela Mundial 2026</h1>
          <p className="text-muted">Inicia sesión para participar</p>
        </div>
        <SignIn 
          routing="path"
          path="/sign-in"
          fallbackRedirectUrl="/home"
          signUpUrl="/sign-up"
        />
      </div>
    </div>
  )
}
