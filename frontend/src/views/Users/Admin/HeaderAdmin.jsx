import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import "./HeaderAdmin.css";

export const HeaderAdmin = () => {
  const [authOpen, setAuthOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("sdh_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const authRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onDocClick = (e) => {
      if (authRef.current && !authRef.current.contains(e.target)) {
        setAuthOpen(false);
      }
    };
    const onEsc = (e) => e.key === "Escape" && setAuthOpen(false);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const onLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pwd }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        localStorage.setItem("sdh_user", JSON.stringify(data.user));
        setAuthOpen(false);
        navigate("/Useradmin");
      } else {
        alert(data.message || "Credenciales inválidas");
      }
    } catch (err) {
      console.error(err);
      alert("Error en la conexión con el servidor");
    }
  };

  const onLogout = () => {
    setUser(null);
    localStorage.removeItem("sdh_user");
    navigate("/");
  };

  return (
    <header className="admin-header">
      <div className="mensaje-banner">
        <p>🎉 Bienvenido a mi Sabores del Hogar — Ofertas especiales todo el mes 🎉</p>
      </div>

      <nav className="Header-nav">
        <Link to="/Useradmin" className="logo-wrap" aria-label="Inicio administrador">
          <img src="/logoFondoBlanco.svg" className="Header-icon" alt="Logo Sabores del Hogar" />
        </Link>

        <h1 className="NombreEmpresa">SABORES DEL HOGAR</h1>

        <div className="header-actions">
          <div className={`auth-popover ${authOpen ? "open" : ""}`} ref={authRef}>
            <button
              className="Header-login-trigger"
              onClick={() => setAuthOpen((v) => !v)}
              aria-haspopup="true"
              aria-expanded={authOpen}
              title={user ? "Cuenta" : "Iniciar sesión"}
            >
              <FaUser className="Header-login-icon" size={26} />
              <div className="auth-mini-text">
                <span>Hola{user ? `, ${user.nombre}` : "!"}</span>
                <strong>{user ? user.nombre : "Inicia sesión"}</strong>
              </div>
            </button>

            <div className="auth-panel" role="dialog" aria-label="Cuenta administrador">
              {!user ? (
                <>
                  <form className="auth-form" onSubmit={onLoginSubmit}>
                    <label>
                      <span>Email</span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </label>

                    <label>
                      <span>Contraseña</span>
                      <div className="pwd-wrap">
                        <input
                          type={showPwd ? "text" : "password"}
                          minLength={8}
                          value={pwd}
                          onChange={(e) => setPwd(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="pwd-toggle"
                          onClick={() => setShowPwd((s) => !s)}
                          aria-label="Mostrar/ocultar contraseña"
                        >
                          {showPwd ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </label>

                    <button type="submit" className="auth-primary">Iniciar Sesión</button>
                  </form>

                  <Link className="auth-link" to="/forgot" onClick={() => setAuthOpen(false)}>
                    Olvidé mi contraseña
                  </Link>
                </>
              ) : (
                <>
                  <p className="auth-hello">
                    Sesión iniciada como <strong>{user.nombre}</strong>
                  </p>
                  <button
                    className="auth-primary"
                    onClick={() => navigate("/Useradmin")}
                  >
                    Ir al panel
                  </button>
                  <button className="auth-primary" onClick={onLogout}>
                    Cerrar sesión
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
