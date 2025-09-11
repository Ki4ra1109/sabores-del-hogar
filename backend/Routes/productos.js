// backend/routes/productos.js
const express = require("express");
const router = express.Router();
const Producto = require("../models/Producto");

// GET todos los productos
router.get("/", async (req, res) => {
  try {
    const productos = await Producto.findAll();
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET producto por sku
router.get("/:sku", async (req, res) => {
  try {
    const producto = await Producto.findOne({ where: { sku: req.params.sku } });
    if (!producto) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(producto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
