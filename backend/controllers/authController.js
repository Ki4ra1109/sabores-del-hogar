const bcrypt = require("bcrypt");
const User = require("../models/User");

// Normaliza el RUT: quita puntos y guion
function cleanRut(r) {
  return String(r || "").replace(/[.\-]/g, "").toUpperCase();
}

// Login
const login = async (req, res) => {
  try {
    const { email, correo, password } = req.body || {};
    const emailNorm = String(email || correo || "").toLowerCase().trim();

    if (!emailNorm || !password) {
      return res.status(400).json({ message: "Faltan credenciales" });
    }

    const user = await User.findOne({ where: { email: emailNorm } });
    if (!user) {
      return res.status(401).json({ message: "Email o contraseña incorrecta" });
    }

    const validPassword = await bcrypt.compare(password, user.password || "");
    if (!validPassword) {
      return res.status(401).json({ message: "Email o contraseña incorrecta" });
    }

    return res.status(200).json({
      message: "Login exitoso",
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rut: user.rut,
        telefono: user.telefono,
        fecha_nacimiento: user.fecha_nacimiento,
        direccion: user.direccion,
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
      correo,
      email,
      password,
      rut,            // opcional
      telefono,       // opcional
      fechaNacimiento,// opcional
      direccion,      // opcional
    } = req.body || {};

    const emailNorm = String(email || correo || "").toLowerCase().trim();

    // Datos mínimos
    if (!nombre || !apellido || !emailNorm || !password) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    // Si viene, normaliza rut
    const rutNorm = rut ? cleanRut(rut) : null;

    // Email único
    const existingEmail = await User.findOne({ where: { email: emailNorm } });
    if (existingEmail) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    // Rut único (solo si se envía)
    if (rutNorm) {
      const existingRut = await User.findOne({ where: { rut: rutNorm } });
      if (existingRut) {
        return res.status(400).json({ message: "El RUT ya está registrado" });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario con campos opcionales en null si no vienen
    const newUser = await User.create({
      nombre,
      apellido,
      email: emailNorm,
      password: hashedPassword,
      rut: rutNorm || null,
      telefono: telefono || null,
      fecha_nacimiento: fechaNacimiento || null,
      direccion: direccion || null,
      rol: "user",
      fecha_creacion: new Date(), // asegura valor para NOT NULL
    });

    return res.status(201).json({
      message: "Usuario creado con éxito",
      user: {
        id: newUser.id,
        nombre: newUser.nombre,
        apellido: newUser.apellido,
        rut: newUser.rut,
        email: newUser.email,
        telefono: newUser.telefono,
        fecha_nacimiento: newUser.fecha_nacimiento,
        direccion: newUser.direccion,
        rol: newUser.rol,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Ocurrió un error en el registro" });
  }
};

module.exports = { login, registerUser };
