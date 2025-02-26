const response = require("./../utils/response");

module.exports = (userRole) => {
  return async (req, res, next) => {
    const user = req.user;
    const hasRole = user.role.toString() == userRole.toString();
    if (!hasRole) {
      return response(res, 403, "Forbidden");
    }
    next();
  };
};
