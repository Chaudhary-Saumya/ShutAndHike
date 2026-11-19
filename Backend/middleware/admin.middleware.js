const admin = (req, res, next) => {
  const role = req.user?.role || req.data?.role;

  if (!role || role.toLowerCase() !== 'admin') {
    return res.status(403).json({ msg: "Access denied. Only admin can perform this action." });
  }

  next();
};

admin.admin = admin;
module.exports = admin;
