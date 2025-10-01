const { Sequelize } = require("sequelize");
require("dotenv").config();

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgres://postgres:password@localhost:5432/postgres";

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: "postgres",
  protocol: "postgres",
  dialectOptions:
    process.env.DATABASE_URL && process.env.DATABASE_URL.includes("render.com")
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {},
  logging: false,
});

// Probar conexión
sequelize
  .authenticate()
  .then(() => console.log("✅ Conectado a PostgreSQL con Sequelize"))
  .catch((err) => console.error("❌ Error al conectar a la DB:", err));

module.exports = sequelize;
