import { signOutAction } from "@/app/transactions/actions";

export default function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700"
      >
        Sign out
      </button>
    </form>
  );
}
