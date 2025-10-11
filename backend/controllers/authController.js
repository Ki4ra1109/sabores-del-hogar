const bcrypt = require("bcrypt");
const crypto = require("crypto");
const User = require("../models/User");
const PasswordReset = require("../models/PasswordReset");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

function cleanRut(r) {
  return String(r || "").replace(/[.\-]/g, "").toUpperCase();
}

function genTempPassword() {
  const hex = crypto.randomBytes(8).toString("hex");
  return hex + "A1";
}

async function login(req, res) {
  try {
    const { email, correo, password } = req.body || {};
    const emailNorm = String(email || correo || "").toLowerCase().trim();
    if (!emailNorm || !password) {
      return res.status(400).json({ message: "Faltan credenciales" });
    }

    const user = await User.findOne({ where: { email: emailNorm } });
    if (!user) return res.status(401).json({ message: "Email o contraseña incorrecta" });

    const validPassword = await bcrypt.compare(password, user.password || "");
    if (!validPassword) return res.status(401).json({ message: "Email o contraseña incorrecta" });

    const token = process.env.JWT_SECRET
      ? jwt.sign({ uid: user.id, email: user.email, rol: user.rol }, process.env.JWT_SECRET, { expiresIn: "7d" })
      : null;

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
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
}

async function registerUser(req, res) {
  try {
    const {
      nombre,
      apellido,
      correo,
      email,
      password,
      rut,
      telefono,
      fechaNacimiento,
      direccion,
    } = req.body || {};

    const emailNorm = String(email || correo || "").toLowerCase().trim();
    if (!nombre || !apellido || !emailNorm || !password) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    const rutNorm = rut ? cleanRut(rut) : null;

    const existingEmail = await User.findOne({ where: { email: emailNorm } });
    if (existingEmail) return res.status(400).json({ message: "El correo ya está registrado" });

    if (rutNorm) {
      const existingRut = await User.findOne({ where: { rut: rutNorm } });
      if (existingRut) return res.status(400).json({ message: "El RUT ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      nombre,
      apellido,
      email: emailNorm,
      password: hashedPassword,
      rut: rutNorm || null,
      telefono: telefono || null,
      fecha_nacimiento: fechaNacimiento || null,
      direccion: direccion || null,
      rol: "usuario",
      fecha_creacion: new Date(),
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
}

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  JWT_SECRET,
} = process.env;

const oauth = new OAuth2Client({
  clientId: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  redirectUri: GOOGLE_REDIRECT_URI,
});

async function googleLoginToken(req, res) {
  try {
    const { access_token } = req.body || {};
    if (!access_token) return res.status(400).json({ message: "Falta access_token" });

    const r = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    if (!r.ok) return res.status(401).json({ message: "Token inválido" });
    const profile = await r.json();

    const email = String(profile?.email || "").toLowerCase();
    const given = profile?.given_name || profile?.name || "Usuario";
    const family = profile?.family_name || "";

    if (!email) return res.status(400).json({ message: "No se pudo obtener el email" });

    let user = await User.findOne({ where: { email } });
    let isNew = false;
    if (!user) {
      const tempPass = await bcrypt.hash(genTempPassword(), 10);
      user = await User.create({
        email,
        password: tempPass,
        nombre: given,
        apellido: family || "",
        rol: "usuario",
        fecha_creacion: new Date(),
        must_set_password: true,
      });
      isNew = true;
    }

    const token = JWT_SECRET
      ? jwt.sign({ uid: user.id, email: user.email, rol: user.rol }, JWT_SECRET, { expiresIn: "7d" })
      : null;

    return res.json({
      message: "Login Google exitoso",
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
        mustSetPassword: !!user.must_set_password,
      },
      token,
      isNew,
    });
  } catch (err) {
    console.error("Google token login error:", err);
    return res.status(500).json({ message: "Error al autenticar con Google" });
  }
}

const googleCallback = async (req, res) => {
    try {
      const googleUser = req.user;
      const usuario = await User.findOne({ where: { email: googleUser.email } });
  
      if (usuario) {
        const payload = {
          usuario: { id: usuario.id, rol: usuario.rol },
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
        const userForFrontend = {
          id: usuario.id,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          email: usuario.email,
          rol: usuario.rol,
        };
        
        // --- AQUÍ ESTÁ LA CORRECCIÓN ---
        // Se elimina "/success" para que la redirección sea a la página de Login
        const frontendUrl = `${process.env.FRONTEND_URL}/login?token=${token}&user=${encodeURIComponent(JSON.stringify(userForFrontend))}`;
        return res.redirect(frontendUrl);

      } else {
        const tempPayload = {
          email: googleUser.email,
          nombre: googleUser.nombre,
          apellido: googleUser.apellido,
          googleId: googleUser.id,
        };
        
        const tempToken = jwt.sign(tempPayload, process.env.JWT_SECRET, { expiresIn: "10m" });
  
        const completionUrl = `${process.env.FRONTEND_URL}/login?action=completeGoogle&tempToken=${tempToken}`;
        return res.redirect(completionUrl);
      }
    } catch (error) {
      console.error("Error en el callback de Google:", error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=google_failed`);
    }
};

async function googleComplete(req, res) {
  const { tempToken, password } = req.body;

  try {
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    
    const existingUser = await User.findOne({ where: { email: decoded.email } });
    if (existingUser) {
      return res.status(400).json({ message: "Este correo ya fue registrado." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      nombre: decoded.nombre,
      apellido: decoded.apellido,
      email: decoded.email,
      password: hashedPassword,
      googleId: decoded.googleId,
      rol: "usuario",
    });

    const payload = { usuario: { id: newUser.id, rol: newUser.rol } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({
      message: "Cuenta creada con éxito",
      token,
      user: {
        id: newUser.id,
        nombre: newUser.nombre,
        apellido: newUser.apellido,
        email: newUser.email,
        rol: newUser.rol,
      },
    });
  } catch (error) {
    console.error("Error completando registro de Google:", error);
    res.status(400).json({ message: "Token inválido o expirado. Inténtalo de nuevo." });
  }
}

function passOK(p) {
  return typeof p === "string" && p.length >= 9 && /[A-Za-z]/.test(p) && /\d/.test(p);
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "465", 10),
  secure: String(process.env.SMTP_SECURE || "true") === "true",
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

async function sendRecovery(to, code) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const subject = "Código de recuperación";
  const text = `Tu código es ${code}. Expira en 15 minutos.`;
  const html = `<p>Tu código es <b>${code}</b>. Expira en 15 minutos.</p>`;
  try {
    await transporter.sendMail({ from, to, subject, text, html });
  } catch (e) {
    console.error("SMTP error:", e.message);
    console.log(`[RECOVERY][FALLBACK] ${to} => código ${code} (15 min)`);
  }
}

async function forgotPassword(req, res) {
  try {
    const email = String(req.body?.email || "").toLowerCase().trim();
    if (!email) return res.status(400).json({ message: "Email requerido" });

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const exp = new Date(Date.now() + 15 * 60 * 1000);

    await PasswordReset.destroy({ where: { email } });
    await PasswordReset.create({ email, code, expires_at: exp, used: false });

    await sendRecovery(email, code);
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Error en forgot" });
  }
}

async function resetPassword(req, res) {
  try {
    const email = String(req.body?.email || "").toLowerCase().trim();
    const code = String(req.body?.code || "");
    const newPassword = req.body?.newPassword;
    if (!email || !code || !newPassword) return res.status(400).json({ message: "Datos faltantes" });
    if (!passOK(newPassword)) return res.status(400).json({ message: "Política inválida" });

    const pr = await PasswordReset.findOne({ where: { email } });
    if (!pr) return res.status(400).json({ message: "Código inválido" });
    if (pr.used) return res.status(400).json({ message: "Código usado" });
    if (pr.code !== code) return res.status(400).json({ message: "Código inválido" });
    if (new Date(pr.expires_at).getTime() < Date.now()) return res.status(400).json({ message: "Código expirado" });

    const u = await User.findOne({ where: { email } });
    if (!u) return res.status(400).json({ message: "Usuario no existe" });

    u.password = await bcrypt.hash(newPassword, 10);
    await u.save();

    pr.used = true;
    await pr.save();

    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Error en reset" });
  }
}

module.exports = { login, registerUser, googleLoginToken, forgotPassword, resetPassword, googleCallback, googleComplete };