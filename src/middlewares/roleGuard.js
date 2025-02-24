module.exports = (userRole) => {
  return async (req, res, next) => {
    const user = req.user;
    const hasRole = user.role.toString() == userRole.toString();
    if (!hasRole) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};
