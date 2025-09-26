import React, { useEffect, useMemo, useState } from "react";
import { Header } from "../../../componentes/Header";
import { Footer } from "../../../componentes/Footer";
import { useNavigate, useLocation } from "react-router-dom";
import "./Perfil.css";

export default function Perfil() {
  const navigate = useNavigate();
  const location = useLocation();

  const storedUser = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("sdh_user") || "null"); }
    catch { return null; }
  }, []);

  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("account");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    nombre: "",
    apellido: "",
    rut: "",
    telefono: "",
    fecha_nacimiento: "",
    direccion: ""
  });

  useEffect(() => {
    if (!storedUser) navigate("/login", { replace: true });
  }, [storedUser, navigate]);

  useEffect(() => {
    setUser(storedUser);
  }, [storedUser]);

  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const t = q.get("tab");
    if (["account", "orders", "settings"].includes(t || "")) setTab(t);
  }, [location.search]);

  useEffect(() => {
    async function fetchUser() {
      if (!storedUser?.id) return;
      setLoading(true);
      try {
        const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
        const res = await fetch(`${baseUrl}/api/usuarios/${storedUser.id}`);
        if (!res.ok) throw new Error("No se pudo obtener usuario");
        const data = await res.json();
        const u = data.user || {};
        setUser(u);
        setForm({
          email: u.email || "",
          password: "",
          nombre: u.nombre || "",
          apellido: u.apellido || "",
          rut: u.rut || "",
          telefono: u.telefono || "",
          fecha_nacimiento: u.fecha_nacimiento ? formatForInput(u.fecha_nacimiento) : "",
          direccion: u.direccion || ""
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [storedUser]);

  function formatForInput(val) {
    if (!val) return "";
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return val;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  const changeTab = (t) => {
    setTab(t);
    const q = new URLSearchParams(location.search);
    q.set("tab", t);
    navigate({ pathname: "/perfil", search: `?${q.toString()}` }, { replace: true });
  };

  const logout = () => {
    localStorage.removeItem("sdh_user");
    navigate("/login", { replace: true });
  };

  const handleChange = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleReset = () => {
    if (!user) return;
    setForm({
      email: user.email || "",
      password: "",
      nombre: user.nombre || "",
      apellido: user.apellido || "",
      rut: user.rut || "",
      telefono: user.telefono || "",
      fecha_nacimiento: user.fecha_nacimiento ? formatForInput(user.fecha_nacimiento) : "",
      direccion: user.direccion || ""
    });
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
      const payload = {
        nombre: form.nombre || null,
        apellido: form.apellido || null,
        rut: form.rut || null,
        email: form.email || null,
        telefono: form.telefono || null,
        fecha_nacimiento: form.fecha_nacimiento || null,
        direccion: form.direccion || null
      };
      if (form.password && form.password.length > 0) payload.password = form.password;
      const res = await fetch(`${baseUrl}/api/usuarios/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data?.message || "Error al guardar";
        alert(msg);
        return;
      }
      const updated = data.user || {};
      const merged = { ...user, ...updated };
      localStorage.setItem("sdh_user", JSON.stringify(merged));
      setUser(merged);
      setForm(prev => ({ ...prev, password: "" }));
      alert("Perfil actualizado");
    } catch (e) {
      console.error(e);
      alert("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header />

      <div className="user-container" style={{ paddingTop: 24 }}>
        <aside className="sidebar" aria-hidden={false}>
          <ul>
            <li className={tab === "account" ? "active" : ""} onClick={() => changeTab("account")}>Cuenta</li>
            <li className={tab === "orders" ? "active" : ""} onClick={() => changeTab("orders")}>Mis Órdenes</li>
            <li className={tab === "settings" ? "active" : ""} onClick={() => changeTab("settings")}>Configuración</li>
          </ul>
        </aside>

        <main className="main-content">
          {tab === "account" && (
            <div className="card">
              <div className="card-head">
                <h3>Datos de tu cuenta</h3>
              </div>

              <div className="card-stack">
                <div className="grid2">
                  <div className="field">
                    <label>Email</label>
                    <input type="email" value={form.email} disabled />
                  </div>
                  <div className="field">
                    <label>Contraseña</label>
                    <input type="password" value={form.password} onChange={(e) => handleChange("password", e.target.value)} placeholder="Dejar en blanco para mantener" />
                  </div>
                </div>

                <div className="grid2">
                  <div className="field">
                    <label>Nombre</label>
                    <input value={form.nombre} onChange={(e) => handleChange("nombre", e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Apellido</label>
                    <input value={form.apellido} onChange={(e) => handleChange("apellido", e.target.value)} />
                  </div>
                </div>

                <div className="grid2">
                  <div className="field">
                    <label>RUT</label>
                    <input value={form.rut} onChange={(e) => handleChange("rut", e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Teléfono</label>
                    <input value={form.telefono} onChange={(e) => handleChange("telefono", e.target.value)} />
                  </div>
                </div>

                <div className="grid2">
                  <div className="field">
                    <label>Fecha de Nacimiento</label>
                    <input type="date" value={form.fecha_nacimiento} onChange={(e) => handleChange("fecha_nacimiento", e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Dirección</label>
                    <input value={form.direccion} onChange={(e) => handleChange("direccion", e.target.value)} />
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 8 }}>
                  <button className="btn primary" onClick={handleSave} disabled={saving}>{saving ? "Guardando..." : "Guardar cambios"}</button>
                  <button className="btn" onClick={handleReset} disabled={saving}>Restablecer</button>
                  <div style={{ marginLeft: "auto" }}>
                    <button className="btn danger" onClick={logout}>Cerrar sesión</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "orders" && (
            <div className="card">
              <h3>Historial De Órdenes</h3>
              <div className="orders">
                <div className="order">
                  <div className="order-info">
                    <strong>Entregado</strong>
                    <span>Llegó el 17 de septiembre</span>
                    <span>Cheesecake de Frambuesa</span>
                  </div>
                  <div className="order-actions">
                    <button className="btn">Ver compra</button>
                  </div>
                </div>

                <div className="order">
                  <div className="order-info">
                    <strong>Entregado</strong>
                    <span>Llegó el 17 de septiembre</span>
                    <span>Muffin de Arándanos</span>
                  </div>
                  <div className="order-actions">
                    <button className="btn">Ver compra</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "settings" && (
            <div className="card">
              <h3>Configuración</h3>
              <div className="field">
                <label>Tema de color</label>
                <select defaultValue="default">
                  <option value="default">Café (default)</option>
                  <option value="oscuro">Oscuro</option>
                  <option value="claro">Claro</option>
                </select>
              </div>
              <div className="mt">
                <button className="btn primary" onClick={() => alert("Guardado")}>Guardar</button>
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </>
  );
}
