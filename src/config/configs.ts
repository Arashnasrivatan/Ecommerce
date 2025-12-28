const configs = {
  port: process.env.PORT || 4000,
  domain: process.env.DOMAIN || "http://localhost:4000",
  cors : process.env.CORS || "*",
  nodeEnv: process.env.NODE_ENV || "development",

  // Database
  mongoURI: process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce",

  // Redis
  redisURI: process.env.REDIS_URI || "redis://localhost:6379",

  // Auth
  accessTokenSecretKey:
    process.env.ACCESS_TOKEN_SECRET_KEY || "default-access-token-key",
  refreshTokenSecretKey:
    process.env.REFRESH_TOKEN_SECRET_KEY || "default-refresh-token-key",
  accessTokenExpiresIn: parseInt(
    process.env.ACCESS_TOKEN_EXPIRES_IN_SECONDS || "5000",
    10
  ),
  refreshTokenExpiresIn: parseInt(
    process.env.REFRESH_TOKEN_EXPIRES_IN_SECONDS || "60000",
    10
  ),
};

export default configs;
