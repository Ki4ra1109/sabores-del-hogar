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

    // Si cambia email valida que este no exista
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

module.exports = { getUsuario, patchUsuario };
