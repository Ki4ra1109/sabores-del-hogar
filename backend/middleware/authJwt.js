const jwt = require("jsonwebtoken");

function authJwt(req, res, next) {
  const h = req.headers.authorization || "";
  const [, token] = h.split(" ");
  if (!token) return res.status(401).json({ message: "Token faltante" });
  try {
    const p = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: p.uid, email: p.email, rol: p.rol };
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido" });
  }
}

function isAdmin(req, res, next) {
  if (req.user?.rol === "admin") return next();
  return res.status(403).json({ message: "Requiere admin" });
}

module.exports = { authJwt, isAdmin };
