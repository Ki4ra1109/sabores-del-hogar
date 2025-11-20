const express = require("express");
const router = express.Router();
const pedidoController = require("../controllers/pedidoController");
// Añadir import de la conexión a la base de datos (Sequelize)
const sequelize = require("../config/db");

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

module.exports = router;
