import React, { useEffect, useMemo, useState } from "react";
import "./CuentaPanel.css";

const API_BASE = import.meta.env?.VITE_API_URL || "http://localhost:5000";

function cleanRut(r) {
  return String(r || "").replace(/[.\-]/g, "").toUpperCase();
}
function validateRut(rut) {
  const c = cleanRut(rut);
  if (!c) return true;
  if (!/^\d{7,8}[0-9K]$/.test(c)) return false;
  const body = c.slice(0, -1);
  const dv = c.slice(-1);
  let sum = 0, m = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += m * parseInt(body[i], 10);
    m = m === 7 ? 2 : m + 1;
  }
  const d = 11 - (sum % 11);
  const dvCalc = d === 11 ? "0" : d === 10 ? "K" : String(d);
  return dvCalc === dv;
}
function maskRut(v) {
  const c = cleanRut(v);
  if (!c) return "";
  const body = c.slice(0, -1);
  const dv = c.slice(-1);
  return body.replace(/\B(?=(\d{3})+(?!\d))/g, ".").concat("-", dv);
}
const norm = (v) => (typeof v === "string" ? v.trim() : v);
const formatPhone = (v) => {
  const d = String(v || "").replace(/\D/g, "");
  const rest = d.startsWith("56") ? d.slice(2) : d;
  return "+56" + rest.slice(0, 9);
};
const phoneForDiff = (v) => {
  const s = String(v || "").replace(/\s/g, "");
  if (!s || s === "+56") return "";
  return s;
};

export default function CuentaPanel({ onSaved }) {
  const storageUser = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("sdh_user") || "null"); }
    catch { return null; }
  }, []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({ contacto: false, id: false, seg: false });
  const [okMsg, setOkMsg] = useState({ contacto: "", id: "", seg: "" });
  const [errors, setErrors] = useState({ contacto: {}, id: {}, seg: {} });

  const userId = storageUser?.id || storageUser?.id_usuario || storageUser?.id_user;

  const [form, setForm] = useState({
    nombre: storageUser?.nombre || "",
    apellido: storageUser?.apellido || "",
    rut: storageUser?.rut || "",
    correo: storageUser?.email || storageUser?.correo || "",
    telefono: storageUser?.telefono ? formatPhone(storageUser.telefono) : "+56",
    fechaNacimiento: storageUser?.fecha_nacimiento || storageUser?.fechaNacimiento || "",
    direccion: storageUser?.direccion || "",
    pwd: { current: "", next: "" }
  });
  const [base, setBase] = useState(form);

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!userId) { setLoading(false); return; }
      try {
        const r = await fetch(`${API_BASE}/api/usuarios/${userId}`);
        const j = await r.json().catch(() => ({}));
        if (!alive) return;
        const next = {
          nombre: j.user?.nombre ?? form.nombre,
          apellido: j.user?.apellido ?? form.apellido,
          rut: j.user?.rut ?? form.rut,
          correo: j.user?.correo ?? form.correo,
          telefono: formatPhone(j.user?.telefono || "+56"),
          fechaNacimiento: j.user?.fecha_nacimiento ?? form.fechaNacimiento,
          direccion: j.user?.direccion ?? form.direccion,
          pwd: { current: "", next: "" }
        };
        setForm(next);
        setBase(next);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [userId]);

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === "rut") {
      setForm((p) => ({ ...p, rut: maskRut(value) }));
      setOkMsg({ contacto: "", id: "", seg: "" });
      return;
    }
    if (name === "telefono") {
      setForm((p) => ({ ...p, telefono: formatPhone(value) }));
      setOkMsg({ contacto: "", id: "", seg: "" });
      return;
    }
    setForm((p) => ({ ...p, [name]: value }));
    setOkMsg({ contacto: "", id: "", seg: "" });
  };

  const onChangePwd = (field, val) => {
    setForm((p) => ({ ...p, pwd: { ...p.pwd, [field]: val } }));
    setOkMsg((m) => ({ ...m, seg: "" }));
  };

  const diffContacto = useMemo(() => {
    const d = {};
    if (phoneForDiff(form.telefono) !== phoneForDiff(base.telefono)) d.telefono = form.telefono;
    if (norm(form.direccion) !== norm(base.direccion)) d.direccion = form.direccion;
    return d;
  }, [form.telefono, form.direccion, base.telefono, base.direccion]);

  const diffId = useMemo(() => {
    const d = {};
    if (norm(form.nombre) !== norm(base.nombre)) d.nombre = form.nombre;
    if (norm(form.apellido) !== norm(base.apellido)) d.apellido = form.apellido;
    if (norm(form.rut) !== norm(base.rut)) d.rut = form.rut;
    if (form.fechaNacimiento !== base.fechaNacimiento) d.fecha_nacimiento = form.fechaNacimiento;
    return d;
  }, [form, base]);

  const canSaveContacto = Object.keys(diffContacto).length > 0;
  const canSaveId = Object.keys(diffId).length > 0;
  const canSaveSeg = !!norm(form.pwd.next);

  const validateContacto = () => {
    const e = {};
    if ("telefono" in diffContacto) {
      const t = phoneForDiff(form.telefono);
      if (t && !/^\+56\d{8,9}$/.test(t)) e.telefono = "Formato +56XXXXXXXX";
    }
    setErrors((p) => ({ ...p, contacto: e }));
    return Object.keys(e).length === 0;
  };

  const validateId = () => {
    const e = {};
    if ("nombre" in diffId && !norm(form.nombre)) e.nombre = "Ingresa tu nombre";
    if ("apellido" in diffId && !norm(form.apellido)) e.apellido = "Ingresa tu apellido";
    if ("rut" in diffId) {
      if (form.rut && !validateRut(form.rut)) e.rut = "RUT inválido";
    }
    if ("fecha_nacimiento" in diffId) {
      if (form.fechaNacimiento && isNaN(Date.parse(form.fechaNacimiento))) e.fechaNacimiento = "Fecha inválida";
    }
    setErrors((p) => ({ ...p, id: e }));
    return Object.keys(e).length === 0;
  };

  const saveContacto = async () => {
    if (!canSaveContacto) return;
    if (!validateContacto()) return;
    const payload = {};
    if ("telefono" in diffContacto) {
      const t = phoneForDiff(form.telefono);
      payload.telefono = t || null;
    }
    if ("direccion" in diffContacto) payload.direccion = norm(form.direccion) || null;

    try {
      setSaving((s) => ({ ...s, contacto: true }));
      const r = await fetch(`${API_BASE}/api/usuarios/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        setErrors((p) => ({ ...p, contacto: { global: j.message || "No se pudo guardar" } }));
        return;
      }
      const nextBase = { ...base, ...payload, telefono: payload.telefono ? payload.telefono : "+56" };
      setBase(nextBase);
      setForm((f) => ({ ...f, ...payload, telefono: payload.telefono ? payload.telefono : "+56" }));
      const local = { ...(storageUser || {}), ...payload };
      localStorage.setItem("sdh_user", JSON.stringify(local));
      onSaved && onSaved(local);
      setOkMsg((m) => ({ ...m, contacto: "Cambios guardados" }));
    } finally {
      setSaving((s) => ({ ...s, contacto: false }));
    }
  };

  const saveId = async () => {
    if (!canSaveId) return;
    if (!validateId()) return;
    const payload = {};
    if ("nombre" in diffId) payload.nombre = norm(form.nombre);
    if ("apellido" in diffId) payload.apellido = norm(form.apellido);
    if ("rut" in diffId) payload.rut = norm(form.rut) || null;
    if ("fecha_nacimiento" in diffId) payload.fecha_nacimiento = form.fechaNacimiento || null;

    try {
      setSaving((s) => ({ ...s, id: true }));
      const r = await fetch(`${API_BASE}/api/usuarios/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        setErrors((p) => ({ ...p, id: { global: j.message || "No se pudo guardar" } }));
        return;
      }
      const nextBase = { ...base, ...payload };
      setBase(nextBase);
      setForm((f) => ({ ...f, ...payload }));
      const local = { ...(storageUser || {}), ...payload };
      localStorage.setItem("sdh_user", JSON.stringify(local));
      onSaved && onSaved(local);
      setOkMsg((m) => ({ ...m, id: "Cambios guardados" }));
    } finally {
      setSaving((s) => ({ ...s, id: false }));
    }
  };

  const saveSeg = async () => {
    if (!canSaveSeg) return;
    const np = form.pwd.next;
    if (np.length < 9 || !/[A-Za-z]/.test(np) || !/\d/.test(np)) {
      setErrors((p) => ({ ...p, seg: { next: "Mín. 9, letras y números" } }));
      return;
    }
    try {
      setSaving((s) => ({ ...s, seg: true }));
      const r = await fetch(`${API_BASE}/api/usuarios/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: np })
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        setErrors((p) => ({ ...p, seg: { global: j.message || "No se pudo guardar" } }));
        return;
      }
      setForm((f) => ({ ...f, pwd: { current: "", next: "" } }));
      setOkMsg((m) => ({ ...m, seg: "Contraseña actualizada" }));
    } finally {
      setSaving((s) => ({ ...s, seg: false }));
    }
  };

  const initials = () => {
    const n = (form.nombre || "").trim()[0] || "";
    const a = (form.apellido || "").trim()[0] || "";
    return (n + a).toUpperCase() || "U";
  };

  if (loading) {
    return (
      <div className="card">
        <div className="cuenta" style={{ gap: 16 }}>
          <div className="cuenta-header">
            <div className="skel" style={{ width: 56, height: 56, borderRadius: 999 }} />
            <div className="cuenta-head-text">
              <div className="skel skel-line" style={{ width: "40%" }} />
              <div className="skel skel-line" style={{ width: "30%" }} />
            </div>
            <div className="skel" style={{ width: 110, height: 36, borderRadius: 10 }} />
          </div>

          <div className="cuenta-section open">
            <div className="section-toggle">
              <div className="skel" style={{ width: 140, height: 20, borderRadius: 10 }} />
              <span />
            </div>
            <div className="section-body">
              <div className="field">
                <div className="skel skel-line" style={{ width: "18%" }} />
                <div className="skel skel-input" />
              </div>
              <div className="field">
                <div className="skel skel-line" style={{ width: "18%" }} />
                <div className="skel skel-input" />
              </div>
              <div className="field" style={{ gridColumn: "1 / -1" }}>
                <div className="skel skel-line" style={{ width: "16%" }} />
                <div className="skel skel-input" />
              </div>
            </div>
          </div>

          <div className="cuenta-section open">
            <div className="section-toggle">
              <div className="skel" style={{ width: 140, height: 20, borderRadius: 10 }} />
              <span />
            </div>
            <div className="section-body">
              <div className="field">
                <div className="skel skel-line" style={{ width: "18%" }} />
                <div className="skel skel-input" />
              </div>
              <div className="field">
                <div className="skel skel-line" style={{ width: "18%" }} />
                <div className="skel skel-input" />
              </div>
              <div className="field">
                <div className="skel skel-line" style={{ width: "12%" }} />
                <div className="skel skel-input" />
              </div>
              <div className="field">
                <div className="skel skel-line" style={{ width: "30%" }} />
                <div className="skel skel-input" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="cuenta">
        <div className="cuenta-header">
          <div className="cuenta-avatar">{initials()}</div>
          <div className="cuenta-head-text">
            <div className="cuenta-name">{form.nombre} {form.apellido}</div>
            <div className="cuenta-mail">{form.correo}</div>
          </div>
          <div />
        </div>

        <form noValidate>
          <div className="cuenta-section open">
            <div className="section-toggle">
              <span className="toggle-title">Contacto</span>
              <span className="toggle-icon">▸</span>
            </div>
            <div className="section-body">
              <div className="field readonly">
                <label>Correo</label>
                <input name="correo" type="email" value={form.correo} readOnly />
              </div>
              <div className={`field ${errors.contacto?.telefono ? "invalid" : ""}`}>
                <label>Teléfono</label>
                <input
                  name="telefono"
                  value={form.telefono}
                  onChange={onChange}
                  placeholder="+56XXXXXXXX"
                />
                {errors.contacto?.telefono && <div className="err">{errors.contacto.telefono}</div>}
                <div className="help">Usa el prefijo +56 y solo números</div>
              </div>
              <div className="field" style={{ gridColumn: "1 / -1" }}>
                <label>Dirección</label>
                <input
                  name="direccion"
                  value={form.direccion}
                  onChange={onChange}
                  placeholder="Calle, número, comuna"
                />
              </div>
            </div>
            {canSaveContacto && (
              <div className="cuenta-actions">
                {errors.contacto?.global && <div className="err" style={{ marginRight: "auto" }}>{errors.contacto.global}</div>}
                {okMsg.contacto && <div className="profile-ok" style={{ marginRight: "auto" }}>{okMsg.contacto}</div>}
                <button type="button" className="btn primary" onClick={saveContacto} disabled={saving.contacto}>
                  {saving.contacto ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            )}
          </div>

          <div className="cuenta-section open">
            <div className="section-toggle">
              <span className="toggle-title">Identificación</span>
              <span className="toggle-icon">▸</span>
            </div>
            <div className="section-body">
              <div className={`field ${errors.id?.nombre ? "invalid" : ""}`}>
                <label>Nombre</label>
                <input name="nombre" value={form.nombre} onChange={onChange} placeholder="Tu nombre" />
                {errors.id?.nombre && <div className="err">{errors.id.nombre}</div>}
              </div>
              <div className={`field ${errors.id?.apellido ? "invalid" : ""}`}>
                <label>Apellido</label>
                <input name="apellido" value={form.apellido} onChange={onChange} placeholder="Tu apellido" />
                {errors.id?.apellido && <div className="err">{errors.id.apellido}</div>}
              </div>
              <div className={`field ${errors.id?.rut ? "invalid" : ""}`}>
                <label>RUT</label>
                <input name="rut" value={form.rut} onChange={onChange} placeholder="12.345.678-9" maxLength={12} />
                {errors.id?.rut && <div className="err">{errors.id.rut}</div>}
                <div className="help">Ingresa RUT sin puntos ni guion. Se formatea al escribir.</div>
              </div>
              <div className={`field ${errors.id?.fechaNacimiento ? "invalid" : ""}`}>
                <label>Fecha de nacimiento</label>
                <input name="fechaNacimiento" type="date" value={form.fechaNacimiento || ""} onChange={onChange} />
                {errors.id?.fechaNacimiento && <div className="err">{errors.id.fechaNacimiento}</div>}
              </div>
            </div>
            {canSaveId && (
              <div className="cuenta-actions">
                {errors.id?.global && <div className="err" style={{ marginRight: "auto" }}>{errors.id.global}</div>}
                {okMsg.id && <div className="profile-ok" style={{ marginRight: "auto" }}>{okMsg.id}</div>}
                <button type="button" className="btn primary" onClick={saveId} disabled={saving.id}>
                  {saving.id ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            )}
          </div>

          <div className="cuenta-section open">
            <div className="section-toggle">
              <span className="toggle-title">Seguridad</span>
              <span className="toggle-icon">▸</span>
            </div>
            <div className="section-body">
              <div className="field readonly">
                <label>Contraseña actual</label>
                <input type="password" value={form.pwd.current} onChange={(e) => onChangePwd("current", e.target.value)} placeholder="Opcional" />
              </div>
              <div className={`field ${errors.seg?.next ? "invalid" : ""}`}>
                <label>Nueva contraseña</label>
                <input type="password" value={form.pwd.next} onChange={(e) => onChangePwd("next", e.target.value)} placeholder="Mínimo 9, letras y números" />
                {errors.seg?.next && <div className="err">{errors.seg.next}</div>}
              </div>
            </div>
            {canSaveSeg && (
              <div className="cuenta-actions">
                {errors.seg?.global && <div className="err" style={{ marginRight: "auto" }}>{errors.seg.global}</div>}
                {okMsg.seg && <div className="profile-ok" style={{ marginRight: "auto" }}>{okMsg.seg}</div>}
                <button type="button" className="btn primary" onClick={saveSeg} disabled={saving.seg}>
                  {saving.seg ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}