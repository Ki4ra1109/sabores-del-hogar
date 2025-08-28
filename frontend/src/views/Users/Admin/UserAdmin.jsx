import React, { useState, useEffect, useRef } from "react";
import { Footer } from "../../../componentes/Footer";
import { Header } from "../../../componentes/Header";
import "./UserAdmin.css";

function PedidosSection() {
  const [q, setQ] = useState("");
  const pedidos = [];
  const list = pedidos.filter(p =>
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
            <div className="empty"><p>No hay pedidos registrados todavía.</p></div>
          )}
        </div>
      </div>
    </>
  );
}

function GananciasSection() {
  const periodos = {
    day: [
      { l: "Lun", v: 45600 }, { l: "Mar", v: 70000 }, { l: "Mié", v: 55090 },
      { l: "Jue", v: 84900 }, { l: "Vie", v: 60500 }, { l: "Sáb", v: 95000 }, { l: "Dom", v: 54500 },
    ],
    week: [
      { l: "Sem 1", v: 28000 }, { l: "Sem 2", v: 35000 }, { l: "Sem 3", v: 30000 }, { l: "Sem 4", v: 40000 },
    ],
    month: [
      { l: "Ene", v: 120000 }, { l: "Feb", v: 110000 }, { l: "Mar", v: 140000 },
      { l: "Abr", v: 130000 }, { l: "May", v: 150000 }, { l: "Jun", v: 160000 },
    ],
  };
  const [period, setPeriod] = useState("day");
  const data = periodos[period];
  const max = Math.max(...data.map(d => d.v));

  return (
    <div className="card">
      <div className="card-head">
        <h2>Ganancias</h2>
        <div className="tabs">
          <button className={`tab ${period==="day"?"on":""}`} onClick={()=>setPeriod("day")}>Día</button>
          <button className={`tab ${period==="week"?"on":""}`} onClick={()=>setPeriod("week")}>Semana</button>
          <button className={`tab ${period==="month"?"on":""}`} onClick={()=>setPeriod("month")}>Mes</button>
        </div>
      </div>
      <div className="chart">
        {data.map((d,i)=>(
          <div key={i} className="col">
            <div className="bar" style={{height:`${(d.v/max)*100}%`}} title={`$${d.v.toLocaleString()}`}/>
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

  const [form, setForm] = useState({
    nombre: "",
    categoria: "tortas",
    precioMin: "",
    precioMax: "",
    imagen: "",
    descripcion: "",
    porciones: [],
    activo: true,
    sku: "",
    usarPorciones: true,
    porcionPrecios: {} // { [tam]: "50000" }
  });
  const [errors, setErrors] = useState({});

  const toggleForm = () => setShowForm(v => !v);

  const PORCIONES = [12, 18, 24, 30, 50];

  const num = (v) => {
    const n = Number(String(v).replace(/[^\d.]/g, ""));
    return Number.isFinite(n) ? n : NaN;
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "categoria") {
      const usar = value === "tortas";
      setForm(prev => ({
        ...prev,
        categoria: value,
        usarPorciones: usar,
        porciones: usar ? prev.porciones : [],
        porcionPrecios: usar ? prev.porcionPrecios : {}
      }));
      return;
    }

    if (name === "usarPorciones") {
      setForm(prev => ({
        ...prev,
        usarPorciones: checked,
        porciones: checked ? prev.porciones : [],
        porcionPrecios: checked ? prev.porcionPrecios : {}
      }));
      return;
    }

    if (name.startsWith("precioMin") || name.startsWith("precioMax")) {
      setForm(prev => ({
        ...prev,
        [name]: value.replace(/[^\d]/g, "")
      }));
      return;
    }

    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" && name !== "porciones" ? checked : value
    }));
  };

  const onTogglePorcion = (p) => {
    if (!form.usarPorciones) return;
    setForm(prev => {
      const exists = prev.porciones.includes(p);
      const next = exists ? prev.porciones.filter(x => x !== p) : [...prev.porciones, p].sort((a,b)=>a-b);
      const nextPrecios = { ...prev.porcionPrecios };
      if (exists) delete nextPrecios[p];
      return { ...prev, porciones: next, porcionPrecios: nextPrecios };
    });
  };

  const isValidUrl = (u) => {
    if (!u) return true;
    try {
      const url = new URL(u);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch { return false; }
  };

  const preciosCap = () => {
    const min = num(form.precioMin);
    const max = num(form.precioMax);
    const ps = form.porciones.slice().sort((a,b)=>a-b);
    if (!ps.length || !Number.isFinite(min) || !Number.isFinite(max) || min <= 0 || max <= 0 || min > max) {
      return {};
    }
    const pMin = ps[0];
    const pMax = ps[ps.length - 1];
    const caps = {};
    ps.forEach(p => {
      if (pMin === pMax) {
        caps[p] = max; // caso borde, una sola porción
      } else {
        const t = (p - pMin) / (pMax - pMin); // 0..1
        const cap = Math.round(min + t * (max - min));
        caps[p] = cap;
      }
    });
    return caps;
  };

  const caps = preciosCap();

  const onChangePrecioPorcion = (p, v) => {
    const limpio = v.replace(/[^\d]/g, "");
    setForm(prev => ({
      ...prev,
      porcionPrecios: { ...prev.porcionPrecios, [p]: limpio }
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "Ingresa un nombre";
    if (!form.categoria) e.categoria = "Selecciona una categoría";

    const min = num(form.precioMin);
    const max = num(form.precioMax);
    if (!Number.isFinite(min) || min <= 0) e.precioMin = "Ingresa un mínimo válido";
    if (!Number.isFinite(max) || max <= 0) e.precioMax = "Ingresa un máximo válido";
    if (Number.isFinite(min) && Number.isFinite(max) && min >= max) e.precioMax = "El máximo debe ser mayor al mínimo";

    if (!isValidUrl(form.imagen)) e.imagen = "URL de imagen no válida";

    if (form.usarPorciones && form.porciones.length > 0 && Object.keys(caps).length) {
      form.porciones.forEach(p => {
        const val = num(form.porcionPrecios[p]);
        const cap = caps[p];
        if (!Number.isFinite(val) || val <= 0) {
          e[`por_${p}`] = `Ingresa un precio válido`;
        } else if (val > cap) {
          e[`por_${p}`] = `No debe superar $${cap.toLocaleString("es-CL")}`;
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
      sku: "",
      usarPorciones: true,
      porcionPrecios: {}
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
        ? form.porciones.map(p => ({
            personas: p,
            precio: num(form.porcionPrecios[p]) || caps[p] || min
          }))
        : [],
      activo: form.activo,
      sku: form.sku.trim()
    };

    setItems(prev =>
      editingId ? prev.map(it => (it.id === editingId ? payload : it)) : [payload, ...prev]
    );

    reset();
    setShowForm(false);
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    const porcionPrecios = {};
    (item.variantes || []).forEach(v => { porcionPrecios[v.personas] = String(v.precio || ""); });
    setForm({
      nombre: item.nombre || "",
      categoria: item.categoria || "tortas",
      precioMin: item.precioMin ? String(item.precioMin) : "",
      precioMax: item.precioMax ? String(item.precioMax) : "",
      imagen: item.imagen || "",
      descripcion: item.descripcion || "",
      porciones: (item.variantes || []).map(v => v.personas).sort((a,b)=>a-b),
      activo: !!item.activo,
      sku: item.sku || "",
      usarPorciones: (item.variantes || []).length > 0 || (item.categoria === "tortas"),
      porcionPrecios
    });
    setShowForm(true);
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(p => p.id !== id));
    if (editingId === id) reset();
  };

  const safeThumb = (src) => {
    const url = (src || "").trim();
    if (!url) return "/placeholder.jpg";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) return url;
    return "/placeholder.jpg";
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
              <label>URL de imagen</label>
              <input
                name="imagen"
                value={form.imagen}
                onChange={onChange}
                placeholder="https://..."
              />
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
                    /> Habilitar porciones para este producto
                  </label>
                </div>
              )}
              <div className="chips">
                {PORCIONES.map(p => (
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
                <label>Precio por porción</label>
                <div className="list" style={{marginTop: 6}}>
                  {form.porciones.map(p => {
                    const cap = caps[p];
                    const val = form.porcionPrecios[p] ?? "";
                    return (
                      <div key={p} className="client" style={{alignItems:"center"}}>
                        <div>
                          <strong>{p} personas</strong>
                          <div style={{fontSize:12, color:"#555"}}>
                            Máximo permitido: ${cap ? cap.toLocaleString("es-CL") : "—"}
                          </div>
                          {errors[`por_${p}`] && <div className="err">{errors[`por_${p}`]}</div>}
                        </div>
                        <div className="row">
                          <input
                            type="number"
                            inputMode="numeric"
                            min="0"
                            step="1"
                            value={val}
                            onChange={(e)=>onChangePrecioPorcion(p, e.target.value)}
                            placeholder={cap ? String(cap) : ""}
                            style={{width:160}}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="field">
              <label>SKU (opcional)</label>
              <input
                name="sku"
                value={form.sku}
                onChange={onChange}
                placeholder="SKU interno"
              />
            </div>

            <div className="field check">
              <label><input type="checkbox" name="activo" checked={form.activo} onChange={onChange} /> Activo</label>
            </div>
          </div>

          <div className="row mt form-actions">
            <button type="submit" className="btn primary">{editingId ? "Guardar cambios" : "Guardar producto"}</button>
            <button type="button" className="btn" onClick={reset}>Limpiar</button>
          </div>
        </form>
      )}

      <div className="grid">
        {items.length === 0 && (
          <div className="empty">
            <p>No hay productos agregados aún.</p>
          </div>
        )}
        {items.map((p) => (
          <div key={p.id} className="product">
            {p.imagen && (
              <img
                src={safeThumb(p.imagen)}
                alt={p.nombre}
                loading="lazy"
                onError={(e)=>{ e.currentTarget.src="/placeholder.jpg"; }}
                style={{ width: "100%", maxHeight: 140, objectFit: "cover", borderRadius: 8, marginBottom: 8 }}
              />
            )}
            <h4>{p.nombre}</h4>
            <p>Categoría: {p.categoria}</p>
            {(p.precioMin && p.precioMax) && (
              <p>Precio: ${p.precioMin.toLocaleString("es-CL")} - ${p.precioMax.toLocaleString("es-CL")}</p>
            )}
            {p.variantes?.length > 0 && (
              <p>
                Porciones:{" "}
                {p.variantes
                  .slice()
                  .sort((a,b)=>a.personas-b.personas)
                  .map(v => `${v.personas}p $${Number(v.precio||0).toLocaleString("es-CL")}`)
                  .join(" · ")}
              </p>
            )}
            {p.sku && <p>SKU: {p.sku}</p>}
            <div className="row">
              <button className="btn sm" onClick={() => startEdit(p)}>Modificar</button>
              <button className="btn sm danger" onClick={() => removeItem(p.id)}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DescuentosSection() {
  const [showForm, setShowForm] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    code: "",
    description: "",
    type: "percent",
    value: "",
    minSpend: "",
    start: "",
    end: "",
    active: true,
  });
  const [errors, setErrors] = useState({});

  const toggleForm = () => setShowForm(v => !v);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const validate = () => {
    const e = {};
    const code = form.code.trim().toUpperCase();
    if (!code) e.code = "Ingresa un código";
    const exists = coupons.some(c => c.code === code && c.id !== editingId);
    if (code && exists) e.code = "El código ya existe";
    if (form.type !== "free_shipping") {
      const n = Number(form.value);
      if (!form.value || Number.isNaN(n) || n <= 0) e.value = "Valor inválido";
    }
    if (form.start && form.end && new Date(form.start) > new Date(form.end)) {
      e.end = "La fecha fin debe ser mayor o igual a inicio";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const reset = () => {
    setForm({
      code: "",
      description: "",
      type: "percent",
      value: "",
      minSpend: "",
      start: "",
      end: "",
      active: true,
    });
    setErrors({});
    setEditingId(null);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      id: editingId ?? Date.now(),
      code: form.code.trim().toUpperCase(),
      description: form.description.trim(),
      type: form.type,
      value: form.type === "free_shipping" ? null : Number(form.value),
      minSpend: form.minSpend ? Number(form.minSpend) : null,
      start: form.start || null,
      end: form.end || null,
      active: !!form.active,
    };

    setCoupons(prev =>
      editingId ? prev.map(c => (c.id === editingId ? payload : c)) : [payload, ...prev]
    );

    reset();
    setShowForm(false);
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setForm({
      code: c.code,
      description: c.description || "",
      type: c.type,
      value: c.value ?? "",
      minSpend: c.minSpend ?? "",
      start: c.start ?? "",
      end: c.end ?? "",
      active: !!c.active,
    });
    setShowForm(true);
  };

  const removeCoupon = (id) => {
    setCoupons(prev => prev.filter(c => c.id !== id));
    if (editingId === id) reset();
  };

  return (
    <div className="card">
      <div className="card-head">
        <h2>Códigos de descuento</h2>
        <button className="btn" onClick={toggleForm}>
          {showForm ? "Cerrar formulario" : "Agregar nuevo código"}
        </button>
      </div>

      {showForm && (
        <form className="product-form" onSubmit={onSubmit} noValidate>
          <div className="form-grid">
            <div className="field">
              <label>Código</label>
              <input
                name="code"
                value={form.code}
                onChange={onChange}
                placeholder="Ej: CUMP2025"
              />
              {errors.code && <span className="err">{errors.code}</span>}
            </div>

            <div className="field">
              <label>Tipo</label>
              <select name="type" value={form.type} onChange={onChange}>
                <option value="percent">Porcentaje (%)</option>
                <option value="amount">Monto fijo</option>
                <option value="free_shipping">Envío gratis</option>
              </select>
            </div>

            {form.type !== "free_shipping" && (
              <div className="field">
                <label>Valor</label>
                <input
                  name="value"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.value}
                  onChange={onChange}
                  placeholder={form.type === "percent" ? "Ej: 10 = 10%" : "Ej: 5000"}
                />
                {errors.value && <span className="err">{errors.value}</span>}
              </div>
            )}

            <div className="field">
              <label>Mínimo a gastar (opcional)</label>
              <input
                name="minSpend"
                type="number"
                min="0"
                step="0.01"
                value={form.minSpend}
                onChange={onChange}
                placeholder="Ej: 20000"
              />
            </div>

            <div className="field">
              <label>Vigencia desde</label>
              <input
                name="start"
                type="date"
                value={form.start}
                onChange={onChange}
              />
            </div>

            <div className="field">
              <label>Vigencia hasta</label>
              <input
                name="end"
                type="date"
                value={form.end}
                onChange={onChange}
              />
              {errors.end && <span className="err">{errors.end}</span>}
            </div>

            <div className="field field-span">
              <label>Descripción</label>
              <textarea
                name="description"
                rows={2}
                value={form.description}
                onChange={onChange}
                placeholder="Texto visible para el cliente"
              />
            </div>

            <div className="field check">
              <label><input type="checkbox" name="active" checked={form.active} onChange={onChange} /> Activo</label>
            </div>
          </div>

          <div className="row mt form-actions">
            <button type="submit" className="btn primary">{editingId ? "Guardar cambios" : "Crear código"}</button>
            <button type="button" className="btn" onClick={reset}>Limpiar</button>
          </div>
        </form>
      )}

      <div className="list">
        {coupons.length === 0 && (
          <div className="empty"><p>No hay códigos aún. Crea uno con “Agregar nuevo código”.</p></div>
        )}

        {coupons.map(c => (
          <div key={c.id} className="discount">
            <div>
              <p><strong>Código:</strong> {c.code}</p>
              {c.description && <p><strong>Descripción:</strong> {c.description}</p>}
              <p>
                <strong>Tipo:</strong>{" "}
                {c.type === "percent" ? `Descuento ${c.value}%`
                  : c.type === "amount" ? `Descuento $${c.value?.toLocaleString("es-CL")}`
                  : "Envío gratis"}
              </p>
              {c.minSpend != null && <p><strong>Mínimo:</strong> ${Number(c.minSpend).toLocaleString("es-CL")}</p>}
              {(c.start || c.end) && (
                <p><strong>Vigencia:</strong> {c.start || "—"} {c.end ? `→ ${c.end}` : ""}</p>
              )}
              <p><strong>Estado:</strong> {c.active ? "Activo" : "Inactivo"}</p>
            </div>
            <div className="row">
              <button className="btn sm" onClick={() => startEdit(c)}>Modificar</button>
              <button className="btn sm danger" onClick={() => removeCoupon(c.id)}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const UserNormal = () => {
  const [active, setActive] = useState("inicio");
  const mainRef = useRef(null);

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
        <div><strong>5</strong><span>Pedidos pendientes</span></div>
        <div><strong>12</strong><span>Clientes nuevos</span></div>
        <div><strong>3</strong><span>Sin stock</span></div>
        <div><strong>2</strong><span>Alertas</span></div>
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
      <p style={{color:"#555"}}>Cuando conectes tu base de datos, este panel mostrará KPIs reales.</p>
    </div>
  );

  const renderAccount = () => (
    <div className="card">
      <h2>Cuenta</h2>
      <div className="grid2">
        <div className="field"><label>Correo</label><input defaultValue="usuario.demo@example.com" /></div>
        <div className="field"><label>Nombre</label><input defaultValue="Joaquín" /></div>
        <div className="field"><label>Apellido</label><input defaultValue="Riveros" /></div>
        <div className="field"><label>Teléfono</label><input defaultValue="+56 9 2345 6789" /></div>
        <div className="field"><label>Dirección</label><input defaultValue="Av. Libertad 1234, Santiago" /></div>
      </div>
      <div className="row mt">
        <button className="btn primary">Guardar</button>
        <button className="btn">Cancelar</button>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="card">
      <h2>Configuración</h2>
      <div className="grid2">
        <div className="field">
          <label>Tema de color</label>
          <select defaultValue="default">
            <option value="default">Café (default)</option>
            <option value="oscuro">Oscuro</option>
            <option value="claro">Claro</option>
            <option value="pastel">Pastel</option>
          </select>
        </div>
        <div className="field check">
          <label><input type="checkbox" /> Modo oscuro</label>
        </div>
        <div className="field check">
          <label><input type="checkbox" defaultChecked /> Notificaciones</label>
        </div>
        <div className="field">
          <label>Tamaño de fuente</label>
          <select defaultValue="media">
            <option value="pequena">Pequeña</option>
            <option value="media">Media</option>
            <option value="grande">Grande</option>
          </select>
        </div>
        <div className="field">
          <label>Idioma</label>
          <select defaultValue="es">
            <option value="es">Español</option>
            <option value="en">Inglés</option>
            <option value="pt">Portugués</option>
          </select>
        </div>
        <div className="field check">
          <label><input type="checkbox" defaultChecked /> Mostrar foto de perfil</label>
        </div>
      </div>
      <button className="btn danger mt">Cerrar sesión</button>
    </div>
  );

  return (
    <div>
      <Header />
      <div className="user-container">
        <aside className="sidebar" aria-label="Menú de administración">
          <ul>
            {sections.map(s => (
              <li
                key={s.id}
                className={active===s.id ? "active" : ""}
                tabIndex={0}
                onClick={()=>goSection(s.id)}
                onKeyDown={(e)=> (e.key==="Enter" || e.key===" ") && goSection(s.id)}
                aria-current={active===s.id ? "page" : undefined}
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
          {active === "descuentos" && <DescuentosSection />}
          {active === "account" && renderAccount()}
          {active === "settings" && renderSettings()}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default UserNormal;
