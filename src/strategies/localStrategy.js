const User = require("./../models/User");
const bcrypt = require("bcrypt");

const localStrategy = require("passport-local").Strategy;

module.exports = new localStrategy(async (username, password, done) => {
  const user = await User.findOne({ username });
  if (!user) {
    return done(null, false);
  }
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return done(null, false);
  }
  return done(null, user);
});
