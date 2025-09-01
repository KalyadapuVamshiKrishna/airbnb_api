export const requireHost = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  if (req.user.role !== "host") return res.status(403).json({ message: "Only hosts allowed" });
  next();
};
