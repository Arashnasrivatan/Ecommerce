import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { setHeaders } from "./common/middlewares/setHeaders";
import errorHandler from "./common/middlewares/errorHandler";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import logger from "./utils/logger";
import path from "path";
import passport from "passport";
import configs from "./config/configs";

const app = express();

//* BodyParser
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json({ limit: "50mb" }));

//* Helmet
app.use(helmet());

//* Rate Limiter
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 35,
  message: { error: "Too many requests from this IP, please try again later." },
});
app.use(limiter);

//* Cors Policy
app.use(setHeaders);
app.use(cookieParser());
app.use(
  cors({
    origin: configs.cors,
    credentials: true,
  })
);

//* Logger
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    })
  );
}

//* Static Files
app.use(express.static(path.resolve(__dirname, "..", "public")));

//* Passport
app.use(passport.initialize());
// TODO

//* Routes

app.get("/api", async (req, res) => {
  res.send("🎉 Server is running!");
});
// TODO

// Swagger UI
// TODO

//* 404 Err Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: `404! This ${req.path} Path Not Found! Please Check The Path Or Method...`,
  });
});

//* Error Handler
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use((err: any, req: Request, res: Response) => {
  errorHandler(err, req, res);
});

export default app;
