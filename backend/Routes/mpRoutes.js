const express = require("express");
const { MercadoPagoConfig, Preference } = require("mercadopago");

const router = express.Router();

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});
const preferenceAPI = new Preference(client);

router.post("/preference", express.json(), async (req, res) => {
  try {
    const { items, payerEmail, orderId } = req.body;

    const API_URL = (process.env.API_URL || "http://localhost:5000").trim();

    const body = {
      items: items.map(i => ({
        title: i.title,
        quantity: Number(i.quantity),
        unit_price: Number(i.unit_price),
        currency_id: "CLP"
      })),
      payer: { email: payerEmail },
      external_reference: String(orderId),
      back_urls: {
        success: "https://example.org/success",
        pending: "https://example.org/pending",
        failure: "https://example.org/failure"
      },
      auto_return: "approved",
      notification_url: `${API_URL}/api/mp/webhook`
    };

    console.log("back_urls=", body.back_urls);

    const pref = await preferenceAPI.create({ body });

    res.json({ preferenceId: pref.id, init_point: pref.init_point });
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
      console.log("MP payment:", payment.id, payment.status, payment.external_reference);
    }
    res.sendStatus(200);
  } catch (e) {
    console.error("mp_webhook_error", e);
    res.sendStatus(200);
  }
});

module.exports = router;