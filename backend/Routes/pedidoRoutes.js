const express = require("express");
const router = express.Router(); // <-- esta línea debe ir primero
const pedidoController = require("../controllers/pedidoController");

// ✅ Crear un nuevo pedido (con productos del catálogo y personalizados)
router.post("/crear", (req, res) => pedidoController.crearPedido(req, res));

// ✅ Obtener todos los pedidos (vista administrativa, incluye nombre del cliente)
router.get("/", (req, res) => pedidoController.obtenerTodosLosPedidos(req, res));

// ✅ Obtener todos los pedidos de un usuario específico
router.get("/usuario/:id_usuario", (req, res) =>
  pedidoController.obtenerPedidosUsuario(req, res)
);

// ✅ Obtener el detalle completo de un pedido (productos + personalizados)
router.get("/detalle/:id_pedido", (req, res) =>
  pedidoController.obtenerDetallePedido(req, res)
);

// Obtener pedido por id (para checkout/polling)
router.get("/:id_pedido", pedidoController.obtenerPedidoPorId);

// Obtener pedidos de un usuario con detalle
router.get("/usuario/:id_usuario/con-detalle", (req, res) =>
  pedidoController.obtenerPedidosUsuarioConDetalle(req, res)
);

module.exports = router;
