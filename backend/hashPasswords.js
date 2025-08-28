const bcrypt = require("bcrypt");
const User = require("./models/User"); // Ajusta la ruta si es necesario
const sequelize = require("./config/db"); // Asegúrate de exportar sequelize en db.js

async function hashAllPasswords() {
  try {
    await sequelize.authenticate();
    console.log("Conexión a la DB exitosa ✅");

    const users = await User.findAll();

    for (let user of users) {
      // Solo hashea si la contraseña NO está hasheada aún (por seguridad)
      if (!user.password.startsWith("$2b$")) {
        const hashed = await bcrypt.hash(user.password, 10);
        user.password = hashed;
        await user.save();
        console.log(`Contraseña de ${user.email} hasheada ✅`);
      }
    }

    console.log("Todas las contraseñas han sido actualizadas 🔒");
    process.exit();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

hashAllPasswords();
