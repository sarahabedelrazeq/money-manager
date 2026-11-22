import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { and, desc, eq, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { transactions, type NewTransaction } from "@/db/schema";

/** Returns the signed-in user's id, or redirects to /login. */
export const verifySession = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return { userId: session.user.id, user: session.user };
});

export async function getTransactions() {
  const { userId } = await verifySession();
  return db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.occurredOn), desc(transactions.createdAt));
}

export async function getTotals() {
  const { userId } = await verifySession();
  const [row] = await db
    .select({
      income: sql<number>`coalesce(sum(${transactions.amountCents}) filter (where ${transactions.type} = 'income'), 0)`.mapWith(Number),
      expense: sql<number>`coalesce(sum(${transactions.amountCents}) filter (where ${transactions.type} = 'expense'), 0)`.mapWith(Number),
    })
    .from(transactions)
    .where(eq(transactions.userId, userId));

  const income = row?.income ?? 0;
  const expense = row?.expense ?? 0;
  return { income, expense, balance: income - expense };
}

export async function createTransaction(
  input: Omit<NewTransaction, "id" | "userId" | "createdAt">,
) {
  const { userId } = await verifySession();
  await db.insert(transactions).values({ ...input, userId });
}

export async function deleteTransaction(id: string) {
  const { userId } = await verifySession();
  await db
    .delete(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
}
