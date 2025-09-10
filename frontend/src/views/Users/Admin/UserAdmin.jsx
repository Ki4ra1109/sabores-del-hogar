import React, { useState, useEffect, useRef } from "react";
import { Footer } from "../../../componentes/Footer";
import { HeaderAdmin } from "./HeaderAdmin";
import "./UserAdmin.css";
import CuentaPanel from "../../../componentes/CuentaPanel";

const THEMES = {
  cafe:  { brand: "#442918", btn: "#6d4a35" },
  claro: { brand: "#744c33", btn: "#9a6a4a" },
  pastel:{ brand: "#7e5a4a", btn: "#a97c68" },
  cacao: { brand: "#5a3422", btn: "#80513b" },
};

const DEFAULT_PREFS = {
  theme: "cafe",     
  scheme: "system", 
  font: "md",        
  lang: "es",        
  showAvatar: true,
  notifications: true,
};

const LS_PREFS = "sdh_prefs";
const LS_LANG  = "sdh_lang";

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

  // Tamaño de fuente base
  root.setAttribute("data-font", prefs.font);

  // Idioma persistido 
  try { localStorage.setItem(LS_LANG, prefs.lang); } catch {}
}

function PedidosSection() {
  const [q, setQ] = useState("");
  const pedidos = [];
  const list = pedidos.filter((p) =>
    q.trim() ? String(p.id).includes(q.trim()) : true
  );

  return (
    <>
      <div className="orders-search">
        <input
          className="orders-input"
          type="number"
          inputMode="numeric"
          placeholder="Buscar por # de pedido (ej: 1004)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="card">
        <h2>Gestión de pedidos</h2>
        <div className="orders">
          {list.length === 0 && (
            <div className="empty">
              <p>No hay pedidos registrados todavía.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function GananciasSection() {
  const periodos = {
    day: [
      { l: "Lun", v: 45600 },
      { l: "Mar", v: 70000 },
      { l: "Mié", v: 55090 },
      { l: "Jue", v: 84900 },
      { l: "Vie", v: 60500 },
      { l: "Sáb", v: 95000 },
      { l: "Dom", v: 54500 },
    ],
    week: [
      { l: "Sem 1", v: 28000 },
      { l: "Sem 2", v: 35000 },
      { l: "Sem 3", v: 30000 },
      { l: "Sem 4", v: 40000 },
    ],
    month: [
      { l: "Ene", v: 120000 },
      { l: "Feb", v: 110000 },
      { l: "Mar", v: 140000 },
      { l: "Abr", v: 130000 },
      { l: "May", v: 150000 },
      { l: "Jun", v: 160000 },
    ],
  };
  const [period, setPeriod] = useState("day");
  const data = periodos[period];
  const max = Math.max(...data.map((d) => d.v));

  return (
    <div className="card">
      <div className="card-head">
        <h2>Ganancias</h2>
        <div className="tabs">
          <button
            className={`tab ${period === "day" ? "on" : ""}`}
            onClick={() => setPeriod("day")}
          >
            Día
          </button>
          <button
            className={`tab ${period === "week" ? "on" : ""}`}
            onClick={() => setPeriod("week")}
          >
            Semana
          </button>
          <button
            className={`tab ${period === "month" ? "on" : ""}`}
            onClick={() => setPeriod("month")}
          >
            Mes
          </button>
        </div>
      </div>
      <div className="chart">
        {data.map((d, i) => (
          <div key={i} className="col">
            <div
              className="bar"
              style={{ height: `${(d.v / max) * 100}%` }}
              title={`$${d.v.toLocaleString()}`}
            />
            <span className="lbl">{d.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductosSection() {
  const [showForm, setShowForm] = useState(false);
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [preview, setPreview] = useState({ open: false, src: "", alt: "" });
  const [zoom, setZoom] = useState(1);

  const openPreview = (src, alt) => {
    setPreview({ open: true, src, alt });
    setZoom(1);
  };
  const closePreview = () => setPreview({ open: false, src: "", alt: "" });
  const toggleZoom = () => setZoom((z) => (z === 1 ? 2.25 : 1));

  useEffect(() => {
    if (!preview.open) return;
    const onKey = (e) => e.key === "Escape" && closePreview();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [preview.open]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("productos") || "[]");
    if (Array.isArray(saved)) setItems(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("productos", JSON.stringify(items));
  }, [items]);

  const [form, setForm] = useState({
    nombre: "",
    categoria: "tortas",
    precioMin: "",
    precioMax: "",
    imagen: "",
    descripcion: "",
    porciones: [],
    activo: true,
    usarPorciones: true,
    porcionPrecios: {},
  });
  const [errors, setErrors] = useState({});

  const toggleForm = () => setShowForm((v) => !v);

  const PORCIONES = [12, 18, 24, 30, 50];

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

  const onUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, imagen: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => setForm((prev) => ({ ...prev, imagen: "" }));

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "Ingresa un nombre";
    if (!form.categoria) e.categoria = "Selecciona una categoría";

    const min = num(form.precioMin);
    const max = num(form.precioMax);
    if (!Number.isFinite(min) || min <= 0) e.precioMin = "Ingresa un mínimo válido";
    if (!Number.isFinite(max) || max <= 0) e.precioMax = "Ingresa un máximo válido";
    if (Number.isFinite(min) && Number.isFinite(max) && min >= max)
      e.precioMax = "El máximo debe ser mayor al mínimo";

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
      nombre: "",
      categoria: "tortas",
      precioMin: "",
      precioMax: "",
      imagen: "",
      descripcion: "",
      porciones: [],
      activo: true,
      usarPorciones: true,
      porcionPrecios: {},
    });
    setErrors({});
    setEditingId(null);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const min = num(form.precioMin);
    const max = num(form.precioMax);

    const payload = {
      id: editingId ?? Date.now(),
      nombre: form.nombre.trim(),
      categoria: form.categoria,
      precioMin: min,
      precioMax: max,
      imagen: form.imagen.trim(),
      descripcion: form.descripcion.trim(),
      variantes: form.usarPorciones
        ? form.porciones.map((p) => ({
            personas: p,
            precio: num(form.porcionPrecios[p]) || suggestions[p] || min,
          }))
        : [],
      activo: form.activo,
    };

    setItems((prev) =>
      editingId ? prev.map((it) => (it.id === editingId ? payload : it)) : [payload, ...prev]
    );

    reset();
    setShowForm(false);
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    const porcionPrecios = {};
    (item.variantes || []).forEach((v) => {
      porcionPrecios[v.personas] = String(v.precio || "");
    });
    setForm({
      nombre: item.nombre || "",
      categoria: item.categoria || "tortas",
      precioMin: item.precioMin ? String(item.precioMin) : "",
      precioMax: item.precioMax ? String(item.precioMax) : "",
      imagen: item.imagen || "",
      descripcion: item.descripcion || "",
      porciones: (item.variantes || []).map((v) => v.personas).sort((a, b) => a - b),
      activo: !!item.activo,
      usarPorciones: (item.variantes || []).length > 0 || item.categoria === "tortas",
      porcionPrecios,
    });
    setShowForm(true);
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
    if (editingId === id) reset();
  };

  const safeThumb = (src) => {
    const url = (src || "").trim();
    if (!url) return "/placeholder.jpg";
    if (
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("/") ||
      url.startsWith("data:") ||
      url.startsWith("blob:")
    )
      return url;
    return "/placeholder.jpg";
  };

  const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: 24,
  };
  const viewportStyle = {
    position: "relative",
    maxWidth: "90vw",
    maxHeight: "85vh",
    overflow: "auto",
    background: "#fff",
    borderRadius: 10,
    boxShadow: "0 10px 30px rgba(0,0,0,.25)",
    padding: 8,
  };
  const imgStyle = {
    display: "block",
    width: `${zoom * 100}%`,
    height: "auto",
    maxWidth: "none",
    cursor: zoom === 1 ? "zoom-in" : "zoom-out",
  };
  const closeBtn = {
    position: "absolute",
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 999,
    border: 0,
    background: "#ffffff",
    color: "#333",
    fontSize: 22,
    lineHeight: 1,
    cursor: "pointer",
    boxShadow: "0 6px 18px rgba(0,0,0,.2)",
  };
  const hintStyle = {
    position: "absolute",
    left: 12,
    bottom: 10,
    fontSize: 12,
    color: "#666",
    background: "rgba(255,255,255,.85)",
    padding: "2px 8px",
    borderRadius: 6,
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
              <input
                name="imagen"
                value={form.imagen}
                onChange={onChange}
                placeholder="Pega una URL (https://...)"
              />
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
        {items.length === 0 && (
          <div className="empty">
            <p>No hay productos agregados aún.</p>
          </div>
        )}

        {items.map((p) => {
          const variantes = (p.variantes || [])
            .slice()
            .sort((a, b) => a.personas - b.personas);

          return (
            <article key={p.id} className="product modern">
              <div className="thumb">
                <img
                  src={safeThumb(p.imagen)}
                  alt={p.nombre}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.jpg";
                  }}
                  onClick={() => openPreview(safeThumb(p.imagen), p.nombre)}
                  style={{ cursor: "zoom-in" }}
                  title="Ver imagen"
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
                <button className="btn sm" onClick={() => startEdit(p)}>
                  Modificar
                </button>
                <button className="btn sm danger" onClick={() => removeItem(p.id)}>
                  Eliminar
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {preview.open && (
        <div
          style={overlayStyle}
          onClick={closePreview}
          role="dialog"
          aria-modal="true"
        >
          <div style={viewportStyle} onClick={(e) => e.stopPropagation()}>
            <img src={preview.src} alt={preview.alt} onDoubleClick={toggleZoom} style={imgStyle} />
            <button style={closeBtn} onClick={closePreview} aria-label="Cerrar">
              ×
            </button>
            <div style={hintStyle}>
              Doble clic para {zoom === 1 ? "acercar" : "alejar"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DescuentosSection() {
  const [showForm, setShowForm] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const [estado, setEstado] = useState("activos");
  const [tipoFiltro, setTipoFiltro] = useState("todos");
  const [q, setQ] = useState("");

  const API_BASE = import.meta.env?.VITE_API_URL || "http://localhost:5000";

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
      const r = await fetch(`${API_BASE}/api/cupones`);
      const j = await r.json();
      setCoupons(Array.isArray(j.items) ? j.items : []);
    } catch {
      alert("No se pudo cargar la lista de cupones");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const toggleForm = () => setShowForm(v => !v);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };
  const onChangeTipo = (t) => {
    setForm(prev => ({
      ...prev,
      tipo: t,
      valor: t === "free_shipping" ? "" : (prev.valor || (t === "percent" ? 10 : 1000)),
      minimo_compra: (t === "percent") ? "" : (prev.minimo_compra || 0)
    }));
    setErrors({});
  };

  const getStatus = (c) => {
    if (c.activo === false) return "inactivos";
    const today = new Date().toISOString().slice(0,10);
    if (c.fecha_inicio && c.fecha_inicio > today) return "futuros";
    if (c.fecha_fin && c.fecha_fin < today) return "vencidos";
    return "activos";
  };
  const normTipo = (c) => c.tipo || (c.porcentaje != null ? "percent" : (c.valor != null ? "amount" : "free_shipping"));

  const validate = () => {
    const e = {};
    const code = form.codigo.trim().toUpperCase();
    if (!code) e.codigo = "Ingresa un código";
    const exists = coupons.some(c => c.codigo === code && c.id_descuento !== editingId);
    if (code && exists) e.codigo = "El código ya existe";
    if (form.fecha_inicio && form.fecha_fin && new Date(form.fecha_inicio) > new Date(form.fecha_fin)) {
      e.fecha_fin = "La fecha fin debe ser mayor o igual a inicio";
    }
    if (form.tipo === "percent") {
      const n = Number(form.valor);
      if (!form.valor || Number.isNaN(n) || n < 1 || n > 60) e.valor = "Porcentaje entre 1 y 60";
    }
    if (form.tipo === "free_shipping") {
      const min = Number(form.minimo_compra);
      if (Number.isNaN(min) || min <= 0) e.minimo_compra = "Define un mínimo de compra (> 0)";
    }
    if (form.tipo === "amount") {
      const n = Number(form.valor);
      const min = Number(form.minimo_compra);
      if (!form.valor || Number.isNaN(n) || n <= 0) e.valor = "Monto del descuento (> 0)";
      if (Number.isNaN(min) || min <= 0) e.minimo_compra = "Mínimo de compra (> 0)";
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

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || submitting) return;
    setSubmitting(true);

    const payload = {
      codigo: form.codigo.trim().toUpperCase(),
      tipo: form.tipo,
      valor: form.tipo === "free_shipping" ? null : Number(form.valor),
      minimo_compra: (form.tipo === "percent") ? null : Number(form.minimo_compra),
      fecha_inicio: form.fecha_inicio || null,
      fecha_fin: form.fecha_fin || null,
      uso_unico: !!form.uso_unico,
      activo: !!form.activo
    };

    try {
      const url = editingId ? `${API_BASE}/api/cupones/${editingId}` : `${API_BASE}/api/cupones`;
      const method = editingId ? "PUT" : "POST";
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const j = await r.json();
      if (!j.ok) { alert(j.message || "Error al guardar"); return; }
      await load(); reset(); setShowForm(false);
    } catch {
      alert("No se pudo guardar el cupón");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (c) => {
    const tipo = normTipo(c);
    const valor = c.valor ?? (c.porcentaje != null ? Number(c.porcentaje) : "");
    setEditingId(c.id_descuento);
    setForm({
      codigo: c.codigo,
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

  const removeCoupon = async (id) => {
    if (!window.confirm("¿Eliminar el cupón?")) return;
    try {
      const r = await fetch(`${API_BASE}/api/cupones/${id}`, { method: "DELETE" });
      const j = await r.json();
      if (!j.ok) { alert(j.message || "Error al eliminar"); return; }
      await load(); if (editingId === id) reset();
    } catch { alert("No se pudo eliminar"); }
  };

  const copyCode = async (code) => {
    try { await navigator.clipboard.writeText(code); } catch {}
  };
  const toggleActive = async (c) => {
    try {
      await fetch(`${API_BASE}/api/cupones/${c.id_descuento}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !c.activo })
      });
      await load();
    } catch { alert("No se pudo actualizar el estado"); }
  };

  const data = coupons
    .map(c => ({ ...c, _status: getStatus(c), _tipo: normTipo(c) }))
    .filter(c => (estado === "todos" || c._status === estado))
    .filter(c => (tipoFiltro === "todos" || c._tipo === tipoFiltro))
    .filter(c => (q ? c.codigo.toUpperCase().includes(q.trim().toUpperCase()) : true))
    .sort((a,b) => {
      const rank = s => ({activos:0,futuros:1,vencidos:2,inactivos:3}[s] ?? 9);
      const r = rank(a._status) - rank(b._status);
      if (r !== 0) return r;
      return String(b.fecha_fin||"")?.localeCompare(String(a.fecha_fin||""));
    });

  const StatusBadge = ({s}) => (
    <span className={`badge ${s}`}>
      {s === "activos" ? "Activo"
        : s === "futuros" ? "Futuro"
        : s === "vencidos" ? "Vencido" : "Inactivo"}
    </span>
  );

  return (
    <div className="card">
      <div className="card-head" style={{gap:12, alignItems:"center"}}>
        <h2 style={{marginRight:"auto"}}>Códigos de descuento</h2>
        <div className="tabs sm" role="tablist" aria-label="Filtros por estado">
          {["todos","activos","futuros","vencidos","inactivos"].map(s => (
            <button key={s} className={`tab ${estado===s?"on":""}`} onClick={()=>setEstado(s)} role="tab">
              {s[0].toUpperCase()+s.slice(1)}
            </button>
          ))}
        </div>
        <select value={tipoFiltro} onChange={e=>setTipoFiltro(e.target.value)}>
          <option value="todos">Todos los tipos</option>
          <option value="percent">% Porcentaje</option>
          <option value="amount">Monto fijo</option>
          <option value="free_shipping">Envío gratis</option>
        </select>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar código…" style={{minWidth:180}} />
        <button className="btn" onClick={toggleForm}>
          {showForm ? "Cerrar formulario" : "Agregar nuevo código"}
        </button>
      </div>

      {showForm && (
        <form className="product-form" onSubmit={onSubmit} noValidate>
          <div className="form-grid">
            <div className="field">
              <label>Código</label>
              <input name="codigo" value={form.codigo} onChange={onChange} placeholder="Ej: CUMP2025" />
              {errors.codigo && <span className="err">{errors.codigo}</span>}
            </div>
            <div className="field">
              <label>Tipo de descuento</label>
              <select name="tipo" value={form.tipo} onChange={e=>onChangeTipo(e.target.value)}>
                <option value="percent">% Porcentaje</option>
                <option value="amount">Monto fijo (CLP)</option>
                <option value="free_shipping">Envío gratis</option>
              </select>
            </div>
            {form.tipo === "percent" && (
              <div className="field">
                <label>Porcentaje (%)</label>
                <input name="valor" type="number" min="1" max="60" step="1" value={form.valor} onChange={onChange} placeholder="Ej: 10 = 10%" />
                {errors.valor && <span className="err">{errors.valor}</span>}
              </div>
            )}
            {form.tipo === "free_shipping" && (
              <div className="field">
                <label>Mínimo de compra para envío gratis (CLP)</label>
                <input name="minimo_compra" type="number" min="1" step="1" value={form.minimo_compra} onChange={onChange} placeholder="Ej: 20000" />
                {errors.minimo_compra && <span className="err">{errors.minimo_compra}</span>}
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
            <div className="field">
              <label>Vigencia desde</label>
              <input name="fecha_inicio" type="date" value={form.fecha_inicio} onChange={onChange} />
            </div>
            <div className="field">
              <label>Vigencia hasta</label>
              <input name="fecha_fin" type="date" value={form.fecha_fin} onChange={onChange} />
              {errors.fecha_fin && <span className="err">{errors.fecha_fin}</span>}
            </div>
            <div className="field check">
              <label><input type="checkbox" name="uso_unico" checked={form.uso_unico} onChange={onChange}/> Uso único</label>
            </div>
            <div className="field check">
              <label><input type="checkbox" name="activo" checked={form.activo} onChange={onChange}/> Activo</label>
            </div>
          </div>
          <div className="row mt form-actions">
            <button type="submit" className="btn primary" disabled={submitting}>
              {submitting ? "Guardando..." : editingId ? "Guardar cambios" : "Crear código"}
            </button>
            <button type="button" className="btn" onClick={reset} disabled={submitting}>Limpiar</button>
          </div>
        </form>
      )}

      <div className="list">
        {loading && (
          <>
            <div className="skeleton" />
            <div className="skeleton" />
          </>
        )}
        {!loading && data.length === 0 && (
          <div className="empty"><p>No hay códigos para los filtros seleccionados.</p></div>
        )}
        {!loading && data.map(c => (
          <div key={c.id_descuento} className="discount">
            <div>
              <p style={{display:"flex", gap:8, alignItems:"center"}}>
                <strong>Código:</strong> {c.codigo}
                <StatusBadge s={c._status} />
                <span className="badge outline">{c._tipo === "percent" ? "%": c._tipo === "amount" ? "Monto" : "Envío"}</span>
                {c.uso_unico || c.limite_uso === 1 ? <span className="badge outline">Uso único</span> : null}
              </p>
              <p>
                <strong>Tipo:</strong>{" "}
                {c._tipo === "percent"
                  ? `${c.valor ?? c.porcentaje}%`
                  : c._tipo === "amount"
                    ? `$${Number(c.valor||0).toLocaleString("es-CL")} sobre $${Number(c.minimo_compra||0).toLocaleString("es-CL")}`
                    : `Envío gratis sobre $${Number(c.minimo_compra||0).toLocaleString("es-CL")}`}
              </p>
              {(c.fecha_inicio || c.fecha_fin) && (
                <p><strong>Vigencia:</strong> {c.fecha_inicio || "—"} {c.fecha_fin ? `→ ${c.fecha_fin}` : ""}</p>
              )}
            </div>
            <div className="row" style={{gap:8}}>
              <button className="btn sm" title="Copiar código" onClick={()=>copyCode(c.codigo)}>Copiar</button>
              <button className="btn sm" onClick={() => startEdit(c)}>Modificar</button>
              <button className="btn sm" onClick={() => toggleActive(c)}>
                {c.activo === false ? "Activar" : "Desactivar"}
              </button>
              <button className="btn sm danger" onClick={() => removeCoupon(c.id_descuento)}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// userAdmin 
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
  const [errPrefs, setErrPrefs] = useState("");

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
    try { localStorage.setItem(LS_PREFS, JSON.stringify(next)); } catch {}
    applyPrefs(next);
    setOkPrefs("Preferencias aplicadas");
    clearTimeout(window.__prefs_to);
    window.__prefs_to = setTimeout(() => setOkPrefs(""), 1200);
  };

  const resetPrefs = () => {
    setPrefs(DEFAULT_PREFS);
    try { localStorage.setItem(LS_PREFS, JSON.stringify(DEFAULT_PREFS)); } catch {}
    applyPrefs(DEFAULT_PREFS);
    setOkPrefs("Preferencias restablecidas");
    setTimeout(() => setOkPrefs(""), 1200);
  };

  const testNotifs = async () => {
    try {
      if (!("Notification" in window)) return setErrPrefs("Tu navegador no soporta notificaciones.");
      let perm = Notification.permission;
      if (perm !== "granted") perm = await Notification.requestPermission();
      if (perm === "granted") {
        new Notification("✅ Notificaciones activas", { body: "Este es un mensaje de prueba." });
      } else {
        setErrPrefs("Permiso denegado.");
      }
    } catch {
      setErrPrefs("No se pudo mostrar la notificación.");
    } finally {
      setTimeout(() => setErrPrefs(""), 1400);
    }
  };

  const logout = () => {
    try { localStorage.removeItem("sdh_user"); } catch {}
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

  const renderClientes = () => (
    <div className="card">
      <h2>Gestión de clientes</h2>
      <div className="list">
        {[
          { n: "Joaquín Riveros", e: "joaquin.riveros@example.com", t: "+56 9 2345 6789" },
          { n: "Camila Fernández", e: "camila.fernandez@example.com", t: "+56 9 8765 4321" },
          { n: "Sebastián Morales", e: "sebastian.morales@example.com", t: "+56 9 1122 3344" },
          { n: "Valentina Rojas", e: "valentina.rojas@example.com", t: "+56 9 5566 7788" },
        ].map((c, i) => (
          <div key={i} className="client">
            <div>
              <h4>{c.n}</h4>
              <p>{c.e}</p>
              <p>{c.t}</p>
            </div>
            <div className="row">
              <button className="btn sm">Modificar</button>
              <button className="btn sm danger">Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

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
      <h2>Configuración</h2>

      {okPrefs && <div className="profile-ok" style={{marginBottom:10}}>{okPrefs}</div>}
      {errPrefs && <div className="profile-alert" style={{marginBottom:10}}>{errPrefs}</div>}

      <div className="grid2">
        <div className="field">
          <label>Tema de color</label>
          <select name="theme" value={prefs.theme} onChange={onChangePref}>
            <option value="cafe">Café (default)</option>
            <option value="claro">Claro</option>
            <option value="pastel">Pastel</option>
            <option value="cacao">Cacao</option>
          </select>
        </div>

        <div className="field">
          <label>Modo</label>
          <select name="scheme" value={prefs.scheme} onChange={onChangePref}>
            <option value="system">Usar el sistema</option>
            <option value="light">Claro</option>
            <option value="dark">Oscuro</option>
          </select>
        </div>

        <div className="field">
          <label>Tamaño de fuente</label>
          <select name="font" value={prefs.font} onChange={onChangePref}>
            <option value="sm">Pequeña</option>
            <option value="md">Media</option>
            <option value="lg">Grande</option>
          </select>
        </div>

        <div className="field">
          <label>Idioma</label>
          <select name="lang" value={prefs.lang} onChange={onChangePref}>
            <option value="es">Español</option>
            <option value="en">Inglés</option>
            <option value="pt">Portugués</option>
          </select>
        </div>

        <div className="field check">
          <label>
            <input type="checkbox" name="notifications" checked={prefs.notifications} onChange={onChangePref} />
            Notificaciones
          </label>
          <div className="row">
            <button type="button" className="btn sm" onClick={testNotifs}>Probar</button>
          </div>
        </div>

        <div className="field check">
          <label>
            <input type="checkbox" name="showAvatar" checked={prefs.showAvatar} onChange={onChangePref} />
            Mostrar foto de perfil
          </label>
        </div>
      </div>

      <div className="row mt">
        <button type="button" className="btn" onClick={resetPrefs}>Restablecer</button>
        <button type="button" className="btn danger" onClick={logout}>Cerrar sesión</button>
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
          {active === "clientes" && renderClientes()}
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
