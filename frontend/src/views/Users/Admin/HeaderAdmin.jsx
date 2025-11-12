import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaUser, FaEye, FaEyeSlash, FaHome } from "react-icons/fa";
import "./HeaderAdmin.css";

export const HeaderAdmin = () => {
  const [authOpen, setAuthOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const [loginBusy, setLoginBusy] = useState(false);
  const [logoutBusy, setLogoutBusy] = useState(false);
  const [panelFading, setPanelFading] = useState(false);
  const PANEL_FADE_MS = 280;

  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("sdh_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const authRef = useRef(null);
  const emailRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const DotsInline = () => (
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

  const ButtonWithLoader = ({ label, busy, type = "button", onClick, disabled }) => (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || busy}
      className="auth-primary"
      style={{
        position: "relative",
        width: "100%",
        minHeight: 44,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        color: "#fff",
      }}
    >
      <span style={{ opacity: busy ? 0 : 1, transition: "opacity .15s" }}>{label}</span>
      {busy && <span style={{ position: "absolute" }}><DotsInline /></span>}
    </button>
  );

  useEffect(() => {
    const onDocClick = (e) => {
      if (authRef.current && !authRef.current.contains(e.target)) setAuthOpen(false);
    };
    const onEsc = (e) => e.key === "Escape" && setAuthOpen(false);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  useEffect(() => {
    if (authOpen) setTimeout(() => emailRef.current?.focus(), 0);
  }, [authOpen]);

  const onLoginSubmit = async (e) => {
    e.preventDefault();
    if (loginBusy) return;
    setLoginBusy(true);
    try {
      const baseUrl = import.meta?.env?.VITE_API_URL ?? "http://localhost:5000";
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pwd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Credenciales inválidas");

      setUser(data.user);
      localStorage.setItem("sdh_user", JSON.stringify(data.user));

      setPanelFading(true);
      requestAnimationFrame(() => {
        setTimeout(() => {
          setAuthOpen(false);
          setEmail(""); setPwd("");
          setTimeout(() => {
            navigate("/UserAdmin");
            setLoginBusy(false);
            setPanelFading(false);
          }, 30);
        }, PANEL_FADE_MS);
      });
    } catch (err) {
      alert(err.message || "Error en la conexión con el servidor");
      setLoginBusy(false);
    }
  };

  const onLogoutClick = () => {
    if (logoutBusy) return;
    setLogoutBusy(true);
    setPanelFading(true);
    requestAnimationFrame(() => {
      setTimeout(() => {
        localStorage.removeItem("sdh_user");
        setUser(null);
        setAuthOpen(false);
        setTimeout(() => {
          navigate("/");
          setLogoutBusy(false);
          setPanelFading(false);
        }, 30);
      }, PANEL_FADE_MS);
    });
  };

  return (
    <header className="admin-header">
      <div className="mensaje-banner">
        <p>🎉 Bienvenido a Sabores del Hogar — Ofertas especiales todo el mes 🎉</p>
      </div>

      <nav className="Header-nav">
        <Link to="/UserAdmin" className="logo-wrap" aria-label="Inicio administrador">
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
                {user ? (
                  <span>Hola, <strong>{user.nombre}</strong></span>
                ) : (
                  <strong>Inicia sesión</strong>
                )}
              </div>
            </button>

            <div
              className="auth-panel"
              role="dialog"
              aria-label="Cuenta administrador"
              style={{
                opacity: panelFading ? 0 : 1,
                transform: panelFading ? "translateY(-6px)" : "translateY(0)",
                transition: "opacity .28s ease, transform .28s ease",
                willChange: "opacity, transform",
              }}
            >
              {!user ? (
                <>
                  <form className="auth-form" onSubmit={onLoginSubmit}>
                    <label>
                      <span>Email</span>
                      <input
                        ref={emailRef}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loginBusy}
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
                          disabled={loginBusy}
                        />
                        <button
                          type="button"
                          className="pwd-toggle"
                          onClick={() => setShowPwd((s) => !s)}
                          aria-label="Mostrar/ocultar contraseña"
                          disabled={loginBusy}
                        >
                          {showPwd ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </label>

                    <div style={{ height: 44, display: "flex", alignItems: "center" }}>
                      <ButtonWithLoader type="submit" label="Iniciar Sesión" busy={loginBusy} />
                    </div>
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

                  {/* 🔹 Si está en /UserAdmin -> mostrar "Ir al Home" */}
                  {location.pathname === "/UserAdmin" ? (
                    <button
                      className="auth-primary"
                      onClick={() => navigate("/")}
                      disabled={logoutBusy}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                    >
                      <FaHome size={18} />
                      Ir al Home
                    </button>
                  ) : (
                    <button
                      className="auth-primary"
                      onClick={() => navigate("/UserAdmin")}
                      disabled={logoutBusy}
                    >
                      Ir al Panel
                    </button>
                  )}

                  <div style={{ height: 44, display: "flex", alignItems: "center", marginTop: 8 }}>
                    <ButtonWithLoader
                      label="Cerrar sesión"
                      busy={logoutBusy}
                      onClick={onLogoutClick}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
