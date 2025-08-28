// db.js
const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  "sabores_del_hogar",       // nombre de la DB
  "sabores_del_hogar_user",  // usuario
  "9HJjwv17Sx5h6gRZnLRrmKla96UShfM0", // password
  {
    host: "dpg-d2mbb7ur433s73acra1g-a.oregon-postgres.render.com",
    dialect: "postgres",
    dialectOptions: {
      ssl: { rejectUnauthorized: false }
    },
    logging: false
  }
);

sequelize.authenticate()
  .then(() => console.log("Conectado a la DB con Sequelize ✅"))
  .catch(err => console.error("Error al conectar con Sequelize:", err));

module.exports = sequelize;


