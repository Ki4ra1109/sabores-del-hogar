// controllers/carritoController.js
const db = require("../config/db");

// Crear un nuevo carrito (pedido) o agregar producto a un carrito existente
exports.agregarAlCarrito = async (req, res) => {
  try {
    const { id_usuario, sku, porcion, cantidad } = req.body;

    if (!id_usuario || !sku || !porcion || !cantidad) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    // precio dinámico = porciones * 1000 + 7000
    const precio_unitario = porcion * 1000 + 7000;

    // 1. Buscar pedido pendiente del usuario
    let [pedido] = await db.query(
      "SELECT * FROM pedido WHERE id_usuario = ? AND estado = 'pendiente' LIMIT 1",
      [id_usuario]
    );

    let id_pedido;
    if (pedido.length === 0) {
      const [result] = await db.query(
        "INSERT INTO pedido (id_usuario, estado, total, fecha_pedido) VALUES (?, 'pendiente', 0, NOW())",
        [id_usuario]
      );
      id_pedido = result.insertId;
    } else {
      id_pedido = pedido[0].id_pedido;
    }

    // 2. Insertar detalle del pedido
    await db.query(
      "INSERT INTO detalle_pedido (id_pedido, sku, cantidad, precio_unitario, porcion) VALUES (?, ?, ?, ?, ?)",
      [id_pedido, sku, cantidad, precio_unitario, porcion]
    );

    // 3. Actualizar el total del pedido
    await db.query(
      "UPDATE pedido SET total = (SELECT SUM(cantidad * precio_unitario) FROM detalle_pedido WHERE id_pedido = ?) WHERE id_pedido = ?",
      [id_pedido, id_pedido]
    );

    res.status(201).json({ message: "Producto agregado al carrito", id_pedido });
  } catch (error) {
    console.error("Error al agregar al carrito:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Obtener el carrito del usuario
exports.obtenerCarrito = async (req, res) => {
  try {
    const { id_usuario } = req.params;

    const [pedido] = await db.query(
      "SELECT * FROM pedido WHERE id_usuario = ? AND estado = 'pendiente' LIMIT 1",
      [id_usuario]
    );

    if (pedido.length === 0) {
      return res.json({ carrito: [] });
    }

    const id_pedido = pedido[0].id_pedido;

    const [detalles] = await db.query(
      `SELECT d.id_detalle, d.sku, p.nombre, d.porcion, d.cantidad, d.precio_unitario
       FROM detalle_pedido d
       JOIN producto p ON d.sku = p.sku
       WHERE d.id_pedido = ?`,
      [id_pedido]
    );

    res.json({ id_pedido, carrito: detalles });
  } catch (error) {
    console.error("Error al obtener carrito:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Eliminar un producto del carrito
exports.eliminarDelCarrito = async (req, res) => {
  try {
    const { id_detalle } = req.params;

    await db.query("DELETE FROM detalle_pedido WHERE id_detalle = ?", [id_detalle]);

    res.json({ message: "Producto eliminado del carrito" });
  } catch (error) {
    console.error("Error al eliminar del carrito:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
