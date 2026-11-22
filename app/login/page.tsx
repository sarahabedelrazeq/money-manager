import GoogleLoginButton from "@/app/components/google-login-button";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-4 p-6">
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p>Sign in to continue.</p>
        <GoogleLoginButton />
      </div>
    </main>
  );
}
