import { Router, Request, Response } from "express";
import { prisma } from "../db/prismaClient";

const router = Router();

/** GET /api/budgets?year=YYYY&month=M - list budgets for the month */
router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const year = Number(req.query.year);
    const month = Number(req.query.month);

    if (!year || !month || month < 1 || month > 12) {
      return res.status(400).json({ error: "Invalid year or month" });
    }

    const budgets = await prisma.budget.findMany({
      where: { userId, year, month },
      include: { category: true },
      orderBy: { category: { name: "asc" } },
    });

    res.json(
      budgets.map((b) => ({
        id: b.id,
        categoryId: b.categoryId,
        categoryName: b.category.name,
        year: b.year,
        month: b.month,
        amount: Number(b.amount),
        alertAt: b.alertAt,
      })),
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

/** PUT /api/budgets - upsert one budget. body: { categoryId, year, month, amount, alertAt? } */
router.put("/", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const { categoryId, year, month, amount, alertAt } = req.body;

    if (!categoryId || year == null || month == null || amount == null) {
      return res
        .status(400)
        .json({ error: "Missing required fields: categoryId, year, month, amount" });
    }

    const y = Number(year);
    const m = Number(month);
    if (!y || !m || m < 1 || m > 12) {
      return res.status(400).json({ error: "Invalid year or month" });
    }

    const budget = await prisma.budget.upsert({
      where: {
        userId_categoryId_year_month: {
          userId,
          categoryId,
          year: y,
          month: m,
        },
      },
      create: {
        userId,
        categoryId,
        year: y,
        month: m,
        amount: Number(amount),
        alertAt: alertAt != null ? Number(alertAt) : undefined,
      },
      update: {
        amount: Number(amount),
        alertAt: alertAt != null ? Number(alertAt) : undefined,
      },
      include: { category: true },
    });

    res.json({
      id: budget.id,
      categoryId: budget.categoryId,
      categoryName: budget.category.name,
      year: budget.year,
      month: budget.month,
      amount: Number(budget.amount),
      alertAt: budget.alertAt,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
