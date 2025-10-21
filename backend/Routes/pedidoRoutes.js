const express = require("express");
const router = express.Router();
const pedidoController = require("../controllers/pedidoController");

// ✅ Crear un nuevo pedido (con productos del catálogo y personalizados)
router.post("/crear", (req, res) => pedidoController.crearPedido(req, res));

// ✅ Obtener todos los pedidos (solo si necesitas una vista administrativa)
router.get("/", async (req, res) => {
  try {
    const [pedidos] = await pedidoController.db.query("SELECT * FROM pedido");
    res.json(pedidos);
  } catch (error) {
    console.error("❌ Error al obtener todos los pedidos:", error);
    res.status(500).json({ message: "Error al obtener los pedidos." });
  }
});

// ✅ Obtener todos los pedidos de un usuario específico
router.get("/usuario/:id_usuario", (req, res) =>
  pedidoController.obtenerPedidosUsuario(req, res)
);

// ✅ Obtener el detalle completo de un pedido (productos + personalizados)
router.get("/detalle/:id_pedido", (req, res) =>
  pedidoController.obtenerDetallePedido(req, res)
);

module.exports = router;
