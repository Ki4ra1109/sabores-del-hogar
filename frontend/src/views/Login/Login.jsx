import "./Login.css";
import { useState, useEffect, useRef } from "react";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";

const API_BASE = import.meta.env?.VITE_API_URL || "http://localhost:5000";

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

export default function Login() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const navigate = useNavigate();

  // Recuperación (un solo modal tipo switch)
  const [showForgot, setShowForgot] = useState(false);

  // Completar cuenta (Google)
  const [showComplete, setShowComplete] = useState(false);
  const [gEmail, setGEmail] = useState("");
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [errC, setErrC] = useState("");

  const openLogin = () => { setShowSignup(false); setShowLogin(true); };
  const openSignup = () => { setShowLogin(false); setShowSignup(true); };
  const closeAll = () => {
    setShowLogin(false);
    setShowSignup(false);
    setShowForgot(false);
    setShowComplete(false);
  };
  const openForgot = () => { setShowLogin(false); setShowForgot(true); };

  const googleLogin = useGoogleLogin({
    flow: "implicit",
    ux_mode: "popup",
    onSuccess: async (tokenResponse) => {
      try {
        const access_token = tokenResponse?.access_token;
        if (!access_token) throw new Error("No se recibió access_token");

        const res = await fetch(`${API_BASE}/api/auth/google-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "No se pudo iniciar sesión con Google");

        if (data.user) localStorage.setItem("sdh_user", JSON.stringify(data.user));
        if (data.token) localStorage.setItem("sdh_token", data.token);

        const must = !!data.isNew || !!data.user?.mustSetPassword;
        if (must) {
          setGEmail(data.user?.email || "");
          setShowComplete(true);
          return;
        }

        const role = String(data.user?.rol || data.user?.role || "").toLowerCase();
        navigate(role === "admin" ? "/UserAdmin" : "/", { replace: true });
      } catch (err) {
        alert(err.message || "Error de autenticación con Google");
      }
    },
    onError: () => alert("Se canceló o falló el inicio de sesión con Google"),
  });

  const guardarPasswordNueva = async () => {
    setErrC("");
    if (p1 !== p2) return setErrC("Las contraseñas no coinciden");
    const ok = p1.length >= 9 && /[A-Za-z]/.test(p1) && /\d/.test(p1);
    if (!ok) return setErrC("Mínimo 9 caracteres con letras y números");
    try {
      const token = localStorage.getItem("sdh_token") || "";
      const res = await fetch(`${API_BASE}/api/usuarios/me/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword: p1 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "No se pudo guardar la contraseña");

      const u = JSON.parse(localStorage.getItem("sdh_user") || "{}");
      localStorage.setItem("sdh_user", JSON.stringify({ ...u, mustSetPassword: false }));
      setShowComplete(false);
      const role = String(u?.rol || u?.role || "").toLowerCase();
      navigate(role === "admin" ? "/UserAdmin" : "/", { replace: true });
    } catch (e) {
      setErrC(e.message || "Error al guardar");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <Link to="/" className="auth-logo" aria-label="Ir al inicio" title="Ir al inicio">
          <img src="/logoFondoBlanco.svg" alt="Sabores del Hogar" />
        </Link>

        <section className="auth-ctas">
          <h1 className="auth-h1">¡Sabores únicos!</h1>
          <p className="auth-sub">Únete hoy</p>

          <button className="auth-btn auth-btn-light" type="button" onClick={googleLogin}>
            <FcGoogle className="auth-ico" />
            Inicia sesión con Google
          </button>

          <div className="auth-div"><span>o</span></div>

          <button className="auth-btn auth-btn-primary" type="button" onClick={openSignup}>
            Crear cuenta
          </button>

          <div className="auth-row">
            <span>¿Ya tienes una cuenta?</span>
            <button className="auth-link" type="button" onClick={openLogin}>
              Iniciar sesión
            </button>
          </div>
        </section>
      </div>

      <LoginModal isOpen={showLogin} onClose={closeAll} onSwap={openSignup} onForgot={openForgot} />
      <SignupModal isOpen={showSignup} onClose={closeAll} onSwap={openLogin} />

      {/* Completar cuenta (Google) */}
      <Modal isOpen={showComplete} title="Completa tu cuenta" onClose={() => setShowComplete(false)}>
        <div className="auth-form" style={{ gap: 8 }}>
          <div className="af filled">
            <label>Correo</label>
            <input value={gEmail} readOnly />
          </div>
          <div className="af">
            <label>Nueva contraseña</label>
            <input
              type="password"
              value={p1}
              onChange={(e) => setP1(e.target.value)}
              minLength={9}
              pattern="^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{9,}$"
              placeholder="Mín. 9, letras y números"
            />
          </div>
          <div className="af">
            <label>Confirmar contraseña</label>
            <input
              type="password"
              value={p2}
              onChange={(e) => setP2(e.target.value)}
              minLength={9}
              pattern="^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{9,}$"
            />
          </div>
          {errC && <div className="auth-err" role="alert">{errC}</div>}
          <button className="auth-btn auth-btn-primary" type="button" onClick={guardarPasswordNueva}>
            Guardar
          </button>
        </div>
      </Modal>

      {/* Recuperación con switch */}
      <RecoverModal isOpen={showForgot} onClose={() => setShowForgot(false)} />
    </div>
  );
}

function LoginModal({ isOpen, onClose, onSwap, onForgot }) {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({ email: "", password: "" });

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

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
      if (!res.ok) {
        setErrors((p) => ({ ...p, global: data.message || "Credenciales inválidas" }));
        return;
      }
      localStorage.setItem("sdh_user", JSON.stringify(data.user));
      if (data.token) localStorage.setItem("sdh_token", data.token);
      onClose();
      const role = String(data.user?.rol || data.user?.role || "").toLowerCase();
      navigate(role === "admin" ? "/UserAdmin" : "/", { replace: true });
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

        <button type="submit" className="auth-btn auth-btn-primary" disabled={loading}>
          {loading ? "Ingresando..." : "Entrar"}
        </button>
      </form>

      <div className="auth-row" style={{ marginTop: 8 }}>
        <button className="auth-link" type="button" onClick={onForgot}>
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <p className="auth-swap">¿No tienes cuenta? <button className="auth-link" type="button" onClick={onSwap}>Regístrate</button></p>
    </Modal>
  );
}

function SignupModal({ isOpen, onClose, onSwap }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({ global: "" });
  const [form, setForm] = useState({ nombre: "", apellido: "", correo: "", password: "" });

  const setT = (n) => setTouched((t) => ({ ...t, [n]: true }));
  const hasVal = (n) => !!String(form[n] ?? "").trim();

  const fieldClass = (n) => {
    const inv = errors[n] && (touched[n] || submitted);
    const fill = hasVal(n);
    return `af ${inv ? "invalid" : ""} ${fill ? "filled" : ""}`;
  };
  const showErr = (n) => errors[n] && (touched[n] || submitted);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (touched[name] || submitted) validateField(name, value);
  };

  const validateField = (n, v) => {
    let msg = "";
    if ((n === "nombre" || n === "apellido") && !String(v).trim()) msg = "Campo obligatorio";
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
        setErrors((p) => ({ ...p, global: data?.message || "Ocurrió un error en el registro" }));
        return;
      }
      localStorage.setItem("sdh_user", JSON.stringify(data.user));
      onClose();
      navigate("/", { replace: true });
    } catch {
      setErrors((p) => ({ ...p, global: "Error de conexión con el servidor" }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} title="Crear cuenta" onClose={onClose}>
      {errors.global && <div className="auth-err" role="alert">{errors.global}</div>}
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        <div className={fieldClass("nombre")}>
          <label htmlFor="reg-nombre">Nombre</label>
          <input id="reg-nombre" name="nombre" value={form.nombre} onChange={onChange} onBlur={() => setT("nombre")} />
          {showErr("nombre") && <span className="auth-err">{errors.nombre}</span>}
        </div>

        <div className={fieldClass("apellido")}>
          <label htmlFor="reg-apellido">Apellido</label>
          <input id="reg-apellido" name="apellido" value={form.apellido} onChange={onChange} onBlur={() => setT("apellido")} />
          {showErr("apellido") && <span className="auth-err">{errors.apellido}</span>}
        </div>

        <div className={fieldClass("correo")}>
          <label htmlFor="reg-correo">Correo electrónico</label>
          <input id="reg-correo" name="correo" type="email" value={form.correo} onChange={onChange} onBlur={() => setT("correo")} />
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
              onBlur={() => setT("password")}
              minLength={9}
              pattern="^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{9,}$"
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
      <p className="auth-swap">¿Ya tienes cuenta? <button className="auth-link" type="button" onClick={onSwap}>Inicia sesión</button></p>
    </Modal>
  );
}

/** ====== Recuperación con switch (como en Header) ====== */
function RecoverModal({ isOpen, onClose }) {
  const [tab, setTab] = useState("send"); // 'send' | 'enter'
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTab("send"); setEmail(""); setCode(""); setP1(""); setP2(""); setMsg(""); setErr("");
    }
  }, [isOpen]);

  const validatePass = (s) => s.length >= 9 && /[A-Za-z]/.test(s) && /\d/.test(s);

  const send = async () => {
    setErr(""); setMsg("");
    if (!/\S+@\S+\.\S+/.test(email)) return setErr("Ingresa un email válido");
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/auth/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Error al enviar código");
      setMsg("Si el correo existe, enviamos un código de 6 dígitos.");
      // Pasar automáticamente a la pestaña de código
      setTab("enter");
    } catch (e) {
      setErr(e.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  const reset = async () => {
    setErr(""); setMsg("");
    if (!/\S+@\S+\.\S+/.test(email)) return setErr("Email inválido");
    if (!/^\d{6}$/.test(code)) return setErr("Código de 6 dígitos");
    if (p1 !== p2) return setErr("Las contraseñas no coinciden");
    if (!validatePass(p1)) return setErr("Mín. 9, letras y números");
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/auth/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword: p1 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "No se pudo actualizar");
      setMsg("Contraseña actualizada. Ya puedes iniciar sesión.");
    } catch (e) {
      setErr(e.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} title="Recuperar contraseña" onClose={onClose}>
      {/* Switch minimalista */}
      <div className="seg" style={{ marginBottom: 12 }}>
        <div className="seg-inner">
          <div
            className="seg-pill"
            style={{
              transform: tab === "send" ? "translateX(0)" : "translateX(100%)",
              transition: "transform .25s ease",
            }}
          />
          <button
            type="button"
            className={`seg-btn ${tab === "send" ? "active" : ""}`}
            onClick={() => setTab("send")}
          >
            Enviar código
          </button>
          <button
            type="button"
            className={`seg-btn ${tab === "enter" ? "active" : ""}`}
            onClick={() => setTab("enter")}
          >
            Ingresar código
          </button>
        </div>
      </div>

      <div className="auth-form" style={{ gap: 10 }}>
        {/* Campo común: correo */}
        <div className="af">
          <label>Correo</label>
          <input
            type="email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            placeholder="tu@email.com"
          />
        </div>

        {tab === "send" ? (
          <>
            <div className="auth-help" style={{ marginTop: -6 }}>
              Si el correo existe, enviaremos un código de 6 dígitos.
            </div>
            {err && <div className="auth-err" role="alert">{err}</div>}
            {msg && <div className="auth-ok" role="status">{msg}</div>}
            <button className="auth-btn auth-btn-primary" type="button" onClick={send} disabled={loading}>
              {loading ? "Enviando..." : "Enviar código"}
            </button>
          </>
        ) : (
          <>
            <div className="af">
              <label>Código</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="\\d{6}"
                maxLength={6}
                value={code}
                onChange={(e)=>setCode(e.target.value)}
                placeholder="6 dígitos"
              />
            </div>
            <div className="af">
              <label>Nueva contraseña</label>
              <input type="password" value={p1} onChange={(e)=>setP1(e.target.value)} minLength={9} />
            </div>
            <div className="af">
              <label>Confirmar contraseña</label>
              <input type="password" value={p2} onChange={(e)=>setP2(e.target.value)} minLength={9} />
            </div>
            {err && <div className="auth-err" role="alert">{err}</div>}
            {msg && <div className="auth-ok" role="status">{msg}</div>}
            <button className="auth-btn auth-btn-primary" type="button" onClick={reset} disabled={loading}>
              {loading ? "Actualizando..." : "Actualizar contraseña"}
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}
