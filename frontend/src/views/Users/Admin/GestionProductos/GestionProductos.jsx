import React, { useEffect, useState } from "react";
import "./GestionProductos.css";

const API_BASE = import.meta.env?.VITE_API_URL || "http://localhost:5000";

function GestionProductos() {
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [q, setQ] = useState("");

  const PORCIONES = [12, 18, 24, 30, 50];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoadingItems(true);
      const res = await fetch(`${API_BASE}/api/productos`);
      if (!res.ok) throw new Error("Error al cargar productos");
      const json = await res.json();
      setItems(Array.isArray(json) ? json : []);
    } catch (err) {
      console.error("No se pudo cargar productos:", err);
    } finally {
      setLoadingItems(false);
    }
  };

  const refrescar = fetchProducts;

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
    porcionPrecios: {},
  });
  const [errors, setErrors] = useState({});

  const num = (v) => {
    const n = Number(String(v).replace(/[^\d.]/g, ""));
    return Number.isFinite(n) ? n : NaN;
  };

  const safeThumb = (src) => {
    const url = (src || "").trim();
    if (!url) return "https://via.placeholder.com/300x300.png?text=Imagen";
    if (
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("data:") ||
      url.startsWith("blob:")
    )
      return url;
    return url.startsWith("/") ? url : `/${url}`;
  };

  const getProductImage = (p) =>
    p?.imagen || p?.imagen_url || p?.image || p?.url || "";

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onChangePrecioPorcion = (p, v) => {
    const limpio = v.replace(/[^\d]/g, "");
    setForm((prev) => ({
      ...prev,
      porcionPrecios: { ...prev.porcionPrecios, [p]: limpio },
    }));
  };

  const getSuggested = () => {
    const base = num(form.precioMin);
    if (!Number.isFinite(base) || base <= 0) return {};
    const map = {};
    PORCIONES.forEach((p) => {
      if (p === 12) map[p] = base;
      else map[p] = Math.round(base + (p - 12) * 1000);
    });
    return map;
  };

  const suggestions = getSuggested();

  const aplicarSugerencias = () => {
    const sug = getSuggested();
    if (!Object.keys(sug).length) return;
    setForm((prev) => ({
      ...prev,
      porcionPrecios: Object.fromEntries(
        PORCIONES.map((p) => [p, String(sug[p] ?? "")])
      ),
    }));
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

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "Ingresa un nombre";
    const min = num(form.precioMin);
    if (!Number.isFinite(min) || min <= 0) e.precioMin = "Ingresa un precio válido";
    if (!isValidUrl(form.imagen)) e.imagen = "URL de imagen no válida";
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
      porcionPrecios: {},
    });
    setErrors({});
    setEditingId(null);
  };

  const onUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append("file", file);
      const resp = await fetch(`${API_BASE}/api/uploads`, { method: "POST", body: fd });
      const j = await resp.json();
      if (!resp.ok) throw new Error("No se pudo subir la imagen");
      setForm((prev) => ({ ...prev, imagen: j.imagen_url || j.path || "" }));
    } catch {
      alert("Error al subir la imagen");
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const min = num(form.precioMin);
    const variantes = PORCIONES.map((p) => ({
      personas: p,
      precio:
        Number(form.porcionPrecios[p]) ||
        num(suggestions[p]) ||
        min ||
        0,
    }));

    const payload = {
      sku: form.sku.trim() || undefined,
      nombre: form.nombre.trim(),
      categoria: form.categoria,
      precioMin: min || null,
      precioMax: form.precioMax ? num(form.precioMax) : null,
      imagen_url: form.imagen?.trim() || null,
      descripcion: form.descripcion.trim(),
      variantes,
      activo: form.activo,
    };

    try {
      const url = editingId
        ? `${API_BASE}/api/productos/${editingId}`
        : `${API_BASE}/api/productos`;
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || json?.error);
      await fetchProducts();
      reset();
      setShowForm(false);
    } catch (err) {
      alert("Error al guardar producto: " + err.message);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.sku ?? item.id);
    const porcionPrecios = {};
    (item.variantes || []).forEach((v) => {
      if (v && v.personas) porcionPrecios[v.personas] = String(v.precio ?? "");
    });

    setForm({
      sku: item.sku || "",
      nombre: item.nombre || "",
      categoria: item.categoria || "tortas",
      precioMin: item.precioMin ? String(item.precioMin) : "",
      precioMax: item.precioMax ? String(item.precioMax) : "",
      imagen: item.imagen || item.imagen_url || "",
      descripcion: item.descripcion || "",
      porciones: PORCIONES.slice(),
      activo: !!item.activo,
      porcionPrecios,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
    setShowForm(true);
  };

  const removeItem = async (id) => {
    if (!window.confirm("¿Eliminar el producto?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/productos/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Error al eliminar");
      await fetchProducts();
      reset();
      setShowForm(false);
    } catch (err) {
      alert("No se pudo eliminar el producto.");
    }
  };

  const viewItems = items.filter((p) => {
    if (!q.trim()) return true;
    const s = q.toLowerCase();
    return (p.nombre || "").toLowerCase().includes(s);
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
          <button className="btn sm" onClick={refrescar}>
            Refrescar
          </button>
          <button className="btn sm" onClick={() => { reset(); setShowForm((v) => !v); }}>
            {showForm ? "Cerrar formulario" : "Añadir producto"}
          </button>
        </div>
      </div>

      {showForm && (
        <form className="product-form" onSubmit={onSubmit} noValidate>
          {editingId && (
            <div style={{ textAlign: "right", marginBottom: "10px" }}>
              <button
                type="button"
                className="btn danger"
                onClick={() => removeItem(editingId)}
              >
                Eliminar producto
              </button>
            </div>
          )}

          <div className="form-grid">
            <div className="field">
              <label>SKU</label>
              <input name="sku" value={form.sku} onChange={onChange} />
            </div>

            <div className="field">
              <label>Nombre</label>
              <input name="nombre" value={form.nombre} onChange={onChange} />
              {errors.nombre && <span className="err">{errors.nombre}</span>}
            </div>

            <div className="field">
              <label>Categoría</label>
              <select name="categoria" value={form.categoria} onChange={onChange}>
                <option value="tortas">Tortas</option>
                <option value="dulces">Dulces</option>
              </select>
            </div>

            <div className="field">
              <label>Precio base</label>
              <input
                name="precioMin"
                type="number"
                value={form.precioMin}
                onChange={onChange}
              />
              {errors.precioMin && <span className="err">{errors.precioMin}</span>}
            </div>

            <div className="field field-span">
              <label>Imagen del producto</label>
              <input name="imagen" value={form.imagen} onChange={onChange} />
              <input type="file" accept="image/*" onChange={onUploadImage} />
            </div>

            <div className="field field-span">
              <label>Descripción</label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={onChange}
              />
            </div>

            <div className="field field-span">
              <label>Precio por porción</label>
              <button
                type="button"
                className="btn sm"
                onClick={aplicarSugerencias}
                style={{ marginBottom: "8px" }}
              >
                Autocompletar según base
              </button>
              {PORCIONES.map((p) => {
                const sug = suggestions[p];
                const val = form.porcionPrecios[p] ?? "";
                return (
                  <div key={p} className="row" style={{ alignItems: "center", gap: "8px" }}>
                    <label style={{ width: "80px" }}>{p} personas</label>
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
                );
              })}
            </div>

            <div className="field check">
              <label>
                <input
                  type="checkbox"
                  name="activo"
                  checked={form.activo}
                  onChange={onChange}
                />
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

      <div className="grid prod-grid">
        {viewItems.length === 0 && !loadingItems && (
          <div className="empty">
            <p>No hay productos agregados aún.</p>
          </div>
        )}
        {loadingItems && (
          <div className="empty">
            <p>Cargando productos...</p>
          </div>
        )}

        {viewItems.map((p) => {
          const variantes = (p.variantes || []).slice().sort((a, b) => a.personas - b.personas);
          return (
            <article key={p.sku ?? p.id} className="product modern">
              <div className="thumb">
                <img
                  src={safeThumb(getProductImage(p))}
                  alt={p.nombre}
                  onError={(e) =>
                    (e.currentTarget.src =
                      "https://via.placeholder.com/300x300.png?text=Imagen")
                  }
                />
              </div>

              <div className="body">
                <div className="title-row">
                  <h3 className="title">{p.nombre}</h3>
                  {p.categoria && <span className="badge">{p.categoria}</span>}
                </div>

                {p.descripcion && <p className="desc">{p.descripcion}</p>}

                {variantes.length > 0 && (
                  <div className="variants">
                    {variantes.map((v) => (
                      <div key={v.personas} className="pill">
                        <span>{v.personas}p</span>
                        <strong>${v.precio.toLocaleString("es-CL")}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card-actions">
                <button className="btn sm" onClick={() => startEdit(p)}>
                  Modificar
                </button>
                <button
                  className="btn sm danger"
                  onClick={() => removeItem(p.sku ?? p.id)}
                >
                  Eliminar
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default GestionProductos;
