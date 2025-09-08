import React, { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env?.VITE_API_URL || "http://localhost:5000";

function cleanRut(r) {
  return String(r || "").replace(/[.\-]/g, "").toUpperCase();
}
function validateRut(rut) {
  const c = cleanRut(rut);
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
function isStrong(pass) {
  if (!pass) return false;
  return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{9,}$/.test(pass);
}
function same(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export default function CuentaPanel({ onSaved }) {
  const storageUser = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("sdh_user") || "null"); }
    catch { return null; }
  }, []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [ok, setOk] = useState("");

  const userId = storageUser?.id || storageUser?.id_usuario || storageUser?.id_user;

  const [form, setForm] = useState({
    nombre: storageUser?.nombre || "",
    apellido: storageUser?.apellido || "",
    rut: storageUser?.rut || "",
    correo: storageUser?.email || storageUser?.correo || "",
    telefono: storageUser?.telefono || "",
    fechaNacimiento: storageUser?.fecha_nacimiento || storageUser?.fechaNacimiento || "",
    direccion: storageUser?.direccion || ""
  });
  const [base, setBase] = useState(form);

  const [showPwd, setShowPwd] = useState(false);
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!userId) { setLoading(false); return; }
      try {
        const r = await fetch(`${API_BASE}/api/usuarios/${userId}`);
        if (!r.ok) throw new Error("no_ok");
        const j = await r.json().catch(() => ({}));
        const next = {
          nombre: j.nombre ?? form.nombre,
          apellido: j.apellido ?? form.apellido,
          rut: j.rut ?? form.rut,
          correo: j.email ?? j.correo ?? form.correo,
          telefono: j.telefono ?? form.telefono,
          fechaNacimiento: j.fecha_nacimiento ?? j.fechaNacimiento ?? form.fechaNacimiento,
          direccion: j.direccion ?? form.direccion
        };
        if (!alive) return;
        setForm(next);
        setBase(next);
      } catch {
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [userId]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setOk("");
  };

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "Ingresa tu nombre";
    if (!form.apellido.trim()) e.apellido = "Ingresa tu apellido";
    if (form.rut && !validateRut(form.rut)) e.rut = "RUT inválido";
    if (!/\S+@\S+\.\S+/.test(form.correo)) e.correo = "Correo inválido";
    if (form.telefono && !/^\+?56\d{8,9}$/.test(String(form.telefono).replace(/\s/g, ""))) {
      e.telefono = "Formato +56XXXXXXXX";
    }
    if (form.fechaNacimiento && isNaN(Date.parse(form.fechaNacimiento))) {
      e.fechaNacimiento = "Fecha inválida";
    }

    // Validación de contraseña 
    if (showPwd && (pwd.current || pwd.next || pwd.confirm)) {
      if (!isStrong(pwd.next)) e.next = "Mín. 9, letras y números";
      if (pwd.next !== pwd.confirm) e.confirm = "Las contraseñas no coinciden";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const dirty = useMemo(() => {
    const comp = { ...form };
    const ref = { ...base };
    return !same(comp, ref) || (showPwd && !!pwd.next);
  }, [form, base, showPwd, pwd.next]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || !dirty || saving) return;

    const diff = {};
    // Campos de perfil
    if (form.correo !== base.correo) diff.email = form.correo;
    if (form.nombre !== base.nombre) diff.nombre = form.nombre;
    if (form.apellido !== base.apellido) diff.apellido = form.apellido;
    if (form.rut !== base.rut) diff.rut = form.rut;
    if (form.telefono !== base.telefono) diff.telefono = form.telefono;
    if (form.fechaNacimiento !== base.fechaNacimiento) diff.fecha_nacimiento = form.fechaNacimiento;
    if (form.direccion !== base.direccion) diff.direccion = form.direccion;

    // Contraseña 
    if (showPwd && pwd.next) diff.password = pwd.next;

    if (Object.keys(diff).length === 0) return;

    setSaving(true);
    setOk("");
    setErrors((p) => ({ ...p, global: "" }));

    try {
      if (!userId) throw new Error("missing_id");
      const url = `${API_BASE}/api/usuarios/${userId}`;
      const r = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(diff),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        setErrors((p) => ({ ...p, global: j.message || "No se pudo guardar" }));
        return;
      }

      const updatedUser = {
        ...(storageUser || {}),
        ...diff,
        email: diff.email ?? (storageUser?.email || storageUser?.correo),
        fecha_nacimiento: diff.fecha_nacimiento ?? storageUser?.fecha_nacimiento,
      };
      localStorage.setItem("sdh_user", JSON.stringify(updatedUser));
      onSaved && onSaved(updatedUser);

      setOk("Perfil actualizado");

      const newBase = {
        nombre: updatedUser.nombre ?? form.nombre,
        apellido: updatedUser.apellido ?? form.apellido,
        rut: updatedUser.rut ?? form.rut,
        correo: updatedUser.email ?? updatedUser.correo ?? form.correo,
        telefono: updatedUser.telefono ?? form.telefono,
        fechaNacimiento: updatedUser.fecha_nacimiento ?? form.fechaNacimiento,
        direccion: updatedUser.direccion ?? form.direccion
      };
      setBase(newBase);
      setForm(newBase);
      setShowPwd(false);
      setPwd({ current: "", next: "", confirm: "" });
      setErrors({});
    } catch (err) {
      setErrors((p) => ({ ...p, global: "Error de red" }));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <h2>Cuenta</h2>
        <p>Cargando…</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Cuenta</h2>

      {errors.global && (
        <div className="profile-alert" style={{ marginBottom: 10 }}>
          {errors.global}
        </div>
      )}
      {ok && (
        <div className="profile-ok" style={{ marginBottom: 10 }}>
          {ok}
        </div>
      )}

      <form onSubmit={onSubmit} noValidate>
        <div className="grid2">
          <div className={`field ${errors.correo ? "invalid" : ""}`}>
            <label>Correo</label>
            <input
              name="correo"
              type="email"
              value={form.correo}
              onChange={onChange}
              placeholder="correo@ejemplo.com"
            />
            {errors.correo && <div className="err">{errors.correo}</div>}
          </div>

          <div className={`field ${errors.nombre ? "invalid" : ""}`}>
            <label>Nombre</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={onChange}
              placeholder="Tu nombre"
            />
            {errors.nombre && <div className="err">{errors.nombre}</div>}
          </div>

          <div className={`field ${errors.apellido ? "invalid" : ""}`}>
            <label>Apellido</label>
            <input
              name="apellido"
              value={form.apellido}
              onChange={onChange}
              placeholder="Tu apellido"
            />
            {errors.apellido && <div className="err">{errors.apellido}</div>}
          </div>

          <div className={`field ${errors.telefono ? "invalid" : ""}`}>
            <label>Teléfono</label>
            <input
              name="telefono"
              value={form.telefono}
              onChange={onChange}
              placeholder="+56XXXXXXXX"
            />
            {errors.telefono && <div className="err">{errors.telefono}</div>}
          </div>

          <div className={`field ${errors.rut ? "invalid" : ""}`}>
            <label>RUT</label>
            <input
              name="rut"
              value={form.rut}
              onChange={onChange}
              placeholder="12.345.678-9"
            />
            {errors.rut && <div className="err">{errors.rut}</div>}
          </div>

          <div className={`field ${errors.fechaNacimiento ? "invalid" : ""}`}>
            <label>Fecha de nacimiento</label>
            <input
              name="fechaNacimiento"
              type="date"
              value={form.fechaNacimiento || ""}
              onChange={onChange}
            />
            {errors.fechaNacimiento && <div className="err">{errors.fechaNacimiento}</div>}
          </div>

          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label>Dirección</label>
            <input
              name="direccion"
              value={form.direccion}
              onChange={onChange}
              placeholder="Calle, número, comuna…"
            />
          </div>

          {/* Botón para mostrar/ocultar cambio de contraseña */}
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <button
              type="button"
              className="btn"
              onClick={() => setShowPwd(v => !v)}
              aria-expanded={showPwd}
            >
              {showPwd ? "Cancelar cambio de contraseña" : "Cambiar contraseña…"}
            </button>
          </div>

          {showPwd && (
            <div style={{ gridColumn: "1 / -1", display: "grid", gap: 12 }}>
              <div className="field">
                <label>Contraseña actual</label>
                <input
                  type="password"
                  value={pwd.current}
                  onChange={(e) => setPwd(p => ({ ...p, current: e.target.value }))}
                  placeholder="(opcional para tu confirmación)"
                />
                <div className="help" style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                  Solo se usa como recordatorio local. El servidor no la requiere.
                </div>
              </div>

              <div className={`field ${errors.next ? "invalid" : ""}`}>
                <label>Nueva contraseña</label>
                <input
                  type="password"
                  value={pwd.next}
                  onChange={(e) => setPwd(p => ({ ...p, next: e.target.value }))}
                  placeholder="Dejar en blanco si no deseas cambiarla"
                  minLength={9}
                />
                {errors.next && <div className="err">{errors.next}</div>}
                <div className="help" style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                  Mínimo 9 caracteres, debe incluir letras y números.
                </div>
              </div>

              <div className={`field ${errors.confirm ? "invalid" : ""}`}>
                <label>Confirmar nueva contraseña</label>
                <input
                  type="password"
                  value={pwd.confirm}
                  onChange={(e) => setPwd(p => ({ ...p, confirm: e.target.value }))}
                />
                {errors.confirm && <div className="err">{errors.confirm}</div>}
              </div>
            </div>
          )}
        </div>

        <div className="row mt">
          <button type="submit" className="btn primary" disabled={saving || !dirty}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setForm(base);
              setErrors({});
              setOk("");
              setShowPwd(false);
              setPwd({ current: "", next: "", confirm: "" });
            }}
            disabled={saving}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
