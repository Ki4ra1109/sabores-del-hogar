const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bcrypt = require("bcrypt");
const passport = require("passport");

dotenv.config(); 

require("./config/passport-setup");

// Rutas
const usersRoutes = require("./Routes/usersRoutes");
const authRoutes = require("./Routes/authRoutes");
const cuponRoutes = require("./Routes/cuponRoutes");
const productosRoutes = require("./Routes/productos");
const clientesRoutes = require("./Routes/clientesRoutes");
const carritoRoutes = require("./Routes/carritoRoutes");
const pedidoRoutes = require("./Routes/pedidoRoutes");
const gananciasRoutes = require("./Routes/gananciasRoutes"); // NUEVO

// Modelos
const User = require("./models/User");
require("./models/cupon");

// DB
const db = require("./config/db");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(passport.initialize());

// Rutas existentes
app.use("/api/usuarios", usersRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cupones", cuponRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/carrito", carritoRoutes);
app.use("/api/pedidos", pedidoRoutes);
app.use("/api/ganancias", gananciasRoutes); // NUEVO

// Test DB
app.get("/api/test", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT NOW() AS server_time");
        res.json({ success: true, serverTime: rows[0].server_time });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Registro de usuarios (ya existente)
app.post("/api/auth/register", async (req, res) => {
    try {
        const { nombre, apellido, rut, correo, password, telefono, fechaNacimiento, direccion } = req.body;

        if (!nombre || !apellido || !rut || !correo || !password) {
            return res.status(400).json({ message: "Faltan datos obligatorios" });
        }

        const existingUser = await User.findOne({ where: { correo } });
        if (existingUser) {
            return res.status(400).json({ message: "Correo ya registrado" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            nombre,
            apellido,
            rut,
            correo,
            password: hashedPassword,
            telefono,
            fecha_nacimiento: fechaNacimiento,
            direccion
        });

        return res.status(201).json({ message: "Usuario registrado", user: { id: newUser.id, nombre, correo } });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
});

// Puerto
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});