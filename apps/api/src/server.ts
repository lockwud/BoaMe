import { app } from "./app.js";
import { env } from "./config/env.js";

process.on("unhandledRejection", (reason) => {
  console.warn("Unhandled rejection (non-fatal):", reason instanceof Error ? reason.message : reason);
});

app.listen(env.PORT, () => {
  console.log(`BoaMe API listening on http://localhost:${env.PORT}`);
});
