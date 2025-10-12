const { DataTypes } = require("sequelize");
const db = require("../config/db");

const PasswordReset = db.define(
  "PasswordReset",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    correo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(6),
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    used: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "password_resets",
    schema: "public",
    timestamps: false,
  }
);

module.exports = PasswordReset;
