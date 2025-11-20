import React, { useEffect, useMemo, useState, useRef } from "react";
import "./UserNormal.css";
import { Footer } from "../../../componentes/Footer";
import { Header } from "../../../componentes/Header";
import { useNavigate, useLocation } from "react-router-dom";
import Home from "../../Home/Home";
import Perfil from "./Perfil";

const UserNormal = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const storedUser = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("sdh_user") || "null"); }
    catch { return null; }
  }, []);

  const [user, setUser] = useState(storedUser);
  const [activeSection, setActiveSection] = useState("home");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const firstFocusable = useRef(null);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (!storedUser) navigate("/login", { replace: true });
  }, [storedUser, navigate]);

  useEffect(() => { setUser(storedUser); }, [storedUser]);

  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const section = q.get("section");
    const openDrawer = q.get("drawer");
    if (section === "account" || section === "orders" || section === "settings" || section === "home") {
      setActiveSection(section);
    }
    if (openDrawer === "1" && section === "account") {
      setDrawerOpen(true);
    }
  }, [location.search]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setDrawerOpen(false);
    if (drawerOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  useEffect(() => {
    if (drawerOpen && firstFocusable.current) firstFocusable.current.focus();
  }, [drawerOpen]);

  useEffect(() => {
    // Solo cargar pedidos si está en la sección "orders" y hay usuario
    if (activeSection === "orders" && user?.id) {
      setLoadingOrders(true);
      const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
      console.log(`${baseUrl}/api/pedidos/usuario/${user.id}`);
      fetch(`${baseUrl}/api/pedidos/usuario/${user.id}`)
        .then(res => res.json())
        .then(data => {
          console.log("Respuesta pedidos:", data);
          setOrders(data.pedidos || []);
        })
        .catch(err => {
          console.error("Error al cargar pedidos:", err);
          setOrders([]);
        })
        .finally(() => setLoadingOrders(false));
    }
  }, [activeSection, user?.id]);

  const logout = () => {
    localStorage.removeItem("sdh_user");
    navigate("/login", { replace: true });
  };

  const correo = user?.email || user?.correo || "";
  const nombre = user?.nombre || "";
  const apellido = user?.apellido || "";
  const rut = user?.rut || "";
  const telefono = user?.telefono || "";
  const fechaNac = user?.fecha_nacimiento || user?.fechaNacimiento || "";
  const direccion = user?.direccion || "";

  const go = (section) => {
    setActiveSection(section);
    setDrawerOpen(false);
  };

  const mainClass = `main-content ${activeSection === "home" ? "fullbleed" : ""}`;

  const renderContent = () => {
    switch (activeSection) {
      case "account":
        return (
          <div className="datos-cuenta">
            <h2>Datos de tu cuenta</h2>
            <div className="campo"><strong>Correo electrónico:</strong><span>{correo || "—"}</span></div>
            <div className="campo"><strong>Contraseña:</strong><span>•••••••••</span></div>
            <div className="campo"><strong>Nombre:</strong><span>{nombre || "—"}</span></div>
            <div className="campo"><strong>Apellido:</strong><span>{apellido || "—"}</span></div>
            <div className="campo"><strong>RUT:</strong><span>{rut || "—"}</span></div>
            <div className="campo"><strong>Teléfono:</strong><span>{telefono || "—"}</span></div>
            <div className="campo"><strong>Fecha de Nacimiento:</strong><span>{fechaNac || "—"}</span></div>
            <div className="campo"><strong>Dirección:</strong><span>{direccion || "—"}</span></div>
          </div>
        );
      case "orders":
        return (
          <div className="orders-history">
            <h2>Historial De Órdenes</h2>
            {loadingOrders ? (
              <p>Cargando órdenes...</p>
            ) : orders.length === 0 ? (
              <p>No tienes órdenes registradas</p>
            ) : (
              orders.map((order) => (
                <div key={order.id_pedido} className="order-card">
                  <div className="order-left">
                    {/* Si tienes imagen, úsala. Si no, muestra un placeholder */}
                    <img src={order.img || "/assets/home/pan.png"} alt={order.detalle_productos?.[0]?.nombre_producto || "Pedido"} />
                    <div>
                      <p className="order-status">{order.estado}</p>
                      <p className="order-date">{new Date(order.fecha_pedido).toLocaleDateString()}</p>
                      <p className="order-title">
                        {order.detalle_productos?.map(p => p.nombre_producto).join(", ")}
                      </p>
                      <p className="order-quantity">
                        {order.detalle_productos?.reduce((acc, p) => acc + p.cantidad, 0)} productos
                      </p>
                    </div>
                  </div>
                  <div className="order-right">
                    <p className="order-store">Sabores del Hogar</p>
                    <p className="order-seller">Total: ${order.total?.toLocaleString("es-CL")}</p>
                    <button className="btn-primary">Ver compra</button>
                    <button className="btn-secondary">Volver a comprar</button>
                  </div>
                </div>
              ))
            )}
          </div>
        );
      case "settings":
        return (
          <div className="configuracion">
            <h2>Configuración</h2>
            <p>Ajustes de tu cuenta.</p>

            <div className="config-item">
              <label htmlFor="notificaciones">Notificaciones</label>
              <input type="checkbox" id="notificaciones" defaultChecked />
            </div>

            <div className="config-item">
              <label htmlFor="fuente">Tamaño de fuente:</label>
              <select id="fuente" defaultValue="media">
                <option value="pequena">Pequeña</option>
                <option value="media">Media</option>
                <option value="grande">Grande</option>
              </select>
            </div>

            <div className="config-item">
              <label htmlFor="idioma">Idioma:</label>
              <select id="idioma" defaultValue="es">
                <option value="es">Español</option>
                <option value="en">Inglés</option>
                <option value="pt">Portugués</option>
              </select>
            </div>

            <div className="config-item">
              <label htmlFor="perfil">Mostrar foto de perfil</label>
              <input type="checkbox" id="perfil" defaultChecked />
            </div>

            <div className="config-item">
              <button className="logout-btn" onClick={logout}>Cerrar sesión</button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  console.log("Usuario actual:", user);

  return (
    <div>
      {activeSection !== "home" && <Header />}

      {activeSection === "account" && (
        <button
          className="udrawer-toggle"
          aria-label="Abrir menú"
          onClick={() => setDrawerOpen(true)}
        >
          ☰
        </button>
      )}

      {activeSection === "account" && (
        <div
          className={`udrawer-ov ${drawerOpen ? "show" : ""}`}
          onClick={() => setDrawerOpen(false)}
          aria-hidden={!drawerOpen}
        />
      )}

      {activeSection === "account" && (
        <aside className={`udrawer ${drawerOpen ? "open" : ""}`} aria-hidden={!drawerOpen}>
          <div className="udrawer-head">
            <h3>Menú</h3>
            <button
              ref={firstFocusable}
              className="udrawer-close"
              onClick={() => setDrawerOpen(false)}
              aria-label="Cerrar menú"
            >
              ✕
            </button>
          </div>
          <ul className="udrawer-list">
            <li className={activeSection === "home" ? "active" : ""} onClick={() => go("home")}>Inicio</li>
            <li className={activeSection === "account" ? "active" : ""} onClick={() => go("account")}>Cuenta</li>
            <li className={activeSection === "orders" ? "active" : ""} onClick={() => go("orders")}>Mis Órdenes</li>
            <li className={activeSection === "settings" ? "active" : ""} onClick={() => go("settings")}>Configuración</li>
          </ul>
        </aside>
      )}

      <div className={`user-container-overlay`}>
        <main className={mainClass}>
          {activeSection === "home" && (
            <div className="home-embedded">
              <Home />
            </div>
          )}

          {renderContent()}
        </main>
      </div>

      {activeSection !== "home" && <Footer />}
    </div>
  );
};

export default UserNormal;