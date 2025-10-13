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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    code: {
      type: DataTypes.TEXT, 
      allowNull: false,
      field: "codigo_hash", 
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "expiracion", 
    },
    used: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "uso", 
    },
  },
  {
    tableName: "password_resets",
    schema: "public",
    timestamps: false,
  }
);

module.exports = PasswordReset;