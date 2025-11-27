import React, { useEffect, useMemo, useState } from "react";
import { Header } from "../../../componentes/Header";
import { Footer } from "../../../componentes/Footer";
import { useNavigate, useLocation } from "react-router-dom";
import "./Perfil.css";

export default function Perfil() {
  const navigate = useNavigate();
  const location = useLocation();
  // Handler para eliminar pedido (debe implementarse la lógica de backend y frontend)
  function handleEliminarPedido(id_pedido) {
    // Aquí iría la lógica para eliminar el pedido, por ejemplo, llamada a API y actualización de estado
    alert(`Eliminar pedido #${id_pedido} (implementar lógica)`);
  }

  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("sdh_user") || "null");
    } catch {
      return null;
    }
  }, []);

  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("account");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pedidos, setPedidos] = useState([]);
  // const [detallePedido, setDetallePedido] = useState(null);

  const [form, setForm] = useState({
    email: "",
    password: "",
    nombre: "",
    apellido: "",
    rut: "",
    telefono: "",
    fecha_nacimiento: "",
    direccion: "",
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
    const fetchUser = async () => {
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
          fecha_nacimiento: u.fecha_nacimiento
            ? formatForInput(u.fecha_nacimiento)
            : "",
          direccion: u.direccion || "",
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
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

  const handleChange = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleReset = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
      const res = await fetch(`${baseUrl}/api/pedidos/usuario/${user.id}`);
      const data = await res.json();
      setPedidos(Array.isArray(data.pedidos) ? data.pedidos : []);
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Cargar pedidos del usuario con detalle incluido
  const cargarPedidos = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
      const res = await fetch(`${baseUrl}/api/pedidos/usuario/${user.id}/con-detalle`);
      const data = await res.json();
      console.log("Respuesta pedidos:", data);
      setPedidos(Array.isArray(data.pedidos) ? data.pedidos : []);
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "orders" && user?.id) {
      console.log("ID usuario:", user.id);
      cargarPedidos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, user?.id]);

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
        direccion: form.direccion || null,
      };
      if (form.password && form.password.length > 0) payload.password = form.password;
      const res = await fetch(`${baseUrl}/api/usuarios/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      setForm((prev) => ({ ...prev, password: "" }));
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
      <div className="perfil-shell">
        <aside className="perfil-sidebar">
          <ul className="perfil-menu">
            <li
              className={tab === "account" ? "active" : ""}
              onClick={() => changeTab("account")}
            >
              Cuenta
            </li>
            <li
              className={tab === "orders" ? "active" : ""}
              onClick={() => changeTab("orders")}
            >
              Mis Órdenes
            </li>
            <li
              className={tab === "settings" ? "active" : ""}
              onClick={() => changeTab("settings")}
            >
              Configuración
            </li>
          </ul>
        </aside>
        <section className="perfil-content">
          {tab === "account" && (
            <div className="perfil-card">
              <h2>Datos de Cuenta</h2>
              <form>
                <div>
                  <label>Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => handleChange("email", e.target.value)}
                    disabled
                  />
                </div>
                <div>
                  <label>Nombre</label>
                  <input
                    type="text"
                    value={form.nombre}
                    onChange={e => handleChange("nombre", e.target.value)}
                  />
                </div>
                <div>
                  <label>Apellido</label>
                  <input
                    type="text"
                    value={form.apellido}
                    onChange={e => handleChange("apellido", e.target.value)}
                  />
                </div>
                <div>
                  <label>RUT</label>
                  <input
                    type="text"
                    value={form.rut}
                    onChange={e => handleChange("rut", e.target.value)}
                  />
                </div>
                <div>
                  <label>Teléfono</label>
                  <input
                    type="text"
                    value={form.telefono}
                    onChange={e => handleChange("telefono", e.target.value)}
                  />
                </div>
                <div>
                  <label>Fecha de nacimiento</label>
                  <input
                    type="date"
                    value={form.fecha_nacimiento}
                    onChange={e => handleChange("fecha_nacimiento", e.target.value)}
                  />
                </div>
                <div className="full">
                  <label>Dirección</label>
                  <input
                    type="text"
                    value={form.direccion}
                    onChange={e => handleChange("direccion", e.target.value)}
                  />
                </div>
                <div className="perfil-actions">
                  <button type="button" className="btn primary" onClick={handleSave} disabled={saving}>
                    Guardar cambios
                  </button>
                  <button type="button" className="btn ghost" onClick={handleReset}>
                    Restablecer
                  </button>
                  <button type="button" className="btn ghost" onClick={logout}>
                    Cerrar sesión
                  </button>
                </div>
              </form>
            </div>
          )}
          {tab === "orders" && (
            <div className="pedidos-card">
              <h3 style={{marginBottom: '8px'}}>Historial de Órdenes</h3>
              {loading ? (
                <p>Cargando órdenes...</p>
              ) : pedidos.length > 0 ? (
                <div className="pedidos-list">
                  {pedidos.map((pedido) => (
                    <div key={pedido.id_pedido} className="pedido-item">
                      <div className="pedido-info">
                        <h4>Pedido #{pedido.id_pedido}</h4>
                        <p>Cliente: <strong>{pedido.nombre_cliente || pedido.cliente || 'Usuario'}</strong></p>
                        <p>
                          Estado: <span className={`status-chip ${
                            pedido.estado === "completado" || pedido.estado === "entregado"
                              ? "success"
                              : pedido.estado === "cancelado"
                              ? "danger"
                              : "warning"
                          }`}>
                            {pedido.estado === "completado" ? "Entregado" : pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                          </span>
                        </p>
                        <p>Fecha: {pedido.fecha_pedido ? new Date(pedido.fecha_pedido).toLocaleDateString() : "Sin fecha"}</p>
                        <p>Total: ${pedido.total?.toLocaleString("es-CL")}</p>
                        {/* Botones funcionales para resumen de compra y acciones */}
                        <div className="pedido-actions" style={{marginTop: '10px', display: 'flex', gap: '8px'}}>
                          <button className="btn-resumen" onClick={() => navigate(`/resumen-compra/${pedido.id_pedido}`)}>
                            Ver resumen
                          </button>
                          <button className="btn-eliminar" onClick={() => handleEliminarPedido(pedido.id_pedido)}>
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No tienes órdenes registradas.</p>
              )}
            </div>
          // ...existing code...
          )}
          {tab === "settings" && (
            <div className="perfil-card">
              {/* Botón de detalle eliminado porque la función y estados relacionados han sido removidos */}
            </div>
          )}
        </section>
      </div>
      <Footer />
    </>
  );
}