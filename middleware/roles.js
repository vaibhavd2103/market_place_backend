const permit = (...allowedRoles) => {
  return (req, res, next) => {
    const { role } = req.user;

    if (allowedRoles.includes(role)) {
      next();
    } else {
      res.status(403).json({ message: "Forbidden: Access is denied" });
    }
  };
};

module.exports = permit;
