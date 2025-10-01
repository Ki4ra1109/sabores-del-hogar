// server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

// Rutas
const usersRoutes = require("./Routes/usersRoutes");
const authRoutes = require("./Routes/authRoutes");
const cuponRoutes = require("./Routes/cuponRoutes");
const productosRoutes = require("./Routes/productos");
const clientesRoutes = require("./Routes/clientesRoutes");

// Modelos (registran definiciones)
require("./models/User");
require("./models/cupon");

// DB (si necesitas probar conexión en /api/ping)
const db = require("./config/db");

dotenv.config();
const app = express();

// CORS: permitimos localhost y 127.0.0.1 (5173/5174)
const allow = [
  process.env.FRONTEND_ORIGIN  || "http://localhost:5173",
  process.env.FRONTEND_ORIGIN_2|| "http://localhost:5174",
  process.env.FRONTEND_ORIGIN_3|| "http://127.0.0.1:5173",
  process.env.FRONTEND_ORIGIN_4|| "http://127.0.0.1:5174",
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allow.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// habilitar preflight
app.options("*", cors());

// parsers
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// rutas API
app.use("/api/usuarios", usersRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cupones", cuponRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/productos", productosRoutes);

// health check (y prueba de DB)
app.get("/api/ping", async (_req, res) => {
  try {
    const [rows] = await db.query("SELECT NOW() AS server_time");
    res.json({ ok: true, serverTime: rows?.[0]?.server_time || null });
  } catch {
    res.json({ ok: true });
  }
});

// manejador simple de errores CORS (útil en dev)
app.use((err, _req, res, _next) => {
  if (err && err.message === "Not allowed by CORS") {
    return res.status(403).json({ message: "Origen no permitido por CORS" });
  }
  return res.status(500).json({ message: "Error interno" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
