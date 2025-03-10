import { NewPasswordForm } from "@/components/auth/new-password-form"

export default function NewPasswordPage({ params }: { params: { token: string } }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Set New Password</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Create a new password for your account</p>
        </div>
        <NewPasswordForm token={params.token} />
      </div>
    </main>
  )
}

