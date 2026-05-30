import Link from "next/link"
import { LoginForm } from "@/components/LoginForm"

export default function LoginPage() {
  return (
    <main className="dot-grid flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <section className="card w-full max-w-md p-6">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm text-muted">Sign in to your EventSphere account.</p>
        <div className="mt-6">
          <LoginForm />
        </div>
        <p className="mt-5 text-center text-sm text-muted">
          New here? <Link href="/register" className="font-medium text-[#6366F1]">Create an account</Link>
        </p>
      </section>
    </main>
  )
}
