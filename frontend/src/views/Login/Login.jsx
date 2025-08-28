import './Login.css';
import { useState, useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { useNavigate } from "react-router-dom";


function Modal({ isOpen, title, onClose, children }) {
  // Cerrar con ESC
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div className="al-modal-overlay" onClick={onClose} aria-modal="true" role="dialog">
      <div className="al-modal" onClick={(e) => e.stopPropagation()}>
        <button className="al-modal-close" onClick={onClose} aria-label="Cerrar">✕</button>
        {title && <h3 className="al-modal-title">{title}</h3>}
        <div className="al-modal-body">{children}</div>
      </div>
    </div>
  );
}

export default function AuthLanding() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const navigate = useNavigate();

  const openLogin = () => { setShowSignup(false); setShowLogin(true); };
  const openSignup = () => { setShowLogin(false); setShowSignup(true); };
  const closeAll = () => { setShowLogin(false); setShowSignup(false); };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [User, setUser] = useState("");

  const onSignupSubmit = async (e) => {
    e.preventDefault();

    // Asegurarnos de que signupData exista
    if (!signupData) {
      alert("Datos incompletos");
      return;
    }

    try {
      // Crear payload seguro usando optional chaining
      const signupPayload = {
        nombre: signupData?.nombre || "",
        apellido: signupData?.apellido || "",
        rut: signupData?.rut || "",
        correo: signupData?.correo || "",
        password: signupData?.password || "",
        telefono: signupData?.telefono || "",
        fechaNacimiento: signupData?.fechaNacimiento || "",
        direccion: signupData?.direccion || "",
      };

      // Llamada al backend con fetch
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Ocurrió un error en el registro");
        return;
      }

      // Guardar usuario en localStorage
      localStorage.setItem("sdh_user", JSON.stringify(data.user));

      // Opcional: actualizar estado global si tienes setUser
      setUser && setUser(data.user);

      // Cerrar modal si aplica
      closeAll && closeAll();

      // Navegar al home
      navigate("/");
    } catch (error) {
      console.error("Error en el registro:", error);
      alert("Ocurrió un error en el registro");
    }
  };

  const handleLogin = async (email, password) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Error al iniciar sesión");
        return;
      }

      // Guardar usuario en localStorage
      localStorage.setItem("sdh_user", JSON.stringify(data.user));

      // Actualizar estado global o local
      setUser(data.user);

      // Cerrar modal
      closeAll();

      // Redirigir al home
      navigate("/");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Error de conexión con el servidor");
    }
  };

  // Estado para todos los campos
  const [signupData, setSignupData] = useState({
    nombre: "",
    apellido: "",
    rut: "",
    correo: "",
    password: "",
    telefono: "",
    fechaNacimiento: "",
    direccion: ""
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    setSignupData({ ...signupData, [name]: value });
  };


  return (
    <div className="al-landing">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 230" style={{ display: 'block', transform: 'scaleY(-1)' }}>
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
              L1440,320 L0,320 Z">
        </path>
      </svg>

      <div className="al-grid">
        <div className="al-left">
          <div className="al-x-mark">
            <img
              src="../../../public/logoFondoBlanco.svg"
              alt="icono"
              className="x-mark-img"
            />
          </div>
        </div>

        {/* Columna derecha: títulos y acciones */}
        <div className="al-right">
          <h1 className="al-title">
            ¡Sabores únicos!<br />¿Qué esperas para ser parte?
          </h1>

          <h2 className="al-subtitle">Únete hoy</h2>

          {/* Botones sociales (placeholders) */}
          <button className="al-btn al-btn-pill al-btn-light">
            <FcGoogle className="al-icon" />
            Inicia sesión con Google
          </button>

          <button className="al-btn al-btn-pill al-btn-light">
            <FaApple className="al-icon" />
            Inicia sesión con Apple
          </button>

          <div className="al-divider">
            <span>o</span>
          </div>

          <button className="al-btn al-btn-pill al-btn-primary" onClick={openSignup}>
            Crear cuenta
          </button>

          <div className="al-have-account">
            <span>¿Ya tienes una cuenta?</span>
            <button className="al-btn al-btn-outline" onClick={openLogin}>Iniciar sesión</button>
          </div>
        </div>
      </div>

      {/* Modal: Iniciar sesión */}
      <Modal isOpen={showLogin} title="Iniciar sesión" onClose={closeAll}>
        <form
          className="al-form al-form-grid"
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin(email, password);
          }}
        >
          <input
            type="email"
            placeholder="Correo electrónico"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="al-btn al-btn-primary">
            Entrar
          </button>
        </form>

        <p className="al-switch">
          ¿No tienes cuenta?{" "}
          <button className="al-link" onClick={openSignup}>
            Regístrate
          </button>
        </p>
      </Modal>

      <Modal isOpen={showSignup} title="Crear cuenta" onClose={closeAll}>
        <form className="al-form al-form-grid" onSubmit={onSignupSubmit}>
          {/* Fila: Nombre y Apellido */}
          <div className="al-form-row">
            <input
              type="text"
              placeholder="Nombre"
              name="nombre"
              value={signupData.nombre}
              onChange={onChange}
              required
            />
            <input
              type="text"
              placeholder="Apellido"
              name="apellido"
              value={signupData.apellido}
              onChange={onChange}
              required
            />
          </div>

          {/* RUT */}
          <input
            type="text"
            placeholder="RUT (ej: 12.345.678-9)"
            name="rut"
            pattern="^(\d{1,2}\.\d{3}\.\d{3}-[\dkK])$"
            title="Formato válido: 12.345.678-9"
            value={signupData.rut}
            onChange={onChange}
            required
          />

          {/* Correo electrónico */}
          <input
            type="email"
            placeholder="Correo electrónico"
            name="correo"
            value={signupData.correo}
            onChange={onChange}
            required
          />

          {/* Contraseña */}
          <input
            type="password"
            placeholder="Contraseña (mínimo 9, letras y números)"
            name="password"
            minLength={9}
            pattern="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{9,}$"
            title="Debe tener al menos 9 caracteres, incluyendo letras y números"
            value={signupData.password}
            onChange={onChange}
            required
          />

          {/* Fila: Teléfono y Fecha de nacimiento */}
          <div className="al-form-row">
            <input
              type="tel"
              placeholder="Teléfono (+56...)"
              name="telefono"
              pattern="^\+56\d{8,9}$"
              title="Debe comenzar con +56 seguido de 8 o 9 dígitos"
              value={signupData.telefono}
              onChange={onChange}
              required
            />
            <input
              type="date"
              name="fechaNacimiento"
              value={signupData.fechaNacimiento}
              onChange={onChange}
              required
              onKeyDown={(e) => e.preventDefault()}
            />
          </div>

          {/* Dirección (opcional) */}
          <input
            type="text"
            placeholder="Dirección (opcional)"
            name="direccion"
            value={signupData.direccion}
            onChange={onChange}
          />

          {/* Checkbox Términos */}
          <label className="al-check">
            <input
              type="checkbox"
              name="terminos"
              checked={signupData.terminos || false}
              onChange={(e) =>
                setSignupData({ ...signupData, terminos: e.target.checked })
              }
              required
            />{" "}
            Acepto los Términos y la Política de Privacidad
          </label>

          <button type="submit" className="al-btn al-btn-primary">
            Registrarse
          </button>
        </form>

        <p className="al-switch">
          ¿Ya tienes cuenta?{" "}
          <button className="al-link" onClick={openLogin}>
            Inicia sesión
          </button>
        </p>
      </Modal>

      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 230" style={{ display: 'block', transform: 'scaleY(1)' }}>
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
              L1440,320 L0,320 Z">
        </path>
      </svg>

    </div>
  );
}

