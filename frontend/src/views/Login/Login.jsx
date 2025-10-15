import "./Login.css";
import { useState, useEffect, useRef } from "react";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const API_BASE = import.meta.env?.VITE_API_URL || "http://localhost:5000";

function DotsInline() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }} role="status" aria-live="polite">
      <style>{`
        @keyframes sdhDots { 0%,80%,100%{transform:translateY(0);opacity:.6} 40%{transform:translateY(-5px);opacity:1} }
        .sdh-dot{width:6px;height:6px;border-radius:50%;background:currentColor;animation:sdhDots 1s infinite}
        .sdh-dot:nth-child(1){animation-delay:0s}
        .sdh-dot:nth-child(2){animation-delay:.15s}
        .sdh-dot:nth-child(3){animation-delay:.3s}
      `}</style>
      <span className="sdh-dot" />
      <span className="sdh-dot" />
      <span className="sdh-dot" />
    </span>
  );
}

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

  const [showForgot, setShowForgot] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [gEmail, setGEmail] = useState("");
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [errC, setErrC] = useState("");
  const [saving, setSaving] = useState(false);
  const [heroBusySignup, setHeroBusySignup] = useState(false);
  const [heroBusyLogin, setHeroBusyLogin] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    const tempToken = params.get('tempToken');
    const token = params.get('token');
    const user = params.get('user');

    if (action === 'completeGoogle' && tempToken) {
      try {
        sessionStorage.setItem('tempGoogleToken', tempToken);
        const decoded = jwtDecode(tempToken);
        setGEmail(decoded.email);
        setShowComplete(true);
        navigate('/login', { replace: true });
      } catch (error) {
        console.error("Error al procesar token temporal:", error);
        alert("Hubo un error al procesar tu registro con Google.");
      }
    }

    if (token && user) {
        localStorage.setItem("sdh_user", user);
        localStorage.setItem("sdh_token", token);
        const userData = JSON.parse(user);
        const role = String(userData.rol || "").toLowerCase();
        navigate(role === "admin" ? "/UserAdmin" : "/", { replace: true });
    }
  }, [navigate]);

  const openLogin = () => { setShowSignup(false); setShowLogin(true); };
  const openSignup = () => { setShowLogin(false); setShowSignup(true); };
  const closeAll = () => {
    setShowLogin(false);
    setShowSignup(false);
    setShowForgot(false);
    setShowComplete(false);
  };
  const openForgot = () => { setShowLogin(false); setShowForgot(true); };

  const openLoginHero = async () => {
    setHeroBusyLogin(true);
    await new Promise(r => setTimeout(r, 1500));
    setHeroBusyLogin(false);
    openLogin();
  };
  const openSignupHero = async () => {
    setHeroBusySignup(true);
    await new Promise(r => setTimeout(r, 1500));
    setHeroBusySignup(false);
    openSignup();
  };

  const guardarPasswordNueva = async () => {
    setErrC("");
    if (p1 !== p2) return setErrC("Las contraseñas no coinciden");
    const ok = p1.length >= 9 && /[A-Za-z]/.test(p1) && /\d/.test(p1);
    if (!ok) return setErrC("Mínimo 9 caracteres con letras y números");
    const t0 = Date.now();
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    try {
      setSaving(true);
      const tempToken = sessionStorage.getItem('tempGoogleToken');
      if (!tempToken) throw new Error("No se encontró el token temporal de registro.");

      const res = await fetch(`${API_BASE}/api/auth/google/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempToken, password: p1 }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "No se pudo completar el registro");

      sessionStorage.removeItem('tempGoogleToken');
      
      localStorage.setItem("sdh_user", JSON.stringify(data.user));
      localStorage.setItem("sdh_token", data.token);
      
      setShowComplete(false);
      
      navigate("/", { replace: true }); 

    } catch (e) {
      setErrC(e.message || "Error al guardar");
    } finally {
      const elapsed = Date.now() - t0;
      if (elapsed < 1500) await sleep(1500 - elapsed);
      setSaving(false);
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

          <a className="auth-btn auth-btn-light" href={`${API_BASE}/api/auth/google`}>
            <FcGoogle className="auth-ico" />
            Inicia sesión con Google
          </a>

          <div className="auth-div"><span>o</span></div>

          <button
            className="auth-btn auth-btn-primary"
            type="button"
            onClick={openSignupHero}
            disabled={heroBusySignup}
            style={{ position: "relative", minHeight: 44 }}
          >
            <span style={{ opacity: heroBusySignup ? 0 : 1, transition: "opacity .15s" }}>Crear cuenta</span>
            {heroBusySignup && (
              <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <DotsInline />
              </span>
            )}
          </button>

          <div className="auth-row">
            <span>¿Ya tienes una cuenta?</span>
            <button
              className="auth-link"
              type="button"
              onClick={openLoginHero}
              disabled={heroBusyLogin}
              style={{ position: "relative", minHeight: 28 }}
            >
              <span style={{ opacity: heroBusyLogin ? 0 : 1, transition: "opacity .15s" }}>Iniciar sesión</span>
              {heroBusyLogin && (
                <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <DotsInline />
                </span>
              )}
            </button>
          </div>
        </section>
      </div>

      <LoginModal isOpen={showLogin} onClose={closeAll} onSwap={openSignup} onForgot={openForgot} />
      <SignupModal isOpen={showSignup} onClose={closeAll} onSwap={openLogin} />
      
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
          <button
            className="auth-btn auth-btn-primary"
            type="button"
            onClick={guardarPasswordNueva}
            disabled={saving}
            style={{ position: "relative", minHeight: 44 }}
          >
            <span style={{ opacity: saving ? 0 : 1, transition: "opacity .15s" }}>Guardar</span>
            {saving && (
              <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <DotsInline />
              </span>
            )}
          </button>
        </div>
      </Modal>

      <RecoverModal
        isOpen={showForgot}
        onClose={() => setShowForgot(false)}
        onGoSignup={() => { setShowForgot(false); setShowSignup(true); }}
      />
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
    const t0 = Date.now();
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
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
      const elapsed = Date.now() - t0;
      if (elapsed < 1500) await sleep(1500 - elapsed);
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

        <button type="submit" className="auth-btn auth-btn-primary" disabled={loading} style={{ position: "relative", minHeight: 44 }}>
          <span style={{ opacity: loading ? 0 : 1, transition: "opacity .15s" }}>Entrar</span>
          {loading && (
            <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <DotsInline />
            </span>
          )}
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
    const t0 = Date.now();
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
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
      const elapsed = Date.now() - t0;
      if (elapsed < 1500) await sleep(1500 - elapsed);
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

        <button type="submit" className="auth-btn auth-btn-primary" disabled={loading} style={{ position: "relative", minHeight: 44 }}>
          <span style={{ opacity: loading ? 0 : 1, transition: "opacity .15s" }}>Registrarse</span>
          {loading && (
            <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <DotsInline />
            </span>
          )}
        </button>
      </form>
      <p className="auth-swap">¿Ya tienes cuenta? <button className="auth-link" type="button" onClick={onSwap}>Inicia sesión</button></p>
    </Modal>
  );
}

function RecoverModal({ isOpen, onClose, onGoSignup }) {
  const [tab, setTab] = useState("send");
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
    const t0 = Date.now();
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    try {
      setLoading(true);

      const chk = await fetch(`${API_BASE}/api/auth/check-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const cj = await chk.json().catch(() => ({}));
      if (!chk.ok) throw new Error(cj?.message || "Error validando correo");
      if (!cj.exists) {
        if (typeof onGoSignup === "function") onGoSignup();
        return;
      }

      const res = await fetch(`${API_BASE}/api/auth/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Error al enviar código");
      setMsg("Si el correo existe, enviamos un código de 6 dígitos.");
      setTab("enter");
    } catch (e) {
      setErr(e.message || "Error");
    } finally {
      const elapsed = Date.now() - t0;
      if (elapsed < 1500) await sleep(1500 - elapsed);
      setLoading(false);
    }
  };

  const reset = async () => {
    setErr(""); setMsg("");
    if (!/\S+@\S+\.\S+/.test(email)) return setErr("Email inválido");
    if (!/^\d{6}$/.test(code)) return setErr("Código de 6 dígitos");
    if (p1 !== p2) return setErr("Las contraseñas no coinciden");
    if (!validatePass(p1)) return setErr("Mín. 9, letras y números");
    const t0 = Date.now();
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
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
      const elapsed = Date.now() - t0;
      if (elapsed < 1500) await sleep(1500 - elapsed);
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} title="Recuperar contraseña" onClose={onClose}>
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
            <button
              className="auth-btn auth-btn-primary"
              type="button"
              onClick={send}
              disabled={loading}
              style={{ position: "relative", minHeight: 44 }}
            >
              <span style={{ opacity: loading ? 0 : 1, transition: "opacity .15s" }}>Enviar código</span>
              {loading && (
                <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <DotsInline />
                </span>
              )}
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
            <button
              className="auth-btn auth-btn-primary"
              type="button"
              onClick={reset}
              disabled={loading}
              style={{ position: "relative", minHeight: 44 }}
            >
              <span style={{ opacity: loading ? 0 : 1, transition: "opacity .15s" }}>Actualizar contraseña</span>
              {loading && (
                <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <DotsInline />
                </span>
              )}
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}
