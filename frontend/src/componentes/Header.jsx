import React, { useMemo, useState, useRef, useEffect } from 'react';
import "./Header.css";
import { FaSearch, FaShoppingCart, FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import Carrito from './Carrito';
import { useNavigate, useLocation, Link } from 'react-router-dom';

export const Header = () => {
  const [abrirCarrito, setAbrirCarrito] = useState(false);
  const [carrito, setCarrito] = useState([]);
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

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

  const [menuOpen, setMenuOpen] = useState(false);

  const buscadorRef = useRef(null);
  const authRef = useRef(null);
  const authPanelRef = useRef(null);     // ← panel del popover
  const emailInputRef = useRef(null);    // ← primer foco dentro del popover
  const submenuRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Ocultar acceso rápido en la página de Login
  const hideQuickAuth = useMemo(
    () => location.pathname.toLowerCase() === "/login",
    [location.pathname]
  );

  const resultados = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return productos.filter(p => p.nombre.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (buscadorRef.current && !buscadorRef.current.contains(e.target)) setShowResults(false);
      if (authRef.current && !authRef.current.contains(e.target)) setAuthOpen(false);
      if (submenuRef.current && !submenuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onEsc = (e) => {
      if (e.key === 'Escape') { setAuthOpen(false); setMenuOpen(false); }
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  // Foco inicial al abrir el popover
  useEffect(() => {
    if (authOpen) {
      setTimeout(() => emailInputRef.current?.focus(), 0);
    }
  }, [authOpen]);

  // Focus trap dentro del popover
  const onAuthPanelKeyDown = (e) => {
    if (e.key !== "Tab" || !authPanelRef.current) return;
    const selectors =
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
    const nodes = Array.from(authPanelRef.current.querySelectorAll(selectors))
      .filter(el => el.offsetParent !== null);
    if (!nodes.length) return;

    const first = nodes[0];
    const last = nodes[nodes.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
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
    try {
      const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pwd }),
      });
      const data = await res.json();

      if (res.ok) {
        // Guardar en localStorage y estado
        localStorage.setItem("sdh_user", JSON.stringify(data.user));
        setUser(data.user);
        setAuthOpen(false);
        setEmail("");
        setPwd("");

        // Redirección según rol
        const role = String(data.user.rol || "").toLowerCase();
        if (role === "admin") {
          navigate("/UserAdmin");   // admin → va al perfil admin
        } else {
          navigate("/");            // normal → se queda en home
        }
      } else {
        alert(data.message || "Email o contraseña incorrecta");
      }
    } catch (err) {
      console.error(err);
      alert("Error en la conexión con el servidor");
    }
  };

  const onLogout = () => {
    setUser(null);
    localStorage.removeItem("sdh_user");
  };

  return (
    <header>
      <div className="mensaje-banner">
        <p>🎉 Bienvenido a mi Sabores del Hogar — Ofertas especiales todo el mes 🎉</p>
      </div>

      <nav className="Header-nav">
        <Link to="/">
          <img
            src="/logoFondoBlanco.svg"
            className="Header-icon"
            alt="Logo Sabores del Hogar"
          />
        </Link>

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
            <button className="buscar-submit" aria-label="buscar" type="submit">
              <FaSearch />
            </button>

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
          >
            <FaShoppingCart size={30} color="#fff" />
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
                  <span>Hola{user ? `, ${user.nombre}` : "!"}</span>
                  <strong>{user ? user.nombre : "Inicia sesión"}</strong>
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
              >
                {!user ? (
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
                            onClick={() => setShowPwd(s => !s)}
                            aria-label="Mostrar/ocultar contraseña"
                          >
                            {showPwd ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                      </label>

                      <button type="submit" className="auth-primary">Iniciar Sesión</button>
                    </form>

                    <Link className="auth-link" to="/forgot">Olvidé mi contraseña</Link>
                    <div className="auth-divider" />
                    <p>Si no tienes una cuenta registrate aca</p>
                    <Link
                      className="auth-secondary"
                      to="/Login"
                      onClick={() => setAuthOpen(false)}
                    >
                      Registrarme
                    </Link>
                  </>
                ) : (
                  <>
                    <p style={{ color: "#fff", margin: "4px 0 10px" }}>
                      Sesión iniciada como <strong>{user.nombre}</strong>
                    </p>

                    <button
                      className="auth-primary"
                      onClick={() => {
                        if (String(user.rol || "").toLowerCase() === "admin") {
                          navigate("/UserAdmin");
                        } else {
                          navigate("/UserNormal");
                        }
                      }}
                    >
                      Ir al perfil
                    </button>

                    <button
                      className="auth-primary"
                      onClick={() => {
                        onLogout();
                        navigate("/");
                      }}
                    >
                      Cerrar sesión
                    </button>
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
            <Link
              to="/Catalogo"
              onClick={(e) => {
                e.preventDefault();
                setMenuOpen((v) => !v);
              }}
            >
              Catálogo
            </Link>

            <ul className="submenu">
              <li>
                <Link to="/Catalogo?cat=tortas" onClick={() => setMenuOpen(false)}>
                  Tortas
                </Link>
              </li>
              <li>
                <Link to="/Catalogo?cat=dulces" onClick={() => setMenuOpen(false)}>
                  Dulces
                </Link>
              </li>
            </ul>
          </li>

          <li><Link to="/nosotros">Nosotros</Link></li>
          <li><Link to="/contacto">Contacto</Link></li>
        </ul>
      </nav>

      <Carrito
        carrito={carrito}
        setCarrito={setCarrito}
        abrir={abrirCarrito}
        setAbrir={setAbrirCarrito}
      />
    </header>
  );
}
