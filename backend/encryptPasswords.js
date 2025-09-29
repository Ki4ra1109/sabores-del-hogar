require("dotenv").config();
const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");

// Conexión usando la URL de Supabase
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
});

// Definir el modelo "Usuario"
const User = sequelize.define(
  "User",
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
    contrasena: {
      // ⚠️ Usamos "contrasena" sin tilde
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "usuarios", // 👈 asegúrate de que así se llama tu tabla
    timestamps: false,
  }
);

async function encryptPasswords() {
  try {
    await sequelize.authenticate();
    console.log("Conexión a la base de datos OK ✅");

    const users = await User.findAll();

    for (const user of users) {
      // Verificar si ya está encriptada
      if (!user.contrasena.startsWith("$2b$")) {
        const hashed = await bcrypt.hash(user.contrasena, 10);
        user.contrasena = hashed;
        await user.save();
        console.log(`Contraseña encriptada para usuario: ${user.correo}`);
      } else {
        console.log(`Ya estaba encriptada: ${user.correo}`);
      }
    }

    console.log("✅ Todas las contraseñas han sido procesadas.");
    await sequelize.close();
  } catch (err) {
    console.error("❌ Error al encriptar contraseñas:", err);
  }
}

encryptPasswords();
