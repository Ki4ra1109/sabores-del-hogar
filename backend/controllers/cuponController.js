const { Op } = require("sequelize");
const Descuento = require("../models/cupon");
const norm = (s) => String(s || "").trim();
function normalizePayload(body) {
  let {
    codigo,
    tipo,
    valor,
    porcentaje,       
    fecha_inicio,
    fecha_fin,
    uso_unico = false,
    minimo_compra = null,
    activo = true,
    limite_uso = null,
  } = body;

  if (!tipo && porcentaje != null) {
    tipo = "percent";
    valor = Math.round(Number(porcentaje));
  }

  if (!norm(codigo)) throw new Error("Código requerido");
  codigo = norm(codigo).toUpperCase();

  if (!["percent", "amount", "free_shipping"].includes(tipo)) {
    throw new Error("Tipo inválido");
  }

  if (tipo === "percent") {
    const n = Number(valor);
    if (!Number.isFinite(n) || n < 1 || n > 60) {
      throw new Error("Porcentaje entre 1 y 60");
    }
    porcentaje = n;             
    valor = n;                   
    minimo_compra = null;       
  }

  if (tipo === "amount") {
    const n = Number(valor);
    if (!Number.isFinite(n) || n <= 0) {
      throw new Error("Monto del descuento (> 0)");
    }
    valor = Math.floor(n);
    const min = Number(minimo_compra);
    if (!Number.isFinite(min) || min <= 0) {
      throw new Error("Mínimo de compra (> 0)");
    }
    minimo_compra = Math.floor(min);
    porcentaje = null;         
  }

  if (tipo === "free_shipping") {
    valor = null;               
    const min = Number(minimo_compra);
    if (!Number.isFinite(min) || min <= 0) {
      throw new Error("Mínimo de compra (> 0) para envío gratis");
    }
    minimo_compra = Math.floor(min);
    porcentaje = null;        
  }

  if (fecha_inicio && fecha_fin && new Date(fecha_inicio) > new Date(fecha_fin)) {
    throw new Error("La fecha fin debe ser mayor o igual a inicio");
  }

  if (uso_unico) limite_uso = 1;

  return {
    codigo,
    tipo,
    valor,
    porcentaje,       
    fecha_inicio: fecha_inicio || null,
    fecha_fin: fecha_fin || null,
    minimo_compra: minimo_compra ?? null,
    uso_unico: !!uso_unico,
    activo: activo !== false,
    limite_uso: limite_uso ?? null,
  };
}

// Cálculo del descuento segun el tipo que se aplica
function applyDiscount({ cup, subtotal, shipping = 0 }) {
  const sub = Number(subtotal) || 0;
  const ship = Number(shipping) || 0;

  if (cup.tipo === "percent") {
    const pct = Math.min(Number(cup.valor || cup.porcentaje || 0), 60);
    return Math.floor(sub * pct / 100); 
  }

  if (cup.tipo === "amount") {
    if (cup.minimo_compra && sub < cup.minimo_compra) return 0;
    const amt = Number(cup.valor || 0);
    return Math.min(amt, sub);
  }

  if (cup.tipo === "free_shipping") {
    if (cup.minimo_compra && sub < cup.minimo_compra) return 0;
    return ship > 0 ? ship : 0;
  }

  return 0;
}

// ---------- CRUD ----------

exports.list = async (req, res) => {
  try {
    const items = await Descuento.findAll({ order: [["id_descuento", "DESC"]] });
    res.json({ ok: true, items });
  } catch (e) {
    res.status(500).json({ ok: false, message: e.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const item = await Descuento.findByPk(req.params.id);
    if (!item) return res.status(404).json({ ok: false, message: "Cupón no encontrado" });
    res.json({ ok: true, item });
  } catch (e) {
    res.status(500).json({ ok: false, message: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const payload = normalizePayload(req.body);

    const dup = await Descuento.findOne({ where: { codigo: payload.codigo } });
    if (dup) return res.status(400).json({ ok: false, message: "El código ya existe" });

    const item = await Descuento.create(payload);
    res.status(201).json({ ok: true, item });
  } catch (e) {
    res.status(400).json({ ok: false, message: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await Descuento.findByPk(req.params.id);
    if (!item) return res.status(404).json({ ok: false, message: "Cupón no encontrado" });

    const merged = { ...item.toJSON(), ...req.body };
    const payload = normalizePayload(merged);

    const dup = await Descuento.findOne({
      where: { codigo: payload.codigo, id_descuento: { [Op.ne]: item.id_descuento } },
    });
    if (dup) return res.status(400).json({ ok: false, message: "El código ya existe" });

    await item.update(payload);
    res.json({ ok: true, item });
  } catch (e) {
    res.status(400).json({ ok: false, message: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const item = await Descuento.findByPk(req.params.id);
    if (!item) return res.status(404).json({ ok: false, message: "Cupón no encontrado" });
    await item.destroy();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, message: e.message });
  }
};
// |- Validacion para el pedido -|
exports.validateForOrder = async (req, res) => {
  try {
    const { codigo, subtotal = 0, shipping = 0 } = req.body;
    const today = new Date().toISOString().slice(0, 10);

    const cup = await Descuento.findOne({
      where: {
        codigo: norm(codigo).toUpperCase(),
        activo: true,
        [Op.and]: [
          { [Op.or]: [{ fecha_inicio: null }, { fecha_inicio: { [Op.lte]: today } }] },
          { [Op.or]: [{ fecha_fin: null }, { fecha_fin: { [Op.gte]: today } }] },
        ],
      },
    });

    if (!cup) return res.status(404).json({ ok: false, message: "Cupón no válido o vencido" });

    if (cup.limite_uso && Number(cup.veces_usado || 0) >= cup.limite_uso) {
      return res.status(400).json({ ok: false, message: "Límite de uso alcanzado" });
    }

    const discountValue = applyDiscount({ cup, subtotal: Number(subtotal), shipping: Number(shipping) });
    const newTotal = Math.max(0, Number(subtotal) + Number(shipping) - discountValue);

    res.json({ ok: true, tipo: cup.tipo, discountValue, newTotal });
  } catch (e) {
    res.status(500).json({ ok: false, message: e.message });
  }
};
