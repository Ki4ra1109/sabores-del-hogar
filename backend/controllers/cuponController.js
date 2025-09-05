const { Op } = require("sequelize");
const Descuento = require("../models/cupon");

const norm = (s) => String(s || "").trim();

exports.list = async (req, res) => {
  try {
    const items = await Descuento.findAll({
      order: [["id_descuento", "DESC"]],
    });
    res.json({ ok: true, items });
  } catch (e) {
    res.status(500).json({ ok: false, message: e.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Descuento.findByPk(id);
    if (!item) return res.status(404).json({ ok: false, message: "Cupón no encontrado" });
    res.json({ ok: true, item });
  } catch (e) {
    res.status(500).json({ ok: false, message: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const {
      codigo,
      porcentaje,
      fecha_inicio,
      fecha_fin,
      uso_unico = false,
    } = req.body;

    if (!norm(codigo)) return res.status(400).json({ ok: false, message: "Código requerido" });

    const dup = await Descuento.findOne({ where: { codigo: norm(codigo).toUpperCase() } });
    if (dup) return res.status(400).json({ ok: false, message: "El código ya existe" });

    const n = Number(porcentaje);
    if (!Number.isFinite(n) || n < 1 || n > 60) {
      return res.status(400).json({ ok: false, message: "Porcentaje entre 1 y 60" });
    }

    if (fecha_inicio && fecha_fin && new Date(fecha_inicio) > new Date(fecha_fin)) {
      return res.status(400).json({ ok: false, message: "La fecha fin debe ser mayor o igual a inicio" });
    }

    const item = await Descuento.create({
      codigo: norm(codigo).toUpperCase(),
      porcentaje: n,
      fecha_inicio: fecha_inicio || null,
      fecha_fin: fecha_fin || null,
      uso_unico: !!uso_unico,
    });

    res.status(201).json({ ok: true, item });
  } catch (e) {
    res.status(500).json({ ok: false, message: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Descuento.findByPk(id);
    if (!item) return res.status(404).json({ ok: false, message: "Cupón no encontrado" });

    const payload = { ...req.body };

    if (payload.codigo) {
      const dup = await Descuento.findOne({
        where: { codigo: norm(payload.codigo).toUpperCase(), id_descuento: { [Op.ne]: id } },
      });
      if (dup) return res.status(400).json({ ok: false, message: "El código ya existe" });
      payload.codigo = norm(payload.codigo).toUpperCase();
    }

    if (payload.porcentaje != null) {
      const n = Number(payload.porcentaje);
      if (!Number.isFinite(n) || n < 1 || n > 60) {
        return res.status(400).json({ ok: false, message: "Porcentaje entre 1 y 60" });
      }
      payload.porcentaje = n;
    }

    if (payload.fecha_inicio && payload.fecha_fin && new Date(payload.fecha_inicio) > new Date(payload.fecha_fin)) {
      return res.status(400).json({ ok: false, message: "La fecha fin debe ser mayor o igual a inicio" });
    }

    await item.update(payload);
    res.json({ ok: true, item });
  } catch (e) {
    res.status(500).json({ ok: false, message: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Descuento.findByPk(id);
    if (!item) return res.status(404).json({ ok: false, message: "Cupón no encontrado" });
    await item.destroy();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, message: e.message });
  }
};

exports.validateForOrder = async (req, res) => {
  try {
    const { codigo } = req.body;
    const today = new Date().toISOString().slice(0, 10);

    const item = await Descuento.findOne({
      where: {
        codigo: norm(codigo).toUpperCase(),
        [Op.and]: [
          { [Op.or]: [{ fecha_inicio: null }, { fecha_inicio: { [Op.lte]: today } }] },
          { [Op.or]: [{ fecha_fin: null }, { fecha_fin: { [Op.gte]: today } }] },
        ],
      },
    });

    if (!item) return res.status(404).json({ ok: false, message: "Cupón no válido o vencido" });

    res.json({ ok: true, item });
  } catch (e) {
    res.status(500).json({ ok: false, message: e.message });
  }
};
