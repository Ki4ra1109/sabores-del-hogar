const express = require("express");
const router = express.Router();
const pedidoController = require("../controllers/pedidoController");

// Crear pedido
router.post("/crear", pedidoController.crearPedido);

// Obtener todos los pedidos
router.get("/", pedidoController.obtenerTodosLosPedidos);

// Obtener pedidos de un usuario
router.get("/usuario/:id_usuario", pedidoController.obtenerPedidosUsuario);

// Obtener detalle de un pedido
router.get("/detalle/:id_pedido", pedidoController.obtenerDetallePedido);

module.exports = router;
