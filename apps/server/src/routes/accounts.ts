import { Router, Request, Response } from "express";
import { prisma } from "../db/prismaClient";
import { AccountType, TransactionType } from "../generated/prisma/client";

const router = Router();

function toAccountPayload(a: {
  id: string;
  name: string;
  type: string;
  balance: { toNumber?: () => number } | number;
  initialBalanceDate: Date | null;
  initialBalance: { toNumber?: () => number } | number | null;
  isDefault: boolean;
  isArchived: boolean;
  sortOrder: number;
}) {
  const balance = typeof a.balance === "number" ? a.balance : Number(a.balance);
  const initialBalance =
    a.initialBalance == null
      ? null
      : typeof a.initialBalance === "number"
        ? a.initialBalance
        : Number(a.initialBalance);
  return {
    id: a.id,
    name: a.name,
    type: a.type,
    balance,
    initialBalanceDate: a.initialBalanceDate?.toISOString?.()?.slice(0, 10) ?? null,
    initialBalance: initialBalance != null ? initialBalance : null,
    isDefault: a.isDefault,
    isArchived: a.isArchived,
    sortOrder: a.sortOrder,
  };
}

/** GET /?include=calculatedBalance — 계정 목록. include=calculatedBalance 시 계산 잔액·차이 포함 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const includeCalculated = String(req.query.include ?? "").toLowerCase() === "calculatedbalance";

    const accounts = await prisma.account.findMany({
      where: { userId, isArchived: false },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    if (!includeCalculated) {
      return res.json(
        accounts.map((a) => toAccountPayload(a)),
      );
    }

    const baselineByAccount = new Map<string, Date>();
    for (const a of accounts) {
      if (a.initialBalanceDate) {
        const d = new Date(a.initialBalanceDate);
        d.setHours(0, 0, 0, 0);
        baselineByAccount.set(a.id, d);
      }
    }

    const result = await Promise.all(
      accounts.map(async (a) => {
        const payload = toAccountPayload(a);
        const baseline = baselineByAccount.get(a.id);
        const inputBalance = Number(a.balance);
        let calculatedBalance: number | null = null;
        let difference: number | null = null;

        if (baseline != null) {
          const base = a.initialBalance != null ? Number(a.initialBalance) : 0;
          const [incomeAgg, expenseAgg] = await Promise.all([
            prisma.transaction.aggregate({
              where: {
                accountId: a.id,
                date: { gte: baseline },
                type: TransactionType.INCOME,
              },
              _sum: { amount: true },
            }),
            prisma.transaction.aggregate({
              where: {
                accountId: a.id,
                date: { gte: baseline },
                type: TransactionType.EXPENSE,
              },
              _sum: { amount: true },
            }),
          ]);
          const income = Number(incomeAgg._sum?.amount ?? 0);
          const expense = Number(expenseAgg._sum?.amount ?? 0);
          calculatedBalance = base + income - expense;
          difference = inputBalance - calculatedBalance;
        }

        return {
          ...payload,
          ...(calculatedBalance != null && {
            calculatedBalance,
            difference,
          }),
        };
      }),
    );

    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

/** POST / — 계정 생성. body: { name, type, sortOrder?, balance?, initialBalanceDate?, initialBalance? } */
router.post("/", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const { name, type, sortOrder, balance, initialBalanceDate, initialBalance } = req.body;
    const trimmedName = typeof name === "string" ? name.trim() : "";
    if (!trimmedName) {
      return res.status(400).json({ error: "name is required" });
    }
    if (!type || !Object.values(AccountType).includes(type)) {
      return res.status(400).json({ error: "type must be one of BANK, CREDIT_CARD, CASH, INVESTMENT, LOAN" });
    }

    const maxOrder = await prisma.account.findFirst({
      where: { userId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    const nextSortOrder = typeof sortOrder === "number" && Number.isInteger(sortOrder)
      ? sortOrder
      : (maxOrder?.sortOrder ?? -1) + 1;

    const balanceNum = balance != null ? Number(balance) : 0;
    if (Number.isNaN(balanceNum) || balanceNum < 0) {
      return res.status(400).json({ error: "balance must be a non-negative number" });
    }

    let initialBalanceDateVal: Date | null = null;
    if (initialBalanceDate != null && initialBalanceDate !== "") {
      const d = new Date(initialBalanceDate);
      if (Number.isNaN(d.getTime())) {
        return res.status(400).json({ error: "initialBalanceDate must be a valid date" });
      }
      d.setHours(0, 0, 0, 0);
      initialBalanceDateVal = d;
    }

    let initialBalanceVal: number | null = null;
    if (initialBalance != null && initialBalance !== "") {
      const n = Number(initialBalance);
      if (Number.isNaN(n) || n < 0) {
        return res.status(400).json({ error: "initialBalance must be a non-negative number" });
      }
      initialBalanceVal = n;
    }

    const created = await prisma.account.create({
      data: {
        userId,
        name: trimmedName,
        type: type as AccountType,
        sortOrder: nextSortOrder,
        balance: balanceNum,
        initialBalanceDate: initialBalanceDateVal,
        initialBalance: initialBalanceVal,
      },
    });

    return res.status(201).json(toAccountPayload(created));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/** PATCH /:id — 잔액만 수정 (기존 호환) */
async function handleUpdateAccountBalance(req: Request, res: Response) {
  const userId = req.userId!;

  const id = req.params.id as string;
  if (!id || id.trim() === "") {
    return res.status(400).json({ error: "Account id is required" });
  }

  const existing = await prisma.account.findUnique({
    where: { id: id.trim() },
    select: { userId: true },
  });
  if (!existing || existing.userId !== userId) {
    return res.status(404).json({ error: "Account not found" });
  }

  const { balance } = req.body;
  if (balance === undefined || balance === null) {
    return res.status(400).json({ error: "balance is required" });
  }
  const balanceNum = Number(balance);
  if (Number.isNaN(balanceNum) || balanceNum < 0) {
    return res.status(400).json({ error: "balance must be a non-negative number" });
  }

  const updated = await prisma.account.update({
    where: { id: id.trim() },
    data: { balance: balanceNum },
  });

  return res.json(toAccountPayload(updated));
}

/** PUT /:id — 계정 전체 수정 (name, type, sortOrder, balance, initialBalanceDate, initialBalance) */
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const id = (req.params.id as string)?.trim();
    if (!id) {
      return res.status(400).json({ error: "Account id is required" });
    }

    const existing = await prisma.account.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ error: "Account not found" });
    }

    const { name, type, sortOrder, balance, initialBalanceDate, initialBalance } = req.body;
    const updates: {
      name?: string;
      type?: AccountType;
      sortOrder?: number;
      balance?: number;
      initialBalanceDate?: Date | null;
      initialBalance?: number | null;
    } = {};

    if (typeof name === "string") {
      const trimmed = name.trim();
      if (!trimmed) return res.status(400).json({ error: "name cannot be empty" });
      updates.name = trimmed;
    }
    if (type != null) {
      if (!Object.values(AccountType).includes(type)) {
        return res.status(400).json({ error: "type must be one of BANK, CREDIT_CARD, CASH, INVESTMENT, LOAN" });
      }
      updates.type = type as AccountType;
    }
    if (sortOrder !== undefined && sortOrder !== null) {
      const n = Number(sortOrder);
      if (!Number.isInteger(n)) return res.status(400).json({ error: "sortOrder must be an integer" });
      updates.sortOrder = n;
    }
    if (balance !== undefined && balance !== null) {
      const n = Number(balance);
      if (Number.isNaN(n) || n < 0) return res.status(400).json({ error: "balance must be a non-negative number" });
      updates.balance = n;
    }
    if (initialBalanceDate !== undefined) {
      if (initialBalanceDate === null || initialBalanceDate === "") {
        updates.initialBalanceDate = null;
      } else {
        const d = new Date(initialBalanceDate);
        if (Number.isNaN(d.getTime())) return res.status(400).json({ error: "initialBalanceDate must be a valid date" });
        d.setHours(0, 0, 0, 0);
        updates.initialBalanceDate = d;
      }
    }
    if (initialBalance !== undefined) {
      if (initialBalance === null || initialBalance === "") {
        updates.initialBalance = null;
      } else {
        const n = Number(initialBalance);
        if (Number.isNaN(n) || n < 0) return res.status(400).json({ error: "initialBalance must be a non-negative number" });
        updates.initialBalance = n;
      }
    }

    if (Object.keys(updates).length === 0) {
      const current = await prisma.account.findUniqueOrThrow({ where: { id } });
      return res.json(toAccountPayload(current));
    }

    const updated = await prisma.account.update({
      where: { id },
      data: updates,
    });
    return res.json(toAccountPayload(updated));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/** PATCH /:id — 잔액만 수정 */
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    await handleUpdateAccountBalance(req, res);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

/** DELETE /:id — 계정 삭제. 거래가 있으면 409 */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const id = (req.params.id as string)?.trim();
    if (!id) {
      return res.status(400).json({ error: "Account id is required" });
    }

    const account = await prisma.account.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!account || account.userId !== userId) {
      return res.status(404).json({ error: "Account not found" });
    }

    const count = await prisma.transaction.count({ where: { accountId: id } });
    if (count > 0) {
      return res.status(409).json({
        error: "Cannot delete account with existing transactions",
        transactionCount: count,
      });
    }

    await prisma.account.delete({ where: { id } });
    return res.status(204).send();
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
