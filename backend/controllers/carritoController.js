const Pedido = require("../models/Pedido");
const DetallePedido = require("../models/DetallePedido");
const Producto = require("../models/Producto");

// Ver el carrito
const verCarrito = async (req, res) => {
  try {
    const id_usuario = 1; // ⚠️ después lo tomas de sesión/login

    let pedido = await Pedido.findOne({
      where: { id_usuario, estado: "pendiente" }
    });

    if (!pedido) {
      return res.json({ message: "El carrito está vacío", productos: [], total: 0 });
    }

    const detalles = await DetallePedido.findAll({ where: { id_pedido: pedido.id_pedido } });

    const productos = await Promise.all(
      detalles.map(async (det) => {
        const producto = await Producto.findOne({ where: { sku: det.sku } });
        return {
          id_detalle: det.id_detalle,
          sku: det.sku,
          nombre: producto ? producto.nombre : "Producto eliminado",
          cantidad: det.cantidad,
          precio_unitario: parseFloat(det.precio_unitario),
          subtotal: parseFloat(det.cantidad * det.precio_unitario),
          imagen_url: producto ? producto.imagen_url : null,
        };
      })
    );

    res.json({
      id_pedido: pedido.id_pedido,
      productos,
      total: parseFloat(pedido.total),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el carrito" });
  }
};

module.exports = {
  verCarrito,
};
