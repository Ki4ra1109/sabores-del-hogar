// controllers/prediccionController.js
// Predicción con estacionalidad mensual + tendencia lineal
// Compatible con Supabase y filtro por categoría

const db = require("../config/db");

// Multiplicadores estacionales ajustables
const SEASONAL_OVERRIDES = {
  1: 1.00, // Ene
  2: 0.92, // Feb
  3: 1.00,
  4: 1.00,
  5: 1.12, // Día de la Madre
  6: 1.00,
  7: 1.00,
  8: 0.95, // Invierno/vacaciones
  9: 1.18, // Fiestas Patrias
  10: 1.00,
  11: 1.00,
  12: 1.28 // Navidad
};

// Utilidad numérica
const num = (v, f = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : f;
};

// ==============================================
// Serie mensual (ventas + órdenes) con filtro de categoría
// ==============================================
exports.timeseriesMensual = async (req, res) => {
  try {
    const { from, to, categoria } = req.query;
    const where = [];
    const repl = {};

    where.push(`p.total > 0`);
    where.push(`p.fecha_pedido IS NOT NULL`);

    if (from) {
      where.push(`p.fecha_pedido >= :from`);
      repl.from = from;
    }
    if (to) {
      where.push(`p.fecha_pedido < :to`);
      repl.to = to;
    }
    if (categoria) {
      where.push(`LOWER(p.categoria) = LOWER(:categoria)`);
      repl.categoria = categoria;
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [rows] = await db.query(
      `
      SELECT
        date_trunc('month', p.fecha_pedido)::date AS mes,
        SUM(p.total)::numeric AS ventas,
        COUNT(*) AS ordenes
      FROM pedido p
      ${whereSql}
      GROUP BY 1
      HAVING SUM(p.total) > 0
      ORDER BY 1
      `,
      { replacements: repl }
    );

    const data = rows.map(r => ({
      mes: new Date(r.mes).toISOString().slice(0, 10),
      ventas: num(r.ventas),
      ordenes: num(r.ordenes)
    }));

    return res.json({ ok: true, data });
  } catch (e) {
    console.error("❌ timeseriesMensual error:", e);
    return res.status(500).json({ ok: false, message: "Error al obtener serie mensual" });
  }
};

// ==============================================
// Pronóstico próximos meses (lineal + estacional)
// ==============================================
exports.forecast = async (req, res) => {
  try {
    const horizon = Math.max(1, Math.min(12, num(req.query.months, 3))); // 1..12

    const [rows] = await db.query(`
      SELECT 
        date_trunc('month', fecha_pedido)::date AS mes,
        SUM(total)::numeric AS ventas
      FROM pedido
      WHERE fecha_pedido IS NOT NULL AND total > 0
      GROUP BY 1
      HAVING SUM(total) > 0
      ORDER BY 1
    `);

    if (!rows.length) {
      return res.json({ ok: true, forecast: [], info: "Sin datos suficientes" });
    }

    const y = rows.map(r => num(r.ventas));
    const months = rows.map(r => new Date(r.mes));
    const mean = y.reduce((a, b) => a + b, 0) / y.length;

    // Índices estacionales
    const sums = Array(13).fill(0);
    const counts = Array(13).fill(0);
    rows.forEach((r, i) => {
      const m = new Date(r.mes).getMonth() + 1;
      sums[m] += y[i];
      counts[m] += 1;
    });
    const seasonal = Array(13).fill(1);
    for (let m = 1; m <= 12; m++) {
      const avgM = counts[m] ? sums[m] / counts[m] : mean;
      seasonal[m] = avgM / mean;
    }

    // Tendencia lineal
    const n = y.length;
    const t = Array.from({ length: n }, (_, i) => i + 1);
    const sumT = t.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumTT = t.reduce((a, b) => a + b * b, 0);
    const sumTY = t.reduce((a, ti, i) => a + ti * y[i], 0);
    const denom = (n * sumTT - sumT * sumT) || 1;
    const beta = (n * sumTY - sumT * sumY) / denom;
    const alpha = (sumY - beta * sumT) / n;

    // Generar pronóstico
    const lastT = t[n - 1];
    const lastDate = months[n - 1];
    const forecast = [];
    let cur = new Date(lastDate);

    for (let h = 1; h <= horizon; h++) {
      cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
      const tm = lastT + h;

      const baseTrend = Math.max(0, alpha + beta * tm);
      const m = cur.getMonth() + 1;
      const sIdx = seasonal[m] || 1;
      const override = SEASONAL_OVERRIDES[m] || 1;

      const yhat = Math.round(baseTrend * sIdx * override);

      forecast.push({
        mes: cur.toISOString().slice(0, 10),
        estimado: yhat,
        mes_num: m,
        seasonal_index: Number(sIdx.toFixed(4)),
        override
      });
    }

    return res.json({
      ok: true,
      mean,
      alpha: Number(alpha.toFixed(4)),
      beta: Number(beta.toFixed(4)),
      seasonal,
      forecast
    });
  } catch (e) {
    console.error("❌ forecast error:", e);
    return res.status(500).json({ ok: false, message: "Error al generar pronóstico" });
  }
};
