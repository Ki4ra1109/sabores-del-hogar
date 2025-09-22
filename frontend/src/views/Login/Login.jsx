import "./Login.css";
import { useState, useEffect, useRef, useMemo } from "react";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env?.VITE_API_URL || "http://localhost:5000";

/* ================= Modal genérico ================= */
function Modal({ isOpen, title, onClose, children }) {
  const firstFocusable = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && firstFocusable.current) firstFocusable.current.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="al-modal-overlay" onClick={onClose} aria-modal="true" role="dialog">
      <div className="al-modal" onClick={(e) => e.stopPropagation()}>
        <button className="al-modal-close" onClick={onClose} aria-label="Cerrar" ref={firstFocusable}>✕</button>
        {title && <h3 className="al-modal-title">{title}</h3>}
        <div className="al-modal-body">{children}</div>
      </div>
    </div>
  );
}

/* ================= Login Page ================= */
export default function Login() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const closeAll = () => { setShowLogin(false); setShowSignup(false); };

  return (
    <div className="login-page">
      <main className="al-middle">
        <section className="al-grid al-hero">
          <div className="al-left">
            <div className="al-x-mark">
              <img src="/logoFondoBlanco.svg" alt="Sabores del Hogar" className="x-mark-img" />
            </div>
          </div>

          <div className="al-right">
            <h1 className="al-title">¡Sabores únicos!<br />¿Qué esperas para ser parte?</h1>
            <h2 className="al-subtitle">Únete hoy</h2>

            <div className="al-cta">
              <button className="al-btn al-btn-pill al-btn-light">
                <FcGoogle className="al-icon" />
                Inicia sesión con Google
              </button>

              <div className="al-divider"><span>o</span></div>

              <button className="al-btn al-btn-pill al-btn-primary" onClick={() => setShowSignup(true)}>Crear cuenta</button>

              <div className="al-have-account">
                <span>¿Ya tienes una cuenta?</span>
                <button className="al-btn al-btn-outline" onClick={() => setShowLogin(true)}>Iniciar sesión</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LoginModal isOpen={showLogin} onClose={closeAll} onSwap={() => { setShowLogin(false); setShowSignup(true); }} />
      <SignupModal isOpen={showSignup} onClose={closeAll} onSwap={() => { setShowSignup(false); setShowLogin(true); }} />
    </div>
  );
}

/* ================= Login Modal ================= */
function LoginModal({ isOpen, onClose, onSwap }) {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({ email: "", password: "", remember: false });

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const validate = () => {
    const e = {};
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Ingresa un email válido";
    if (!form.password) e.password = "Ingresa tu contraseña";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors((p) => ({ ...p, global: "" }));

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre,
          apellido: form.apellido,
          rut: form.rut,
          correo: form.correo,
          password: form.password,
          telefono: form.telefono,
          fechaNacimiento: form.fechaNacimiento,
          direccion: form.direccion,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        // Si quieres, puedes guardar al usuario en localStorage
        localStorage.setItem("sdh_user", JSON.stringify(data.user));
        onClose();
      } else {
        setErrors((p) => ({ ...p, global: data.message || "Error al crear la cuenta" }));
      }
    } catch {
      setErrors((p) => ({ ...p, global: "Error de conexión con el servidor" }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} title="Iniciar sesión" onClose={onClose}>
      {errors.global && <div className="al-msg-err">{errors.global}</div>}

      <form className="al-form" onSubmit={onSubmit} noValidate>
        <div className={`al-field ${errors.email ? "invalid" : ""}`}>
          <label>Correo electrónico</label>
          <input name="email" type="email" placeholder="correo@ejemplo.com" value={form.email} onChange={onChange} />
          {errors.email && <span className="al-msg-err">{errors.email}</span>}
        </div>

        <div className={`al-field ${errors.password ? "invalid" : ""}`}>
          <label>Contraseña</label>
          <div className="al-input-group">
            <input name="password" type={showPass ? "text" : "password"} placeholder="Tu contraseña" value={form.password} onChange={onChange} />
            <button type="button" className="al-eye" onClick={() => setShowPass((v) => !v)}>{showPass ? "🙈" : "👁️"}</button>
          </div>
          {errors.password && <span className="al-msg-err">{errors.password}</span>}
        </div>

        <button type="submit" className="al-btn al-btn-primary" disabled={loading}>{loading ? "Ingresando..." : "Entrar"}</button>
      </form>

      <p className="al-switch">¿No tienes cuenta? <button className="al-link" onClick={onSwap}>Regístrate</button></p>
    </Modal>
  );
}

/* ================= Signup Modal ================= */
function SignupModal({ isOpen, onClose, onSwap }) {
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState({});
  const [form, setForm] = useState({
    nombre: "", apellido: "", rut: "", correo: "", password: "",
    telefono: "", fechaNacimiento: "", direccion: "", accept: false,
  });
  const [errors, setErrors] = useState({});

  const setT = (n) => setTouched((t) => ({ ...t, [n]: true }));
  const hasVal = (n) => !!String(form[n] ?? "").trim();

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (touched[name] || submitted) validateField(name, type === "checkbox" ? checked : value);
  };

  const validateField = (name, value) => {
    let msg = "";
    if (["nombre", "apellido"].includes(name) && !String(value).trim()) msg = "Campo obligatorio";
    if (name === "rut" && !/^(\d{1,2}\.\d{3}\.\d{3}-[\dkK])$/.test(value)) msg = "RUT inválido";
    if (name === "correo" && !/\S+@\S+\.\S+/.test(value)) msg = "Correo inválido";
    if (name === "password" && !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{9,}$/.test(value)) msg = "Mín. 9, letras y números";
    if (name === "telefono" && !/^\+56\d{8,9}$/.test(value)) msg = "Formato +56XXXXXXXX";
    if (name === "fechaNacimiento" && !value) msg = "Selecciona tu fecha";
    if (name === "accept" && !value) msg = "Debes aceptar los términos";
    setErrors((e) => ({ ...e, [name]: msg }));
    return !msg;
  };

  const validateAll = () => ["nombre", "apellido", "rut", "correo", "password", "telefono", "fechaNacimiento", "accept"].every(f => validateField(f, form[f]));

  const onSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (!validateAll()) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); onClose(); }, 1000);
  };

  const fieldClass = (name) => `fl ${errors[name] && (touched[name] || submitted) ? "invalid" : ""} ${hasVal(name) ? "filled" : ""}`;
  const showErr = (name) => errors[name] && (touched[name] || submitted);

  return (
    <Modal isOpen={isOpen} title="Crear cuenta" onClose={onClose}>
      <form className="al-form al-modern al-grid-2" onSubmit={onSubmit} noValidate>
        {/* Nombre */}
        <div className={fieldClass("nombre")}>
          <input name="nombre" placeholder=" " value={form.nombre} onChange={onChange} onBlur={() => setT("nombre")} />
          <label>Nombre</label>
          {showErr("nombre") && <span className="al-msg-err">{errors.nombre}</span>}
        </div>

        {/* Apellido */}
        <div className={fieldClass("apellido")}>
          <input name="apellido" placeholder=" " value={form.apellido} onChange={onChange} onBlur={() => setT("apellido")} />
          <label>Apellido</label>
          {showErr("apellido") && <span className="al-msg-err">{errors.apellido}</span>}
        </div>

        {/* RUT */}
        <div className={fieldClass("rut")}>
          <input name="rut" placeholder=" " value={form.rut} onChange={onChange} onBlur={() => setT("rut")} />
          <label>RUT</label>
          {showErr("rut") && <span className="al-msg-err">{errors.rut}</span>}
        </div>

        {/* Correo */}
        <div className={fieldClass("correo")}>
          <input name="correo" placeholder=" " value={form.correo} onChange={onChange} onBlur={() => setT("correo")} />
          <label>Correo</label>
          {showErr("correo") && <span className="al-msg-err">{errors.correo}</span>}
        </div>

        {/* Contraseña */}
        <div className={fieldClass("password")}>
          <div className="al-input-group">
            <input name="password" placeholder=" " type={showPass ? "text" : "password"} value={form.password} onChange={onChange} onBlur={() => setT("password")} />
            <button type="button" className="al-eye" onClick={() => setShowPass(v => !v)}>{showPass ? "🙈" : "👁️"}</button>
            <label>Contraseña</label>
          </div>
          {showErr("password") && <span className="al-msg-err">{errors.password}</span>}
        </div>

        {/* Teléfono */}
        <div className={fieldClass("telefono")}>
          <input name="telefono" placeholder=" " value={form.telefono} onChange={onChange} onBlur={() => setT("telefono")} />
          <label>Teléfono</label>
          {showErr("telefono") && <span className="al-msg-err">{errors.telefono}</span>}
        </div>

        {/* Fecha de nacimiento */}
        <div className={fieldClass("fechaNacimiento")}>
          <input type="date" name="fechaNacimiento" placeholder=" " value={form.fechaNacimiento} onChange={onChange} onBlur={() => setT("fechaNacimiento")} />
          <label>Fecha de nacimiento</label>
          {showErr("fechaNacimiento") && <span className="al-msg-err">{errors.fechaNacimiento}</span>}
        </div>

        {/* Dirección */}
        <div className={fieldClass("direccion")}>
          <input name="direccion" placeholder=" " value={form.direccion} onChange={onChange} onBlur={() => setT("direccion")} />
          <label>Dirección</label>
        </div>

        {/* Aceptar términos */}
        <div className={`al-terms al-span-2 ${showErr("accept") ? "invalid" : ""}`}>
          <label className="al-check">
            <input type="checkbox" name="accept" checked={form.accept} onChange={onChange} onBlur={() => setT("accept")} />
            Acepto los Términos y la Política de Privacidad
          </label>
          {showErr("accept") && <span className="al-msg-err">{errors.accept}</span>}
        </div>

        {/* Botón enviar */}
        <button type="submit" className="al-btn al-btn-primary al-span-2" disabled={loading}>{loading ? "Creando cuenta..." : "Registrarse"}</button>
      </form>

      <p className="al-switch">¿Ya tienes cuenta? <button className="al-link" onClick={onSwap}>Inicia sesión</button></p>
    </Modal>
  );
}
