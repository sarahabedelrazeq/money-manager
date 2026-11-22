import type { Metadata } from "next";
import { Suspense } from "react";
import SignOutButton from "@/app/components/sign-out-button";
import TransactionForm from "@/app/components/transaction-form";
import { getTotals, getTransactions, verifySession } from "@/app/lib/dal";
import { removeTransaction } from "./actions";

export const metadata: Metadata = { title: "Transactions · Money Manager" };

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
const fmt = (cents: number) => money.format(cents / 100);

export default function TransactionsPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-semibold">Money Manager</h1>
      {/* Reads the session + DB at request time, so it streams in. */}
      <Suspense fallback={<p className="text-zinc-500">Loading your money…</p>}>
        <Dashboard />
      </Suspense>
    </main>
  );
}

async function Dashboard() {
  const { user } = await verifySession();
  const [rows, totals] = await Promise.all([getTransactions(), getTotals()]);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <header className="flex items-center justify-between gap-4">
        <p className="text-sm text-zinc-500">Signed in as {user.email}</p>
        <SignOutButton />
      </header>

      <section className="grid grid-cols-3 gap-3">
        <Stat label="Balance" value={fmt(totals.balance)} />
        <Stat label="Income" value={fmt(totals.income)} tone="text-green-600" />
        <Stat label="Expenses" value={fmt(totals.expense)} tone="text-red-600" />
      </section>

      <TransactionForm today={today} />

      <section>
        <h2 className="mb-3 text-lg font-semibold">History</h2>
        {rows.length === 0 ? (
          <p className="text-zinc-500">No transactions yet.</p>
        ) : (
          <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {rows.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{t.category}</p>
                  <p className="truncate text-sm text-zinc-500">
                    {t.occurredOn}
                    {t.note ? ` · ${t.note}` : ""}
                  </p>
                </div>
                <span
                  className={`font-mono ${t.type === "income" ? "text-green-600" : "text-red-600"}`}
                >
                  {t.type === "income" ? "+" : "−"}
                  {fmt(t.amountCents)}
                </span>
                <form action={removeTransaction.bind(null, t.id)}>
                  <button
                    type="submit"
                    aria-label={`Delete ${t.category}`}
                    className="rounded px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-red-600 dark:hover:bg-zinc-800"
                  >
                    Delete
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function Stat({
  label,
  value,
  tone = "",
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className={`mt-1 text-lg font-semibold sm:text-xl ${tone}`}>{value}</p>
    </div>
  );
}
