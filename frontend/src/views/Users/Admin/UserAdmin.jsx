import React, { useState, useEffect, useRef } from "react";
import { Footer } from "../../../componentes/Footer";
import { HeaderAdmin } from "./HeaderAdmin";
import Dashboard from "./Dashboard";
import "./UserAdmin.css";
import CuentaPanel from "../../../componentes/CuentaPanel";
import {
  BarChart, Bar, XAxis,
  YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import CodigosDesc from "./CodigosDesc/CodigosDesc";
import GestionClientes from "./GestionClientes/GestionClientes";
import GestionPedidos from "./GestionPedidos/GestionPedidos";
import GestionProductos from "./GestionProductos/GestionProductos";

const THEMES = {
  cafe: { brand: "#6f4e37", btn: "#8a5a44" },
  claro: { brand: "#b07b52", btn: "#d39b70" },
  cacao: { brand: "#4b2e1f", btn: "#734930" },
  pastel: { brand: "#a98068", btn: "#c6a489" },
};

const DEFAULT_PREFS = {
  theme: "cafe",
  scheme: "system",
  font: "md",
  lang: "es",
  showAvatar: true,
};

const LS_PREFS = "sdh_prefs";
const LS_LANG = "sdh_lang";

function applyPrefs(prefs) {
  const root = document.documentElement;
  const palette = THEMES[prefs.theme] || THEMES.cafe;

  root.style.setProperty("--brand", palette.brand);
  root.style.setProperty("--brand-btn", palette.btn);

  // Modo de color
  const setScheme = (mode) => {
    if (mode === "dark") root.setAttribute("data-scheme", "dark");
    else if (mode === "light") root.setAttribute("data-scheme", "light");
    else {
      const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.setAttribute("data-scheme", dark ? "dark" : "light");
    }
  };
  setScheme(prefs.scheme);
  root.setAttribute("data-font", prefs.font);
  const fontMap = { sm: "14px", md: "16px", lg: "18px" };
  const fs = fontMap[prefs.font] || fontMap.md;
  root.style.fontSize = fs;
  const scheme = root.getAttribute("data-scheme") || "light";
  if (scheme === "dark") {
    root.style.setProperty("--ink", "#f5ede6");
    root.style.setProperty("--ink-2", "#d8c8bf");
    root.style.setProperty("--input-bg", "#241d1a");
  } else {
    root.style.setProperty("--ink-2", "#7b5a49");
    root.style.setProperty("--input-bg", "#ffffff");
  }
  try { localStorage.setItem(LS_LANG, prefs.lang); } catch { /* empty */ }
}

//SECCION USER ADMIN
const UserAdmin = () => {
  const [active, setActive] = useState("inicio");
  const mainRef = useRef(null);

  const [prefs, setPrefs] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LS_PREFS) || "null");
      return { ...DEFAULT_PREFS, ...(saved || {}) };
    } catch {
      return DEFAULT_PREFS;
    }
  });
  const [okPrefs, setOkPrefs] = useState("");

  // Estado para ganancias en Inicio
  const [period, setPeriod] = useState("day");
  const [ganData, setGanData] = useState([]);
  const [ganLoading, setGanLoading] = useState(true);
  const [ganError, setGanError] = useState(null);

  useEffect(() => {
    applyPrefs(prefs);
  }, [prefs]);

  useEffect(() => {
    if (prefs.scheme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const cb = () => applyPrefs({ ...prefs });
    mq.addEventListener?.("change", cb);
    return () => mq.removeEventListener?.("change", cb);
  }, [prefs, prefs.scheme]);

  // Fetch ganancias cuando se está en "inicio"
  useEffect(() => {
    if (active !== "inicio") return;
    
    const fetchGanancias = async () => {
      try {
        setGanLoading(true);
        setGanError(null);
        const res = await fetch(`http://localhost:5000/api/ganancias?period=${period}`);
        if (!res.ok) throw new Error("Error al obtener ganancias");
        const json = await res.json();
        const mapped = json.map((item) => ({
          label: item.label,
          total: parseFloat(item.total),
        }));
        setGanData(mapped);
      } catch (err) {
        console.error(err);
        setGanError(err.message);
      } finally {
        setGanLoading(false);
      }
    };

    fetchGanancias();
  }, [active, period]);

  const onChangePref = (e) => {
    const { name, type, checked, value } = e.target;
    const next = { ...prefs, [name]: type === "checkbox" ? checked : value };
    setPrefs(next);
    try { localStorage.setItem(LS_PREFS, JSON.stringify(next)); } catch { /* empty */ }
    applyPrefs(next);
    setOkPrefs("Preferencias aplicadas");
    clearTimeout(window.__prefs_to);
    window.__prefs_to = setTimeout(() => setOkPrefs(""), 1200);
  };

  const resetPrefs = () => {
    setPrefs(DEFAULT_PREFS);
    try { localStorage.setItem(LS_PREFS, JSON.stringify(DEFAULT_PREFS)); } catch { /* empty */ }
    applyPrefs(DEFAULT_PREFS);
    setOkPrefs("Preferencias restablecidas");
    setTimeout(() => setOkPrefs(""), 1200);
  };

  const logout = () => {
    try { localStorage.removeItem("sdh_user"); } catch { /* empty */ }
    window.location.href = "/Login";
  };

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [active]);

  const sections = [
    { id: "inicio", label: "Inicio" },
    { id: "pedidos", label: "Gestión de pedidos" },
    { id: "productos", label: "Gestión de productos" },
    { id: "clientes", label: "Gestión de clientes" },
    { id: "interactivo", label: "Dashboard interactivo" },
    { id: "descuentos", label: "Códigos de descuento" },
    { id: "account", label: "Cuenta" },
    { id: "settings", label: "Configuración" },
  ];

  const goSection = (id) => {
    setActive(id);
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderInicio = () => (
    <div className="card-stack">
      {/* KPIs movidos al inicio */}
      <div className="card kpis">
        <div>
          <strong>5</strong>
          <span>Pedidos pendientes</span>
        </div>
        <div>
          <strong>12</strong>
          <span>Clientes nuevos</span>
        </div>
        <div>
          <strong>3</strong>
          <span>Sin stock</span>
        </div>
        <div>
          <strong>2</strong>
          <span>Alertas</span>
        </div>
      </div>

      <div className="card">
        <h2>👋 Bienvenido al Panel</h2>
        <p>Resumen de actividades y alertas recientes.</p>
      </div>

      <div className="card">
        <h3>Mensajes Importantes</h3>
        <ul className="bullets">
          <li>Cliente "Juan Pérez" reporta retraso en entrega.</li>
          <li>Error en la página de pagos detectado.</li>
          <li>Pedido #1023 necesita revisión.</li>
          <li>"Cheesecake de Frambuesa" sin stock.</li>
        </ul>
      </div>

      <div className="card">
        <div className="card-head">
          <h2>Ganancias</h2>
          <div className="tabs">
            <button className={`tab ${period === "day" ? "on" : ""}`} onClick={() => setPeriod("day")}>
              Día
            </button>
            <button className={`tab ${period === "week" ? "on" : ""}`} onClick={() => setPeriod("week")}>
              Semana
            </button>
            <button className={`tab ${period === "month" ? "on" : ""}`} onClick={() => setPeriod("month")}>
              Mes
            </button>
          </div>
        </div>

        {ganLoading && <div className="loading">Cargando datos...</div>}
        {ganError && <div className="error">⚠️ {ganError}</div>}
        {!ganLoading && !ganError && ganData.length === 0 && <div className="empty">No hay datos disponibles</div>}

        {!ganLoading && !ganError && ganData.length > 0 && (
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <BarChart
                data={ganData}
                margin={{ top: 20, right: 20, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-bd)" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--ink-2)", fontSize: 12 }}
                  tickMargin={8}
                />
                <YAxis
                  tick={{ fill: "var(--ink-2)", fontSize: 12 }}
                  tickFormatter={(v) => `$${v.toLocaleString()}`}
                />
                <Tooltip
                  cursor={{ fill: "rgba(87,36,32,0.08)" }}
                  contentStyle={{
                    backgroundColor: "var(--surface)",
                    border: "1px solid var(--surface-bd)",
                    borderRadius: "8px",
                    boxShadow: "var(--shadow)",
                    color: "var(--ink)",
                    fontSize: "13px",
                  }}
                  formatter={(value) => [`$${value.toLocaleString()}`, "Ganancia"]}
                />
                <Legend />
                <Bar
                  dataKey="total"
                  fill="var(--brand)"
                  radius={[8, 8, 0, 0]}
                  barSize={30}
                  animationDuration={700}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );

  // Cuenta conectada
  const renderAccount = () => (
    <div>
      <CuentaPanel />
      <div className="card" style={{ marginTop: 16 }}>
        <button className="btn danger" onClick={logout}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="card">
      <h2>Configuración de apariencia</h2>

      <div style={{ display: "grid", gap: 12, marginTop: 8 }}>
        <div className="field">
          <label>Tema</label>
          <select name="theme" value={prefs.theme} onChange={onChangePref}>
            {Object.keys(THEMES).map((t) => (
              <option key={t} value={t}>
                {t[0].toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Tamaño de fuente</label>
          <select name="font" value={prefs.font} onChange={onChangePref}>
            <option value="sm">Pequeña</option>
            <option value="md">Mediana</option>
            <option value="lg">Grande</option>
          </select>
        </div>

        <div className="field check">
          <label>
            <input type="checkbox" name="showAvatar" checked={prefs.showAvatar} onChange={onChangePref} /> Mostrar avatar en encabezado
          </label>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" onClick={resetPrefs} type="button">Restablecer</button>
        </div>

        {okPrefs && <div style={{ color: "var(--ok, #1a7f37)", fontWeight: 700 }}>{okPrefs}</div>}
      </div>
    </div>
  );

  return (
    <div>
      <HeaderAdmin />
      <div className="user-container">
        <aside className="sidebar" aria-label="Menú de administración">
          <ul>
            {sections.map((s) => (
              <li
                key={s.id}
                className={active === s.id ? "active" : ""}
                tabIndex={0}
                onClick={() => goSection(s.id)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && goSection(s.id)}
                aria-current={active === s.id ? "page" : undefined}
              >
                {s.label}
              </li>
            ))}
          </ul>
        </aside>

        <main ref={mainRef} className="main-content" role="region" aria-live="polite">
          {active === "inicio" && renderInicio()}
          {active === "pedidos" && <GestionPedidos />}
          {active === "productos" && <GestionProductos />}
          {active === "clientes" && <GestionClientes />}
          {active === "interactivo" && <Dashboard />}
          {active === "descuentos" && <CodigosDesc />}
          {active === "account" && renderAccount()}
          {active === "settings" && renderSettings()}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default UserAdmin;