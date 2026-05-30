import Link from "next/link"
import { RegisterForm } from "@/components/RegisterForm"

export default function RegisterPage() {
  return (
    <main className="dot-grid flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <section className="card w-full max-w-lg p-6">
        <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
        <p className="mt-2 text-sm text-muted">Choose your account type and get started with EventSphere.</p>
        <div className="mt-6">
          <RegisterForm />
        </div>
        <p className="mt-5 text-center text-sm text-muted">
          Already registered? <Link href="/login" className="font-medium text-[#6366F1]">Sign in</Link>
        </p>
      </section>
    </main>
  )
}
