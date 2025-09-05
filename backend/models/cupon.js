const { DataTypes } = require("sequelize");
const db = require("../config/db");

const Descuento = db.define("Descuento", {
  id_descuento: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  codigo: {
    type: DataTypes.STRING(50), allowNull: false, unique: true,
    set(v){ this.setDataValue("codigo", String(v||"").trim().toUpperCase()); },
    validate: { notEmpty: true, len: [2,50] },
  },
  tipo: { type: DataTypes.ENUM("percent","amount","free_shipping"), allowNull: true },
  valor: { type: DataTypes.INTEGER, allowNull: true },

  porcentaje: { type: DataTypes.DECIMAL(5,2), allowNull: true },

  fecha_inicio: { type: DataTypes.DATEONLY, allowNull: true },
  fecha_fin:    { type: DataTypes.DATEONLY, allowNull: true },
  minimo_compra:{ type: DataTypes.INTEGER, allowNull: true },
  uso_unico:    { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  limite_uso:   { type: DataTypes.INTEGER, allowNull: true },
  veces_usado:  { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  activo:       { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, {
  tableName: "descuentos",
  schema: "public",
  timestamps: false,
  underscored: true,
});

module.exports = Descuento;
