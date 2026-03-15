import { beforeAll, afterAll, describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../src/main";
import { prisma } from "../../src/db/prismaClient";
import { TransactionType } from "../../src/generated/prisma/client";

describe("/api/transactions E2E", () => {
  const app = createApp();
  const testEmail = `test-user+${Date.now()}@local`;
  const password = "password123!";
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const registerRes = await request(app)
      .post("/api/auth/register")
      .send({ email: testEmail, password, name: "Test User" });

    expect(registerRes.status).toBe(201);
    expect(registerRes.body.token).toBeDefined();

    authToken = registerRes.body.token;
    userId = registerRes.body.user.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("given 다른 유저 거래 when GET /api/transactions then 다른 유저 거래는 포함되지 않는다", async () => {
    const otherUser = await prisma.user.create({
      data: { email: `other-user+${Date.now()}@local`, name: "Other" },
    });
    const otherAccount = await prisma.account.create({
      data: { userId: otherUser.id, name: "Other Account", type: "CASH", balance: 0 },
    });
    const otherCategory = await prisma.category.create({
      data: { userId: otherUser.id, name: "Other Category", type: TransactionType.EXPENSE },
    });
    const hiddenMemo = "SHOULD_NOT_APPEAR_IN_DEMO_TX";
    await prisma.transaction.create({
      data: {
        userId: otherUser.id,
        accountId: otherAccount.id,
        categoryId: otherCategory.id,
        type: TransactionType.EXPENSE,
        amount: 1000,
        date: new Date(),
        memo: hiddenMemo,
      },
    });

    const res = await request(app)
      .get("/api/transactions")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((tx: any) => tx.memo === hiddenMemo)).toBe(false);
  });

  it("given 유효한 거래 데이터 when POST /api/transactions then 거래가 생성된다", async () => {
    const account = await prisma.account.create({
      data: { userId, name: "Test Account", type: "CASH", balance: 0 },
    });
    const category = await prisma.category.findFirstOrThrow({
      where: { userId, type: TransactionType.EXPENSE },
    });

    const payload = {
      type: TransactionType.EXPENSE,
      amount: 12345,
      date: new Date().toISOString(),
      categoryId: category.id,
      accountId: account.id,
      memo: "E2E create tx",
      isFixed: false,
    };

    const res = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${authToken}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.type).toBe(TransactionType.EXPENSE);
    expect(Number(res.body.amount)).toBe(payload.amount);
    expect(res.body.memo).toBe(payload.memo);
    expect(res.body.account.id).toBe(account.id);
    expect(res.body.category.id).toBe(category.id);
  });

  it("given 필수 필드 누락 when POST /api/transactions then 400 과 에러 메시지를 반환한다", async () => {
    const res = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ type: TransactionType.EXPENSE });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Missing required fields");
  });

  it("given 잘못된 month 쿼리 when GET /api/transactions then 400 을 반환한다", async () => {
    const res = await request(app)
      .get("/api/transactions")
      .set("Authorization", `Bearer ${authToken}`)
      .query({ month: "invalid" });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ error: "Invalid month; use YYYY-MM" });
  });
});

