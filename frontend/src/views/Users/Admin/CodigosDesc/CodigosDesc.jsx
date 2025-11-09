import React, { useState, useEffect, useCallback } from "react";
import "./CodigosDesc.css";

function CodigosDesc() {
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

  // antes: const load = async () => { ... }
  const load = useCallback(async () => {
    try {
      setLoading(true);
      const r = await fetch(`${API_BASE}/api/cupones`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      const list = Array.isArray(j) ? j : Array.isArray(j?.items) ? j.items : [];
      setCoupons(list);
    } catch (err) {
      console.error(err);
      alert("No se pudo cargar la lista de cupones");
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleForm = () => setShowForm(v => !v);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "valor" && form.tipo === "percent") {
      const v = String(value).replace(/[^\d]/g, "");
      if (v === "") { setForm(prev => ({ ...prev, valor: "" })); setErrors({}); return; }
      let n = Number(v);
      if (!Number.isFinite(n)) n = 1;
      n = Math.max(1, Math.min(60, n));
      setForm(prev => ({ ...prev, valor: String(n) }));
      setErrors({});
      return;
    }
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setErrors({});
  };

  const onChangeTipo = (t) => {
    setForm(prev => ({
      ...prev,
      tipo: t,
      valor: t === "free_shipping"
        ? ""
        : (t === "percent" ? String(Math.min(Number(prev.valor || 10), 60)) : (prev.valor || 1000)),
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
      if (Number.isNaN(min) || min <= 0) e.minimo_compra = "Mínimo de compra (> 0)";
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

  const genCode = () => {
    const base = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const r = Array.from({ length: 8 }, () => base[Math.floor(Math.random() * base.length)]).join("");
    setForm(prev => ({ ...prev, codigo: r }));
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
      (form.tipo === "amount" && Number(form.valor) > 0 && Number(form.minimo_compra) > 0) ||
      (form.tipo === "free_shipping" && Number(form.minimo_compra) > 0));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || submitting) return;
    setSubmitting(true);

    const payload = {
      codigo: form.codigo.trim().toUpperCase(),
      tipo: form.tipo,
      valor: form.tipo === "free_shipping" ? null : Number(form.valor),
      minimo_compra: form.tipo === "percent" ? null : Number(form.minimo_compra),
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const j = await r.json();
      if (!j.ok) { alert(j.message || "Error al guardar"); return; }
      await load();
      reset();
      setShowForm(false);
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
      await load();
      if (editingId === id) reset();
    } catch { alert("No se pudo eliminar"); }
  };

  const copyCode = async (code) => {
    try { await navigator.clipboard.writeText(code); } catch { /* empty */ }
  };

  const toggleActive = async (c) => {
    try {
      await fetch(`${API_BASE}/api/cupones/${c.id_descuento}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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

  return (
    <div className="card">
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
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar código…" style={{ minWidth: 180 }} />
        <button className="btn" onClick={toggleForm}>
          {showForm ? "Cerrar formulario" : "Agregar nuevo código"}
        </button>
      </div>

      {showForm && (
        <form className="coupon-form" onSubmit={onSubmit} noValidate>
          <div className="coupon-types">
            <button
              type="button"
              className={`ctype ${form.tipo === "percent" ? "on" : ""}`}
              onClick={() => onChangeTipo("percent")}
            >
              <div className="ctype-title">% Porcentaje</div>
              <div className="ctype-desc">Descuento sobre subtotal</div>
            </button>
            <button
              type="button"
              className={`ctype ${form.tipo === "amount" ? "on" : ""}`}
              onClick={() => onChangeTipo("amount")}
            >
              <div className="ctype-title">$ Monto fijo</div>
              <div className="ctype-desc">Requiere mínimo de compra</div>
            </button>
            <button
              type="button"
              className={`ctype ${form.tipo === "free_shipping" ? "on" : ""}`}
              onClick={() => onChangeTipo("free_shipping")}
            >
              <div className="ctype-title">Envío gratis</div>
              <div className="ctype-desc">Con mínimo de compra</div>
            </button>
          </div>

          <div className="coupon-grid">
            <div className="field">
              <label>Código</label>
              <div className="input-group">
                <input name="codigo" value={form.codigo} onChange={onChange} placeholder="Ej: BIENVENIDA10" />
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
                  min="1"
                  max="60"
                  step="1"
                  value={form.valor}
                  onChange={onChange}
                  onBlur={(e) => {
                    let n = Number(e.target.value);
                    if (!Number.isNaN(n) && Number.isFinite(n)) {
                      n = Math.max(1, Math.min(60, n));
                      setForm(prev => ({ ...prev, valor: String(n) }));
                    }
                  }}
                  placeholder="Ej: 10 = 10%"
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

            <div className="field check">
              <label><input type="checkbox" name="uso_unico" checked={form.uso_unico} onChange={onChange} /> Uso único</label>
            </div>
            <div className="field check">
              <label><input type="checkbox" name="activo" checked={form.activo} onChange={onChange} /> Activo</label>
            </div>
          </div>

          <div className="coupon-summary">
            <div className="hint">{summary}</div>
            <div className="row" style={{ gap: 8 }}>
              <button type="submit" className="btn primary" disabled={!ready || submitting}>
                {submitting ? "Guardando..." : editingId ? "Guardar cambios" : "Crear código"}
              </button>
              <button type="button" className="btn" onClick={reset} disabled={submitting}>Limpiar</button>
            </div>
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
              <p style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <strong>Código:</strong> {c.codigo}
                <StatusBadge s={c._status} />
                <span className="badge outline">{c._tipo === "percent" ? "%" : c._tipo === "amount" ? "Monto" : "Envío"}</span>
                {c.uso_unico || c.limite_uso === 1 ? <span className="badge outline">Uso único</span> : null}
              </p>
              <p>
                <strong>Tipo:</strong>{" "}
                {c._tipo === "percent"
                  ? `${c.valor ?? c.porcentaje}%`
                  : c._tipo === "amount"
                    ? `$${Number(c.valor || 0).toLocaleString("es-CL")} sobre $${Number(c.minimo_compra || 0).toLocaleString("es-CL")}`
                    : `Envío gratis sobre $${Number(c.minimo_compra || 0).toLocaleString("es-CL")}`}
              </p>
              {(c.fecha_inicio || c.fecha_fin) && (
                <p><strong>Vigencia:</strong> {c.fecha_inicio || "—"} {c.fecha_fin ? `→ ${c.fecha_fin}` : ""}</p>
              )}
            </div>
            <div className="row" style={{ gap: 8 }}>
              <button className="btn sm" title="Copiar código" onClick={() => copyCode(c.codigo)}>Copiar</button>
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

export default CodigosDesc;