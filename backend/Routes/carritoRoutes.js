const express = require("express");
const router = express.Router();
const carritoController = require("../controllers/carritoController");

// Productos del catálogo
router.post("/agregar", carritoController.agregarAlCarrito);

// Postres personalizados
router.post("/personalizado", carritoController.agregarPersonalizado);

// Obtener carrito
router.get("/:id_usuario", carritoController.obtenerCarrito);

// Eliminar detalle
router.delete("/eliminar/:id_detalle", carritoController.eliminarDelCarrito);

// Finalizar pedido
router.post("/finalizar", carritoController.finalizarPedido);

module.exports = router;
