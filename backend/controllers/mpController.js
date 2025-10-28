// controllers/mp.controller.js
const { MercadoPagoConfig, Preference } = require("mercadopago");
const { QueryTypes } = require("sequelize");
const sequelize = require("../config/db");

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});
const preferenceAPI = new Preference(client);

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
    cancelled: "rechazado"
  };

  await sequelize.query(
    `UPDATE pedido
       SET estado = :estado_local,
           estado_pago = :estado_mp,
           metodo_pago = COALESCE(:metodo_pago, metodo_pago),
           id_pago = :id_pago_mp,
           fecha_pago = NOW(),
           numero_orden = COALESCE(
             numero_orden,
             CONCAT('#', (
               SELECT COALESCE(MAX(CAST(SUBSTRING(numero_orden FROM 2) AS INTEGER)), 999) + 1
               FROM pedido
               WHERE numero_orden ~ '^#[0-9]+$'
             ))
           )
     WHERE id_pedido = :orderId`,
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

async function createPreference(req, res) {
  try {
    const { items, payerEmail, orderId } = req.body;

    const cleanItems = Array.isArray(items)
      ? items
          .map(i => ({
            title: String(i.title || "").slice(0, 255),
            quantity: Number(i.quantity || 0),
            unit_price: Number(i.unit_price || 0)
          }))
          .filter(i => i.title && i.quantity > 0 && i.unit_price > 0)
      : [];

    if (!cleanItems.length || !payerEmail || !orderId) {
      return res.status(400).json({ error: "Faltan datos requeridos" });
    }

    const API_URL = (process.env.API_URL || "http://localhost:5000").trim();
    const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:5174").trim();
    const puedeWebhook = API_URL.startsWith("https://") && !/localhost|127\.0\.0\.1/.test(API_URL);

    const success = `${FRONTEND_URL.replace(/\/+$/,"")}/pedido-exitoso?orderId=${orderId}`;
    const failure = `${FRONTEND_URL.replace(/\/+$/,"")}/pedido-fallido?orderId=${orderId}`;
    const pending = `${FRONTEND_URL.replace(/\/+$/,"")}/pedido-pendiente?orderId=${orderId}`;

    const preference = {
      items: cleanItems.map(i => ({
        title: i.title,
        quantity: i.quantity,
        unit_price: i.unit_price,
        currency_id: "CLP"
      })),
      payer: { email: String(payerEmail) },
      back_urls: { success, failure, pending },
      external_reference: String(orderId),
      statement_descriptor: "Sabores del Hogar",
      binary_mode: true,
      ...(puedeWebhook ? { notification_url: `${API_URL}/api/mp/webhook` } : {})
    };

    const response = await preferenceAPI.create({ body: preference });
    if (!response?.id) throw new Error("No se pudo crear la preferencia");

    res.json({
      preferenceId: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point
    });
  } catch (error) {
    const msg = (error?.cause && error.cause[0]?.description) || error?.message || "Error desconocido";
    res.status(400).json({ error: "Error al crear preferencia de pago", details: msg });
  }
}

async function getStatus(req, res) {
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
}

async function webhook(req, res) {
  try {
    const topic = req.query.type || req.body.type || req.query.topic;
    const paymentId = req.query["data.id"] || req.query.id || req.body?.data?.id;

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
}

module.exports = {
  createPreference,
  getStatus,
  webhook
};
