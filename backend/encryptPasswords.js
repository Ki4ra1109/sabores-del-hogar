const bcrypt = require("bcrypt");
const { Sequelize, DataTypes } = require("sequelize");

// Conexión a tu base de datos en Render
const sequelize = new Sequelize(
  "postgresql://sabores_del_hogar_user:9HJjwv17Sx5h6gRZnLRrmKla96UShfM0@dpg-d2mbb7ur433s73acra1g-a.oregon-postgres.render.com/sabores_del_hogar",
  {
    dialect: "postgres",
    dialectOptions: { ssl: { rejectUnauthorized: false } },
    logging: false
  }
);

// Modelo temporal de usuarios
const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  password: { type: DataTypes.STRING, allowNull: false }
}, {
  tableName: "usuarios_detalle",
  timestamps: false
});

async function encryptPasswords() {
  try {
    await sequelize.authenticate();
    console.log("Conexión a la base de datos OK ✅");

    const users = await User.findAll();

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10); // 10 rounds de salt
      await User.update(
        { password: hashedPassword },
        { where: { id: user.id } }
      );
      console.log(`Usuario ${user.id} actualizado ✅`);
    }

    console.log("Todas las contraseñas han sido encriptadas 🔒");
    process.exit(0);

  } catch (error) {
    console.error("Error al encriptar contraseñas:", error);
    process.exit(1);
  }
}

encryptPasswords();
