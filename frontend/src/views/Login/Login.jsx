import "./Login.css";
import { useState, useEffect, useRef } from "react";
import { FcGoogle } from "react-icons/fc";
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

/* pagina login */
export default function Login() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const closeAll = () => { setShowLogin(false); setShowSignup(false); };

  return (
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

/* ===== Modal Login ===== */
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
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        localStorage.setItem("sdh_user", JSON.stringify(data.user));
        onClose();
        const role = String(data.user?.rol || "").toLowerCase();
        // Admin a panel admin, usuario normal al Home real
        navigate(role === "admin" ? "/UserAdmin" : "/", { replace: true });
      } else {
        setErrors((p) => ({ ...p, global: data.message || "Email o contraseña incorrecta" }));
      }
    } catch {
      setErrors((p) => ({ ...p, global: "Error de conexión con el servidor" }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} title="Iniciar sesión" onClose={onClose}>
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

        <div className={fieldClass("apellido")}>
          <label htmlFor="reg-apellido">Apellido</label>
          <input id="reg-apellido" name="apellido" value={form.apellido} onChange={onChange} onBlur={()=>setT("apellido")} />
          {showErr("apellido") && <span className="auth-err">{errors.apellido}</span>}
        </div>

        <div className={fieldClass("correo")}>
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
