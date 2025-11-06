import React, { useEffect, useMemo, useState } from "react";
import { Header } from "../../../componentes/Header";
import { Footer } from "../../../componentes/Footer";
import { useNavigate, useLocation } from "react-router-dom";
import "./Perfil.css";

export default function Perfil() {
  const navigate = useNavigate();
  const location = useLocation();

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
  const [detallePedido, setDetallePedido] = useState(null);

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

  const handleChange = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleReset = () => {
    if (!user) return;
    setForm({
      email: user.email || "",
      password: "",
      nombre: user.nombre || "",
      apellido: user.apellido || "",
      rut: user.rut || "",
      telefono: user.telefono || "",
      fecha_nacimiento: user.fecha_nacimiento
        ? formatForInput(user.fecha_nacimiento)
        : "",
      direccion: user.direccion || "",
    });
  };

  // 🟢 Cargar pedidos del usuario con detalle incluido
  const cargarPedidos = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
      const res = await fetch(`${baseUrl}/api/pedidos/usuario/${user.id}`);
      if (!res.ok) throw new Error("No se pudo obtener los pedidos");
      const data = await res.json();
      setPedidos(data.pedidos || []);
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "orders") {
      cargarPedidos();
    }
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

      <div className="user-container" style={{ paddingTop: 24 }}>
        <aside className="sidebar" aria-hidden={false}>
          <ul>
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

        <main className="main-content">
          {/* 🧾 TAB ÓRDENES */}
          {tab === "orders" && (
            <div className="card">
              <h3>Historial de Órdenes</h3>
              {loading ? (
                <p>Cargando órdenes...</p>
              ) : pedidos?.length > 0 ? (
                <div className="orders">
                  {pedidos.map((pedido) => (
                    <div key={pedido.id_pedido} className="order">
                      <div className="order-info">
                        <strong>#{pedido.id_pedido}</strong>
                        <span>
                          Fecha: {new Date(pedido.fecha_pedido).toLocaleDateString()}
                        </span>
                        <span>
                          Estado:{" "}
                          <span
                            className={`estado ${
                              pedido.estado === "completado"
                                ? "estado-completado"
                                : pedido.estado === "cancelado"
                                ? "estado-cancelado"
                                : "estado-pendiente"
                            }`}
                          >
                            {pedido.estado}
                          </span>
                        </span>
                        <span>Total: ${pedido.total?.toLocaleString("es-CL")}</span>

                        <div className="order-products">
                          {pedido.detalle_productos?.length > 0 ? (
                            pedido.detalle_productos.map((item, index) => (
                              <div key={index} className="order-item">
                                <span>
                                  {item.nombre_producto} (x{item.cantidad})
                                </span>
                                <span>
                                  ${(
                                    item.precio_unitario * item.cantidad
                                  ).toLocaleString("es-CL")}
                                </span>
                              </div>
                            ))
                          ) : (
                            <em>Sin productos registrados</em>
                          )}
                        </div>

                        <div className="order-actions">
                          <button
                            className="btn btn-detalle"
                            onClick={() => setDetallePedido(pedido)}
                          >
                            Ver detalle
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No tienes órdenes registradas</p>
              )}
            </div>
          )}
        </main>
      </div>

      {/* MODAL DETALLE */}
      {detallePedido && (
        <div className="modal-overlay" onClick={() => setDetallePedido(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Detalle del Pedido #{detallePedido.id_pedido}</h3>
            <p>
              <b>Fecha:</b>{" "}
              {new Date(detallePedido.fecha_pedido).toLocaleDateString()}
            </p>
            <p>
              <b>Estado:</b>{" "}
              <span
                className={`estado ${
                  detallePedido.estado === "completado"
                    ? "estado-completado"
                    : detallePedido.estado === "cancelado"
                    ? "estado-cancelado"
                    : "estado-pendiente"
                }`}
              >
                {detallePedido.estado}
              </span>
            </p>
            <hr />
            <h4>Productos:</h4>
            {detallePedido.detalle_productos?.length > 0 ? (
              detallePedido.detalle_productos.map((p, i) => (
                <div key={i} className="order-item">
                  {p.nombre_producto} (x{p.cantidad}) - $
                  {(p.precio_unitario * p.cantidad).toLocaleString("es-CL")}
                </div>
              ))
            ) : (
              <em>No hay productos en este pedido</em>
            )}
            <hr />
            <h4>Total: ${detallePedido.total?.toLocaleString("es-CL")}</h4>
            <div style={{ textAlign: "right" }}>
              <button className="btn btn-detalle" onClick={() => setDetallePedido(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
