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
        const result = await db.query("SELECT NOW()");
        res.json({ success: true, serverTime: result.rows[0].now });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
