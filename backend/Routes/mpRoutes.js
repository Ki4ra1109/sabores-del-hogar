const express = require("express");
const { MercadoPagoConfig, Preference } = require("mercadopago");
const sequelize = require("../config/db");

const router = express.Router();

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});
const preferenceAPI = new Preference(client);

router.post("/preference", express.json(), async (req, res) => {
  try {
    const { items, payerEmail, orderId } = req.body;

    if (!items?.length || !payerEmail || !orderId) {
      console.error("Datos inválidos:", { items, payerEmail, orderId });
      return res.status(400).json({ error: "Faltan datos requeridos" });
    }

    if (!items.every(item => item.title && item.quantity > 0 && item.unit_price > 0)) {
      console.error("Items inválidos:", items);
      return res.status(400).json({ error: "Datos de items inválidos" });
    }

    const API_URL = (process.env.API_URL || "http://localhost:5000").trim();
    const FRONTEND_URL = (process.env.FRONTEND_URL || "http://127.0.0.1:5174").trim();
    const body = {
      items: items.map(i => ({
        title: i.title,
        quantity: Number(i.quantity),
        unit_price: Number(i.unit_price),
        currency_id: "CLP"
      })),
      payer: { 
        email: payerEmail
      },
      external_reference: String(orderId),
      back_urls: {
        success: `${FRONTEND_URL}/pedido-exitoso`,
        pending: `${FRONTEND_URL}/pedido-pendiente`,
        failure: `${FRONTEND_URL}/pedido-fallido`
      },
       
      statement_descriptor: "Sabores del Hogar",
      notification_url: `${API_URL}/api/mp/webhook`
    };

    console.log("Creando preferencia de pago:", JSON.stringify(body, null, 2));

    const pref = await preferenceAPI.create({ body });
    console.log("Preferencia creada:", JSON.stringify(pref, null, 2));

    if (!pref.id || !pref.init_point) {
      console.error("Preferencia inválida:", JSON.stringify(pref, null, 2));
      return res.status(400).json({ error: "Error al crear preferencia de pago" });
    }

    console.log("Enviando URL de pago:", pref.init_point);
    console.log("Sandbox URL de pago:", pref.sandbox_init_point);
    
     // Logs adicionales para depuración
     console.log("Back URLs (respuesta):", pref.back_urls || pref.redirect_urls || {});
     console.log("API response headers:", pref.api_response && pref.api_response.headers ? pref.api_response.headers : {});

     // Devuelve más detalles al frontend para poder depurar desde el navegador
     res.json({
       preferenceId: pref.id,
       init_point: pref.init_point,
       sandbox_init_point: pref.sandbox_init_point,
       preference: pref
     });
  } catch (e) {
    console.error("mp_pref_create_failed", e);
    res.status(400).json(e);
  }
});

router.post("/webhook", express.json(), async (req, res) => {
  try {
    const topic = req.query.type || req.body.type || req.query.topic;
    const paymentId = req.query["data.id"] || req.query.id || req.body?.data?.id;

    if (topic === "payment" && paymentId) {
      const r = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
      });
      const payment = await r.json();
      
      // Actualizar el estado del pedido en la base de datos
      if (payment.status === 'approved' && payment.external_reference) {
        const pedidoId = payment.external_reference;
        await sequelize.query(
          `UPDATE pedido 
           SET estado = 'aprobado', 
               numero_orden = COALESCE(
                 (SELECT MAX(CAST(SUBSTRING(numero_orden FROM 2) AS INTEGER)) + 1 FROM pedido WHERE numero_orden ~ '^#[0-9]+$'),
                 1000
               )
           WHERE id_pedido = :pedidoId`,
          {
            replacements: { pedidoId },
            type: sequelize.QueryTypes.UPDATE
          }
        );
      }
      
      console.log("Webhook recibido - Detalles del pago:", {
        id: payment.id,
        status: payment.status,
        external_reference: payment.external_reference,
        payment_method: payment.payment_method,
        payment_type: payment.payment_type_id,
        status_detail: payment.status_detail
      });
    }
    res.sendStatus(200);
  } catch (e) {
    console.error("mp_webhook_error", e);
    res.sendStatus(200);
  }
});

module.exports = router;