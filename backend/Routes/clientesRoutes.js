const express = require("express");
const router = express.Router();
const { QueryTypes } = require("sequelize");
const sequelize = require("../config/db");

// ✅ Obtener todos los clientes con rol 'normal'
router.get("/", async (_req, res) => {
  try {
    const rows = await sequelize.query(
      "SELECT id, nombre, correo, telefono FROM usuarios WHERE rol = 'usuario';",
      { type: QueryTypes.SELECT }
    );
    res.json(rows);
  } catch (error) {
    console.error("❌ Error al obtener clientes:", error);
    res.status(500).json({ error: "Error al obtener clientes" });
  }
});

// ✅ Eliminar cliente por correo
router.delete("/correo/:correo", async (req, res) => {
  const { correo } = req.params;
  console.log("🗑️ Correo recibido para eliminar:", correo);

  try {
    const result = await sequelize.query(
      "DELETE FROM usuarios WHERE correo = :correo RETURNING *;",
      {
        replacements: { correo },
        type: QueryTypes.DELETE,
      }
    );

    if (!result || result.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar usuario:", error);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
});

module.exports = router;
