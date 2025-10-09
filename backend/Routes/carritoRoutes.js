// Routes/carritoRoutes.js
const express = require("express");
const router = express.Router();
const carritoController = require("../controllers/carritoController");

// Agregar producto al carrito
router.post("/agregar", carritoController.agregarAlCarrito);

// Ver carrito de un cliente
router.get("/:id_cliente", carritoController.obtenerCarrito);

// Eliminar producto del carrito
router.delete("/eliminar/:id_detalle", carritoController.eliminarDelCarrito);

module.exports = router;
