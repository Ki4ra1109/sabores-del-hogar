import "./Login.css";
import { useState, useEffect, useRef } from "react";
import { FcGoogle } from "react-icons/fc";

import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env?.VITE_API_URL || "http://localhost:5000";


import { Link, useNavigate } from "react-router-dom";

function Modal({ isOpen, title, onClose, children }) {
  const first = useRef(null);
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);
  useEffect(() => { if (isOpen && first.current) first.current.focus(); }, [isOpen]);
  if (!isOpen) return null;

  return (
    <div className="auth-modal-ov" onClick={onClose} aria-modal="true" role="dialog">
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose} aria-label="Cerrar" ref={first}>✕</button>
        {title && <h3 className="auth-title">{title}</h3>}
        <div className="auth-body">{children}</div>
      </div>
    </div>
  );
}


/* ================= Login Page ================= */

/* pagina login */

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

    <div className="auth-page">
      <div className="auth-shell">
        <Link to="/" className="auth-logo" aria-label="Ir al inicio" title="Ir al inicio">
          <img src="/logoFondoBlanco.svg" alt="Sabores del Hogar" />
        </Link>
        <section className="auth-ctas">
          <h1 className="auth-h1">¡Sabores únicos!<br/>¿Qué esperas para ser parte?</h1>
          <p className="auth-sub">Únete hoy</p>

          <button className="auth-btn auth-btn-light" type="button">
            <FcGoogle className="auth-ico" />
            Inicia sesión con Google
          </button>


          <div className="auth-div"><span>o</span></div>

          <button className="auth-btn auth-btn-primary" type="button" onClick={() => setShowSignup(true)}>
            Crear cuenta
          </button>

          <div className="auth-row">
            <span>¿Ya tienes una cuenta?</span>
            <button className="auth-link" type="button" onClick={() => setShowLogin(true)}>
              Iniciar sesión
            </button>
          </div>
        </section>

      </main>

      <LoginModal isOpen={showLogin} onClose={closeAll} onSwap={() => { setShowLogin(false); setShowSignup(true); }} />
      <SignupModal isOpen={showSignup} onClose={closeAll} onSwap={() => { setShowSignup(false); setShowLogin(true); }} />

      </div>
      <LoginModal
        isOpen={showLogin}
        onClose={closeAll}
        onSwap={() => { setShowLogin(false); setShowSignup(true); }}
      />
      <SignupModal
        isOpen={showSignup}
        onClose={closeAll}
        onSwap={() => { setShowSignup(false); setShowLogin(true); }}
      />

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

        const role = String(data.user?.rol || "").toLowerCase();
        // Admin a panel admin, usuario normal al Home real
        navigate(role === "admin" ? "/UserAdmin" : "/", { replace: true });

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
      {errors.global && <div className="auth-err" role="alert">{errors.global}</div>}
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        <div className={`af ${errors.email ? "invalid" : ""}`}>
          <label htmlFor="login-email">Correo electrónico</label>
          <input id="login-email" name="email" type="email" value={form.email} onChange={onChange} />
          {errors.email && <span className="auth-err">{errors.email}</span>}
        </div>
        <div className={`af ${errors.password ? "invalid" : ""}`}>
          <label htmlFor="login-pass">Contraseña</label>
          <div className="af-group">
            <input id="login-pass" name="password" type={showPass ? "text" : "password"} value={form.password} onChange={onChange} />
            <button type="button" className="af-eye" aria-pressed={showPass} onClick={() => setShowPass(v => !v)}>
              {showPass ? "🙈" : "👁️"}
            </button>
          </div>
          {errors.password && <span className="auth-err">{errors.password}</span>}
        </div>
        <div className="af-row">
          <label className="af-check">
            <input type="checkbox" name="remember" checked={form.remember} onChange={onChange} /> Recuérdame
          </label>
          <button type="button" className="auth-link">¿Olvidaste tu contraseña?</button>
        </div>
        <button type="submit" className="auth-btn auth-btn-primary" disabled={loading}>
          {loading ? "Ingresando..." : "Entrar"}
        </button>
      </form>
      <p className="auth-swap">¿No tienes cuenta? <button className="auth-link" onClick={onSwap}>Regístrate</button></p>
    </Modal>
  );
}

/* ================= Signup Modal ================= */
/* ===== Modal Registro ===== */
function SignupModal({ isOpen, onClose, onSwap }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({ global: "" });
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    password: "",
  });

  const setT = (n) => setTouched((t) => ({ ...t, [n]: true }));
  const hasVal = (n) => !!String(form[n] ?? "").trim();

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (touched[name] || submitted) validateField(name, value);
  };

  const validateField = (n, v) => {
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
    if (n === "nombre" && !String(v).trim()) msg = "Campo obligatorio";
    if (n === "apellido" && !String(v).trim()) msg = "Campo obligatorio";
    if (n === "correo") {
      if (!String(v).trim()) msg = "Ingresa tu correo";
      else if (!/\S+@\S+\.\S+/.test(v)) msg = "Correo inválido";
    }
    if (n === "password") {
      if (!String(v)) msg = "Crea una contraseña";
      else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{9,}$/.test(v)) msg = "Mín. 9, letras y números";
    }
    setErrors((e) => ({ ...e, [n]: msg }));
    return !msg;
  };

  const validateAll = () => {
    const fields = ["nombre", "apellido", "correo", "password"];
    return fields.map((f) => validateField(f, form[f])).every(Boolean);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setErrors((p) => ({ ...p, global: "" }));
    if (!validateAll()) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre,
          apellido: form.apellido,
          email: form.correo,
          password: form.password,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = data?.message || "Ocurrió un error en el registro";
        setErrors((p) => ({ ...p, global: msg }));
        return;
      }

      localStorage.setItem("sdh_user", JSON.stringify(data.user));
      onClose();
      // Tras registrarse, ir al Home real
      navigate("/", { replace: true });
    } catch {
      setErrors((p) => ({ ...p, global: "Error de conexión con el servidor" }));
    } finally {
      setLoading(false);
    }
  };

  const showErr = (name) => errors[name] && (touched[name] || submitted);

  return (
    <Modal isOpen={isOpen} title="Crear cuenta" onClose={onClose}>
      <form className="al-form al-modern al-grid-2" onSubmit={onSubmit} noValidate>
        {/* Nombre */}
        <div className={fieldClass("nombre")}>
          <input name="nombre" placeholder=" " value={form.nombre} onChange={onChange} onBlur={() => setT("nombre")} />
          <label>Nombre</label>
          {showErr("nombre") && <span className="al-msg-err">{errors.nombre}</span>}
  const fieldClass = (n) => {
    const inv = errors[n] && (touched[n] || submitted);
    const fill = hasVal(n);
    return `af ${inv ? "invalid" : ""} ${fill ? "filled" : ""}`;
  };
  const showErr = (n) => errors[n] && (touched[n] || submitted);

  return (
    <Modal isOpen={isOpen} title="Crear cuenta" onClose={onClose}>
      {errors.global && <div className="auth-err" role="alert">{errors.global}</div>}
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        <div className={fieldClass("nombre")}>
          <label htmlFor="reg-nombre">Nombre</label>
          <input id="reg-nombre" name="nombre" value={form.nombre} onChange={onChange} onBlur={()=>setT("nombre")} />
          {showErr("nombre") && <span className="auth-err">{errors.nombre}</span>}
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
          <label htmlFor="reg-apellido">Apellido</label>
          <input id="reg-apellido" name="apellido" value={form.apellido} onChange={onChange} onBlur={()=>setT("apellido")} />
          {showErr("apellido") && <span className="auth-err">{errors.apellido}</span>}
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
          <label htmlFor="reg-correo">Correo electrónico</label>
          <input id="reg-correo" type="email" name="correo" value={form.correo} onChange={onChange} onBlur={()=>setT("correo")} />
          {showErr("correo") && <span className="auth-err">{errors.correo}</span>}
        </div>

        <div className={`${fieldClass("password")} has-eye`}>
          <label htmlFor="reg-pass">Contraseña</label>
          <div className="af-group">
            <input
              id="reg-pass"
              name="password"
              type={showPass ? "text" : "password"}
              value={form.password}
              onChange={onChange}
              onBlur={()=>setT("password")}
              minLength={9}
              pattern="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{9,}$"
            />
            <button type="button" className="af-eye" aria-pressed={showPass} onClick={() => setShowPass(v => !v)}>
              {showPass ? "🙈" : "👁️"}
            </button>
          </div>
          <div className="auth-help">Mín. 9, letras y números.</div>
          {showErr("password") && <span className="auth-err">{errors.password}</span>}
        </div>

        <button type="submit" className="auth-btn auth-btn-primary" disabled={loading}>
          {loading ? "Creando cuenta..." : "Registrarse"}
        </button>
      </form>
      <p className="auth-swap">¿Ya tienes cuenta? <button className="auth-link" onClick={onSwap}>Inicia sesión</button></p>
    </Modal>
  );
}

const API_BASE = import.meta.env?.VITE_API_URL || "http://localhost:5000";
