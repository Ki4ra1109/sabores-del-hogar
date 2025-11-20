const { QueryTypes } = require("sequelize");
const nodemailer = require("nodemailer");
const sequelize = require("../config/db");

function htmlEscape(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function nl2br(str = "") {
  return htmlEscape(str).replace(/\r?\n/g, "<br>");
}

function buildReplyHtml({ nombre, replyMessage, originalMessage, originalSubject }) {
  const safeNombre = nombre || "cliente";
  const safeReply = nl2br(replyMessage);
  const safeOriginal = nl2br(originalMessage || "");
  const safeSubject = htmlEscape(originalSubject || "Consulta desde Sabores del Hogar");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charSet="UTF-8" />
  <title>Respuesta - Sabores del Hogar</title>
</head>
<body style="margin:0;padding:0;background:#f6f4f1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f4f1;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 20px rgba(0,0,0,0.06);">
          <tr>
            <td style="background:#572420;padding:20px 32px;text-align:center;">
              <h1 style="margin:0;font-size:22px;font-weight:600;color:#ffffff;">Sabores del Hogar</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 8px 32px;">
              <p style="margin:0 0 12px 0;font-size:15px;color:#444;">
                Hola ${htmlEscape(safeNombre)},
              </p>
              <p style="margin:0 0 16px 0;font-size:14px;color:#555;line-height:1.6;">
                Hemos recibido tu mensaje sobre <strong>${safeSubject}</strong>. Te compartimos nuestra respuesta:
              </p>
              <div style="margin:0 0 18px 0;padding:14px 16px;border-radius:10px;background:#fdf3ea;border:1px solid #f3e0d2;font-size:14px;color:#3f312a;line-height:1.6;">
                ${safeReply}
              </div>
              ${
                originalMessage
                  ? `<p style="margin:0 0 6px 0;font-size:13px;color:#888;">Mensaje que nos enviaste:</p>
                     <div style="margin:0 0 4px 0;padding:10px 12px;border-radius:8px;background:#fafafa;border:1px solid #e5e7eb;font-size:13px;color:#555;line-height:1.5;">
                       ${safeOriginal}
                     </div>`
                  : ""
              }
            </td>
          </tr>
          <tr>
            <td style="padding:12px 32px 24px 32px;">
              <p style="margin:0 0 6px 0;font-size:13px;color:#666;line-height:1.5;">
                Si tienes más dudas o necesitas hacer cambios en tu pedido, puedes responder a este correo.
              </p>
              <p style="margin:12px 0 0 0;font-size:11px;color:#999;text-align:center;">
                Este correo se generó automáticamente para responder tu consulta en Sabores del Hogar.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#faf7f4;padding:10px 32px 14px 32px;text-align:center;">
              <span style="font-size:11px;color:#b08968;">Sabores del Hogar</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: String(process.env.SMTP_SECURE) === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function crearMensaje(req, res) {
  try {
    const { nombre, correo, telefono, asunto, mensaje } = req.body;

    if (!nombre || !correo || !mensaje) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    await sequelize.query(
      `INSERT INTO solicitudes_contacto (nombre, correo, telefono, asunto, mensaje, estado)
       VALUES (:nombre, :correo, :telefono, :asunto, :mensaje, :estado)`,
      {
        replacements: {
          nombre,
          correo,
          telefono: telefono || null,
          asunto: asunto || "",
          mensaje,
          estado: "pendiente",
        },
        type: QueryTypes.INSERT,
      }
    );

    res.status(201).json({ ok: true });
  } catch (err) {
    console.error("Error al guardar mensaje de contacto:", err);
    res.status(500).json({ error: "Error al guardar el mensaje" });
  }
}

async function listarMensajes(req, res) {
  try {
    const filas = await sequelize.query(
      `SELECT
         id,
         nombre,
         correo AS email,
         telefono,
         asunto,
         mensaje,
         estado,
         creado_en AS created_at
       FROM solicitudes_contacto
       ORDER BY creado_en DESC`,
      { type: QueryTypes.SELECT }
    );

    res.json(filas);
  } catch (err) {
    console.error("Error al obtener mensajes de contacto:", err);
    res.status(500).json({ error: "Error al obtener los mensajes" });
  }
}

async function responderMensaje(req, res) {
  try {
    const { id, email, subject, message } = req.body;

    if (!id || !email || !subject || !message) {
      return res.status(400).json({ error: "Faltan datos para responder" });
    }

    const fila = await sequelize.query(
      `SELECT nombre, mensaje, asunto
       FROM solicitudes_contacto
       WHERE id = :id`,
      {
        replacements: { id },
        type: QueryTypes.SELECT,
      }
    );

    if (!fila.length) {
      return res.status(404).json({ error: "Solicitud no encontrada" });
    }

    const original = fila[0];

    const textBody =
      `Hola ${original.nombre || "cliente"},\n\n` +
      `Hemos recibido tu consulta sobre "${original.asunto || "Sabores del Hogar"}".\n\n` +
      `${message.trim()}\n\n` +
      (original.mensaje
        ? `---\nMensaje que nos enviaste:\n${original.mensaje}`
        : "");

    const htmlBody = buildReplyHtml({
      nombre: original.nombre,
      replyMessage: message,
      originalMessage: original.mensaje,
      originalSubject: original.asunto,
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject,
      text: textBody,
      html: htmlBody,
    });

    await sequelize.query(
      `UPDATE solicitudes_contacto
       SET estado = :estado
       WHERE id = :id`,
      {
        replacements: { id, estado: "respondido" },
        type: QueryTypes.UPDATE,
      }
    );

    res.json({ ok: true, estado: "respondido" });
  } catch (err) {
    console.error("Error al responder mensaje de contacto:", err);
    res.status(500).json({ error: "Error al enviar la respuesta" });
  }
}

module.exports = {
  crearMensaje,
  listarMensajes,
  responderMensaje,
};
