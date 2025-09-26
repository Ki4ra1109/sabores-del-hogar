// db.js
const { Sequelize } = require("sequelize");
require("dotenv").config();

// Conexión usando DATABASE_URL de Supabase
const sequelize = new Sequelize(
  "postgresql://postgres.tptcvaxbjsnxmgwhmoup:9HJjwv17Sx5h6gRZnLRrmKla96UShfM0@aws-1-us-east-2.pooler.supabase.com:5432/postgres",
  {
    dialect: "postgres",
    protocol: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
  }
);

// Probar conexión
sequelize
  .authenticate()
  .then(() => console.log("✅ Conectado a Supabase con Sequelize"))
  .catch((err) =>
    console.error("❌ Error al conectar a Supabase con Sequelize:", err)
  );

module.exports = sequelize;
