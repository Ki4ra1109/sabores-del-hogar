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

// ✅ Producto por SKU (usa el controlador con variantes)
router.get("/:sku", controller.obtenerProductoPorSku);

//  NUEVAS RUTAS ADMIN
router.post("/", controller.crearProducto);
router.put("/:sku", controller.actualizarProducto);
router.delete("/:sku", controller.eliminarProducto);

module.exports = router;
