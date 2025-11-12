import React, { useEffect, useState } from "react";
import "./GestionProductos.css";

const API_BASE = import.meta.env?.VITE_API_URL || "http://localhost:5000";

function GestionProductos() {
  // listado
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  // formulario
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // búsqueda y refresco
  const [q, setQ] = useState("");

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

  const refrescar = () => {
    setLoadingItems(true);
    fetch(`${API_BASE}/api/productos`)
      .then(r => r.json())
      .then(d => setItems(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoadingItems(false));
  };

  // ---------- utilidades de imagen ----------
  const safeThumb = (src) => {
    const url = (src || "").trim();
    if (!url) return "https://via.placeholder.com/300x300.png?text=Imagen";
    if (
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("data:") ||
      url.startsWith("blob:")
    ) return url;
    return url.startsWith("/") ? url : `/${url}`;
  };

  const getProductImage = (p) =>
    p?.imagen || p?.imagen_url || p?.image || p?.url || "";

  // ---------- formulario (crear/editar) ----------
  const PORCIONES = [12, 18, 24, 30, 50];

  const [form, setForm] = useState({
    sku: "",
    nombre: "",
    categoria: "tortas",
    precioMin: "",
    precioMax: "",
    imagen: "",
    descripcion: "",
    porciones: PORCIONES.slice(),
    activo: true,
    usarPorciones: true,
    porcionPrecios: {},
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
    if (u.startsWith("data:") || u.startsWith("blob:") || u.startsWith("/")) return true;
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
    if (!ps.length || !Number.isFinite(min) || !Number.isFinite(max) || min <= 0 || max <= 0 || min > max) {
      return {};
    }
    const pMin = ps[0];
    const pMax = ps[ps.length - 1];
    const map = {};
    ps.forEach((p) => {
      if (pMin === pMax) map[p] = max;
      else {
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
    const sug = getSuggested();
    if (!Object.keys(sug).length) return;
    setForm((prev) => ({
      ...prev,
      porcionPrecios: {
        ...prev.porcionPrecios,
        ...Object.fromEntries(prev.porciones.map((p) => [p, String(sug[p] ?? "")])),
      },
    }));
  };

  const onUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append("file", file);
      const resp = await fetch(`${API_BASE}/api/uploads`, { method: "POST", body: fd });
      const j = await resp.json();
      if (!resp.ok) {
        console.error("Upload error:", j);
        alert("No se pudo subir la imagen");
        return;
      }
      setForm((prev) => ({ ...prev, imagen: j.imagen_url || j.path || "" }));
    } catch (err) {
      console.error("Error en upload:", err);
      alert("No se pudo subir la imagen");
    }
  };

  const validateImageUrl = (url) =>
    new Promise((resolve) => {
      try {
        const img = new Image();
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
    alert(ok ? "La URL parece válida." : "No se pudo cargar la imagen desde esa URL.");
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
    if (Number.isFinite(min) && Number.isFinite(max) && min >= max) e.precioMax = "El máximo debe ser mayor al mínimo";

    if (!isValidUrl(form.imagen)) e.imagen = "URL de imagen no válida";

    if (form.usarPorciones && form.porciones.length > 0) {
      const ps = form.porciones.slice().sort((a, b) => a - b);
      let prevPrice = null;
      ps.forEach((p, idx) => {
        const val = num(form.porcionPrecios[p]);
        const cap = suggestions[p];
        if (!Number.isFinite(val) || val <= 0) {
          e[`por_${p}`] = "Ingresa un precio válido";
        } else {
          if (Number.isFinite(cap) && val > cap) e[`por_${p}`] = `No debe superar $${cap.toLocaleString("es-CL")} (sugerido)`;
          if (prevPrice != null && val < prevPrice) e[`por_${p}`] = `Debe ser ≥ al precio de ${ps[idx - 1]} personas ($${prevPrice.toLocaleString("es-CL")})`;
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
      if (!res.ok) throw new Error(json?.message || json?.error || "Error al guardar producto");
      // recargar lista
      refrescar();
      reset();
      setShowForm(false);
    } catch (err) {
      console.error("Error al guardar producto:", err);
      alert("No se pudo guardar el producto. " + (err.message || ""));
    }
  };

  const startEdit = (item) => {
    setEditingId(item.sku ?? item.id);
    const porcionPrecios = {};
    (item.variantes || []).forEach((v) => {
      if (v && v.personas) porcionPrecios[v.personas] = String(v.precio ?? "");
    });

    const suggestedMap = (() => {
      const map = {};
      const min = item.precioMin ?? null;
      const max = item.precioMax ?? null;
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
      if (!porcionPrecios[p]) porcionPrecios[p] = suggestedMap[p] ? String(suggestedMap[p]) : "";
    });

    setForm({
      sku: item.sku || "",
      nombre: item.nombre || "",
      categoria: item.categoria || "tortas",
      precioMin: item.precioMin ? String(item.precioMin) : "",
      precioMax: item.precioMax ? String(item.precioMax) : "",
      imagen: item.imagen || item.imagen_url || item.image || "",
      descripcion: item.descripcion || "",
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
        refrescar();
        if (editingId === id) reset();
      } catch (err) {
        console.error("Error al eliminar producto:", err);
        alert("No se pudo eliminar el producto.");
      }
    })();
  };

  // filtro por búsqueda
  const viewItems = items.filter((p) => {
    if (!q.trim()) return true;
    const s = q.toLowerCase();
    return (p.nombre || "").toLowerCase().includes(s) || String(p.sku || "").toLowerCase().includes(s);
  });

  return (
    <div className="card productos-card">
      <div className="card-head">
        <h2>Gestión de productos</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            className="productos-search"
            placeholder="Buscar por nombre o SKU…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="btn sm" onClick={refrescar}>Refrescar</button>
          <button className="btn sm" onClick={toggleForm}>
            {showForm ? "Cerrar formulario" : "Añadir producto"}
          </button>
        </div>
      </div>

      {showForm && (
        <form className="product-form" onSubmit={onSubmit} noValidate>
          <div className="form-grid">
            <div className="field">
              <label>SKU</label>
              <input name="sku" value={form.sku} onChange={onChange} placeholder="Ej: TCHOC" />
              {errors.sku && <span className="err">{errors.sku}</span>}
            </div>

            <div className="field">
              <label>Nombre</label>
              <input name="nombre" value={form.nombre} onChange={onChange} placeholder="Ej: Torta de Chocolate" />
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
              <input name="precioMin" type="number" min="0" step="1" value={form.precioMin} onChange={onChange} placeholder="Ej: 25000" />
              {errors.precioMin && <span className="err">{errors.precioMin}</span>}
            </div>

            <div className="field">
              <label>Precio máximo</label>
              <input name="precioMax" type="number" min="0" step="1" value={form.precioMax} onChange={onChange} placeholder="Ej: 75000" />
              {errors.precioMax && <span className="err">{errors.precioMax}</span>}
            </div>

            <div className="field field-span">
              <label>Imagen del producto</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  name="imagen"
                  value={form.imagen}
                  onChange={onChange}
                  placeholder="Pega una URL (https://...)"
                  style={{ flex: 1 }}
                />
                <button type="button" className="btn sm" onClick={onValidateUrlClick}>Validar URL</button>
              </div>
              <div className="row" style={{ gap: 8, marginTop: 8, alignItems: "center" }}>
                <input type="file" accept="image/*" onChange={onUploadImage} />
                {form.imagen && (
                  <>
                    <img
                      src={safeThumb(form.imagen)}
                      alt="preview"
                      style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 6, border: "1px solid #ddd" }}
                    />
                    <button type="button" className="btn sm danger" onClick={clearImage}>Quitar imagen</button>
                  </>
                )}
              </div>
              {errors.imagen && <span className="err">{errors.imagen}</span>}
            </div>

            <div className="field field-span">
              <label>Descripción breve</label>
              <textarea name="descripcion" value={form.descripcion} onChange={onChange} placeholder="Opcional" rows={3} />
            </div>

            <div className="field field-span">
              <label>Porciones</label>
              {form.categoria === "dulces" && (
                <div className="field check" style={{ marginBottom: 8 }}>
                  <label>
                    <input type="checkbox" name="usarPorciones" checked={form.usarPorciones} onChange={onChange} /> Habilitar porciones
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
                <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
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
                          {errors[`por_${p}`] && <div className="err">{errors[`por_${p}`]}</div>}
                        </div>
                        <div className="row">
                          <input
                            type="number"
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
                <input type="checkbox" name="activo" checked={form.activo} onChange={onChange} /> Activo
              </label>
            </div>
          </div>

          <div className="row mt form-actions">
            <button type="submit" className="btn primary">{editingId ? "Guardar cambios" : "Guardar producto"}</button>
            <button type="button" className="btn" onClick={reset}>Limpiar</button>
          </div>
        </form>
      )}

      <div className="grid prod-grid">
        {viewItems.length === 0 && !loadingItems && (
          <div className="empty"><p>No hay productos agregados aún.</p></div>
        )}
        {loadingItems && <div className="empty"><p>Cargando productos...</p></div>}

        {viewItems.map((p) => {
          const variantes = (p.variantes || []).slice().sort((a, b) => a.personas - b.personas);
          return (
            <article key={p.sku ?? p.id} className="product modern">
              <div className="thumb">
                <img
                  src={safeThumb(getProductImage(p))}
                  alt={p.nombre}
                  loading="lazy"
                  onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/300x300.png?text=Imagen"; }}
                  style={{ cursor: "default" }}
                />
              </div>

              <div className="body">
                <div className="title-row">
                  <h3 className="title">{p.nombre || "Sin nombre"}</h3>
                  {p.categoria && <span className="badge">{p.categoria}</span>}
                </div>

                {p.descripcion && <p className="desc">{p.descripcion}</p>}

                {p.precioMin && p.precioMax && (
                  <div className="price-range">
                    <span>Desde ${Number(p.precioMin).toLocaleString("es-CL")}</span>
                    <span>Hasta ${Number(p.precioMax).toLocaleString("es-CL")}</span>
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

export default GestionProductos;