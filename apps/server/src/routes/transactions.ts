import { Router, Request, Response } from "express";
import multer from "multer";
import { TransactionType } from "../generated/prisma/client";
import { prisma } from "../db/prismaClient";
import {
  parseTransactionExcel,
  type ParsedRow,
} from "../services/excelParser";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/** GET /?month=YYYY-MM (default: current month). Returns list with category and account. */
router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    let monthStr = req.query.month as string | undefined;
    if (!monthStr) {
      const now = new Date();
      monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    }
    const [y, m] = monthStr.split("-").map(Number);
    if (!y || !m || m < 1 || m > 12) {
      return res.status(400).json({ error: "Invalid month; use YYYY-MM" });
    }
    const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: start, lte: end },
      },
      include: {
        category: true,
        account: true,
      },
      orderBy: [{ date: "desc" }, { createdAt: "asc" }],
    });

    res.json(transactions);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

/** POST /upload multipart: file, accountId, expenseCategoryId, incomeCategoryId. Bulk create from Excel. */
router.post(
  "/upload",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const file = req.file;
      const accountId = req.body?.accountId as string | undefined;
      const expenseCategoryId = req.body?.expenseCategoryId as string | undefined;
      const incomeCategoryId = req.body?.incomeCategoryId as string | undefined;

      if (!file?.buffer) {
        return res.status(400).json({ error: "File is required" });
      }
      if (!accountId?.trim()) {
        return res.status(400).json({ error: "accountId is required" });
      }
      if (!expenseCategoryId?.trim()) {
        return res.status(400).json({ error: "expenseCategoryId is required" });
      }
      if (!incomeCategoryId?.trim()) {
        return res.status(400).json({ error: "incomeCategoryId is required" });
      }

      const [account, expenseCat, incomeCat] = await Promise.all([
        prisma.account.findFirst({
          where: { id: accountId.trim(), userId },
          select: { id: true },
        }),
        prisma.category.findFirst({
          where: { id: expenseCategoryId.trim(), userId, type: TransactionType.EXPENSE },
          select: { id: true },
        }),
        prisma.category.findFirst({
          where: { id: incomeCategoryId.trim(), userId, type: TransactionType.INCOME },
          select: { id: true },
        }),
      ]);

      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }
      if (!expenseCat) {
        return res.status(404).json({ error: "Expense category not found" });
      }
      if (!incomeCat) {
        return res.status(404).json({ error: "Income category not found" });
      }

      let rows: ParsedRow[];
      let skipped: number;
      try {
        const parsed = await parseTransactionExcel(file.buffer);
        rows = parsed.rows;
        skipped = parsed.skipped;
      } catch (parseErr) {
        const message =
          parseErr instanceof Error
            ? parseErr.message
            : "엑셀 파일을 읽을 수 없습니다.";
        return res.status(400).json({ error: message });
      }

      const created = [];

      for (const row of rows) {
        const categoryId = row.type === "INCOME" ? incomeCat.id : expenseCat.id;
        const t = await prisma.transaction.create({
          data: {
            userId,
            accountId: account.id,
            categoryId,
            type: row.type,
            amount: row.amount,
            date: row.date,
            memo: row.memo ?? undefined,
          },
          include: {
            category: true,
            account: true,
          },
        });
        created.push(t);
      }

      res.status(201).json({
        created: created.length,
        skipped,
        transactions: created,
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/** POST / body: type, amount, date, categoryId, accountId, memo?, isFixed?, scheduledAt?, labels? */
router.post("/", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const {
      type,
      amount,
      date,
      categoryId,
      accountId,
      memo,
      isFixed,
      scheduledAt,
      labels,
    } = req.body;

    if (
      type == null ||
      amount == null ||
      date == null ||
      categoryId == null ||
      accountId == null
    ) {
      return res
        .status(400)
        .json({ error: "Missing required fields: type, amount, date, categoryId, accountId" });
    }
    if (!Object.values(TransactionType).includes(type)) {
      return res.status(400).json({ error: "Invalid type" });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        accountId,
        categoryId,
        type,
        amount: Number(amount),
        date: new Date(date),
        memo: memo ?? undefined,
        isFixed: Boolean(isFixed),
        scheduledAt: scheduledAt != null ? new Date(scheduledAt) : undefined,
        labels: labels != null ? labels : undefined,
      },
      include: {
        category: true,
        account: true,
      },
    });

    res.status(201).json(transaction);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

/** PUT /:id body: type?, amount?, date?, categoryId?, accountId?, memo?, isFixed?, scheduledAt?, labels? */
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const { id } = req.params as { id: string };
    if (!id) {
      return res.status(400).json({ error: "Transaction id is required" });
    }

    const existing = await prisma.transaction.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    const {
      type,
      amount,
      date,
      categoryId,
      accountId,
      memo,
      isFixed,
      scheduledAt,
      labels,
    } = req.body;

    if (type != null && !Object.values(TransactionType).includes(type)) {
      return res.status(400).json({ error: "Invalid type" });
    }

    const data: Record<string, unknown> = {};

    if (type != null) {
      data.type = type;
    }
    if (amount != null) {
      data.amount = Number(amount);
    }
    if (date != null) {
      data.date = new Date(date);
    }
    if (categoryId != null) {
      data.categoryId = categoryId;
    }
    if (accountId != null) {
      data.accountId = accountId;
    }
    if (memo !== undefined) {
      data.memo = memo ?? null;
    }
    if (isFixed != null) {
      data.isFixed = Boolean(isFixed);
    }
    if (scheduledAt !== undefined) {
      data.scheduledAt = scheduledAt != null ? new Date(scheduledAt) : null;
    }
    if (labels !== undefined) {
      data.labels = labels != null ? labels : null;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data,
      include: {
        category: true,
        account: true,
      },
    });

    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

/** DELETE /:id - delete transaction owned by demo user */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const { id } = req.params as { id: string };
    if (!id) {
      return res.status(400).json({ error: "Transaction id is required" });
    }

    const existing = await prisma.transaction.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    await prisma.transaction.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
