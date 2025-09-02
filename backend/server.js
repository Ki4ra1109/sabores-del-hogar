// server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./Routes/authRoutes");
const db = require("./config/db");

dotenv.config();
const app = express();

// Middleware para manejar JSON
app.use(express.json());

app.use(cors());

// Rutas principales
app.use("/api/auth", authRoutes);

// Puerto
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
})

app.get("/api/test", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT NOW() AS server_time");
        res.json({ success: true, serverTime: rows[0].server_time });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post("/api/auth/register", async (req, res) => {
    try {
        const { nombre, apellido, rut, correo, password, telefono, fechaNacimiento, direccion } = req.body;

        // Validar campos mínimos
        if (!nombre || !apellido || !rut || !correo || !password) {
            return res.status(400).json({ message: "Faltan datos obligatorios" });
        }

        // Verificar si el correo ya existe
        const existingUser = await User.findOne({ where: { correo } });
        if (existingUser) {
            return res.status(400).json({ message: "Correo ya registrado" });
        }

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear usuario
        const newUser = await User.create({
            nombre,
            apellido,
            rut,
            correo,
            password: hashedPassword,
            telefono,
            fechaNacimiento,
            direccion
        });

        return res.status(201).json({ message: "Usuario registrado", user: { id: newUser.id, nombre, correo } });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
});
