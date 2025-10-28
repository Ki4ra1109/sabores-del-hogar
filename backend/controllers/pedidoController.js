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

  if (!id_usuario || (!Array.isArray(detalle) && !Array.isArray(personalizados))) {
    return res.status(400).json({ message: "Datos incompletos para crear el pedido." });
  }

  const t = await db.transaction();
  try {
    const [pedidoResult] = await db.query(
      `
      INSERT INTO pedido (id_usuario, estado, total, fecha_pedido, codigo_descuento, fecha_entrega)
      VALUES (?, ?, 0, NOW(), ?, ?)
      RETURNING id_pedido
      `,
      {
        replacements: [
          id_usuario,
          estado || "pendiente",
          codigo_descuento || null,
          fecha_entrega || null,
        ],
        type: db.QueryTypes.INSERT,
        transaction: t,
      }
    );

    const id_pedido = pedidoResult[0].id_pedido;

    if (Array.isArray(detalle) && detalle.length) {
      const items = detalle
        .map(it => ({
          sku: String(it.sku || "").trim(),
          cantidad: Math.max(1, Number(it.cantidad || 1)),
          porcion: it.porcion || null,
        }))
        .filter(it => it.sku);

      if (items.length) {
        const skus = items.map(i => i.sku);
        const placeholders = skus.map(() => "?").join(",");
        const [prodRows] = await db.query(
          `SELECT sku, precio FROM producto WHERE sku IN (${placeholders})`,
          { replacements: skus, transaction: t }
        );

        const mapaPrecio = new Map(prodRows.map(r => [r.sku, Number(r.precio)]));
        const faltantes = skus.filter(s => !mapaPrecio.has(s));
        if (faltantes.length) {
          await t.rollback();
          return res.status(409).json({ message: "SKU inexistente", skus: faltantes });
        }

        for (const it of items) {
          const precio = mapaPrecio.get(it.sku);
          await db.query(
            `
            INSERT INTO detalle_pedido (id_pedido, sku, cantidad, precio_unitario, porcion)
            VALUES (?, ?, ?, ?, ?)
            `,
            {
              replacements: [id_pedido, it.sku, it.cantidad, precio, it.porcion],
              transaction: t,
            }
          );
        }
      }
    }

    if (Array.isArray(personalizados) && personalizados.length) {
      for (const p of personalizados) {
        await db.query(
          `
          INSERT INTO postre_personalizado (id_pedido, tipo, cantidad, bizcocho, relleno, cobertura, toppings)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
          {
            replacements: [
              id_pedido,
              p.tipo || "personalizado",
              Math.max(1, Number(p.cantidad || 1)),
              p.bizcocho || null,
              p.relleno || null,
              p.cobertura || null,
              p.toppings || null,
            ],
            transaction: t,
          }
        );
      }
    }

    const [sumRows] = await db.query(
      `
      SELECT COALESCE(SUM(d.cantidad * d.precio_unitario), 0)::numeric AS total_calc
      FROM detalle_pedido d
      WHERE d.id_pedido = ?
      `,
      { replacements: [id_pedido], transaction: t }
    );
    const total_calc = Number(sumRows[0].total_calc || 0);

    await db.query(
      `UPDATE pedido SET total = ?, estado = COALESCE(?, estado) WHERE id_pedido = ?`,
      { replacements: [total_calc, estado || "pendiente", id_pedido], transaction: t }
    );

    await t.commit();
    res.status(201).json({
      message: "Pedido creado correctamente.",
      id_pedido,
    });
  } catch (error) {
    await t.rollback();
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
    const [detalles] = await db.query(
      `
      SELECT d.*, p.nombre 
      FROM detalle_pedido d 
      JOIN producto p ON p.sku = d.sku
      WHERE d.id_pedido = ?
      `,
      { replacements: [id_pedido] }
    );

    res.json(detalles);
  } catch (error) {
    console.error("❌ Error al obtener detalle del pedido:", error);
    res
      .status(500)
      .json({ message: "Error al obtener los detalles del pedido." });
  }
};

// Obtener TODOS los pedidos (para la sección de gestión de pedidos)
exports.obtenerTodosLosPedidos = async (req, res) => {
  try {
    const [pedido] = await db.query(`
      SELECT 
        p.id_pedido, 
        p.estado, 
        p.total, 
        p.fecha_pedido, 
        u.nombre AS nombre_cliente, 
        u.correo AS correo_cliente
      FROM pedido p
      INNER JOIN usuarios u ON u.id = p.id_usuario
      ORDER BY p.fecha_pedido DESC
    `);

    if (!pedido.length) {
      return res.status(404).json({ message: "No se encontraron pedidos." });
    }

    res.status(200).json(pedido);
  } catch (error) {
    console.error("❌ Error al obtener todos los pedidos:", error);
    res.status(500).json({ message: "Error al obtener la lista de pedidos." });
  }
};

// Obtener pedido por id (para checkout/polling)
exports.obtenerPedidoPorId = async (req, res) => {
  const { id_pedido } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT * FROM pedido WHERE id_pedido = ?`,
      { replacements: [id_pedido] }
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Pedido no encontrado." });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("❌ Error al obtener pedido por ID:", error);
    res.status(500).json({ message: "Error al obtener el pedido." });
  }
};
