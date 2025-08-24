const express = require('express');
const sequelize = require('./config/db');
require('dotenv').config();

const app = express();
app.use(express.json());

// RUTA DE PRUEBA
app.get('/', (req, res) => {
  res.send('Servidor funcionando 🚀');
});

// CONEXIÓN A LA BASE DE DATOS Y LEVANTAR SERVIDOR
const PORT = process.env.PORT || 3001;

sequelize.authenticate()
  .then(() => {
    console.log('Conexión a PostgreSQL exitosa');
    return sequelize.sync();
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
  })
  .catch(err => console.error('Error al conectar con la DB:', err));
