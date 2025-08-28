const bcrypt = require("bcrypt");
const User = require("../models/User");

// Login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verificar si el usuario existe
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Email o contraseña incorrecta" });
    }

    // Verificar la contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Email o contraseña incorrecta" });
    }

    // Login exitoso
    res.status(200).json({
      message: "Login exitoso",
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// Registro
const registerUser = async (req, res) => {
  try {
    const { nombre, apellido, rut, correo, password, telefono, fechaNacimiento, direccion } = req.body;

    // Validar si el correo ya existe
    const existingUser = await User.findOne({ where: { email: correo } });
    if (existingUser) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const newUser = await User.create({
      nombre,
      apellido,
      rut,
      email: correo,
      password: hashedPassword,
      telefono,
      fecha_nacimiento: fechaNacimiento,
      direccion,
    });

    res.status(201).json({ message: "Usuario creado con éxito", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ocurrió un error en el registro" });
  }
};

module.exports = { login, registerUser };

