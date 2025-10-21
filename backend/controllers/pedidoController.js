const db = require("../config/db");

// Crear un pedido y sus detalles (productos del catálogo + personalizados)
exports.crearPedido = async (req, res) => {
  const {
    id_usuario,
    total,
    estado,
    codigo_descuento,
    fecha_entrega,
    detalle,
    personalizados,
  } = req.body;

  try {
    if (
      !id_usuario ||
      (!Array.isArray(detalle) && !Array.isArray(personalizados))
    ) {
      return res
        .status(400)
        .json({ message: "Datos incompletos para crear el pedido." });
    }

    // 1️⃣ Crear el pedido principal
    const [pedidoResult] = await db.query(
      `
      INSERT INTO pedido (id_usuario, estado, total, fecha_pedido, codigo_descuento, fecha_entrega)
      VALUES (?, ?, ?, NOW(), ?, ?)
      RETURNING id_pedido
      `,
      {
        replacements: [
          id_usuario,
          estado || "pendiente",
          total || 0,
          codigo_descuento || null,
          fecha_entrega || null,
        ],
        type: db.QueryTypes.INSERT,
      }
    );

    const id_pedido = pedidoResult[0].id_pedido;

    // 2️⃣ Insertar los productos del catálogo
    if (Array.isArray(detalle)) {
      for (const item of detalle) {
        const { sku, cantidad, precio_unitario, porcion } = item;
        if (!sku || !cantidad || !precio_unitario) continue;

        await db.query(
          `
          INSERT INTO detalle_pedido (id_pedido, sku, cantidad, precio_unitario, porcion)
          VALUES (?, ?, ?, ?, ?)
          `,
          {
            replacements: [
              id_pedido,
              sku,
              cantidad,
              precio_unitario,
              porcion || null,
            ],
          }
        );
      }
    }

    // 3️⃣ Insertar los postres personalizados (arma tu postre)
    if (Array.isArray(personalizados)) {
      for (const p of personalizados) {
        const {
          tipo,
          cantidad,
          bizcocho,
          relleno,
          cobertura,
          toppings,
          mensaje, // 👈 nuevo campo agregado
        } = p;

        await db.query(
          `
          INSERT INTO postre_personalizado (id_pedido, tipo, cantidad, bizcocho, relleno, cobertura, toppings, mensaje)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `,
          {
            replacements: [
              id_pedido,
              tipo,
              cantidad,
              bizcocho || null,
              relleno || null,
              cobertura || null,
              toppings || null,
              mensaje || null, // 👈 se guarda el mensaje si existe
            ],
          }
        );
      }
    }

    // 4️⃣ Recalcular total del pedido (solo productos del catálogo)
    await db.query(
      `
      UPDATE pedido 
      SET total = (
        SELECT COALESCE(SUM(cantidad * precio_unitario), 0)
        FROM detalle_pedido
        WHERE id_pedido = ?
      )
      WHERE id_pedido = ?
      `,
      { replacements: [id_pedido, id_pedido] }
    );

    res.status(201).json({
      message: "Pedido creado correctamente.",
      id_pedido,
    });
  } catch (error) {
    console.error("❌ Error al crear pedido:", error);
    res
      .status(500)
      .json({ message: "Error interno al registrar el pedido.", error });
  }
};

// Obtener pedidos de un usuario
exports.obtenerPedidosUsuario = async (req, res) => {
  const { id_usuario } = req.params;

  try {
    const [pedidos] = await db.query(
      `SELECT * FROM pedido WHERE id_usuario = ? ORDER BY fecha_pedido DESC`,
      { replacements: [id_usuario] }
    );

    res.json(pedidos);
  } catch (error) {
    console.error("❌ Error al obtener pedidos:", error);
    res.status(500).json({ message: "Error al obtener los pedidos." });
  }
};

// Obtener detalle de un pedido específico
exports.obtenerDetallePedido = async (req, res) => {
  const { id_pedido } = req.params;

  try {
    // 1️⃣ Productos del catálogo
    const [detalles] = await db.query(
      `
      SELECT d.*, p.nombre 
      FROM detalle_pedido d 
      JOIN producto p ON p.sku = d.sku
      WHERE d.id_pedido = ?
      `,
      { replacements: [id_pedido] }
    );

    // 2️⃣ Postres personalizados
    const [personalizados] = await db.query(
      `
      SELECT *
      FROM postre_personalizado
      WHERE id_pedido = ?
      `,
      { replacements: [id_pedido] }
    );

    res.json({
      productos: detalles,
      personalizados: personalizados,
    });
  } catch (error) {
    console.error("❌ Error al obtener detalle del pedido:", error);
    res
      .status(500)
      .json({ message: "Error al obtener los detalles del pedido." });
  }
};