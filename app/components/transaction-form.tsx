"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  addTransaction,
  type TransactionFormState,
} from "@/app/transactions/actions";

const initialState: TransactionFormState = { ok: false };

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900";

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="mt-1 text-sm text-red-600">{messages[0]}</p>;
}

export default function TransactionForm({ today }: { today: string }) {
  const [state, formAction, pending] = useActionState(
    addTransaction,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid gap-3 rounded-xl border border-zinc-200 p-4 sm:grid-cols-2 dark:border-zinc-800"
    >
      <div>
        <label htmlFor="type" className="mb-1 block text-sm font-medium">
          Type
        </label>
        <select id="type" name="type" defaultValue="expense" className={inputClass}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>

      <div>
        <label htmlFor="amount" className="mb-1 block text-sm font-medium">
          Amount
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0.01"
          required
          placeholder="0.00"
          className={inputClass}
        />
        <FieldError messages={state.errors?.amount} />
      </div>

      <div>
        <label htmlFor="category" className="mb-1 block text-sm font-medium">
          Category
        </label>
        <input
          id="category"
          name="category"
          required
          maxLength={50}
          placeholder="Food, Salary, Rent…"
          className={inputClass}
        />
        <FieldError messages={state.errors?.category} />
      </div>

      <div>
        <label htmlFor="occurredOn" className="mb-1 block text-sm font-medium">
          Date
        </label>
        <input
          id="occurredOn"
          name="occurredOn"
          type="date"
          required
          defaultValue={today}
          className={inputClass}
        />
        <FieldError messages={state.errors?.occurredOn} />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="note" className="mb-1 block text-sm font-medium">
          Note <span className="text-zinc-500">(optional)</span>
        </label>
        <input id="note" name="note" maxLength={200} className={inputClass} />
      </div>

      <div className="flex items-center gap-3 sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {pending ? "Saving…" : "Add transaction"}
        </button>
        <p aria-live="polite" className="text-sm text-zinc-500">
          {state.message}
        </p>
      </div>
    </form>
  );
}
