import app from "./app.js";
import config from "./config/index.js";
import { initDB } from "./db/index.js";

const main = async (): Promise<void> => {
  try {
    await initDB();
    app.listen(config.port, () => {
      console.log(`DevPulse API is running on port ${config.port}`);
    });
  } catch (error: unknown) {
    console.error("Failed to start DevPulse API", error);
    process.exit(1);
  }
};

void main();
