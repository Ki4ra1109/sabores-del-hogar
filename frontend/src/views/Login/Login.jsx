import "./Login.css";
import { useState, useEffect, useRef } from "react";
import { FcGoogle } from "react-icons/fc";

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
        <button className="al-modal-close" onClick={onClose} aria-label="Cerrar" ref={firstFocusable}>
          ✕
        </button>
        {title && <h3 className="al-modal-title">{title}</h3>}
        <div className="al-modal-body">{children}</div>
      </div>
    </div>
  );
}

export default function AuthLanding() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const openLogin = () => { setShowSignup(false); setShowLogin(true); };
  const openSignup = () => { setShowLogin(false); setShowSignup(true); };
  const closeAll = () => { setShowLogin(false); setShowSignup(false); };

  return (
    <div className="al-landing">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 230" style={{ display: "block", transform: "scaleY(-1)" }}>
        <path
          stroke="none"
          fill="#F8D7DA"
          fillOpacity="1"
          d="M0,192 C60,240 120,160 180,200 
              C240,240 300,120 360,180 
              C420,240 480,80 540,160 
              C600,240 660,100 720,180 
              C780,260 840,140 900,200 
              C960,260 1020,100 1080,160 
              C1140,220 1200,140 1260,200 
              C1320,260 1380,120 1440,180 
              L1440,320 L0,320 Z"
        />
      </svg>

      <div className="al-grid">
        <div className="al-left">
          <div className="al-x-mark">
            <img src="/logoFondoBlanco.svg" alt="Sabores del Hogar" className="x-mark-img" />
          </div>
        </div>

        <div className="al-right">
          <h1 className="al-title">
            ¡Sabores únicos!
            <br />
            ¿Qué esperas para ser parte?
          </h1>

          <h2 className="al-subtitle">Únete hoy</h2>

          <button
            className="al-btn al-btn-pill al-btn-light"
            onClick={() => {}}
            aria-label="Inicia sesión con Google"
          >
            <FcGoogle className="al-icon" />
            Inicia sesión con Google
          </button>

          <div className="al-divider">
            <span>o</span>
          </div>

          <button className="al-btn al-btn-pill al-btn-primary" onClick={openSignup}>
            Crear cuenta
          </button>

          <div className="al-have-account">
            <span>¿Ya tienes una cuenta?</span>
            <button className="al-btn al-btn-outline" onClick={openLogin}>
              Iniciar sesión
            </button>
          </div>
        </div>
      </div>

      <LoginModal isOpen={showLogin} onClose={closeAll} onSwap={openSignup} />
      <SignupModal isOpen={showSignup} onClose={closeAll} onSwap={openLogin} />

      {/* AQUÍ estaba el error: faltaba abrir el <svg> */}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 230" style={{ display: "block", transform: "scaleY(1)" }}>
        <path
          stroke="none"
          fill="#F8D7DA"
          fillOpacity="1"
          d="M0,192 C60,240 120,160 180,200 
              C240,240 300,120 360,180 
              C420,240 480,80 540,160 
              C600,240 660,100 720,180 
              C780,260 840,140 900,200 
              C960,260 1020,100 1080,160 
              C1140,220 1200,140 1260,200 
              C1320,260 1380,120 1440,180 
              L1440,320 L0,320 Z"
        />
      </svg>
    </div>
  );
}

function LoginModal({ isOpen, onClose, onSwap }) {
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
    if (form.password.length < 6) e.password = "Ingresa tu contraseña";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onClose();
    }, 900);
  };

  return (
    <Modal isOpen={isOpen} title="Iniciar sesión" onClose={onClose}>
      <form className="al-form" onSubmit={onSubmit} noValidate>
        <div className="al-field">
          <label htmlFor="login-email">Correo electrónico</label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="correo@ejemplo.com"
            value={form.email}
            onChange={onChange}
            aria-invalid={!!errors.email}
          />
          {errors.email && <span className="al-error">{errors.email}</span>}
        </div>

        <div className="al-field">
          <label htmlFor="login-pass">Contraseña</label>
          <div className="al-input-group">
            <input
              id="login-pass"
              name="password"
              type={showPass ? "text" : "password"}
              autoComplete="current-password"
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
              title={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPass ? "🙈" : "👁️"}
            </button>
          </div>
          {errors.password && <span className="al-error">{errors.password}</span>}
        </div>

        <div className="al-row-split">
          <label className="al-check">
            <input type="checkbox" name="remember" checked={form.remember} onChange={onChange} /> Recuérdame
          </label>
          <button type="button" className="al-link" onClick={() => alert("Recuperar contraseña (por implementar)")}>
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <button type="submit" className="al-btn al-btn-primary" disabled={loading}>
          {loading ? "Ingresando..." : "Entrar"}
        </button>
      </form>

      <p className="al-switch">
        ¿No tienes cuenta?{" "}
        <button className="al-link" onClick={onSwap}>
          Regístrate
        </button>
      </p>
    </Modal>
  );
}

function SignupModal({ isOpen, onClose, onSwap }) {
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    rut: "",
    correo: "",
    password: "",
    telefono: "",
    fechaNacimiento: "",
    direccion: "",
    accept: false,
  });
  const [errors, setErrors] = useState({});

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "Ingresa tu nombre";
    if (!form.apellido.trim()) e.apellido = "Ingresa tu apellido";
    if (!/^(\d{1,2}\.\d{3}\.\d{3}-[\dkK])$/.test(form.rut)) e.rut = "RUT inválido";
    if (!/\S+@\S+\.\S+/.test(form.correo)) e.correo = "Correo inválido";
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{9,}$/.test(form.password)) e.password = "Mín. 9, letras y números";
    if (!/^\+56\d{8,9}$/.test(form.telefono)) e.telefono = "Formato +56XXXXXXXX";
    if (!form.fechaNacimiento) e.fechaNacimiento = "Selecciona tu fecha";
    if (!form.accept) e.accept = "Debes aceptar los términos";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onClose();
    }, 1000);
  };

  return (
    <Modal isOpen={isOpen} title="Crear cuenta" onClose={onClose}>
      <form className="al-form" onSubmit={onSubmit} noValidate>
        <div className="al-field">
          <label htmlFor="reg-nombre">Nombre</label>
          <input id="reg-nombre" name="nombre" value={form.nombre} onChange={onChange} placeholder="Nombre" />
          {errors.nombre && <span className="al-error">{errors.nombre}</span>}
        </div>

        <div className="al-field">
          <label htmlFor="reg-apellido">Apellido</label>
          <input id="reg-apellido" name="apellido" value={form.apellido} onChange={onChange} placeholder="Apellido" />
          {errors.apellido && <span className="al-error">{errors.apellido}</span>}
        </div>

        <div className="al-field">
          <label htmlFor="reg-rut">RUT</label>
          <input
            id="reg-rut"
            name="rut"
            value={form.rut}
            onChange={onChange}
            placeholder="12.345.678-9"
            pattern="^(\d{1,2}\.\d{3}\.\d{3}-[\dkK])$"
          />
          {errors.rut && <span className="al-error">{errors.rut}</span>}
        </div>

        <div className="al-field">
          <label htmlFor="reg-correo">Correo electrónico</label>
          <input id="reg-correo" type="email" name="correo" value={form.correo} onChange={onChange} placeholder="correo@ejemplo.com" />
          {errors.correo && <span className="al-error">{errors.correo}</span>}
        </div>

        <div className="al-field">
          <label htmlFor="reg-pass">Contraseña</label>
          <div className="al-input-group">
            <input
              id="reg-pass"
              name="password"
              type={showPass ? "text" : "password"}
              value={form.password}
              onChange={onChange}
              placeholder="Mínimo 9, letras y números"
              minLength={9}
              pattern="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{9,}$"
            />
            <button
              type="button"
              className="al-eye"
              aria-pressed={showPass}
              onClick={() => setShowPass((v) => !v)}
              title={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPass ? "🙈" : "👁️"}
            </button>
          </div>
          {errors.password && <span className="al-error">{errors.password}</span>}
        </div>

        <div className="al-field">
          <label htmlFor="reg-tel">Teléfono</label>
          <input id="reg-tel" name="telefono" value={form.telefono} onChange={onChange} placeholder="+56XXXXXXXX" />
          {errors.telefono && <span className="al-error">{errors.telefono}</span>}
        </div>

        <div className="al-field">
          <label htmlFor="reg-fecha">Fecha de nacimiento</label>
          <input id="reg-fecha" type="date" name="fechaNacimiento" value={form.fechaNacimiento} onChange={onChange} />
          {errors.fechaNacimiento && <span className="al-error">{errors.fechaNacimiento}</span>}
        </div>

        <div className="al-field">
          <label htmlFor="reg-dir">Dirección (opcional)</label>
          <input id="reg-dir" name="direccion" value={form.direccion} onChange={onChange} placeholder="Dirección" />
        </div>

        <label className="al-check">
          <input type="checkbox" name="accept" checked={form.accept} onChange={onChange} /> Acepto los Términos y la Política de Privacidad
        </label>
        {errors.accept && <span className="al-error">{errors.accept}</span>}

        <button type="submit" className="al-btn al-btn-primary" disabled={loading}>
          {loading ? "Creando cuenta..." : "Registrarse"}
        </button>
      </form>

      <p className="al-switch">
        ¿Ya tienes cuenta?{" "}
        <button className="al-link" onClick={onSwap}>
          Inicia sesión
        </button>
      </p>
    </Modal>
  );
}
