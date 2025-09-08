import "./Login.css";
import { useState, useEffect, useRef, useMemo } from "react";
import { FcGoogle } from "react-icons/fc";
import { Header } from "../../componentes/Header";
import { Footer } from "../../componentes/Footer";
import { useNavigate } from "react-router-dom";


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

export default function AuthLanding() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const closeAll = () => { setShowLogin(false); setShowSignup(false); };

  return (
    <div className="login-page">
      <Header />
      <main className="al-middle">
        <svg className="al-wave al-wave--top" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 230" preserveAspectRatio="none">
          <path stroke="none" fill="#F8D7DA" fillOpacity="1" d="M0,192 C60,240 120,160 180,200 C240,240 300,120 360,180 C420,240 480,80 540,160 C600,240 660,100 720,180 C780,260 840,140 900,200 C960,260 1020,100 1080,160 C1140,220 1200,140 1260,200 C1320,260 1380,120 1440,180 L1440,320 L0,320 Z"/>
        </svg>

        <section className="al-grid al-hero">
          <div className="al-left">
            <div className="al-x-mark">
              <img src="/logoFondoBlanco.svg" alt="Sabores del Hogar" className="x-mark-img" />
            </div>
          </div>

          <div className="al-right">
            <h1 className="al-title">¡Sabores únicos!<br/>¿Qué esperas para ser parte?</h1>
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

        <svg className="al-wave al-wave--bottom" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 230" preserveAspectRatio="none">
          <path stroke="none" fill="#F8D7DA" fillOpacity="1" d="M0,192 C60,240 120,160 180,200 C240,240 300,120 360,180 C420,240 480,80 540,160 C600,240 660,100 720,180 C780,260 840,140 900,200 C960,260 1020,100 1080,160 C1140,220 1200,140 1260,200 C1320,260 1380,120 1440,180 L1440,320 L0,320 Z"/>
        </svg>
      </main>

      <Footer />

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
        navigate(role === "admin" ? "/UserAdmin" : "/UserNormal", { replace: true });
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
      {errors.global && <div className="al-msg-err" role="alert">{errors.global}</div>}

      <form className="al-form" onSubmit={onSubmit} noValidate>
        <div className={`al-field ${errors.email ? "invalid" : ""}`}>
          <label htmlFor="login-email">Correo electrónico</label>
          <input
            id="login-email"
            name="email"
            type="email"
            placeholder="correo@ejemplo.com"
            value={form.email}
            onChange={onChange}
            aria-invalid={!!errors.email}
          />
          {errors.email && <span className="al-msg-err" role="alert">{errors.email}</span>}
        </div>

        <div className={`al-field ${errors.password ? "invalid" : ""}`}>
          <label htmlFor="login-pass">Contraseña</label>
          <div className="al-input-group">
            <input
              id="login-pass"
              name="password"
              type={showPass ? "text" : "password"}
              placeholder="Tu contraseña"
              value={form.password}
              onChange={onChange}
              aria-invalid={!!errors.password}
            />
            <button
              type="button"
              className="al-eye"
              aria-pressed={showPass}
              onClick={() => setShowPass((v) => !v)}
            >
              {showPass ? "🙈" : "👁️"}
            </button>
          </div>
          {errors.password && <span className="al-msg-err" role="alert">{errors.password}</span>}
        </div>

        <div className="al-row-split">
          <label className="al-check">
            <input
              type="checkbox"
              name="remember"
              checked={form.remember}
              onChange={onChange}
            />{" "}
            Recuérdame
          </label>
          <button type="button" className="al-link">¿Olvidaste tu contraseña?</button>
        </div>

        <button type="submit" className="al-btn al-btn-primary" disabled={loading}>
          {loading ? "Ingresando..." : "Entrar"}
        </button>
      </form>

      <p className="al-switch">
        ¿No tienes cuenta? <button className="al-link" onClick={onSwap}>Regístrate</button>
      </p>
    </Modal>
  );
}


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
    if (name === "nombre" && !String(value).trim()) msg = "Campo obligatorio";
    if (name === "apellido" && !String(value).trim()) msg = "Campo obligatorio";
    if (name === "rut") {
      if (!String(value).trim()) msg = "Ingresa tu RUT";
      else if (!/^(\d{1,2}\.\d{3}\.\d{3}-[\dkK])$/.test(value)) msg = "RUT inválido";
    }
    if (name === "correo") {
      if (!String(value).trim()) msg = "Ingresa tu correo";
      else if (!/\S+@\S+\.\S+/.test(value)) msg = "Correo inválido";
    }
    if (name === "password") {
      if (!String(value)) msg = "Crea una contraseña";
      else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{9,}$/.test(value)) msg = "Mín. 9, letras y números";
    }
    if (name === "telefono") {
      if (!String(value).trim()) msg = "Ingresa tu teléfono";
      else if (!/^\+56\d{8,9}$/.test(value)) msg = "Formato +56XXXXXXXX";
    }
    if (name === "fechaNacimiento" && !String(value).trim()) msg = "Selecciona tu fecha";
    if (name === "accept" && !value) msg = "Debes aceptar los términos";
    setErrors((e) => ({ ...e, [name]: msg }));
    return !msg;
  };

  const validateAll = () => {
    const fields = ["nombre","apellido","rut","correo","password","telefono","fechaNacimiento","accept"];
    return fields.map((f) => validateField(f, form[f])).every(Boolean);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (!validateAll()) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); onClose(); }, 1000);
  };

  const fieldClass = (name) => {
    const inv = errors[name] && (touched[name] || submitted);
    const fill = hasVal(name);
    return `fl ${inv ? "invalid" : ""} ${fill ? "filled" : ""}`;
  };
  const showErr = (name) => errors[name] && (touched[name] || submitted);

  return (
    <Modal isOpen={isOpen} title="Crear cuenta" onClose={onClose}>
      <form className="al-form al-modern al-grid-2" onSubmit={onSubmit} noValidate>
        <div className={fieldClass("nombre")}>
          <input id="reg-nombre" name="nombre" placeholder=" " value={form.nombre} onChange={onChange} onBlur={()=>setT("nombre")} aria-invalid={!!showErr("nombre")}/>
          <label htmlFor="reg-nombre">Nombre</label>
          {showErr("nombre") && <span className="al-msg-err" role="alert">{errors.nombre}</span>}
        </div>

        <div className={fieldClass("apellido")}>
          <input id="reg-apellido" name="apellido" placeholder=" " value={form.apellido} onChange={onChange} onBlur={()=>setT("apellido")} aria-invalid={!!showErr("apellido")}/>
          <label htmlFor="reg-apellido">Apellido</label>
          {showErr("apellido") && <span className="al-msg-err" role="alert">{errors.apellido}</span>}
        </div>

        <div className={fieldClass("rut")}>
          <input id="reg-rut" name="rut" placeholder=" " value={form.rut} onChange={onChange} onBlur={()=>setT("rut")} pattern="^(\d{1,2}\.\d{3}\.\d{3}-[\dkK])$" aria-invalid={!!showErr("rut")}/>
          <label htmlFor="reg-rut">RUT</label>
          {showErr("rut") && <span className="al-msg-err" role="alert">{errors.rut}</span>}
        </div>

        <div className={fieldClass("correo")}>
          <input id="reg-correo" type="email" name="correo" placeholder=" " value={form.correo} onChange={onChange} onBlur={()=>setT("correo")} aria-invalid={!!showErr("correo")}/>
          <label htmlFor="reg-correo">Correo electrónico</label>
          {showErr("correo") && <span className="al-msg-err" role="alert">{errors.correo}</span>}
        </div>

        <div className={`${fieldClass("password")} has-eye`}>
          <input id="reg-pass" name="password" type={showPass ? "text" : "password"} placeholder=" " value={form.password} onChange={onChange} onBlur={()=>setT("password")} minLength={9} pattern="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{9,}$" aria-invalid={!!showErr("password")}/>
          <label htmlFor="reg-pass">Contraseña</label>
          <button type="button" className="al-eye" aria-pressed={showPass} onClick={() => setShowPass(v => !v)}>{showPass ? "🙈" : "👁️"}</button>
          <div className="al-help">Mín. 9, letras y números.</div>
          {showErr("password") && <span className="al-msg-err" role="alert">{errors.password}</span>}
        </div>

        <div className={fieldClass("telefono")}>
          <input id="reg-tel" name="telefono" placeholder=" " value={form.telefono} onChange={onChange} onBlur={()=>setT("telefono")} aria-invalid={!!showErr("telefono")}/>
          <label htmlFor="reg-tel">Teléfono</label>
          {showErr("telefono") && <span className="al-msg-err" role="alert">{errors.telefono}</span>}
        </div>

        <div className={`${fieldClass("fechaNacimiento")} filled`}>
          <input id="reg-fecha" type="date" name="fechaNacimiento" placeholder=" " value={form.fechaNacimiento} onChange={onChange} onBlur={()=>setT("fechaNacimiento")} aria-invalid={!!showErr("fechaNacimiento")}/>
          <label htmlFor="reg-fecha">Fecha de nacimiento</label>
          {showErr("fechaNacimiento") && <span className="al-msg-err" role="alert">{errors.fechaNacimiento}</span>}
        </div>

        <div className="fl al-span-2">
          <input id="reg-dir" name="direccion" placeholder=" " value={form.direccion} onChange={onChange}/>
          <label htmlFor="reg-dir">Dirección (opcional)</label>
        </div>

        <div className={`al-terms al-span-2 ${showErr("accept") ? "invalid" : ""}`}>
          <label className="al-check">
            <input type="checkbox" name="accept" checked={form.accept} onChange={onChange} onBlur={()=>setT("accept")} />
            Acepto los Términos y la Política de Privacidad
          </label>
        </div>
        {showErr("accept") && <span className="al-msg-err al-span-2" role="alert">{errors.accept}</span>}

        <button type="submit" className="al-btn al-btn-primary al-span-2" disabled={loading}>{loading ? "Creando cuenta..." : "Registrarse"}</button>
      </form>

      <p className="al-switch">¿Ya tienes cuenta? <button className="al-link" onClick={onSwap}>Inicia sesión</button></p>
    </Modal>
  );
}
const API_BASE = import.meta.env?.VITE_API_URL || "http://localhost:5000";

function cleanRut(r) {
  return String(r || "").replace(/[.\-]/g, "").toUpperCase();
}
function validateRut(rut) {
  const c = cleanRut(rut);
  if (!/^\d{7,8}[0-9K]$/.test(c)) return false;
  const body = c.slice(0, -1);
  const dv = c.slice(-1);
  let sum = 0, m = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += m * parseInt(body[i], 10);
    m = m === 7 ? 2 : m + 1;
  }
  const d = 11 - (sum % 11);
  const dvCalc = d === 11 ? "0" : d === 10 ? "K" : String(d);
  return dvCalc === dv;
}
function isStrong(pass) {
  if (!pass) return false;
  return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{9,}$/.test(pass);
}
function same(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function ProfileModal({ isOpen, onClose, user, onSaved }) {
  const initial = useMemo(() => ({
    nombre: user?.nombre || "",
    apellido: user?.apellido || "",
    rut: user?.rut || "",
    correo: user?.email || user?.correo || "",
    telefono: user?.telefono || "",
    fechaNacimiento: user?.fecha_nacimiento || user?.fechaNacimiento || "",
    direccion: user?.direccion || "",
    password: ""
  }), [user]);

  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState("");

  useEffect(() => {
    if (isOpen) {
      setForm(initial);
      setErrors({});
      setOk("");
    }
  }, [isOpen, initial]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setOk("");
  };

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "Ingresa tu nombre";
    if (!form.apellido.trim()) e.apellido = "Ingresa tu apellido";
    if (form.rut && !validateRut(form.rut)) e.rut = "RUT inválido";
    if (!/\S+@\S+\.\S+/.test(form.correo)) e.correo = "Correo inválido";
    if (form.telefono && !/^\+?56\d{8,9}$/.test(String(form.telefono).replace(/\s/g, ""))) e.telefono = "Formato +56XXXXXXXX";
    if (form.password && !isStrong(form.password)) e.password = "Mín. 9, letras y números";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const dirty = useMemo(() => {
    const comp = { ...form, password: "" };
    const base = { ...initial, password: "" };
    return !same(comp, base) || !!form.password;
  }, [form, initial]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || !dirty || saving) return;

    const diff = {};
    Object.keys(form).forEach((k) => {
      if (k === "password") {
        if (form.password) diff.password = form.password;
      } else if (form[k] !== initial[k]) {
        if (k === "correo") diff.email = form[k];
        else if (k === "fechaNacimiento") diff.fecha_nacimiento = form[k];
        else diff[k] = form[k];
      }
    });
    if (Object.keys(diff).length === 0) return;

    setSaving(true);
    setOk("");
    try {
      const id = user?.id || user?.id_usuario || user?.id_user || "";
      const url = `${API_BASE}/api/usuarios/${id}`;
      const r = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(diff),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && (j.ok ?? true)) {
        const merged = {
          ...user,
          ...diff,
          email: diff.email ?? user?.email,
          fecha_nacimiento: diff.fecha_nacimiento ?? user?.fecha_nacimiento
        };
        onSaved && onSaved(merged);
        setOk("Perfil actualizado");
      } else {
        setErrors((p) => ({ ...p, global: j.message || "No se pudo guardar" }));
      }
    } catch {
      setErrors((p) => ({ ...p, global: "Error de red" }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} title="Mi perfil" onClose={onClose}>
      {errors.global && <div className="profile-alert">{errors.global}</div>}
      {ok && <div className="profile-ok">{ok}</div>}

      <form className="al-form al-form-grid" onSubmit={onSubmit} noValidate>
        <div className="al-form-row">
          <div className={`al-field ${errors.nombre ? "invalid" : ""}`}>
            <label>Nombre</label>
            <input name="nombre" value={form.nombre} onChange={onChange} />
            {errors.nombre && <span className="al-msg-err">{errors.nombre}</span>}
          </div>
          <div className={`al-field ${errors.apellido ? "invalid" : ""}`}>
            <label>Apellido</label>
            <input name="apellido" value={form.apellido} onChange={onChange} />
            {errors.apellido && <span className="al-msg-err">{errors.apellido}</span>}
          </div>
        </div>

        <div className="al-form-row">
          <div className={`al-field ${errors.rut ? "invalid" : ""}`}>
            <label>RUT</label>
            <input name="rut" value={form.rut} onChange={onChange} />
            {errors.rut && <span className="al-msg-err">{errors.rut}</span>}
          </div>
          <div className={`al-field ${errors.correo ? "invalid" : ""}`}>
            <label>Correo electrónico</label>
            <input name="correo" type="email" value={form.correo} onChange={onChange} />
            {errors.correo && <span className="al-msg-err">{errors.correo}</span>}
          </div>
        </div>

        <div className="al-form-row">
          <div className={`al-field ${errors.telefono ? "invalid" : ""}`}>
            <label>Teléfono</label>
            <input name="telefono" value={form.telefono} onChange={onChange} />
            {errors.telefono && <span className="al-msg-err">{errors.telefono}</span>}
          </div>
          <div className="al-field">
            <label>Fecha de nacimiento</label>
            <input name="fechaNacimiento" type="date" value={form.fechaNacimiento} onChange={onChange} />
          </div>
        </div>

        <div className="al-field">
          <label>Dirección</label>
          <input name="direccion" value={form.direccion} onChange={onChange} />
        </div>

        <div className={`al-field ${errors.password ? "invalid" : ""}`}>
          <label>Nueva contraseña</label>
          <input name="password" type="password" value={form.password} onChange={onChange} placeholder="Dejar en blanco si no deseas cambiarla" />
          {errors.password && <span className="al-msg-err">{errors.password}</span>}
          <div className="al-help">Mínimo 9 caracteres, debe incluir letras y números.</div>
        </div>

        <div className="profile-actions">
          <button type="submit" className="al-btn al-btn-primary" disabled={saving || !dirty}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
