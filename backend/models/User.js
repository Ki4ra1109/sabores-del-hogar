const { DataTypes } = require("sequelize");
const db = require("../config/db");

const User = db.define("User", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  apellido: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  rut: {
    type: DataTypes.STRING(12),
    allowNull: true,          
    unique: true,
  },
  telefono: {
    type: DataTypes.STRING(15),
    allowNull: true,
  },
  fecha_nacimiento: {
    type: DataTypes.DATEONLY,
    allowNull: true,          
  },
  direccion: {
    type: DataTypes.STRING(120),
    allowNull: true,
  },
  rol: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: "user",     
  },
}, {
  tableName: "usuarios_detalle",
  schema: "public",
  timestamps: true,
  createdAt: "fecha_creacion",
  updatedAt: false,
});

module.exports = User;
