const jwt = require('jsonwebtoken');

function authJwt(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Falta token' });

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET no configurado en .env');
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (e) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}

//proteger rutas solo admin
function isAdmin(req, res, next) {
  const rol = String(req.user?.rol || req.user?.role || '').toLowerCase();
  if (rol !== 'admin') return res.status(403).json({ message: 'No autorizado' });
  next();
}

module.exports = { authJwt, isAdmin };
