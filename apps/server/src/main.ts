import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import accountsRouter from "./routes/accounts";
import budgetsRouter from "./routes/budgets";
import categoriesRouter from "./routes/categories";
import summaryRouter from "./routes/summary";
import transactionsRouter from "./routes/transactions";
import userRouter from "./routes/user";
import authRouter from "./routes/auth";
import { requireAuth } from "./middleware/auth";

console.log("[server] Starting...");
process.on("unhandledRejection", (reason, promise) => {
  console.error("[server] Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    })
  );

  app.get("/", (req, res) => {
    res.send("Hello World");
  });

  app.use("/api/auth", authRouter);

  app.use("/api/user", requireAuth, userRouter);
  app.use("/api/transactions", requireAuth, transactionsRouter);
  app.use("/api/categories", requireAuth, categoriesRouter);
  app.use("/api/accounts", requireAuth, accountsRouter);
  app.use("/api/summary", requireAuth, summaryRouter);
  app.use("/api/budgets", requireAuth, budgetsRouter);

  return app;
}

const app = createApp();
const server = http.createServer(app);

async function start() {
  try {
    server.listen(3000, () => {
      console.log("[server] Listening on http://localhost:3000");
    });
  } catch (err) {
    console.error("[server] Failed to start:", err);
    process.exit(1);
  }
}

// Only start the HTTP server when this file is the entrypoint (e.g. `tsx src/main.ts`).
// This allows tests to import `createApp` without side effects.
// eslint-disable-next-line @typescript-eslint/no-var-requires
if (require.main === module) {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  start();
}
