const express = require("express");
const router = express.Router();
const carritoController = require("../controllers/carritoController");

router.post("/agregar", carritoController.agregarAlCarrito);
router.post("/personalizado", carritoController.agregarPersonalizado);
router.get("/:id_usuario", carritoController.obtenerCarrito);
router.delete("/eliminar/:id_detalle", carritoController.eliminarDelCarrito);
router.put("/cantidad", carritoController.actualizarCantidad); // ← NUEVO
router.post("/finalizar", carritoController.finalizarPedido);

module.exports = router;