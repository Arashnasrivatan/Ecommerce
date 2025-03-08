const express = require("express");
const cors = require("cors");
const response = require("./utils/response");
const helmet = require("helmet");
const { setHeaders } = require("./middlewares/setHeaders");
const { errorHandler } = require("./middlewares/errorHandler");
const rateLimit = require("express-rate-limit");
const path = require("path");
const passport = require("passport");
const localStrategy = require("./strategies/localStrategy");
const JwtAccessTokenStrategy = require("./strategies/JwtAccessTokenStrategy");
const JwtRefreshTokenStrategy = require("./strategies/JwtRefreshTokenStrategy");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");
const productRoutes = require("./routes/product");
const commentRoutes = require("./routes/comment");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/order");

const app = express();

//* BodyParser
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json({ limit: "50mb" }));

//* Helmet
app.use(helmet());

//* Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

//* Cors Policy
app.use(setHeaders);
app.use(cors());

//* Static Files
app.use(express.static(path.resolve(__dirname, "..", "public")));

//* Passport
passport.use(localStrategy);
passport.use("accessToken", JwtAccessTokenStrategy);
passport.use("refreshToken", JwtRefreshTokenStrategy);

//* Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);

//TODO Swagger

//* 404 Err Handler
app.use((req, res) => {
  return response(
    res,
    404,
    `404! This ${req.path} Path Not Found! Please Check The Path Or Method...`
  );
});

//* Error Handler
app.use(errorHandler);

module.exports = app;
