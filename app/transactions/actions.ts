"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { signOut } from "@/auth";
import { createTransaction, deleteTransaction } from "@/app/lib/dal";

const TransactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce
    .number({ error: "Enter an amount" })
    .positive("Amount must be greater than 0")
    .max(100_000_000, "Amount is too large"),
  category: z.string().trim().min(1, "Category is required").max(50),
  occurredOn: z.iso.date("Pick a valid date"),
  note: z
    .string()
    .trim()
    .max(200)
    .transform((v) => v || null),
});

export type TransactionFormState = {
  ok: boolean;
  message?: string;
  errors?: Partial<Record<keyof z.infer<typeof TransactionSchema>, string[]>>;
};

export async function addTransaction(
  _prev: TransactionFormState,
  formData: FormData,
): Promise<TransactionFormState> {
  const parsed = TransactionSchema.safeParse({
    type: formData.get("type"),
    amount: formData.get("amount"),
    category: formData.get("category"),
    occurredOn: formData.get("occurredOn"),
    note: formData.get("note") ?? "",
  });

  if (!parsed.success) {
    return { ok: false, errors: z.flattenError(parsed.error).fieldErrors };
  }

  const { amount, ...rest } = parsed.data;
  await createTransaction({ ...rest, amountCents: Math.round(amount * 100) });

  revalidatePath("/transactions");
  return { ok: true, message: "Transaction added" };
}

export async function removeTransaction(id: string) {
  z.uuid().parse(id);
  await deleteTransaction(id);
  revalidatePath("/transactions");
}

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}
