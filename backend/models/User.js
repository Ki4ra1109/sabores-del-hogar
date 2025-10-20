const { DataTypes } = require("sequelize");
const db = require("../config/db");
const bcrypt = require("bcrypt"); 

const User = db.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      field: "correo",
    },

    password: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: "contrasena",
    },

    nombre: { type: DataTypes.STRING(100), allowNull: false },
    apellido: { type: DataTypes.STRING(100), allowNull: true }, 
    rut: { type: DataTypes.STRING(12), allowNull: true, unique: true },
    telefono: { type: DataTypes.STRING(15), allowNull: true },
    fecha_nacimiento: { type: DataTypes.DATEONLY, allowNull: true },
    direccion: { type: DataTypes.STRING(120), allowNull: true },

    rol: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "usuario",
    },

    must_set_password: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    password_set_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    fecha_creacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "creado_en",
    },
  },
  {
    tableName: "usuarios",
    schema: "public",
    timestamps: false,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    }
  }
);

module.exports = User;