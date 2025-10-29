const db = require("../config/db");

// ===============================
// Agregar producto del catálogo
// ===============================
exports.agregarAlCarrito = async (req, res) => {
  try {
    const { id_usuario, sku, porcion, cantidad, precio_unitario } = req.body;

    if (!id_usuario || !sku || !cantidad || !precio_unitario)
      return res.status(400).json({ message: "Faltan datos obligatorios" });

    // Buscar o crear pedido pendiente
    const [pedido] = await db.query(
      "SELECT * FROM pedido WHERE id_usuario=$1 AND estado='pendiente' LIMIT 1",
      { bind: [id_usuario] }
    );

    let id_pedido;
    if (pedido.length === 0) {
      const [nuevo] = await db.query(
        "INSERT INTO pedido (id_usuario, estado, total, fecha_pedido) VALUES ($1,'pendiente',0,NOW()) RETURNING id_pedido",
        { bind: [id_usuario] }
      );
      id_pedido = nuevo[0].id_pedido;
    } else {
      id_pedido = pedido[0].id_pedido;
    }

    // Insertar producto del catálogo
    await db.query(
      `INSERT INTO detalle_pedido (id_pedido, sku, cantidad, precio_unitario, porcion)
       VALUES ($1,$2,$3,$4,$5)`,
      { bind: [id_pedido, sku, cantidad, precio_unitario, porcion || null] }
    );

    // Actualizar total
    await db.query(
      `UPDATE pedido 
       SET total = (SELECT COALESCE(SUM(cantidad * precio_unitario),0) FROM detalle_pedido WHERE id_pedido=$1)
       WHERE id_pedido=$1`,
      { bind: [id_pedido] }
    );

    res.status(201).json({ message: "Producto agregado al carrito", id_pedido });
  } catch (error) {
    console.error("Error agregarAlCarrito:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ===============================
// Agregar postre personalizado
// ===============================
exports.agregarPersonalizado = async (req, res) => {
  try {
    const { id_usuario, personalizados } = req.body;

    if (!id_usuario || !Array.isArray(personalizados))
      return res.status(400).json({ message: "Datos incompletos" });

    // Buscar o crear pedido pendiente
    const [pedido] = await db.query(
      "SELECT * FROM pedido WHERE id_usuario=$1 AND estado='pendiente' LIMIT 1",
      { bind: [id_usuario] }
    );

    let id_pedido;
    if (pedido.length === 0) {
      const [nuevo] = await db.query(
        "INSERT INTO pedido (id_usuario, estado, total, fecha_pedido) VALUES ($1,'pendiente',0,NOW()) RETURNING id_pedido",
        { bind: [id_usuario] }
      );
      id_pedido = nuevo[0].id_pedido;
    } else {
      id_pedido = pedido[0].id_pedido;
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
        precio_unitario
      } = p;

      // Validar precio
      const precioFinal = parseFloat(precio_unitario || 0);
      if (isNaN(precioFinal) || precioFinal <= 0)
        throw new Error("Precio del postre personalizado inválido");

      // 1️⃣ Crear detalle en detalle_pedido (sin SKU)
      const descripcion = `Postre personalizado (${tipo})` +
        (bizcocho ? ` | Bizcocho: ${bizcocho}` : "") +
        (relleno ? ` | Relleno: ${relleno}` : "") +
        (cobertura ? ` | Cobertura: ${cobertura}` : "") +
        (toppings ? ` | Extras: ${toppings}` : "") +
        (mensaje ? ` | Mensaje: "${mensaje}"` : "") +
        (decoracion ? ` | Decoración: ${decoracion}` : "");

      const [detalle] = await db.query(
        `INSERT INTO detalle_pedido (id_pedido, cantidad, precio_unitario, descripcion)
         VALUES ($1,$2,$3,$4)
         RETURNING id_detalle`,
        { bind: [id_pedido, cantidad || 1, precioFinal, descripcion] }
      );

      const id_detalle = detalle[0].id_detalle;

      // 2️⃣ Crear registro en postre_personalizado
      const [postre] = await db.query(
        `INSERT INTO postre_personalizado 
        (id_detalle, tipo, cantidad, bizcocho, relleno, cobertura, toppings, mensaje, decoracion, precio_unitario)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
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
          ],
        }
      );

      const id_postre = postre[0].id_postre;

      // 3️⃣ Vincular el detalle con el postre personalizado
      await db.query(
        `UPDATE detalle_pedido SET id_postre_personalizado=$1 WHERE id_detalle=$2`,
        { bind: [id_postre, id_detalle] }
      );
    }

    // 4️⃣ Actualizar total del pedido
    await db.query(
      `UPDATE pedido 
       SET total = (SELECT COALESCE(SUM(cantidad * precio_unitario),0) FROM detalle_pedido WHERE id_pedido=$1)
       WHERE id_pedido=$1`,
      { bind: [id_pedido] }
    );

    res.status(201).json({ message: "Postre personalizado agregado correctamente", id_pedido });
  } catch (error) {
    console.error("Error agregarPersonalizado:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ===============================
// Obtener carrito
// ===============================
exports.obtenerCarrito = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const [pedido] = await db.query(
      "SELECT * FROM pedido WHERE id_usuario=$1 AND estado='pendiente' LIMIT 1",
      { bind: [id_usuario] }
    );

    if (pedido.length === 0) return res.json({ carrito: [], personalizados: [] });

    const id_pedido = pedido[0].id_pedido;

    const [detalles] = await db.query(
      `SELECT * FROM detalle_pedido WHERE id_pedido=$1`,
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
// Eliminar del carrito
// ===============================
exports.eliminarDelCarrito = async (req, res) => {
  try {
    const { id_detalle } = req.params;
    await db.query("DELETE FROM detalle_pedido WHERE id_detalle=$1", { bind: [id_detalle] });
    res.json({ message: "Producto eliminado del carrito" });
  } catch (error) {
    console.error("Error eliminarDelCarrito:", error);
    res.status(500).json({ message: "Error interno del servidor" });
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

    if (pedido.length === 0)
      return res.status(400).json({ message: "No hay pedido pendiente" });

    const id_pedido = pedido[0].id_pedido;

    await db.query("UPDATE pedido SET estado='finalizado' WHERE id_pedido=$1", {
      bind: [id_pedido],
    });

    res.status(200).json({ message: "Pedido finalizado con éxito", id_pedido });
  } catch (error) {
    console.error("Error finalizarPedido:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
