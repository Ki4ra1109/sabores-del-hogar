const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET solo clientes (usuarios normales)
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, nombre, email, telefono FROM usuarios_detalle WHERE rol = 'normal'"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// DELETE: eliminar cliente por correo
router.delete("/correo/:correo", async (req, res) => {
  try {
    const correo = req.params.correo;
    console.log("Correo recibido para eliminar:", correo);

    const query = "DELETE FROM usuarios_detalle WHERE email = $1 RETURNING *";
    const result = await db.query(query, [correo]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (err) {
    console.error("Error al eliminar usuario:", err);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
});


module.exports = router;
