import express from "express";
import http from "http";
import { ensureDemoData } from "./db/seed";
import transactionsRouter from "./routes/transactions";
import categoriesRouter from "./routes/categories";
import accountsRouter from "./routes/accounts";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/api/transactions", transactionsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/accounts", accountsRouter);

const server = http.createServer(app);

ensureDemoData()
  .then(() => {
    server.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((err) => {
    console.error("Failed to ensure demo data:", err);
    process.exit(1);
  });
