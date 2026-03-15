import "dotenv/config";
import { ensureDemoData } from "./seed";

ensureDemoData()
  .then(() => {
    console.log("[seed] Done.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("[seed] Failed:", err);
    process.exit(1);
  });
