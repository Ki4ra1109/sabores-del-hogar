const bcrypt = require("bcrypt");
const User = require("../models/User");

// Login
const login = async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: "Faltan credenciales" });
  }

  try {
    const emailNorm = String(email).toLowerCase().trim();

    // Verificar si el usuario existe
    const user = await User.findOne({ where: { email: emailNorm } });
    if (!user) {
      return res.status(401).json({ message: "Email o contraseña incorrecta" });
    }

    // Verificar la contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Email o contraseña incorrecta" });
    }

    // Login exitoso (sin exponer password)
    return res.status(200).json({
      message: "Login exitoso",
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

// Registro
const registerUser = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      rut,
      correo,              
      password,
      telefono,
      fechaNacimiento,
      direccion,
    } = req.body || {};

    // Validaciones mínimas
    if (!nombre || !apellido || !correo || !password) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    const emailNorm = String(correo).toLowerCase().trim();

    // Validar si el correo ya existe
    const existingUser = await User.findOne({ where: { email: emailNorm } });
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
      email: emailNorm,
      password: hashedPassword,
      telefono,
      fecha_nacimiento: fechaNacimiento,
      direccion,
      rol: "user", 
    });

    // Responde sin la contraseña
    const safeUser = {
      id: newUser.id,
      nombre: newUser.nombre,
      apellido: newUser.apellido,
      rut: newUser.rut,
      email: newUser.email,
      telefono: newUser.telefono,
      fecha_nacimiento: newUser.fecha_nacimiento,
      direccion: newUser.direccion,
      rol: newUser.rol,
    };

    return res.status(201).json({ message: "Usuario creado con éxito", user: safeUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Ocurrió un error en el registro" });
  }
};

module.exports = { login, registerUser };
