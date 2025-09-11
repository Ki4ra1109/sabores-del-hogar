// backend/models/Producto.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Producto = sequelize.define(
  "Producto",
  {
    sku: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    nombre: DataTypes.STRING,
    descripcion: DataTypes.STRING,
    precio: DataTypes.FLOAT,
    categoria: DataTypes.STRING,
    stock: DataTypes.INTEGER,
    puntuacion_promedio: DataTypes.FLOAT,
    imagen_url: DataTypes.STRING,
    estado: DataTypes.STRING
  },
  {
    tableName: "producto",
    timestamps: false
  }
);

module.exports = Producto;