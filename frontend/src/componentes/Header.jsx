import React, { useMemo, useState, useRef, useEffect } from 'react';
import "./Header.css";
import { FaSearch, FaShoppingCart, FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import Carrito from './Carrito';
import productos from '../data/productos';
import { useNavigate, useLocation, Link } from 'react-router-dom';

export const Header = () => {
  const [abrirCarrito, setAbrirCarrito] = useState(false);
  const [carrito, setCarrito] = useState([]);
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  const [authOpen, setAuthOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");               // ← string
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
  const submenuRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  // ⬅️ Redirige automáticamente tras login según rol
  useEffect(() => {
    if (!user) return;
    const role = String(user.rol || "").toLowerCase();
    const target = role === "admin" ? "/UserAdmin" : "/UserNormal";
    if (location.pathname !== target) {
      navigate(target, { replace: true });
    }
  }, [user, location.pathname, navigate]);

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

  const irADetalle = (id) => {
    setShowResults(false);
    setQuery("");
    navigate(`/catalogo/${id}`);
  };

  const onSubmitBuscar = (e) => {
    e.preventDefault();
    if (resultados.length > 0) irADetalle(resultados[0].id);
  };

  // Baseline: login guarda sesión; el useEffect de arriba hace la redirección
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
        localStorage.setItem("sdh_user", JSON.stringify(data.user));
        setUser(data.user);        // ← dispara el redirect automático
        setAuthOpen(false);
        setEmail("");
        setPwd("");
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

          <div className={`auth-popover ${authOpen ? 'open' : ''}`} ref={authRef}>
            <button
              className="Header-login-trigger"
              onClick={() => setAuthOpen(v => !v)}
              aria-haspopup="true"
              aria-expanded={authOpen}
              title={user ? "Cuenta" : "Iniciar sesión"}
            >
              <FaUser className="Header-login-icon" size={26} color="#fff" />
              <div className="auth-mini-text">
                <span>Hola{user ? `, ${user.nombre}` : "!"}</span>
                <strong>{user ? user.nombre : "Inicia sesión"}</strong>
              </div>
            </button>

            <div className="auth-panel" role="dialog" aria-label="Cuenta">
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
                        navigate("/UserAdmin");     // rutas con mayúsculas
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
