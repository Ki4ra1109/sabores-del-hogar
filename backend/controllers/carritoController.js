// carritoController.js
const db = require("../config/db");

// Helper: recalcula total del pedido y actualiza la fila de pedido
async function recalcularTotal(id_pedido, transaction = null) {
  const [sumRows] = await db.query(
    `SELECT COALESCE(SUM(cantidad * precio_unitario), 0)::numeric AS total_calc
     FROM detalle_pedido
     WHERE id_pedido = $1`,
    { bind: [id_pedido], transaction }
  );
  const total_calc = Number(sumRows[0].total_calc || 0);
  await db.query(
    `UPDATE pedido SET total = $1 WHERE id_pedido = $2`,
    { bind: [total_calc, id_pedido], transaction }
  );
  return total_calc;
}

// ===============================
// Agregar producto del catálogo (ahora: evita duplicados; suma cantidades)
// ===============================
exports.agregarAlCarrito = async (req, res) => {
  const t = await db.transaction();
  try {
    const { id_usuario, sku, porcion, cantidad, precio_unitario } = req.body;

    if (!id_usuario || !sku || !cantidad || !precio_unitario)
      return res.status(400).json({ message: "Faltan datos obligatorios" });

    // Buscar o crear pedido pendiente
    const [pedidoRows] = await db.query(
      "SELECT * FROM pedido WHERE id_usuario=$1 AND estado='pendiente' LIMIT 1",
      { bind: [id_usuario], transaction: t }
    );

    let id_pedido;
    if (pedidoRows.length === 0) {
      const [nuevo] = await db.query(
        "INSERT INTO pedido (id_usuario, estado, total, fecha_pedido) VALUES ($1,'pendiente',0,NOW()) RETURNING id_pedido",
        { bind: [id_usuario], transaction: t }
      );
      id_pedido = nuevo[0].id_pedido;
    } else {
      id_pedido = pedidoRows[0].id_pedido;
    }

    // Si ya existe un detalle con ese sku + porcion en este pedido, sumar cantidad
    const [exist] = await db.query(
      `SELECT id_detalle, cantidad
       FROM detalle_pedido
       WHERE id_pedido=$1 AND sku=$2 AND ( (porcion IS NULL AND $3 IS NULL) OR porcion=$3 ) 
       LIMIT 1`,
      { bind: [id_pedido, sku, porcion], transaction: t }
    );

    if (exist.length) {
      const id_detalle = exist[0].id_detalle;
      const nuevaCantidad = Number(exist[0].cantidad || 0) + Number(cantidad || 0);
      await db.query(
        `UPDATE detalle_pedido SET cantidad=$1, precio_unitario=$2 WHERE id_detalle=$3`,
        { bind: [nuevaCantidad, precio_unitario, id_detalle], transaction: t }
      );
    } else {
      await db.query(
        `INSERT INTO detalle_pedido (id_pedido, sku, cantidad, precio_unitario, porcion)
         VALUES ($1,$2,$3,$4,$5)`,
        { bind: [id_pedido, sku, cantidad, precio_unitario, porcion || null], transaction: t }
      );
    }

    // recalcular total
    await recalcularTotal(id_pedido, t);

    await t.commit();

    // devolver carrito actualizado
    const [detalles] = await db.query(
      `SELECT d.id_detalle, d.sku, d.cantidad, d.precio_unitario, d.porcion, d.descripcion, p.nombre AS nombre_producto, p.imagen_url
       FROM detalle_pedido d
       LEFT JOIN producto p ON p.sku = d.sku
       WHERE d.id_pedido = $1`,
      { bind: [id_pedido] }
    );

    return res.status(201).json({ message: "Producto agregado al carrito", id_pedido, carrito: detalles });
  } catch (error) {
    await t.rollback();
    console.error("Error agregarAlCarrito:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ===============================
// Agregar postre personalizado
// ===============================
exports.agregarPersonalizado = async (req, res) => {
  const t = await db.transaction();
  try {
    const { id_usuario, personalizados } = req.body;

    if (!id_usuario || !Array.isArray(personalizados))
      return res.status(400).json({ message: "Datos incompletos" });

    // Buscar o crear pedido pendiente
    const [pedidoRows] = await db.query(
      "SELECT * FROM pedido WHERE id_usuario=$1 AND estado='pendiente' LIMIT 1",
      { bind: [id_usuario], transaction: t }
    );

    let id_pedido;
    if (pedidoRows.length === 0) {
      const [nuevo] = await db.query(
        "INSERT INTO pedido (id_usuario, estado, total, fecha_pedido) VALUES ($1,'pendiente',0,NOW()) RETURNING id_pedido",
        { bind: [id_usuario], transaction: t }
      );
      id_pedido = nuevo[0].id_pedido;
    } else {
      id_pedido = pedidoRows[0].id_pedido;
    }

    for (const p of personalizados) {
      const {
        tipo,
        cantidad,
        bizcocho,
        relleno,
        cobertura,
        toppings,
        mensaje,
        decoracion,
        precio_unitario,
      } = p;

      const precioFinal = parseFloat(precio_unitario || 0);
      if (isNaN(precioFinal) || precioFinal <= 0)
        throw new Error("Precio del postre personalizado inválido");

      const descripcion =
        `Postre personalizado (${tipo})` +
        (bizcocho ? ` | Bizcocho: ${bizcocho}` : "") +
        (relleno ? ` | Relleno: ${relleno}` : "") +
        (cobertura ? ` | Cobertura: ${cobertura}` : "") +
        (toppings ? ` | Extras: ${toppings}` : "") +
        (mensaje ? ` | Mensaje: "${mensaje}"` : "") +
        (decoracion ? ` | Decoración: ${decoracion}` : "");

      // Insertar en detalle_pedido
      const [detalle] = await db.query(
        `INSERT INTO detalle_pedido (id_pedido, cantidad, precio_unitario, descripcion)
         VALUES ($1,$2,$3,$4)
         RETURNING id_detalle`,
        { bind: [id_pedido, cantidad || 1, precioFinal, descripcion], transaction: t }
      );

      const id_detalle = detalle[0].id_detalle;

      // Insertar info modelo postre personalizado
      const [postre] = await db.query(
        `INSERT INTO postre_personalizado 
        (id_detalle, tipo, cantidad, bizcocho, relleno, cobertura, toppings, mensaje, decoracion, precio_unitario, id_pedido)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        RETURNING id_postre`,
        {
          bind: [
            id_detalle,
            tipo,
            cantidad || 1,
            bizcocho || null,
            relleno || null,
            cobertura || null,
            toppings || null,
            mensaje || null,
            decoracion || null,
            precioFinal,
            id_pedido
          ],
          transaction: t,
        }
      );

      const id_postre = postre[0].id_postre;

      // Vincular el postre al detalle
      await db.query(
        `UPDATE detalle_pedido SET id_postre_personalizado=$1 WHERE id_detalle=$2`,
        { bind: [id_postre, id_detalle], transaction: t }
      );
    }

    // Actualizar total
    await recalcularTotal(id_pedido, t);

    await t.commit();

    // devolver carrito actualizado
    const [detalles] = await db.query(
      `SELECT d.id_detalle, d.sku, d.cantidad, d.precio_unitario, d.porcion, d.descripcion
       FROM detalle_pedido d
       WHERE d.id_pedido = $1`,
      { bind: [id_pedido] }
    );

    return res.status(201).json({ message: "Postre personalizado agregado correctamente", id_pedido, carrito: detalles });
  } catch (error) {
    await t.rollback();
    console.error("Error agregarPersonalizado:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ===============================
// Obtener carrito (incluye id_detalle y datos basicos del producto)
// ===============================
exports.obtenerCarrito = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const [pedidoRows] = await db.query(
      "SELECT * FROM pedido WHERE id_usuario=$1 AND estado='pendiente' LIMIT 1",
      { bind: [id_usuario] }
    );

    if (pedidoRows.length === 0) return res.json({ carrito: [], personalizados: [] });

    const id_pedido = pedidoRows[0].id_pedido;

    const [detalles] = await db.query(
      `SELECT d.id_detalle, d.sku, d.cantidad, d.precio_unitario, d.porcion, d.descripcion, d.id_postre_personalizado,
              p.nombre AS nombre_producto, p.imagen_url
       FROM detalle_pedido d
       LEFT JOIN producto p ON p.sku = d.sku
       WHERE d.id_pedido=$1
       ORDER BY d.id_detalle ASC`,
      { bind: [id_pedido] }
    );

    const [personalizados] = await db.query(
      `SELECT * FROM postre_personalizado WHERE id_detalle IN 
       (SELECT id_detalle FROM detalle_pedido WHERE id_pedido=$1)`,
      { bind: [id_pedido] }
    );

    res.json({ id_pedido, carrito: detalles, personalizados });
  } catch (error) {
    console.error("Error obtenerCarrito:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ===============================
// Eliminar ítem del carrito (por id_detalle) - elimina postre_personalizado asociado si existe
// ===============================
exports.eliminarDelCarrito = async (req, res) => {
  const t = await db.transaction();
  try {
    const { id_detalle } = req.params;
    if (!id_detalle) return res.status(400).json({ message: "Falta id_detalle" });

    // obtener id_pedido para devolver carrito actualizado luego
    const [rows] = await db.query(
      "SELECT id_pedido FROM detalle_pedido WHERE id_detalle=$1 LIMIT 1",
      { bind: [id_detalle], transaction: t }
    );
    if (!rows.length) {
      await t.rollback();
      return res.status(404).json({ message: "Detalle no encontrado" });
    }
    const id_pedido = rows[0].id_pedido;

    // eliminar posible postre personalizado vinculado
    await db.query(
      `DELETE FROM postre_personalizado WHERE id_detalle=$1`,
      { bind: [id_detalle], transaction: t }
    );

    // eliminar detalle
    await db.query(
      `DELETE FROM detalle_pedido WHERE id_detalle=$1`,
      { bind: [id_detalle], transaction: t }
    );

    // recalcular total y commit
    await recalcularTotal(id_pedido, t);

    await t.commit();

    // devolver carrito actualizado
    const [detalles] = await db.query(
      `SELECT d.id_detalle, d.sku, d.cantidad, d.precio_unitario, d.porcion, d.descripcion, p.nombre AS nombre_producto, p.imagen_url
       FROM detalle_pedido d
       LEFT JOIN producto p ON p.sku = d.sku
       WHERE d.id_pedido = $1`,
      { bind: [id_pedido] }
    );

    return res.json({ message: "Producto eliminado del carrito", id_pedido, carrito: detalles });
  } catch (error) {
    await t.rollback();
    console.error("Error eliminarDelCarrito:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ===============================
// Actualizar cantidad del ítem (si cantidad < 1 se elimina). Devuelve carrito actualizado.
// ===============================
exports.actualizarCantidad = async (req, res) => {
  const t = await db.transaction();
  try {
    const { id_detalle, cantidad } = req.body;
    const qty = Number(cantidad || 0);

    if (!id_detalle || isNaN(qty) || qty < 0) {
      await t.rollback();
      return res.status(400).json({ message: "Datos inválidos" });
    }

    // obtener id_pedido
    const [rows] = await db.query(
      "SELECT id_pedido FROM detalle_pedido WHERE id_detalle=$1 LIMIT 1",
      { bind: [id_detalle], transaction: t }
    );
    if (!rows.length) {
      await t.rollback();
      return res.status(404).json({ message: "Detalle no encontrado" });
    }
    const id_pedido = rows[0].id_pedido;

    if (qty < 1) {
      // eliminar
      await db.query("DELETE FROM postre_personalizado WHERE id_detalle=$1", { bind: [id_detalle], transaction: t });
      await db.query("DELETE FROM detalle_pedido WHERE id_detalle=$1", { bind: [id_detalle], transaction: t });
    } else {
      await db.query(
        `UPDATE detalle_pedido SET cantidad=$1 WHERE id_detalle=$2`,
        { bind: [qty, id_detalle], transaction: t }
      );
    }

    await recalcularTotal(id_pedido, t);

    await t.commit();

    // devolver carrito actualizado
    const [detalles] = await db.query(
      `SELECT d.id_detalle, d.sku, d.cantidad, d.precio_unitario, d.porcion, d.descripcion, p.nombre AS nombre_producto, p.imagen_url
       FROM detalle_pedido d
       LEFT JOIN producto p ON p.sku = d.sku
       WHERE d.id_pedido = $1`,
      { bind: [id_pedido] }
    );

    return res.json({ message: "Cantidad actualizada", id_pedido, carrito: detalles });
  } catch (error) {
    await t.rollback();
    console.error("Error actualizarCantidad:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ===============================
// Finalizar pedido
// ===============================
exports.finalizarPedido = async (req, res) => {
  try {
    const { id_usuario } = req.body;

    if (!id_usuario) return res.status(400).json({ message: "Falta id_usuario" });

    const [pedido] = await db.query(
      "SELECT * FROM pedido WHERE id_usuario=$1 AND estado='pendiente' LIMIT 1",
      { bind: [id_usuario] }
    );

    if (pedido.length === 0) return res.status(400).json({ message: "No hay pedido pendiente" });

    const id_pedido = pedido[0].id_pedido;

    await db.query("UPDATE pedido SET estado='finalizado' WHERE id_pedido=$1", { bind: [id_pedido] });

    return res.status(200).json({ message: "Pedido finalizado con éxito", id_pedido });
  } catch (error) {
    console.error("Error finalizarPedido:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};
