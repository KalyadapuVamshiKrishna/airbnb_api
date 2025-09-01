import jwt from "jsonwebtoken";

export const jwtSecret = process.env.JWT_SECRET || "supersecret";

export const requireAuth = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  jwt.verify(token, jwtSecret, (err, userData) => {
    if (err) return res.status(401).json({ error: "Invalid token" });
    req.user = userData;
    next();
  });
};
