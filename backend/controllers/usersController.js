const bcrypt = require("bcrypt");
const User = require("../models/User");

const toSafe = (u) => ({
  id: u.id,
  nombre: u.nombre,
  apellido: u.apellido,
  rut: u.rut,
  email: u.email,
  telefono: u.telefono,
  fecha_nacimiento: u.fecha_nacimiento,
  direccion: u.direccion,
  rol: u.rol,
});

async function getUsuario(req, res) {
  try {
    const { id } = req.params;
    const u = await User.findByPk(id);
    if (!u) return res.status(404).json({ message: "Usuario no encontrado" });
    return res.json({ ok: true, user: toSafe(u) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Error en el servidor" });
  }
}

async function patchUsuario(req, res) {
  try {
    const { id } = req.params;
    const u = await User.findByPk(id);
    if (!u) return res.status(404).json({ message: "Usuario no encontrado" });

    const {
      nombre, apellido, rut, email, telefono,
      fecha_nacimiento, direccion, password, rol
    } = req.body || {};

    if (email && email !== u.email) {
      const exists = await User.findOne({ where: { email } });
      if (exists) return res.status(400).json({ message: "El correo ya está registrado" });
    }
    const data = {};
    if (nombre != null) data.nombre = nombre;
    if (apellido != null) data.apellido = apellido;
    if (rut != null) data.rut = rut;
    if (email != null) data.email = String(email).toLowerCase().trim();
    if (telefono != null) data.telefono = telefono;
    if (fecha_nacimiento != null) data.fecha_nacimiento = fecha_nacimiento;
    if (direccion != null) data.direccion = direccion;
    if (rol != null) data.rol = rol;
    if (password) data.password = await bcrypt.hash(password, 10);

    await User.update(data, { where: { id } });
    const updated = await User.findByPk(id);
    return res.json({ ok: true, user: toSafe(updated) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Error en el servidor" });
  }
}

function validaPass(p) {
  return typeof p === "string" && p.length >= 9 && /[A-Za-z]/.test(p) && /\d/.test(p);
}

async function updateMyPassword(req, res) {
  try {
    const { newPassword } = req.body || {};
    if (!validaPass(newPassword)) return res.status(400).json({ message: "Política inválida" });

    const u = await User.findByPk(req.user.id);
    if (!u) return res.status(404).json({ message: "Usuario no existe" });

    u.password = await bcrypt.hash(newPassword, 10);
    u.must_set_password = false;
    u.password_set_at = new Date();
    await u.save();

    return res.json({
      ok: true,
      user: {
        id: u.id,
        email: u.email,
        rol: u.rol,
        mustSetPassword: false,
        passwordSetAt: u.password_set_at
      }
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Error interno" });
  }
}

async function getMe(req, res) {
  try {
    const u = await User.findByPk(req.user.id);
    if (!u) return res.status(404).json({ message: "Usuario no existe" });
    return res.json({
      ok: true,
      user: {
        id: u.id,
        nombre: u.nombre,
        apellido: u.apellido,
        email: u.email,
        rol: u.rol,
        mustSetPassword: !!u.must_set_password,
        passwordSetAt: u.password_set_at
      }
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Error interno" });
  }
}

module.exports = { getUsuario, patchUsuario, updateMyPassword, getMe };
