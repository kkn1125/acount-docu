import { Router, Request, Response } from "express";
import { prisma } from "../db/prismaClient";
import { Transaction, TransactionType } from "../generated/prisma/client";

const DEMO_EMAIL = "demo@local";
const router = Router();

async function getDemoUserId(): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
    select: { id: true },
  });
  return user?.id ?? null;
}

/** GET /api/summary/monthly?year=YYYY&month=M */
router.get("/monthly", async (req: Request, res: Response) => {
  try {
    const userId = await getDemoUserId();
    if (!userId) {
      return res.status(404).json({ error: "Demo user not found" });
    }

    const year = Number(req.query.year);
    const month = Number(req.query.month);

    if (!year || !month || month < 1 || month > 12) {
      return res.status(400).json({ error: "Invalid year or month" });
    }

    const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const [transactions, todayTransactions] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          userId,
          date: { gte: start, lte: end },
        },
        include: {
          category: true,
        },
      }),
      (async () => {
        const now = new Date();
        const todayStart = new Date(
          Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate(),
            0,
            0,
            0,
            0
          )
        );
        const todayEnd = new Date(
          Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate(),
            23,
            59,
            59,
            999
          )
        );
        return prisma.transaction.findMany({
          where: {
            userId,
            date: { gte: todayStart, lte: todayEnd },
            type: TransactionType.EXPENSE,
          },
        });
      })(),
    ]);

    let totalIncome = 0;
    let totalExpense = 0;

    const categoryMap = new Map<
      string,
      {
        categoryId: string;
        categoryName: string;
        spent: number;
        budget: number | null;
      }
    >();

    for (const tx of transactions) {
      if (tx.type === TransactionType.INCOME) {
        totalIncome += Number(tx.amount);
      } else if (tx.type === TransactionType.EXPENSE) {
        totalExpense += Number(tx.amount);

        const key = tx.categoryId;
        const existing = categoryMap.get(key);
        const spent = (existing?.spent ?? 0) + Number(tx.amount);
        categoryMap.set(key, {
          categoryId: tx.categoryId,
          categoryName: tx.category.name,
          spent,
          budget: existing?.budget ?? null,
        });
      }
    }

    const budgets = await prisma.budget.findMany({
      where: { userId, year, month },
      select: { categoryId: true, amount: true },
    });

    for (const b of budgets) {
      const existing = categoryMap.get(b.categoryId);
      if (existing) {
        existing.budget = Number(b.amount);
      } else {
        const cat = await prisma.category.findUnique({
          where: { id: b.categoryId },
          select: { name: true },
        });
        categoryMap.set(b.categoryId, {
          categoryId: b.categoryId,
          categoryName: cat?.name ?? b.categoryId,
          spent: 0,
          budget: Number(b.amount),
        });
      }
    }

    const todayExpense = todayTransactions.reduce(
      (sum: number, tx: Transaction) => sum + Number(tx.amount),
      0
    );

    res.json({
      year,
      month,
      totalIncome,
      totalExpense,
      todayExpense,
      categoryBreakdown: Array.from(categoryMap.values()),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
