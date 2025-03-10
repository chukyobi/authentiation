import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Sign up or log in to access your account</p>
        </div>
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/signup">Sign Up</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">Log In</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}

