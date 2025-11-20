import React, { useMemo, useState, useRef, useEffect } from 'react';
import "./Header.css";
import { FaSearch, FaShoppingCart, FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import Carrito from './Carrito';
import { useNavigate, useLocation, Link } from 'react-router-dom';


export const Header = () => {
  const [abrirCarrito, setAbrirCarrito] = useState(false);
  const [carrito, setCarrito] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  const [authOpen, setAuthOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const [loginBusy, setLoginBusy] = useState(false);
  const [loginDone, setLoginDone] = useState(false);
  const [logoutBusy, setLogoutBusy] = useState(false);
  const [registerBusy, setRegisterBusy] = useState(false);
  const [loginErr, setLoginErr] = useState("");

  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("sdh_user");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });
  const [authMode, setAuthMode] = useState("login");
  const [fgStep, setFgStep] = useState(0);
  const [fgEmail, setFgEmail] = useState("");
  const [fgCode, setFgCode] = useState("");
  const [fgP1, setFgP1] = useState("");
  const [fgP2, setFgP2] = useState("");
  const [fgErr, setFgErr] = useState("");
  const [fgMsg, setFgMsg] = useState("");
  const [fgBusy, setFgBusy] = useState(false);
  const [showFgP1, setShowFgP1] = useState(false);
  const [showFgP2, setShowFgP2] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);

  const buscadorRef = useRef(null);
  const authRef = useRef(null);
  const authPanelRef = useRef(null);
  const emailInputRef = useRef(null);
  const submenuRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  const PANEL_FADE_MS = 280;
  const FG_STORE = "sdh_fg_state";

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

  const ButtonWithLoader = ({ label, busy, type = "button", onClick, disabled, className = "auth-primary" }) => (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || busy}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        minHeight: 44,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
      }}
    >
      <span style={{ opacity: busy ? 0 : 1, transition: "opacity .15s" }}>{label}</span>
      {busy && <span style={{ position: "absolute", color: "#fff" }}><DotsInline /></span>}
    </button>
  );

  const hideQuickAuth = useMemo(
    () => location.pathname.toLowerCase() === "/login",
    [location.pathname]
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FG_STORE);
      if (!raw) return;
      const s = JSON.parse(raw);
      setAuthMode("forgot");
      setFgEmail(s.email || "");
      setFgStep(s.step === 1 ? 1 : 0);
    } catch {}
  }, []);

  useEffect(() => {
    const nav = performance.getEntriesByType?.('navigation')?.[0];
    if (nav && nav.type === 'reload') {
      const raw = localStorage.getItem(FG_STORE);
      if (raw) setAuthOpen(true);
    }
  }, []);

  useEffect(() => {
    const onBeforeUnload = () => localStorage.removeItem(FG_STORE);
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  const loadCart = () => {
    try {
      const items = JSON.parse(localStorage.getItem("carrito") || "[]");
      setCarrito(items);
      const c = items.reduce((acc, it) => acc + Number(it.cantidad || 0), 0);
      setCartCount(c);
    } catch {
      setCarrito([]); setCartCount(0);
    }
  };

  useEffect(() => {
    loadCart();
    const onAdded = () => { loadCart(); setAbrirCarrito(true); };
    const onStorage = (e) => { if (e.key === "carrito") loadCart(); };
    const onUpdated = () => loadCart();

    window.addEventListener("carrito:agregado", onAdded);
    window.addEventListener("carrito:actualizado", onUpdated);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("carrito:agregado", onAdded);
      window.removeEventListener("carrito:actualizado", onUpdated);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    const role = String(user.rol || "").toLowerCase();
    const target = role === "admin" ? "/UserAdmin" : "/perfil";
    if (location.pathname.toLowerCase() === "/login") {
      navigate(target, { replace: true });
    }
  }, [user, location.pathname, navigate]);

  const resultados = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return (window.productos || []).filter(p => p.nombre.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (buscadorRef.current && !buscadorRef.current.contains(e.target)) setShowResults(false);
      if (authRef.current && !authRef.current.contains(e.target)) setAuthOpen(false);
      if (submenuRef.current && !submenuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onEsc = (e) => { if (e.key === 'Escape') { setAuthOpen(false); setMenuOpen(false); } };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  useEffect(() => {
    if (authOpen) setTimeout(() => emailInputRef.current?.focus(), 0);
  }, [authOpen]);

  const onAuthPanelKeyDown = (e) => {
    if (e.key !== "Tab" || !authPanelRef.current) return;
    const selectors = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
    const nodes = Array.from(authPanelRef.current.querySelectorAll(selectors)).filter(el => el.offsetParent !== null);
    const first = nodes[0]; const last = nodes[nodes.length - 1];
    if (!nodes.length) return;
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  const irADetalle = (id) => {
    setShowResults(false);
    setQuery("");
    navigate(`/catalogo/${id}`);
  };

  const onSubmitBuscar = (e) => {
    e.preventDefault();
    if (resultados.length > 0) irADetalle(resultados[0].id);
  };

  const onLoginSubmit = async (e) => {
    e.preventDefault();
    if (loginBusy) return;
    setLoginBusy(true);
    setLoginErr("");
    try {
      const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pwd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Email o contraseña incorrecta");

      localStorage.setItem("sdh_user", JSON.stringify(data.user));
      setUser(data.user);

      setLoginDone(true);
      requestAnimationFrame(() => {
        setTimeout(() => {
          setAuthOpen(false);
          setEmail(""); setPwd("");
          const role = String(data.user.rol || "").toLowerCase();
          const to = role === "admin" ? "/UserAdmin" : "/";
          setTimeout(() => {
            navigate(to);
            setLoginBusy(false);
            setLoginDone(false);
          }, 30);
        }, PANEL_FADE_MS);
      });
    } catch (err) {
      setLoginErr(err.message || "Error en la conexión con el servidor");
      setLoginBusy(false);
    }
  };

  const handleRegisterNavigation = () => {
    if (registerBusy) return;
    setRegisterBusy(true);
    setLoginDone(true);

    setTimeout(() => {
      navigate("/login");
      setAuthOpen(false);
      setRegisterBusy(false);
      setLoginDone(false);
    }, PANEL_FADE_MS);
  };

  const sendCode = async () => {
    setFgErr(""); setFgMsg("");
    if (!/\S+@\S+\.\S+/.test(fgEmail)) { setFgErr("Ingresa un correo válido"); return; }
    const t0 = Date.now();
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    try {
      setFgBusy(true);
      const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
      const r = await fetch(`${baseUrl}/api/auth/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fgEmail })
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d?.message || "No se pudo enviar el código");
      setFgMsg("Código enviado. Revisa tu correo.");
      setFgStep(1);
      localStorage.setItem(FG_STORE, JSON.stringify({ email: fgEmail, step: 1 }));
    } catch (e) {
      setFgErr(e.message || "Error al enviar código");
    } finally {
      const elapsed = Date.now() - t0;
      if (elapsed < 1500) await sleep(1500 - elapsed);
      setFgBusy(false);
    }
  };

  const doReset = async () => {
    setFgErr(""); setFgMsg("");
    if (!/^\d{6}$/.test(fgCode)) { setFgErr("Código de 6 dígitos"); return; }
    if (fgP1 !== fgP2) { setFgErr("Las contraseñas no coinciden"); return; }
    if (!(fgP1.length >= 9 && /[A-Za-z]/.test(fgP1) && /\d/.test(fgP1))) { setFgErr("Mínimo 9, con letras y números"); return; }
    const t0 = Date.now();
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    try {
      setFgBusy(true);
      const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
      const r = await fetch(`${baseUrl}/api/auth/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fgEmail, code: fgCode, newPassword: fgP1 })
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d?.message || "No se pudo actualizar");
      setFgMsg("Contraseña actualizada. Inicia sesión.");
      setAuthMode("login");
      setFgStep(0);
      setEmail(fgEmail);
      setPwd("");
      localStorage.removeItem(FG_STORE);
    } catch (e) {
      setFgErr(e.message || "Error al actualizar");
    } finally {
      const elapsed = Date.now() - t0;
      if (elapsed < 1500) await sleep(1500 - elapsed);
      setFgBusy(false);
    }
  };

  const onLogoutClick = () => {
    if (logoutBusy) return;
    setLogoutBusy(true);
    setLoginDone(true);
    requestAnimationFrame(() => {
      setTimeout(() => {
        localStorage.removeItem("sdh_user");
        setUser(null);
        setAuthOpen(false);
        setTimeout(() => {
          navigate("/");
          setLogoutBusy(false);
          setLoginDone(false);
        }, 30);
      }, PANEL_FADE_MS);
    });
  };

  const autoShow = (setter) => { setter(true); setTimeout(() => setter(false), 2000); };
  const onP1Blur = () => { if (fgP2 && fgP1 !== fgP2) setFgErr("Las contraseñas no coinciden"); };
  const onP2Blur = () => { if (fgP1 && fgP1 !== fgP2) setFgErr("Las contraseñas no coinciden"); };

  return (
    <header>
      <div className="mensaje-banner">
        <p>🎉 Bienvenido a mi Sabores del Hogar — Ofertas especiales todo el mes 🎉</p>
      </div>

      <nav className="Header-nav">
        <Link to="/"><img src="/logoFondoBlanco.svg" className="Header-icon" alt="Logo Sabores del Hogar" /></Link>
        <h1 className="NombreEmpresa">Sabores del hogar</h1>

        <div className="header-actions">
          <form className="buscar-container" onSubmit={onSubmitBuscar} ref={buscadorRef}>
            <input
              type="text"
              placeholder="Buscar..."
              className="buscar-input"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowResults(true); }}
              onFocus={() => setShowResults(true)}
            />
            <button className="buscar-submit" aria-label="buscar" type="submit"><FaSearch /></button>

            {showResults && resultados.length > 0 && (
              <ul className="buscar-dropdown">
                {resultados.map(r => (
                  <li key={r.id} onMouseDown={() => irADetalle(r.id)}>
                    <img src={r.imagen} alt={r.nombre} />
                    <div>
                      <span className="res-nombre">{r.nombre}</span>
                      <span className="res-precio">{r.precio}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </form>

          <button
            className="Header-carrito-icon"
            onClick={(e) => { e.preventDefault(); setAbrirCarrito(true); }}
            title="Carrito"
            style={{ position: "relative" }}
          >
            <FaShoppingCart size={30} color="#fff" />
            {cartCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  background: "#b12d2d",
                  color: "#fff",
                  borderRadius: "999px",
                  fontSize: 12,
                  lineHeight: "18px",
                  minWidth: 18,
                  height: 18,
                  padding: "0 6px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                }}
                aria-label={`Productos en el carrito: ${cartCount}`}
              >
                {cartCount}
              </span>
            )}
          </button>

          {!hideQuickAuth && (
            <div className={`auth-popover ${authOpen ? 'open' : ''}`} ref={authRef}>
              <button
                type="button"
                className="Header-login-trigger"
                onClick={() => setAuthOpen(v => !v)}
                aria-haspopup="dialog"
                aria-expanded={authOpen}
                aria-controls="auth-popover-panel"
                title={user ? "Cuenta" : "Iniciar sesión"}
              >
                <FaUser className="Header-login-icon" size={26} color="#fff" />
                <div className="auth-mini-text">
                  {user ? (
                    <span>Hola, <strong>{user.nombre}</strong></span>
                  ) : (
                    <strong>Inicia sesión</strong>
                  )}
                </div>
              </button>

              <div
                id="auth-popover-panel"
                className="auth-panel"
                role="dialog"
                aria-modal="true"
                aria-label="Cuenta"
                ref={authPanelRef}
                onKeyDown={onAuthPanelKeyDown}
                style={{
                  opacity: loginDone ? 0 : 1,
                  transform: loginDone ? "translateY(-6px)" : "translateY(0)",
                  transition: "opacity .28s ease, transform .28s ease",
                  willChange: "opacity, transform",
                  pointerEvents: authOpen ? "auto" : "none"
                }}
              >
                {!user ? (
                  <>
                    {authMode === "login" && (
                      <>
                        <form className="auth-form" onSubmit={onLoginSubmit}>
                          <label>
                            <span>Email</span>
                            <input
                              ref={emailInputRef}
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
                                onClick={() => setShowPwd(s => !s)}
                                aria-label="Mostrar/ocultar contraseña"
                                disabled={loginBusy}
                              >
                                <FaEyeSlash style={{ display: showPwd ? "inline" : "none" }} />
                                <FaEye style={{ display: showPwd ? "none" : "inline" }} />
                              </button>
                            </div>
                          </label>

                          {loginErr && <div className="auth-err" role="alert">{loginErr}</div>}

                          <div style={{ height: 44, display: "flex", alignItems: "center" }}>
                            <ButtonWithLoader type="submit" label="Iniciar Sesión" busy={loginBusy} />
                          </div>
                        </form>

                        <div className="auth-link-forgot">
                          <button
                            className="auth-link"
                            type="button"
                            onClick={() => { setAuthMode("forgot"); setFgStep(0); setFgErr(""); setFgMsg(""); setFgEmail(email); }}
                            disabled={loginBusy}
                          >
                            ¿Olvidaste tu contraseña?
                          </button>
                        </div>
                        <p className="auth-register-text">Si no tienes una cuenta registrate aca</p>
                        
                        <ButtonWithLoader
                          label="Registrarme"
                          busy={registerBusy}
                          onClick={handleRegisterNavigation}
                          className="auth-secondary"
                        />
                      </>
                    )}

                    {authMode === "forgot" && (
                      <div className="auth-form">
                        <div className="seg">
                          <button type="button" className={`seg-btn ${fgStep === 0 ? "on" : ""}`} onClick={() => setFgStep(0)}>
                            Enviar código
                          </button>
                          <button type="button" className={`seg-btn ${fgStep === 1 ? "on" : ""}`} onClick={() => fgEmail ? setFgStep(1) : setFgStep(0)} disabled={!fgEmail}>
                            Ingresar código
                          </button>
                          <span 
                            className="seg-ind" 
                            style={{ transform: `translateX(calc(${fgStep * 100}% + ${fgStep === 1 ? 4 : 0}px))` }} 
                          />
                        </div>

                        {fgStep === 0 && (
                          <>
                            <label>
                              <span>Correo</span>
                              <input type="email" value={fgEmail} onChange={(e) => setFgEmail(e.target.value)} placeholder="tu@email.com" />
                            </label>
                            {fgErr && <div className="auth-err">{fgErr}</div>}
                            {fgMsg && <div className="auth-ok">{fgMsg}</div>}
                            <ButtonWithLoader label="Enviar código" busy={fgBusy} onClick={sendCode} />
                          </>
                        )}

                        {fgStep === 1 && (
                          <>
                            <label>
                              <span>Correo</span>
                              <input type="email" value={fgEmail} readOnly />
                            </label>
                            <label>
                              <span>Código</span>
                              <input type="text" inputMode="numeric" maxLength={6} value={fgCode} onChange={(e) => setFgCode(e.target.value.replace(/\D/g, ""))} placeholder="6 dígitos" />
                            </label>
                            <label>
                              <span>Nueva contraseña</span>
                              <div className="pwd-wrap">
                                <input
                                  type={showFgP1 ? "text" : "password"}
                                  value={fgP1}
                                  onChange={(e) => { setFgP1(e.target.value); if (fgErr && e.target.value === fgP2) setFgErr(""); }}
                                  minLength={9}
                                  placeholder="Mín. 9, letras y números"
                                  onBlur={onP1Blur}
                                />
                                <button
                                  type="button"
                                  className="pwd-toggle"
                                  onClick={() => autoShow(setShowFgP1)}
                                  aria-label="Mostrar/ocultar contraseña"
                                >
                                  <FaEyeSlash style={{ display: showFgP1 ? "inline" : "none" }} />
                                  <FaEye style={{ display: showFgP1 ? "none" : "inline" }} />
                                </button>
                              </div>
                            </label>
                            <label>
                              <span>Confirmar contraseña</span>
                              <div className="pwd-wrap">
                                <input
                                  type={showFgP2 ? "text" : "password"}
                                  value={fgP2}
                                  onChange={(e) => { setFgP2(e.target.value); if (fgErr && fgP1 === e.target.value) setFgErr(""); }}
                                  minLength={9}
                                  onBlur={onP2Blur}
                                />
                                <button
                                  type="button"
                                  className="pwd-toggle"
                                  onClick={() => autoShow(setShowFgP2)}
                                  aria-label="Mostrar/ocultar contraseña"
                                >
                                  <FaEyeSlash style={{ display: showFgP2 ? "inline" : "none" }} />
                                  <FaEye style={{ display: showFgP2 ? "none" : "inline" }} />
                                </button>
                              </div>
                            </label>
                            {fgErr && <div className="auth-err">{fgErr}</div>}
                            {fgMsg && <div className="auth-ok">{fgMsg}</div>}
                            <ButtonWithLoader label="Actualizar contraseña" busy={fgBusy} onClick={doReset} />
                            <button className="auth-link" type="button" onClick={() => setFgStep(0)} disabled={fgBusy}>
                                Reenviar código
                            </button>
                          </>
                        )}

                        <button className="auth-link" type="button" onClick={() => { setAuthMode("login"); setFgStep(0); localStorage.removeItem(FG_STORE); }}>
                          Volver a iniciar sesión
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <p style={{ color: "#fff", margin: "4px 0 10px" }}>
                      Sesión iniciada como <strong>{user.nombre}</strong>
                    </p>

                    <button
                      className="auth-primary"
                      onClick={() => {
                        if (String(user.rol || "").toLowerCase() === "admin") navigate("/UserAdmin");
                        else navigate("/perfil");
                      }}
                      disabled={logoutBusy}
                    >
                      Ir al perfil
                    </button>

                    <div style={{ height: 44, display: "flex", alignItems: "center" }}>
                      <ButtonWithLoader label="Cerrar sesión" busy={logoutBusy} onClick={onLogoutClick} />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <hr />

      <nav className="navbar">
        <ul className="navbar-list">
          <li><Link to="/">Inicio</Link></li>

          <li
            className={`has-submenu ${menuOpen ? 'open' : ''}`}
            ref={submenuRef}
            onMouseEnter={() => setMenuOpen(true)}
            onMouseLeave={() => setMenuOpen(false)}
          >
            <Link to="/catalogo">
              Catálogo
            </Link>
            <ul className="submenu">
              <li><Link to="/catalogo?cat=tortas" onClick={() => setMenuOpen(false)}>Tortas</Link></li>
              <li><Link to="/catalogo?cat=dulces" onClick={() => setMenuOpen(false)}>Dulces</Link></li>
              <li><Link to="/postre" onClick={() => setMenuOpen(false)}>Arma tu Postre</Link></li>
            </ul>
          </li>

          <li><Link to="/nosotros">Nosotros</Link></li>
          <li><Link to="/contacto">Contacto</Link></li>
        </ul>
      </nav>

      <Carrito carrito={carrito} setCarrito={setCarrito} abrir={abrirCarrito} setAbrir={setAbrirCarrito} />
    </header>
  );
};