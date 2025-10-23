const { Sequelize } = require("sequelize");
require("dotenv").config();

const DATABASE_URL = process.env.DATABASE_URL;

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: "postgres",
  protocol: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: false,
});

// Probar conexión
sequelize
  .authenticate()
  .then(() => console.log("✅ Conectado a Supabase con Sequelize"))
  .catch((err) => console.error("❌ Error al conectar a la DB:", err));

module.exports = sequelize;