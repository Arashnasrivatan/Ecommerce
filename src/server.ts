import app from "./app";
import redis from "./config/redis";
import { connectToMongo, disconnectFromMongo } from "./config/mongo";
import configs from "./config/configs";
import { Server } from "http";

let server: Server;

//* Start Server
async function startServer() {
  try {
    //* Connect To MongoDB
    await connectToMongo();

    //* Connect To Redis
    await redis.ping();
    console.log("✅ Connected to Redis");

    //* Start Express App
    server = app.listen(configs.port, () => {
      console.log(`Server started on port ${configs.port} 🚀`);
    });
  } catch (err) {
    console.error("Startup error:", err);
    await shutdown(1);
  }
}

//* Graceful Shutdown Handler
async function shutdown(exitCode = 0) {
  try {
    console.log("Shutting down server...");

    if (server) {
      await new Promise<void>((resolve) => {
        server.close(() => {
          console.log("HTTP server closed");
          resolve();
        });
      });
    }

    if (redis.status === "ready") {
      await Promise.race([
        redis.quit(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Redis quit timeout")), 5000)
        ),
      ]);

      console.log("Redis disconnected");
    }

    await disconnectFromMongo();
    console.log("MongoDB disconnected");
  } catch (err) {
    console.error("Error during shutdown:", err);
  } finally {
    process.exit(exitCode);
  }
}

//* Process Events
process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  shutdown(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  shutdown(1);
});

//* Run Project
startServer();
