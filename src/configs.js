module.exports = {
  db: {
    mongo_uri: process.env.MONGO_URI,
  },

  domain: process.env.DOMAIN,

  isProduction: process.env.NODE_ENV === "production",
  port: parseInt(process.env.PORT) || 4000,

  auth: {
    accessTokenSecretKey: process.env.ACCESS_TOKEN_SECRET_KEY,
    refreshTokenSecretKey: process.env.REFRESH_TOKEN_SECRET_KEY,
    accessTokenExpiresInSeconds: process.env.ACCESS_TOKEN_EXPIRES_IN_SECONDS,
    refreshTokenExpiresInSeconds: process.env.REFRESH_TOKEN_EXPIRES_IN_SECONDS,
  },

  redis: {
    uri: process.env.REDIS_URL,
  },

  sms: {
    sms_base_url: process.env.SMS_SANDBOX_BASE_URL,
    sms_patern: process.env.SMS_PATERN,
    sms_api_key: process.env.SMS_SANDBOX_API_KEY,
  },
};
