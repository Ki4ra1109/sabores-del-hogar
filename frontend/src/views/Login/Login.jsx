import './Login.css';
import { useState, useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";

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

  const openLogin = () => { setShowSignup(false); setShowLogin(true); };
  const openSignup = () => { setShowLogin(false); setShowSignup(true); };
  const closeAll = () => { setShowLogin(false); setShowSignup(false); };

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
        {/* Columna izquierda: “X”/logo grande*/}
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
            Sabores unicos<br />Que esperas para ser parte
          </h1>

          <h2 className="al-subtitle">Únete hoy</h2>

          {/* Botones sociales (placeholders) */}
          <button className="al-btn al-btn-pill al-btn-light">
            <FcGoogle className="al-icon" />
            Inicia sesión con Google
          </button>

          <button className="al-btn al-btn-pill al-btn-light">
            <FaApple className="al-icon" />
            Registrarse con Apple
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
        <form className="al-form" onSubmit={(e) => { e.preventDefault();}}>
          <input type="email" placeholder="Correo electrónico" required />
          <input type="password" placeholder="Contraseña" required />
          <button type="submit" className="al-btn al-btn-primary">Entrar</button>
        </form>
        <p className="al-switch">
          ¿No tienes cuenta? <button className="al-link" onClick={openSignup}>Regístrate</button>
        </p>
      </Modal>

      {/* Modal: Crear cuenta */}
      <Modal isOpen={showSignup} title="Crear cuenta" onClose={closeAll}>
        <form
          className="al-form"
          onSubmit={(e) => {
            e.preventDefault();
            // Aquí validaciones extra si es necesario
          }}
        >
          {/* Nombre */}
          <input
            type="text"
            placeholder="Nombre"
            name="nombre"
            required
          />

          {/* Apellido */}
          <input
            type="text"
            placeholder="Apellido"
            name="apellido"
            required
          />

          {/* RUT */}
          <input
            type="text"
            placeholder="RUT (ej: 12.345.678-9)"
            name="rut"
            pattern="^(\d{1,2}\.\d{3}\.\d{3}-[\dkK])$"
            title="Formato válido: 12.345.678-9"
            required
          />

          {/* Correo */}
          <input
            type="email"
            placeholder="Correo electrónico"
            name="correo"
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
            required
          />

          {/* Teléfono */}
          <input
            type="tel"
            placeholder="Teléfono (+56...)"
            name="telefono"
            pattern="^\+56\d{8,9}$"
            title="Debe comenzar con +56 seguido de 8 o 9 dígitos"
            required
          />

          {/* Fecha de nacimiento */}
          <input
            type="date"
            name="fechaNacimiento"
            required
            onKeyDown={(e) => e.preventDefault()} // evita modificar con teclado
          />

          {/* Dirección (opcional) */}
          <input
            type="text"
            placeholder="Dirección (opcional)"
            name="direccion"
          />

          {/* Aceptar términos */}
          <label className="al-check">
            <input type="checkbox" required /> Acepto los Términos y la Política de Privacidad
          </label>

          <button type="submit" className="al-btn al-btn-primary">Registrarse</button>
        </form>
        <p className="al-switch">
          ¿Ya tienes cuenta? <button className="al-link" onClick={openLogin}>Inicia sesión</button>
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

