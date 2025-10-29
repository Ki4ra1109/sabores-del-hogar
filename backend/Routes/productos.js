const express = require("express");
const router = express.Router();
const sequelize = require("../config/db");
const controller = require("../controllers/productoController");


// Todos los productos activos (usado por el catálogo)
router.get("/", async (req, res) => {
  try {
    const [productos] = await sequelize.query(
      "SELECT * FROM producto WHERE estado = 'activo'"
    );
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Producto por SKU
router.get("/:sku", async (req, res) => {
  const { sku } = req.params;
  try {
    const [rows] = await sequelize.query(
      "SELECT * FROM producto WHERE sku = :sku",
      { replacements: { sku } }
    );
    if (!rows.length)
      return res.status(404).json({ message: "Producto no encontrado" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//  NUEVAS RUTAS ADMIN

router.post("/", controller.crearProducto);
router.put("/:sku", controller.actualizarProducto);
router.delete("/:sku", controller.eliminarProducto);

module.exports = router;