const JwtStrategy = require("passport-jwt").Strategy;
const { ExtractJwt } = require("passport-jwt");
const bcrypt = require("bcrypt");
const configs = require("../configs");
const redis = require("../redis");
const User = require("./../models/User");

module.exports = new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: configs.auth.refreshTokenSecretKey,
    passReqToCallback: true,
  },
  async (req, payload, done) => {
    const refreshToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    const user = await User.findById(payload.id).select("-password");

    if (!user) {
      return done(null, false);
    }

    const hashedRefreshToken = await redis.get(`refreshToken:${user.id}`);

    if (!hashedRefreshToken) {
      return done(null, false);
    }

    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      hashedRefreshToken
    );

    if (!isRefreshTokenValid) {
      return done(null, false);
    }

    return done(null, user);
  }
);
