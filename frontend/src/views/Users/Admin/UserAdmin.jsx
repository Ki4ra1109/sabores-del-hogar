import React, { useState, useEffect, useRef } from "react";
import { Footer } from "../../../componentes/Footer";
import { HeaderAdmin } from "./HeaderAdmin";
import "./UserAdmin.css";
import CuentaPanel from "../../../componentes/CuentaPanel";
import {
  BarChart, Bar, XAxis,
  YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

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

  // Tamaño de fuente base (para que la opción funcione)
  root.setAttribute("data-font", prefs.font);
  // ajustamos font-size en el root para que los textos escalen
  const fontMap = { sm: "14px", md: "16px", lg: "18px" };
  const fs = fontMap[prefs.font] || fontMap.md;
  root.style.fontSize = fs;

  // Ajustes adicionales: texto e input background para mejorar contraste
  // Si el esquema actual es oscuro, invertimos a colores de alto contraste
  const scheme = root.getAttribute("data-scheme") || "light";
  if (scheme === "dark") {
    // para modo oscuro usar tonos claros en texto y fondo oscuro en inputs
    root.style.setProperty("--ink", "#f5ede6");
    root.style.setProperty("--ink-2", "#d8c8bf");
    root.style.setProperty("--input-bg", "#241d1a");
  } else {
    // modo claro: usar colores seguros para lectura (no depender sólo del tema)
    // preferimos variables de contraste; si el tema sólo tiene brand/btn, calculamos valores seguros
    root.style.setProperty("--ink", "#3b2a26");
    root.style.setProperty("--ink-2", "#7b5a49");
    root.style.setProperty("--input-bg", "#ffffff");
  }

  // Idioma persistido 
  try { localStorage.setItem(LS_LANG, prefs.lang); } catch { /* empty */ }
}

// SECCIÓN DE PEDIDOS
function PedidosSection() {
  const [q, setQ] = useState("");
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Función para asignar clases de color según estado
  const getEstadoClass = (estado) => {
    if (!estado) return "";
    const e = estado.toLowerCase();

    if (["entregado", "pagado", "completado"].includes(e)) return "success";
    if (["pendiente", "en proceso"].includes(e)) return "warning";
    if (["cancelado", "rechazado"].includes(e)) return "danger";
    return "";
  };

  // Fetch de pedidos
  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/pedidos");
        const data = await res.json();
        setPedidos(data);
      } catch (err) {
        console.error("Error al obtener pedidos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPedidos();
  }, []);

  // 🔍 Filtro combinado: busca por ID o nombre de cliente
  const list = pedidos.filter((p) => {
    if (!q.trim()) return true;

    const query = q.toLowerCase();
    const idMatch = String(p.id_pedido).includes(query);
    const nombreMatch = p.nombre_cliente?.toLowerCase().includes(query);

    return idMatch || nombreMatch;
  });

  return (
    <>
      <div className="orders-search">
        <input
          className="orders-input"
          type="text"
          placeholder="Buscar por # de pedido o nombre del cliente..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="card">
        <h2>Gestión de pedidos</h2>

        {loading ? (
          <p>Cargando pedidos...</p>
        ) : (
          <div className="orders">
            {list.length === 0 ? (
              <div className="empty">
                <p>No se encontraron pedidos que coincidan con la búsqueda.</p>
              </div>
            ) : (
              list.map((p) => (
                <div key={p.id_pedido} className="order-item">
                  <div className="order-info">
                    <h4>Pedido #{p.id_pedido}</h4>
                    <p>
                      Cliente: <strong>{p.nombre_cliente || "N/A"}</strong>
                    </p>
                    <p>
                      Estado:{" "}
                      <span
                        className={`status-chip ${getEstadoClass(p.estado)}`}
                      >
                        {p.estado}
                      </span>
                    </p>
                    <p>Fecha: {new Date(p.fecha_pedido).toLocaleDateString()}</p>
                    <p>Total: ${p.total}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}

//VISUALIZAR GANANCIAS
function GananciasSection() {
  const [period, setPeriod] = useState("day");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGanancias = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`http://localhost:5000/api/ganancias?period=${period}`);
        if (!res.ok) throw new Error("Error al obtener ganancias");
        const json = await res.json();

        // Adaptamos los datos al formato que Recharts espera
        const mapped = json.map((item) => ({
          label: item.label,
          total: parseFloat(item.total),
        }));

        setData(mapped);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGanancias();
  }, [period]);

  return (
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

      {loading && <div className="loading">Cargando datos...</div>}
      {error && <div className="error">⚠️ {error}</div>}
      {!loading && !error && data.length === 0 && <div className="empty">No hay datos disponibles</div>}

      {!loading && !error && data.length > 0 && (
        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer>
            <BarChart
              data={data}
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
  );
}

//SECCION DE PRODUCTOS 
function ProductosSection() {
  const [showForm, setShowForm] = useState(false);
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // no preview modal: images no abren en ventana al clickear

  // API base para llamadas al backend
  const API_BASE = import.meta.env?.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    let mounted = true;
    const fetchProducts = async () => {
      try {
        setLoadingItems(true);
        const res = await fetch(`${API_BASE}/api/productos`);
        if (!res.ok) throw new Error("Error al cargar productos");
        const json = await res.json();
        if (mounted) setItems(Array.isArray(json) ? json : []);
      } catch (err) {
        console.error("No se pudo cargar productos:", err);
      } finally {
        if (mounted) setLoadingItems(false);
      }
    };
    fetchProducts();
    return () => { mounted = false; };
  }, []);

  const PORCIONES = [12, 18, 24, 30, 50];

  const [form, setForm] = useState({
    sku: "",
    nombre: "",
    categoria: "tortas",
    precioMin: "",
    precioMax: "",
    imagen: "",
    descripcion: "",
    // siempre incluir todas las porciones predeterminadas
    porciones: PORCIONES.slice(),
    activo: true,
    usarPorciones: true,
    porcionPrecios: {}, // map porcion => precio (strings)
  });
  const [errors, setErrors] = useState({});

  const toggleForm = () => setShowForm((v) => !v);

  const num = (v) => {
    const n = Number(String(v).replace(/[^\d.]/g, ""));
    return Number.isFinite(n) ? n : NaN;
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "categoria") {
      const usar = value === "tortas";
      setForm((prev) => ({
        ...prev,
        categoria: value,
        usarPorciones: usar,
        porciones: usar ? prev.porciones : [],
        porcionPrecios: usar ? prev.porcionPrecios : {},
      }));
      return;
    }

    if (name === "usarPorciones") {
      setForm((prev) => ({
        ...prev,
        usarPorciones: checked,
        porciones: checked ? prev.porciones : [],
        porcionPrecios: checked ? prev.porcionPrecios : {},
      }));
      return;
    }

    if (name.startsWith("precioMin") || name.startsWith("precioMax")) {
      setForm((prev) => ({
        ...prev,
        [name]: value.replace(/[^\d]/g, ""),
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" && name !== "porciones" ? checked : value,
    }));
  };

  const onTogglePorcion = (p) => {
    if (!form.usarPorciones) return;
    setForm((prev) => {
      const exists = prev.porciones.includes(p);
      const next = exists
        ? prev.porciones.filter((x) => x !== p)
        : [...prev.porciones, p].sort((a, b) => a - b);
      const nextPrecios = { ...prev.porcionPrecios };
      if (exists) delete nextPrecios[p];
      return { ...prev, porciones: next, porcionPrecios: nextPrecios };
    });
  };

  const isValidUrl = (u) => {
    if (!u) return true;
    if (u.startsWith("data:") || u.startsWith("blob:") || u.startsWith("/"))
      return true;
    try {
      const url = new URL(u);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  const getSuggested = () => {
    const min = num(form.precioMin);
    const max = num(form.precioMax);
    const ps = form.porciones.slice().sort((a, b) => a - b);
    if (
      !ps.length ||
      !Number.isFinite(min) ||
      !Number.isFinite(max) ||
      min <= 0 ||
      max <= 0 ||
      min > max
    ) {
      return {};
    }
    const pMin = ps[0];
    const pMax = ps[ps.length - 1];
    const map = {};
    ps.forEach((p) => {
      if (pMin === pMax) {
        map[p] = max;
      } else {
        const t = (p - pMin) / (pMax - pMin);
        map[p] = Math.round(min + t * (max - min));
      }
    });
    return map;
  };

  const suggestions = getSuggested();

  const onChangePrecioPorcion = (p, v) => {
    const limpio = v.replace(/[^\d]/g, "");
    setForm((prev) => ({
      ...prev,
      porcionPrecios: { ...prev.porcionPrecios, [p]: limpio },
    }));
  };

  const aplicarSugerencias = () => {
    if (!Object.keys(suggestions).length) return;
    setForm((prev) => ({
      ...prev,
      porcionPrecios: {
        ...prev.porcionPrecios,
        ...Object.fromEntries(prev.porciones.map((p) => [p, String(suggestions[p] ?? "")])),
      },
    }));
  };

  // Subir imagen al backend y guardar la ruta devuelta en form.imagen (imagen_url)
  const onUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append("file", file);
      const resp = await fetch(`${API_BASE}/api/uploads`, {
        method: "POST",
        body: fd,
      });
      const j = await resp.json();
      if (!resp.ok) {
        console.error("Upload error:", j);
        alert("No se pudo subir la imagen");
        return;
      }
      // j.imagen_url expected like "/catalogo/nombre.jpg"
      setForm((prev) => ({ ...prev, imagen: j.imagen_url || j.path || "" }));
    } catch (err) {
      console.error("Error en upload:", err);
      alert("No se pudo subir la imagen");
    }
  };

  // Valida que una URL apunte a una imagen "cargable" en el navegador
  const validateImageUrl = (url) =>
    new Promise((resolve) => {
      try {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        // timeout por si hay bloqueo CORS o no responde
        const t = setTimeout(() => {
          img.onload = img.onerror = null;
          resolve(false);
        }, 5000);
        img.onload = () => { clearTimeout(t); resolve(true); };
        img.onerror = () => { clearTimeout(t); resolve(false); };
        img.src = url;
      } catch {
        resolve(false);
      }
    });

  const onValidateUrlClick = async () => {
    const url = (form.imagen || "").trim();
    if (!url) { alert("Pega primero la URL en el campo de imagen."); return; }
    if (!/^https?:\/\//i.test(url) && !url.startsWith("/")) { alert("La URL debe comenzar con http(s) o /"); return; }
    const ok = await validateImageUrl(url);
    if (ok) {
      alert("La URL parece válida. Se usará tal cual.");
    } else {
      alert("No se pudo cargar la imagen desde esa URL (CORS o URL inválida). Usa el botón de archivo para subirla.");
    }
  };

  const clearImage = () => setForm((prev) => ({ ...prev, imagen: "" }));

  const validate = () => {
    const e = {};
    const skuVal = (form.sku || "").trim();
    if (!skuVal) e.sku = "Ingresa un SKU único";
    else if (!/^[A-Za-z0-9\-_]+$/.test(skuVal)) e.sku = "SKU sólo acepta letras, números, - y _";
    if (!form.nombre.trim()) e.nombre = "Ingresa un nombre";
    if (!form.categoria) e.categoria = "Selecciona una categoría";

    const min = num(form.precioMin);
    const max = num(form.precioMax);
    if (!Number.isFinite(min) || min <= 0) e.precioMin = "Ingresa un mínimo válido";
    if (!Number.isFinite(max) || max <= 0) e.precioMax = "Ingresa un máximo válido";
    if (Number.isFinite(min) && Number.isFinite(max) && min >= max)
      e.precioMax = "El máximo debe ser mayor al máximo";

    if (!isValidUrl(form.imagen)) e.imagen = "URL de imagen no válida";

    if (form.usarPorciones && form.porciones.length > 0) {
      const ps = form.porciones.slice().sort((a, b) => a - b);
      let prevPrice = null;
      ps.forEach((p, idx) => {
        const val = num(form.porcionPrecios[p]);
        const cap = suggestions[p];
        if (!Number.isFinite(val) || val <= 0) {
          e[`por_${p}`] = `Ingresa un precio válido`;
        } else {
          if (Number.isFinite(cap) && val > cap) {
            e[`por_${p}`] = `No debe superar $${cap.toLocaleString("es-CL")} (sugerido)`;
          }
          if (prevPrice != null && val < prevPrice) {
            e[`por_${p}`] = `Debe ser ≥ al precio de ${ps[idx - 1]} personas ($${prevPrice.toLocaleString(
              "es-CL"
            )})`;
          }
          prevPrice = Number.isFinite(val) ? val : prevPrice;
        }
      });
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const reset = () => {
    setForm({
      sku: "",
      nombre: "",
      categoria: "tortas",
      precioMin: "",
      precioMax: "",
      imagen: "",
      descripcion: "",
      // reset a todas las porciones
      porciones: PORCIONES.slice(),
      activo: true,
      usarPorciones: true,
      porcionPrecios: {},
    });
    setErrors({});
    setEditingId(null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const min = num(form.precioMin);
    const max = num(form.precioMax);

    const variantes = PORCIONES.map((p) => {
      const precioManual = num(form.porcionPrecios?.[p]);
      const sugerido = suggestions[p];
      const precio =
        Number.isFinite(precioManual) && precioManual > 0
          ? precioManual
          : Number.isFinite(sugerido)
          ? sugerido
          : Number.isFinite(min) && Number.isFinite(max)
          ? Math.round((min + max) / 2)
          : Number.isFinite(min)
          ? min
          : Number.isFinite(max)
          ? max
          : 0;
      return { personas: p, precio };
    });

    const payload = {
      // incluir sku si el admin lo indicó
      sku: form.sku.trim() || undefined,
      nombre: form.nombre.trim(),
      categoria: form.categoria,
      precioMin: min || null,
      precioMax: max || null,
      imagen_url: form.imagen?.trim() || null,
      descripcion: form.descripcion.trim(),
      variantes,
      activo: form.activo,
    };

    try {
      const url = editingId ? `${API_BASE}/api/productos/${editingId}` : `${API_BASE}/api/productos`;
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.message || json?.error || "Error al guardar producto");
      }
      // refresh list from server
      const listRes = await fetch(`${API_BASE}/api/productos`);
      const listJson = await listRes.json();
      setItems(Array.isArray(listJson) ? listJson : []);
      reset();
      setShowForm(false);
    } catch (err) {
      console.error("Error al guardar producto:", err);
      alert("No se pudo guardar el producto. " + (err.message || ""));
    }
  };

  const startEdit = (item) => {
    setEditingId(item.sku ?? item.id);
    // rellenar precios por porción para todas las PORCIONES predeterminadas
    const porcionPrecios = {};
    // mapear valores existentes
    (item.variantes || []).forEach((v) => {
      if (v && v.personas) porcionPrecios[v.personas] = String(v.precio ?? "");
    });
    // asegurar keys para todas las PORCIONES (llenar con sugerencias si no existen)
    const suggestedMap = (() => {
      const map = {};
      const min = item.precioMin ?? null;
      const max = item.precioMax ?? null;
      // calc suggestions similar a frontend
      const ps = PORCIONES.slice().sort((a, b) => a - b);
      if (Number.isFinite(Number(min)) && Number.isFinite(Number(max)) && Number(min) > 0 && Number(max) > 0 && Number(min) < Number(max)) {
        const pMin = ps[0];
        const pMax = ps[ps.length - 1];
        ps.forEach((p) => {
          if (pMin === pMax) map[p] = Number(max);
          else {
            const t = (p - pMin) / (pMax - pMin);
            map[p] = Math.round(Number(min) + t * (Number(max) - Number(min)));
          }
        });
      }
      return map;
    })();

    PORCIONES.forEach((p) => {
      if (!porcionPrecios[p]) {
        porcionPrecios[p] = suggestedMap[p] ? String(suggestedMap[p]) : "";
      }
    });

    setForm({
      sku: item.sku || "",
      nombre: item.nombre || "",
      categoria: item.categoria || "tortas",
      precioMin: item.precioMin ? String(item.precioMin) : "",
      precioMax: item.precioMax ? String(item.precioMax) : "",
      imagen: (item.imagen || item.imagen_url || item.image || ""),
      descripcion: item.descripcion || "",
      // mantener todas las porciones predeterminadas
      porciones: PORCIONES.slice(),
      activo: !!item.activo,
      usarPorciones: true,
      porcionPrecios,
    });
    setShowForm(true);
  };

  const removeItem = (id) => {
    if (!window.confirm("¿Eliminar el producto?")) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/productos/${id}`, { method: "DELETE" });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || "Error al eliminar");
        // refresh list
        const listRes = await fetch(`${API_BASE}/api/productos`);
        const listJson = await listRes.json();
        setItems(Array.isArray(listJson) ? listJson : []);
        if (editingId === id) reset();
      } catch (err) {
        console.error("Error al eliminar producto:", err);
        alert("No se pudo eliminar el producto.");
      }
    })();
  };

  const safeThumb = (src) => {
    const url = (src || "").trim();
    if (!url) return "/placeholder.jpg";
    // URLs absolutas o data/blob se devuelven tal cual
    if (
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("data:") ||
      url.startsWith("blob:")
    ) return url;
    // Normalizar rutas relativas: "catalogo/imagen.jpg" -> "/catalogo/imagen.jpg"
    // Esto permite que las imágenes ubicadas en frontend/public/catalogo/ sean accesibles.
    return url.startsWith("/") ? url : `/${url}`;
  };

  // Helper: obtener ruta de imagen desde distintos campos que pueda devolver el backend
  const getProductImage = (p) => {
    if (!p) return "";
    return p.imagen || p.imagen_url || p.image || p.url || "";
  };

  return (
    <div className="card">
      <div className="card-head">
        <h2>Gestión de productos</h2>
        <button className="btn" onClick={toggleForm}>
          {showForm ? "Cerrar formulario" : "Añadir nuevo producto"}
        </button>
      </div>

      {showForm && (
        <form className="product-form" onSubmit={onSubmit} noValidate>
          <div className="form-grid">
            <div className="field">
              <label>SKU</label>
              <input
                name="sku"
                value={form.sku}
                onChange={onChange}
                placeholder="Ej: TCHOC"
              />
              {errors.sku && <span className="err">{errors.sku}</span>}
            </div>
            <div className="field">
              <label>Nombre</label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={onChange}
                placeholder="Ej: Torta de Chocolate"
              />
              {errors.nombre && <span className="err">{errors.nombre}</span>}
            </div>

            <div className="field">
              <label>Categoría</label>
              <select name="categoria" value={form.categoria} onChange={onChange}>
                <option value="tortas">Tortas</option>
                <option value="dulces">Dulces</option>
              </select>
              {errors.categoria && <span className="err">{errors.categoria}</span>}
            </div>

            <div className="field">
              <label>Precio mínimo</label>
              <input
                name="precioMin"
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={form.precioMin}
                onChange={onChange}
                placeholder="Ej: 25000"
              />
              {errors.precioMin && <span className="err">{errors.precioMin}</span>}
            </div>

            <div className="field">
              <label>Precio máximo</label>
              <input
                name="precioMax"
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={form.precioMax}
                onChange={onChange}
                placeholder="Ej: 75000"
              />
              {errors.precioMax && <span className="err">{errors.precioMax}</span>}
            </div>

            <div className="field">
              <label>Imagen del producto</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  name="imagen"
                  value={form.imagen}
                  onChange={onChange}
                  placeholder="Pega una URL (https://...)"
                  style={{ flex: 1 }}
                />
                <button type="button" className="btn sm" onClick={onValidateUrlClick} style={{ whiteSpace: "nowrap" }}>
                  Validar URL
                </button>
              </div>
              <div
                className="row"
                style={{ gap: 8, marginTop: 8, alignItems: "center" }}
              >
                <input type="file" accept="image/*" onChange={onUploadImage} />
                {form.imagen && (
                  <>
                    <img
                      src={safeThumb(form.imagen)}
                      alt="preview"
                      style={{
                        width: 56,
                        height: 56,
                        objectFit: "cover",
                        borderRadius: 6,
                        border: "1px solid #ddd",
                      }}
                    />
                    <button
                      type="button"
                      className="btn sm danger"
                      onClick={clearImage}
                    >
                      Quitar imagen
                    </button>
                  </>
                )}
              </div>
              {errors.imagen && <span className="err">{errors.imagen}</span>}
            </div>

            <div className="field field-span">
              <label>Descripción breve</label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={onChange}
                placeholder="Opcional"
                rows={3}
              />
            </div>

            <div className="field field-span">
              <label>Porciones</label>
              {form.categoria === "dulces" && (
                <div className="field check" style={{ marginBottom: 8 }}>
                  <label>
                    <input
                      type="checkbox"
                      name="usarPorciones"
                      checked={form.usarPorciones}
                      onChange={onChange}
                    />{" "}
                    Habilitar porciones para este producto
                  </label>
                </div>
              )}
              <div className="chips">
                {PORCIONES.map((p) => (
                  <button
                    type="button"
                    key={p}
                    className={`chip ${form.porciones.includes(p) ? "on" : ""}`}
                    onClick={() => onTogglePorcion(p)}
                    disabled={!form.usarPorciones}
                    aria-disabled={!form.usarPorciones}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {form.usarPorciones && form.porciones.length > 0 && (
              <div className="field field-span">
                <div
                  className="row"
                  style={{ justifyContent: "space-between", alignItems: "center" }}
                >
                  <label>Precio por porción</label>
                  <button type="button" className="btn sm" onClick={aplicarSugerencias}>
                    Autocompletar según rango
                  </button>
                </div>

                <div className="list" style={{ marginTop: 6 }}>
                  {form.porciones.map((p) => {
                    const sug = suggestions[p];
                    const val = form.porcionPrecios[p] ?? "";
                    return (
                      <div key={p} className="client" style={{ alignItems: "center" }}>
                        <div>
                          <strong>{p} personas</strong>
                          <div style={{ fontSize: 12, color: "#555" }}>
                            sugerido: {sug ? `$${sug.toLocaleString("es-CL")}` : "—"}
                          </div>
                          {errors[`por_${p}`] && (
                            <div className="err">{errors[`por_${p}`]}</div>
                          )}
                        </div>
                        <div className="row">
                          <input
                            type="number"
                            inputMode="numeric"
                            min="0"
                            step="1"
                            value={val}
                            onChange={(e) => onChangePrecioPorcion(p, e.target.value)}
                            placeholder={sug ? String(sug) : ""}
                            style={{ width: 160 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="field check">
              <label>
                <input
                  type="checkbox"
                  name="activo"
                  checked={form.activo}
                  onChange={onChange}
                />{" "}
                Activo
              </label>
            </div>
          </div>

          <div className="row mt form-actions">
            <button type="submit" className="btn primary">
              {editingId ? "Guardar cambios" : "Guardar producto"}
            </button>
            <button type="button" className="btn" onClick={reset}>
              Limpiar
            </button>
          </div>
        </form>
      )}

      <div className="grid">
        {items.length === 0 && !loadingItems && (
          <div className="empty">
            <p>No hay productos agregados aún.</p>
          </div>
        )}
        {loadingItems && (
          <div className="empty"><p>Cargando productos...</p></div>
        )}

        {items.map((p) => {
          const variantes = (p.variantes || []).slice().sort((a, b) => a.personas - b.personas);
          return (
            <article key={p.sku ?? p.id} className="product modern">
              <div className="thumb">
                <img
                  src={safeThumb(getProductImage(p))}
                  alt={p.nombre}
                  loading="lazy"
                  onError={(e) => { e.currentTarget.src = "/placeholder.jpg"; }}
                  style={{ cursor: "default" }}
                />
              </div>

              <div className="body">
                <div className="title-row">
                  <h4 className="title">{p.nombre}</h4>
                  <span className="badge">{p.categoria}</span>
                </div>

                {p.descripcion && <p className="desc">{p.descripcion}</p>}

                {p.precioMin && p.precioMax && (
                  <div className="price-range">
                    <span>Desde ${p.precioMin.toLocaleString("es-CL")}</span>
                    <span>Hasta ${p.precioMax.toLocaleString("es-CL")}</span>
                  </div>
                )}

                {variantes.length > 0 && (
                  <div className="variants">
                    {variantes.map((v) => (
                      <div key={v.personas} className="pill">
                        <span>{v.personas}p</span>
                        <strong>${Number(v.precio || 0).toLocaleString("es-CL")}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card-actions">
                <button className="btn sm" onClick={() => startEdit(p)}>Modificar</button>
                <button className="btn sm danger" onClick={() => removeItem(p.sku ?? p.id)}>Eliminar</button>
              </div>
            </article>
          );
        })}
      </div>

    </div>
  );
}

//SECCION DE DESCUENTOS
function DescuentosSection() {
  const [showForm, setShowForm] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [estado, setEstado] = useState("activos");
  const [tipoFiltro, setTipoFiltro] = useState("todos");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState({});
  const [msg, setMsg] = useState(null);
  const API_BASE = import.meta.env?.VITE_API_URL || "http://localhost:5000";

  const ThreeDot = ({ size = 12 }) => (
    <span className="three-dot" style={{ fontSize: size }}>
      <i />
      <i />
      <i />
    </span>
  );

  const BusyButton = ({ label, onClick, className, disabled, busy, type = "button" }) => (
    <button
      type={type}
      className={`${className || ""} has-loader ${busy ? "busy" : ""}`}
      onClick={onClick}
      disabled={disabled}
      aria-busy={busy}
    >
      <span className="label">{label}</span>
      {busy ? (
        <span className="loader">
          <ThreeDot />
        </span>
      ) : null}
    </button>
  );

  const [form, setForm] = useState({
    codigo: "",
    tipo: "percent",
    valor: "",
    minimo_compra: "",
    fecha_inicio: "",
    fecha_fin: "",
    uso_unico: false,
    activo: true
  });
  const [errors, setErrors] = useState({});

  const load = async () => {
    try {
      setLoading(true);
      const r = await fetch(`${API_BASE}/api/cupones`, { credentials: "include" });
      const j = await r.json();
      setCoupons(Array.isArray(j.items) ? j.items : []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const flash = (text, type = "ok") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 1200);
  };

  const toggleForm = () => setShowForm(v => !v);

  const clampPercent = (v) => {
    const n = Math.trunc(Number(String(v).replace(/[^\d-]/g, "")));
    if (!Number.isFinite(n)) return "";
    return Math.min(60, Math.max(1, n));
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "codigo") {
      const base = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      const up = String(value).toUpperCase().split("").filter(ch => base.includes(ch)).join("").slice(0, 15);
      setForm(prev => ({ ...prev, codigo: up }));
    } else if (name === "valor" && form.tipo === "percent") {
      if (value === "" || /^[0-9]{0,2}$/.test(value)) {
        setForm(prev => ({ ...prev, valor: value }));
      }
    } else {
      setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    }
    setErrors({});
  };

  const onPercentBlur = () => {
    if (form.tipo !== "percent") return;
    const n = clampPercent(form.valor);
    setForm(prev => ({ ...prev, valor: n === "" ? "" : String(n) }));
  };

  const onChangeTipo = (t) => {
    setForm(prev => ({
      ...prev,
      tipo: t,
      valor: t === "free_shipping" ? "" : (prev.valor || (t === "percent" ? 10 : 1000)),
      minimo_compra: t === "percent" ? "" : (prev.minimo_compra || 0)
    }));
    setErrors({});
  };

  const getStatus = (c) => {
    if (c.activo === false) return "inactivos";
    const today = new Date().toISOString().slice(0, 10);
    if (c.fecha_inicio && c.fecha_inicio > today) return "futuros";
    if (c.fecha_fin && c.fecha_fin < today) return "vencidos";
    return "activos";
  };
  const normTipo = (c) => c.tipo || (c.porcentaje != null ? "percent" : (c.valor != null ? "amount" : "free_shipping"));

  const validate = () => {
    const e = {};
    const code = (form.codigo || "").trim().toUpperCase();
    if (!/^[A-Z0-9]{4,15}$/.test(code)) e.codigo = "Código alfanumérico de 4 a 15";
    const exists = coupons.some(c => String(c.codigo).toUpperCase() === code && c.id_descuento !== editingId);
    if (code && exists) e.codigo = "El código ya existe";
    if (form.fecha_inicio && form.fecha_fin && new Date(form.fecha_inicio) > new Date(form.fecha_fin)) {
      e.fecha_fin = "Fin debe ser ≥ inicio";
    }
    if (form.tipo === "percent") {
      const n = Math.trunc(Number(form.valor));
      if (!Number.isFinite(n) || n < 1 || n > 60) e.valor = "Porcentaje entre 1 y 60";
    }
    if (form.tipo === "amount") {
      const n = Number(form.valor);
      const min = Number(form.minimo_compra);
      if (!Number.isFinite(n) || n <= 0) e.valor = "Monto > 0";
      if (!Number.isFinite(min) || min <= 0) e.minimo_compra = "Mínimo > 0";
      if (Number.isFinite(n) && Number.isFinite(min) && n >= min) e.valor = "Monto < mínimo";
    }
    if (form.tipo === "free_shipping") {
      const min = Number(form.minimo_compra);
      if (!Number.isFinite(min) || min <= 0) e.minimo_compra = "Mínimo > 0";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const reset = () => {
    setForm({
      codigo: "",
      tipo: "percent",
      valor: "",
      minimo_compra: "",
      fecha_inicio: "",
      fecha_fin: "",
      uso_unico: false,
      activo: true
    });
    setErrors({});
    setEditingId(null);
  };

  const cancelEdit = () => {
    reset();
    setShowForm(false);
  };

  const genCode = () => {
    const base = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const r = Array.from({ length: 15 }, () => base[Math.floor(Math.random() * base.length)]).join("");
    setForm(prev => ({ ...prev, codigo: r.slice(0, 15) }));
  };

  const summary = (() => {
    if (form.tipo === "percent") {
      if (!form.valor) return "Define el porcentaje";
      return `Descuento ${form.valor}% sobre el subtotal`;
    }
    if (form.tipo === "amount") {
      if (!form.valor || !form.minimo_compra) return "Monto y mínimo requeridos";
      return `Descuento $${Number(form.valor).toLocaleString("es-CL")} sobre compras desde $${Number(form.minimo_compra).toLocaleString("es-CL")}`;
    }
    if (form.tipo === "free_shipping") {
      if (!form.minimo_compra) return "Define el mínimo de compra";
      return `Envío gratis desde $${Number(form.minimo_compra).toLocaleString("es-CL")}`;
    }
    return "";
  })();

  const ready =
    (form.codigo || "").trim() &&
    ((form.tipo === "percent" && Number(form.valor) >= 1 && Number(form.valor) <= 60) ||
      (form.tipo === "amount" && Number(form.valor) > 0 && Number(form.minimo_compra) > 0 && Number(form.valor) < Number(form.minimo_compra)) ||
      (form.tipo === "free_shipping" && Number(form.minimo_compra) > 0));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || submitting) return;
    setSubmitting(true);
    const isPercent = form.tipo === "percent";
    const isAmount = form.tipo === "amount";
    const v = Math.trunc(Number(form.valor));
    const payload = {
      codigo: form.codigo.trim().toUpperCase(),
      tipo: form.tipo,
      porcentaje: isPercent ? v : null,
      valor: isPercent ? v : (isAmount ? Number(form.valor) : null),
      minimo_compra: isPercent ? null : Number(form.minimo_compra),
      fecha_inicio: form.fecha_inicio || null,
      fecha_fin: form.fecha_fin || null,
      uso_unico: !!form.uso_unico,
      activo: !!form.activo
    };
    try {
      const url = editingId ? `${API_BASE}/api/cupones/${editingId}` : `${API_BASE}/api/cupones`;
      const method = editingId ? "PUT" : "POST";
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
        credentials: "include",
        body: JSON.stringify(payload)
      });
      const j = await r.json();
      if (!j.ok) { setErrors(j.errors || {}); flash(j.message || "Error al guardar", "err"); setSubmitting(false); return; }
      await load();
      reset();
      setShowForm(false);
      flash(editingId ? "Cupón actualizado" : "Cupón creado", "ok");
    } catch {
      flash("Error de red", "err");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (c) => {
    const tipo = normTipo(c);
    const valor = c.valor ?? (c.porcentaje != null ? Number(c.porcentaje) : "");
    setEditingId(c.id_descuento);
    setForm({
      codigo: (c.codigo || "").toUpperCase(),
      tipo,
      valor: tipo === "free_shipping" ? "" : String(valor ?? ""),
      minimo_compra: c.minimo_compra ?? "",
      fecha_inicio: c.fecha_inicio || "",
      fecha_fin: c.fecha_fin || "",
      uso_unico: !!c.uso_unico || (c.limite_uso === 1),
      activo: c.activo !== false
    });
    setShowForm(true);
    setErrors({});
  };

  const setBusyFor = (id, action) => setBusy(prev => ({ ...prev, [id]: action }));
  const clearBusy = (id) => setBusy(prev => ({ ...prev, [id]: null }));
  const isBusy = (id, action) => busy[id] === action;

  const onCopy = async (c) => {
    setBusyFor(c.id_descuento, "copy");
    try {
      await navigator.clipboard.writeText(String(c.codigo || "").toUpperCase());
    } finally {
      setTimeout(() => clearBusy(c.id_descuento), 500);
    }
  };

  const onEdit = async (c) => {
    setBusyFor(c.id_descuento, "edit");
    setTimeout(() => {
      startEdit(c);
      clearBusy(c.id_descuento);
    }, 250);
  };

  const onToggle = async (c) => {
    setBusyFor(c.id_descuento, "toggle");
    try {
      await fetch(`${API_BASE}/api/cupones/${c.id_descuento}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
        credentials: "include",
        body: JSON.stringify({ activo: !c.activo })
      });
      await load();
      flash(c.activo ? "Cupón desactivado" : "Cupón activado", "ok");
    } catch {
      flash("No se pudo actualizar", "err");
    } finally {
      clearBusy(c.id_descuento);
    }
  };

  const removeCoupon = async (id) => {
    if (!window.confirm("¿Eliminar el cupón?")) return;
    try {
      const r = await fetch(`${API_BASE}/api/cupones/${id}`, { method: "DELETE", credentials: "include", headers: { "X-Requested-With": "XMLHttpRequest" } });
      const j = await r.json();
      if (!j.ok) { flash(j.message || "Error al eliminar", "err"); return; }
      await load(); if (editingId === id) reset();
      flash("Cupón eliminado", "ok");
    } catch { flash("No se pudo eliminar", "err"); }
  };

  const data = coupons
    .map(c => ({ ...c, _status: getStatus(c), _tipo: normTipo(c) }))
    .filter(c => (estado === "todos" || c._status === estado))
    .filter(c => (tipoFiltro === "todos" || c._tipo === tipoFiltro))
    .filter(c => (q ? String(c.codigo).toUpperCase().includes(q.trim().toUpperCase()) : true))
    .sort((a, b) => {
      const rank = s => ({ activos: 0, futuros: 1, vencidos: 2, inactivos: 3 }[s] ?? 9);
      const r = rank(a._status) - rank(b._status);
      if (r !== 0) return r;
      return String(b.fecha_fin || "")?.localeCompare(String(a.fecha_fin || ""));
    });

  const StatusBadge = ({ s }) => (
    <span className={`badge ${s}`}>
      {s === "activos" ? "Activo" : s === "futuros" ? "Futuro" : s === "vencidos" ? "Vencido" : "Inactivo"}
    </span>
  );

  const clearSearch = () => setQ("");

  return (
    <div className="card">
      <style>{`
        @keyframes fadeUp { from { opacity:.0; transform: translateY(4px) } to { opacity:1; transform: translateY(0) } }
        .anim-in { animation: fadeUp .18s ease-out both; }
        @keyframes dotPulse { 0%{ transform: translateY(0); opacity:.5 } 50%{ transform: translateY(-2px); opacity:1 } 100%{ transform: translateY(0); opacity:.5 } }
        .three-dot { display:inline-flex; align-items:center; gap:4px; line-height:1; vertical-align:middle }
        .three-dot i { width:6px; height:6px; border-radius:50%; background: currentColor; animation: dotPulse 1s infinite; }
        .three-dot i:nth-child(2){ animation-delay:.15s }
        .three-dot i:nth-child(3){ animation-delay:.3s }
        .btn.has-loader { position: relative }
        .btn.has-loader .loader { position:absolute; inset:0; display:flex; align-items:center; justify-content:center }
        .btn.busy .label { visibility:hidden }
      `}</style>

      <div className="card-head" style={{ gap: 12, alignItems: "center" }}>
        <h2 style={{ marginRight: "auto" }}>Códigos de descuento</h2>
        <div className="tabs sm" role="tablist" aria-label="Filtros por estado">
          {["todos", "activos", "futuros", "vencidos", "inactivos"].map(s => (
            <button key={s} className={`tab ${estado === s ? "on" : ""}`} onClick={() => setEstado(s)} role="tab">
              {s[0].toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <select value={tipoFiltro} onChange={e => setTipoFiltro(e.target.value)}>
          <option value="todos">Todos los tipos</option>
          <option value="percent">% Porcentaje</option>
          <option value="amount">Monto fijo</option>
          <option value="free_shipping">Envío gratis</option>
        </select>
        <div role="search" style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 6, minWidth: 260, background: "var(--input-bg)", border: "1px solid var(--surface-bd)", borderRadius: 999, padding: "0 6px" }}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por código" style={{ height: 38, border: 0, outline: "none", background: "transparent", padding: "0 8px" }} />
          <div style={{ display: "flex", gap: 6, paddingRight: 4 }}>
            <button type="button" className="btn sm" onClick={() => setQ(q.trim().toUpperCase())}>Buscar</button>
            <button type="button" className="btn sm" onClick={clearSearch} disabled={!q}>Limpiar</button>
          </div>
        </div>
        <button className="btn" onClick={toggleForm}>
          {showForm ? "Cerrar formulario" : "Agregar nuevo código"}
        </button>
      </div>

      {msg && <div className={`notice ${msg.type} anim-in`}>{msg.text}</div>}

      {showForm && (
        <form className="coupon-form anim-in" onSubmit={onSubmit} noValidate>
          <div className="coupon-types">
            <button type="button" className={`ctype ${form.tipo === "percent" ? "on" : ""}`} onClick={() => onChangeTipo("percent")}>
              <div className="ctype-title">% Porcentaje</div>
              <div className="ctype-desc">Descuento sobre subtotal</div>
            </button>
            <button type="button" className={`ctype ${form.tipo === "amount" ? "on" : ""}`} onClick={() => onChangeTipo("amount")}>
              <div className="ctype-title">$ Monto fijo</div>
              <div className="ctype-desc">Requiere mínimo de compra</div>
            </button>
            <button type="button" className={`ctype ${form.tipo === "free_shipping" ? "on" : ""}`} onClick={() => onChangeTipo("free_shipping")}>
              <div className="ctype-title">Envío gratis</div>
              <div className="ctype-desc">Con mínimo de compra</div>
            </button>
          </div>

          <div className="form-grid">
            <div className="field field-span">
              <label>Código</label>
              <div className="input-group">
                <input name="codigo" value={form.codigo} onChange={onChange} placeholder="Ej: BIENVENI" maxLength={15} />
                <button type="button" className="btn sm" onClick={genCode}>Auto</button>
              </div>
              {errors.codigo && <span className="err">{errors.codigo}</span>}
            </div>

            {form.tipo === "percent" && (
              <div className="field">
                <label>Porcentaje (%)</label>
                <input
                  name="valor"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="60"
                  step="1"
                  value={form.valor}
                  onChange={onChange}
                  onBlur={onPercentBlur}
                  placeholder="Ej: 10"
                />
                {errors.valor && <span className="err">{errors.valor}</span>}
              </div>
            )}

            {form.tipo === "amount" && (
              <>
                <div className="field">
                  <label>Monto del descuento (CLP)</label>
                  <input name="valor" type="number" min="1" step="1" value={form.valor} onChange={onChange} placeholder="Ej: 5000" />
                  {errors.valor && <span className="err">{errors.valor}</span>}
                </div>
                <div className="field">
                  <label>Mínimo de compra (CLP)</label>
                  <input name="minimo_compra" type="number" min="1" step="1" value={form.minimo_compra} onChange={onChange} placeholder="Ej: 15000" />
                  {errors.minimo_compra && <span className="err">{errors.minimo_compra}</span>}
                </div>
              </>
            )}

            {form.tipo === "free_shipping" && (
              <div className="field">
                <label>Mínimo de compra para envío gratis (CLP)</label>
                <input name="minimo_compra" type="number" min="1" step="1" value={form.minimo_compra} onChange={onChange} placeholder="Ej: 20000" />
                {errors.minimo_compra && <span className="err">{errors.minimo_compra}</span>}
              </div>
            )}

            <div className="field">
              <label>Vigencia desde</label>
              <input name="fecha_inicio" type="date" value={form.fecha_inicio} onChange={onChange} />
            </div>
            <div className="field">
              <label>Vigencia hasta</label>
              <input name="fecha_fin" type="date" value={form.fecha_fin} onChange={onChange} />
              {errors.fecha_fin && <span className="err">{errors.fecha_fin}</span>}
            </div>
          </div>

          <div className="coupon-summary">
            <div className="hint">{summary}</div>
            <div className="row" style={{ gap: 12 }}>
              <label className="check"><input type="checkbox" name="uso_unico" checked={form.uso_unico} onChange={onChange} /> Uso único</label>
              <label className="check"><input type="checkbox" name="activo" checked={form.activo} onChange={onChange} /> Activo</label>
            </div>
            <div className="row" style={{ gap: 8 }}>
              <BusyButton
                className="btn primary"
                type="submit"
                label={submitting ? (editingId ? "Guardando cambios" : "Creando") : (editingId ? "Guardar cambios" : "Crear código")}
                onClick={undefined}
                disabled={!ready || submitting}
                busy={submitting}
              />
              {editingId && (
                <button type="button" className="btn" onClick={cancelEdit} disabled={submitting}>
                  <span className="label">Cancelar cambios</span>
                </button>
              )}
            </div>
          </div>
        </form>
      )}

      <div className={`list ${loading ? "anim-in" : ""}`}>
        {loading && (<><div className="skeleton" /><div className="skeleton" /></>)}
        {!loading && data.length === 0 && (<div className="empty anim-in"><p>No hay códigos para los filtros seleccionados.</p></div>)}
        {!loading && data.map(c => (
          <div
            key={c.id_descuento}
            className="discount anim-in"
            style={{ display: "grid", gridTemplateColumns: "minmax(220px,0.9fr) 1.1fr auto", gap: 12, alignItems: "center" }}
            onDoubleClick={() => startEdit(c)}
            role="group"
            aria-label={`Cupón ${String(c.codigo).toUpperCase()}`}
          >
            <div style={{ display: "grid", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{String(c.codigo).toUpperCase()}</div>
                <StatusBadge s={c._status} />
                <span className="badge outline">{c._tipo === "percent" ? "% Porcentaje" : c._tipo === "amount" ? "Monto fijo" : "Envío gratis"}</span>
                {c.uso_unico || c.limite_uso === 1 ? <span className="badge outline">Uso único</span> : null}
                {c.activo ? null : <span className="badge outline">Inactivo</span>}
              </div>
              <div style={{ color: "var(--text-2)" }}>
                {c._tipo === "percent"
                  ? `Descuento ${c.valor ?? c.porcentaje}% sobre subtotal`
                  : c._tipo === "amount"
                    ? `Descuento $${Number(c.valor || 0).toLocaleString("es-CL")} desde $${Number(c.minimo_compra || 0).toLocaleString("es-CL")}`
                    : `Envío gratis desde $${Number(c.minimo_compra || 0).toLocaleString("es-CL")}`}
              </div>
            </div>

            <div style={{ display: "grid", gap: 4 }}>
              <div><strong>Vigencia:</strong> {c.fecha_inicio || "—"} {c.fecha_fin ? `→ ${c.fecha_fin}` : ""}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", color: "var(--text-2)" }}>
                <span>Estado: {c._status === "activos" ? "Activo" : c._status === "futuros" ? "Futuro" : c._status === "vencidos" ? "Vencido" : "Inactivo"}</span>
                <span>Uso: {c.uso_unico || c.limite_uso === 1 ? "Único" : "Múltiple"}</span>
              </div>
            </div>

            <div className="row" style={{ gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <BusyButton
                className="btn sm"
                label="Modificar"
                onClick={() => onEdit(c)}
                disabled={!!busy[c.id_descuento]}
                busy={isBusy(c.id_descuento, "edit")}
              />
              <BusyButton
                className="btn sm"
                label="Copiar"
                onClick={() => onCopy(c)}
                disabled={!!busy[c.id_descuento]}
                busy={isBusy(c.id_descuento, "copy")}
              />
              <BusyButton
                className={`btn sm toggle ${c.activo ? "on" : "off"}`}
                label={c.activo ? "Desactivar" : "Activar"}
                onClick={() => onToggle(c)}
                disabled={!!busy[c.id_descuento]}
                busy={isBusy(c.id_descuento, "toggle")}
              />
              <button className="btn sm danger" onClick={() => removeCoupon(c.id_descuento)}><span className="label">Eliminar</span></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
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

  useEffect(() => {
    applyPrefs(prefs);
  }, []);

  useEffect(() => {
    if (prefs.scheme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const cb = () => applyPrefs({ ...prefs });
    mq.addEventListener?.("change", cb);
    return () => mq.removeEventListener?.("change", cb);
  }, [prefs.scheme]);

  const onChangePref = (e) => {
    const { name, type, checked, value } = e.target;
    const next = { ...prefs, [name]: type === "checkbox" ? checked : value };
    setPrefs(next);
    try { localStorage.setItem(LS_PREFS, JSON.stringify(next)); } catch { }
    applyPrefs(next);
    setOkPrefs("Preferencias aplicadas");
    clearTimeout(window.__prefs_to);
    window.__prefs_to = setTimeout(() => setOkPrefs(""), 1200);
  };

  const resetPrefs = () => {
    setPrefs(DEFAULT_PREFS);
    try { localStorage.setItem(LS_PREFS, JSON.stringify(DEFAULT_PREFS)); } catch { }
    applyPrefs(DEFAULT_PREFS);
    setOkPrefs("Preferencias restablecidas");
    setTimeout(() => setOkPrefs(""), 1200);
  };

  const logout = () => {
    try { localStorage.removeItem("sdh_user"); } catch { }
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
    { id: "ganancias", label: "Visualizar ganancias" },
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
      <div className="card">
        <h2>👋 Bienvenido al Panel</h2>
        <p>Resumen de actividades y alertas recientes.</p>
      </div>
      <div className="card">
        <h3>Mensajes Importantes</h3>
        <ul className="bullets">
          <li>Cliente “Juan Pérez” reporta retraso en entrega.</li>
          <li>Error en la página de pagos detectado.</li>
          <li>Pedido #1023 necesita revisión.</li>
          <li>“Cheesecake de Frambuesa” sin stock.</li>
        </ul>
      </div>
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
    </div>
  );

  //SECCION GESTIOS DE CLIENTES
  const RenderClientes = () => {
    const [clientes, setClientes] = useState([]);

    useEffect(() => {
      const fetchClientes = async () => {
        try {
          const res = await fetch("http://localhost:5000/api/clientes");
          const data = await res.json();
          console.log("Clientes recibidos desde backend:", data);
          setClientes(data);
        } catch (err) {
          console.error("Error al obtener clientes", err);
        }
      };
      fetchClientes();
    }, []);

    const eliminarCliente = async (correo) => {
      if (!window.confirm("¿Seguro que deseas eliminar este cliente?")) return;

      try {
        const response = await fetch(`http://localhost:5000/api/clientes/correo/${correo}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Error al eliminar cliente");

        setClientes(clientes.filter((c) => c.correo !== correo));
      } catch (err) {
        console.error("Error al eliminar cliente", err);
      }
    };

    return (
      <div className="card">
        <h2>Gestión de clientes</h2>
        <div className="list">
          {clientes.length === 0 ? (
            <p>No hay clientes registrados o error al cargar.</p>
          ) : (
            clientes.map((c, i) => (
              <div key={c.id || i} className="client">
                <div>
                  <h4>{c.nombre}</h4>
                  <p>{c.correo}</p>
                  <p>{c.telefono}</p>
                </div>
                <div className="row">
                  <button
                    onClick={() => eliminarCliente(c.correo)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };


  const renderInteractivo = () => (
    <div className="card">
      <h2>Dashboard interactivo</h2>
      <p style={{ color: "#555" }}>
        Cuando conectes tu base de datos, este panel mostrará KPIs reales.
      </p>
    </div>
  );

  // Cuenta conectada
  const renderAccount = () => <CuentaPanel />;

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
          <label>Modo de color</label>
          <div style={{ display: "flex", gap: 8 }}>
            <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input type="radio" name="scheme" value="system" checked={prefs.scheme === "system"} onChange={onChangePref} /> Sistema
            </label>
            <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input type="radio" name="scheme" value="light" checked={prefs.scheme === "light"} onChange={onChangePref} /> Claro
            </label>
            <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input type="radio" name="scheme" value="dark" checked={prefs.scheme === "dark"} onChange={onChangePref} /> Oscuro
            </label>
          </div>
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
          {active === "pedidos" && <PedidosSection />}
          {active === "productos" && <ProductosSection />}
          {active === "clientes" && <RenderClientes />}
          {active === "ganancias" && <GananciasSection />}
          {active === "interactivo" && renderInteractivo()}

          <section style={{ display: active === "descuentos" ? "block" : "none" }}>
            <DescuentosSection />
          </section>

          {active === "account" && renderAccount()}
          {active === "settings" && renderSettings()}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default UserAdmin;