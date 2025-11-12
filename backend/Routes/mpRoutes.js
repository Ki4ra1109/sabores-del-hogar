const express = require("express");
const { MercadoPagoConfig, Preference } = require("mercadopago");
const { QueryTypes } = require("sequelize");
const sequelize = require("../config/db");

const router = express.Router();

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});
const preferenceAPI = new Preference(client);

// Sincroniza pago con tablas pago/pedido
async function syncPagoYPedidoDesdePayment(payment) {
  const existe = await sequelize.query(
    "SELECT 1 FROM pago WHERE id_pago_mp = :id LIMIT 1",
    { replacements: { id: String(payment.id) }, type: QueryTypes.SELECT }
  );

  if (!existe.length) {
    await sequelize.query(
      `INSERT INTO pago (id_pago_mp, metodo_pago, monto, fecha_pago, estado_pago, referencia)
       VALUES (:id_pago_mp, :metodo_pago, :monto, NOW(), :estado_pago, :referencia)`,
      {
        replacements: {
          id_pago_mp: String(payment.id),
          metodo_pago: payment.payment_method_id || null,
          monto: payment.transaction_amount || 0,
          estado_pago: payment.status || "unknown",
          referencia: String(payment.external_reference)
        }
      }
    );
  } else {
    await sequelize.query(
      `UPDATE pago
         SET metodo_pago = :metodo_pago,
             monto = :monto,
             estado_pago = :estado_pago,
             fecha_pago = NOW(),
             referencia = :referencia
       WHERE id_pago_mp = :id_pago_mp`,
      {
        replacements: {
          id_pago_mp: String(payment.id),
          metodo_pago: payment.payment_method_id || null,
          monto: payment.transaction_amount || 0,
          estado_pago: payment.status || "unknown",
          referencia: String(payment.external_reference)
        }
      }
    );
  }

  const statusMap = {
    approved: "aprobado",
    pending: "pendiente",
    in_process: "pendiente",
    rejected: "rechazado",
    cancelled: "rechazado",
    charged_back: "cancelado"
  };

  await sequelize.query(
    `UPDATE pedido
       SET estado = :estado_local,
           estado_pago = :estado_mp,
           metodo_pago = COALESCE(:metodo_pago, metodo_pago),
           id_pago_mp = :id_pago_mp,
           fecha_pago = CASE WHEN :estado_mp = 'approved' THEN NOW() ELSE fecha_pago END,
           numero_orden = CASE
                            WHEN :estado_mp = 'approved' AND numero_orden IS NULL
                            THEN 'ORD-'||LPAD(id_pedido::text, 8, '0')
                            ELSE numero_orden
                          END
     WHERE id_pedido = :orderId
       AND estado = 'pendiente'`,
    {
      replacements: {
        estado_local: statusMap[payment.status] || "pendiente",
        estado_mp: payment.status || null,
        metodo_pago: payment.payment_method_id || null,
        id_pago_mp: String(payment.id),
        orderId: Number(payment.external_reference)
      }
    }
  );
}

router.post("/preference", express.json(), async (req, res) => {
  try {
    const { items, payerEmail, orderId } = req.body;
    if (!payerEmail || !orderId) {
      return res.status(400).json({ error: "Faltan datos requeridos" });
    }

    // Resuelve URL base del frontend
    let fe =
      (process.env.FRONTEND_URL && process.env.FRONTEND_URL.trim()) ||
      (req.get("origin") && req.get("origin").trim()) ||
      (req.headers.referer && String(req.headers.referer).trim()) ||
      "";
    if (!/^https?:\/\//i.test(fe)) fe = "http://127.0.0.1:5174";
    const base = fe.replace(/\/+$/, "");
    const isHttps = /^https:\/\//i.test(base);

    // URLs de retorno
    const success = `${base}/pedido-exitoso?orderId=${orderId}`;
    const failure = `${base}/pedido-fallido?orderId=${orderId}`;
    const pending = `${base}/pedido-pendiente?orderId=${orderId}`;

    // Ítems desde BD o respaldo del cliente
    const itemsDb = await sequelize.query(
      `SELECT d.sku, d.cantidad, d.precio_unitario, p.nombre
         FROM detalle_pedido d
         JOIN producto p ON p.sku = d.sku
        WHERE d.id_pedido = :orderId`,
      { replacements: { orderId }, type: QueryTypes.SELECT }
    );

    const cleanItems = Array.isArray(items)
      ? items
          .map(i => ({
            title: String(i.title || "").slice(0, 255),
            quantity: Number(i.quantity || 0),
            unit_price: Number(i.unit_price || 0)
          }))
          .filter(i => i.title && i.quantity > 0 && i.unit_price > 0)
      : [];

    let mpItems =
      itemsDb.length > 0
        ? itemsDb.map(i => ({
            title: (i.nombre || i.sku).slice(0, 255),
            quantity: Number(i.cantidad),
            unit_price: Number(i.precio_unitario),
            currency_id: "CLP"
          }))
        : cleanItems.map(i => ({
            title: i.title,
            quantity: i.quantity,
            unit_price: i.unit_price,
            currency_id: "CLP"
          }));

    // Cobro por total del pedido (incluye descuentos)
    const rowTotal = await sequelize.query(
      "SELECT total FROM pedido WHERE id_pedido = :id LIMIT 1",
      { replacements: { id: Number(orderId) }, type: QueryTypes.SELECT }
    );
    const monto = rowTotal[0] ? Math.round(Number(rowTotal[0].total || 0)) : 0;
    if (monto > 0) {
      mpItems = [
        { title: `Pedido #${orderId}`, quantity: 1, unit_price: monto, currency_id: "CLP" }
      ];
    }

    if (!mpItems.length) return res.status(404).json({ error: "pedido_sin_items" });

    const API_URL = (process.env.API_URL || "http://localhost:5000").trim();
    const puedeWebhook = API_URL.startsWith("https://") && !/localhost|127\.0\.0\.1/i.test(API_URL);

    const preference = {
      items: mpItems,
      payer: { email: String(payerEmail) },
      back_urls: { success, failure, pending },
      external_reference: String(orderId),
      statement_descriptor: "Sabores del Hogar",
      binary_mode: true,
      ...(isHttps ? { auto_return: "approved" } : {}),
      ...(puedeWebhook ? { notification_url: `${API_URL.replace(/\/+$/,"")}/api/mp/webhook` } : {})
    };

    const response = await preferenceAPI.create({
      body: preference,
      requestOptions: { idempotencyKey: String(orderId) }
    });
    if (!response?.id) throw new Error("No se pudo crear la preferencia");

    // Guarda id preferencia
    try {
      await sequelize.query(
        "UPDATE pedido SET mp_preference_id = :prefId WHERE id_pedido = :orderId",
        { replacements: { prefId: response.id || null, orderId }, type: QueryTypes.UPDATE }
      );
    } catch {}

    res.json({
      preferenceId: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point
    });
  } catch (error) {
    const msg = (error?.cause && error.cause[0]?.description) || error?.message || "Error desconocido";
    res.status(400).json({ error: "Error al crear preferencia de pago", details: msg });
  }
});

router.get("/status/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const r = await fetch(`https://api.mercadopago.com/v1/payments/search?external_reference=${encodeURIComponent(orderId)}`, {
      headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`, "Content-Type": "application/json" }
    });
    if (!r.ok) return res.status(r.status).json({ error: "MP search error" });
    const data = await r.json();
    const p = Array.isArray(data.results) ? data.results[0] : null;
    if (!p) return res.json({ status: "not_found" });

    await syncPagoYPedidoDesdePayment(p);
    res.json({
      status: p.status,
      id_pago_mp: p.id,
      metodo_pago: p.payment_method_id,
      monto: p.transaction_amount,
      referencia: p.external_reference
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/webhook", express.json(), async (req, res) => {
  try {
    const topic = req.query.type || req.body.type || req.query.topic;
    const paymentId = req.query["data.id"] || req.query.id || req.body?.data?.id;

    // Traza de eventos
    try {
      await sequelize.query(
        `INSERT INTO webhook_events (provider, event_type, event_id, raw_body, headers, received_at)
         VALUES ('mercadopago', :topic, :eventId, :rawBody::jsonb, :headers::jsonb, NOW())`,
        {
          replacements: {
            topic: topic || null,
            eventId: paymentId || null,
            rawBody: JSON.stringify(req.body || {}),
            headers: JSON.stringify(req.headers || {})
          }
        }
      );
    } catch {}

    if (topic === "payment" && paymentId) {
      const r = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`, "Content-Type": "application/json" }
      });
      if (r.ok) {
        const payment = await r.json();
        await syncPagoYPedidoDesdePayment(payment);
      }
    }

    res.sendStatus(200);
  } catch {
    res.sendStatus(200);
  }
});

module.exports = router;
