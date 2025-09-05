const { DataTypes } = require("sequelize");
const db = require("../config/db");

const Descuento = db.define("Descuento", {
  id_descuento: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  codigo: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    set(v) {
      this.setDataValue("codigo", String(v || "").trim().toUpperCase());
    },
    validate: { notEmpty: true, len: [2, 50] },
  },
  porcentaje: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: {
      isValid(v) {
        const n = Number(v);
        if (!Number.isFinite(n) || n < 1 || n > 60) {
          throw new Error("El porcentaje debe estar entre 1 y 60");
        }
      },
    },
  },
  fecha_inicio: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  fecha_fin: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  uso_unico: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  tableName: "descuentos",
  schema: "public",
  timestamps: false,
  underscored: true,
});

module.exports = Descuento;
