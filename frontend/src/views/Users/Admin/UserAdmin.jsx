import React, { useState } from 'react';
import { Footer } from '../../../componentes/Footer';
import { Header } from '../../../componentes/Header';
import "./UserAdmin.css";

const UserNormal = () => {
  const [activeSection, setActiveSection] = useState("home");

  const productos = [
    { nombre: "Cheesecake de Frambuesa", precio: 4990, cantidad: 12, stock: 5 },
    { nombre: "Muffin de Arándanos", precio: 2590, cantidad: 7, stock: 2 },
    { nombre: "Croissant de Mantequilla", precio: 1500, cantidad: 15, stock: 10 },
    { nombre: "Tarta de Limón", precio: 5500, cantidad: 25, stock: 18 },
    { nombre: "Brownie con Nueces", precio: 3200, cantidad: 9, stock: 4 },
    { nombre: "Galletas de Chocolate", precio: 1200, cantidad: 20, stock: 12 },
    { nombre: "Pan de Chocolate", precio: 1800, cantidad: 8, stock: 3 },
    { nombre: "Cupcake de Vainilla", precio: 2200, cantidad: 10, stock: 7 },
    { nombre: "Tiramisu Individual", precio: 4200, cantidad: 5, stock: 1 },
    { nombre: "Donut Glaseado", precio: 1500, cantidad: 6, stock: 0 },
  ];

  const [period, setPeriod] = useState("day");

  const data = {
    day: [
      { label: "Lun", value: 45600 },
      { label: "Mar", value: 70000 },
      { label: "Mié", value: 55090 },
      { label: "Jue", value: 84900 },
      { label: "Vie", value: 60500 },
      { label: "Sáb", value: 95000 },
      { label: "Dom", value: 54500 },
    ],
    week: [
      { label: "Semana 1", value: 28000 },
      { label: "Semana 2", value: 35000 },
      { label: "Semana 3", value: 30000 },
      { label: "Semana 4", value: 40000 },
    ],
    month: [
      { label: "Ene", value: 120000 },
      { label: "Feb", value: 110000 },
      { label: "Mar", value: 140000 },
      { label: "Abr", value: 130000 },
      { label: "May", value: 150000 },
      { label: "Jun", value: 160000 },
    ],
  };

  const clientes = [
    { nombre: "Joaquín Riveros", email: "joaquin.riveros@example.com", telefono: "+56 9 2345 6789" },
    { nombre: "Camila Fernández", email: "camila.fernandez@example.com", telefono: "+56 9 8765 4321" },
    { nombre: "Sebastián Morales", email: "sebastian.morales@example.com", telefono: "+56 9 1122 3344" },
    { nombre: "Valentina Rojas", email: "valentina.rojas@example.com", telefono: "+56 9 5566 7788" },
    { nombre: "Lucas Pérez", email: "lucas.perez@example.com", telefono: "+56 9 9988 7766" },
    { nombre: "Isidora Soto", email: "isidora.soto@example.com", telefono: "+56 9 2233 4455" },
    { nombre: "Matías González", email: "matias.gonzalez@example.com", telefono: "+56 9 6677 8899" },
    { nombre: "Fernanda Díaz", email: "fernanda.diaz@example.com", telefono: "+56 9 3344 5566" },
    { nombre: "Ignacio Castillo", email: "ignacio.castillo@example.com", telefono: "+56 9 7788 9900" },
    { nombre: "Antonia Rivas", email: "antonia.rivas@example.com", telefono: "+56 9 4455 6677" },
  ];

  // Encontrar valor máximo para escalar la altura
  const maxValue = Math.max(...data[period].map(d => d.value));

  return (
    <div>
      <Header />
      <div className="user-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <ul>
            <li onClick={() => setActiveSection("inicio")}>Inicio</li>
            <li onClick={() => setActiveSection("account")}>Cuenta</li>
            <li onClick={() => setActiveSection("ventas")}>Sistema predictivo de ventas</li>
            <li onClick={() => setActiveSection("interactivo")}>Dashboard interactivo</li>
            <li onClick={() => setActiveSection("pedidos")}>Gestión de pedidos</li>
            <li onClick={() => setActiveSection("ganancias")}>Visualizar ganancias</li>
            <li onClick={() => setActiveSection("productos")}>Gestión de productos</li>
            <li onClick={() => setActiveSection("clientes")}>Gestión de clientes</li>
            <li onClick={() => setActiveSection("descuentos")}>Crear códigos de descuento</li>
            <li onClick={() => setActiveSection("settings")}>Configuración</li>
          </ul>
        </aside>

        {/* Contenido central */}
        <main className="main-content">

          {/* Inicio */}
          {activeSection === "inicio" && (
            <div className="admin-home">
              <h2>👋 Bienvenido al Panel de Administración</h2>
              <p>Resumen de las actividades más importantes y alertas recientes.</p>

              <div className="admin-cards">
                {/* Mensaje de bienvenida */}
                <div className="admin-card welcome-card">
                  <h3>Hola, Administrador</h3>
                  <p>Revisa las novedades y gestiona tu negocio de forma eficiente.</p>
                </div>

                {/* Mensajes importantes */}
                <div className="admin-card important-msgs">
                  <h3>Mensajes Importantes</h3>
                  <ul>
                    <li>Cliente "Juan Pérez" ha dejado un comentario sobre retraso en entrega.</li>
                    <li>Error crítico en la página de pagos detectado.</li>
                    <li>Pedido con ID #1023 necesita revisión urgente.</li>
                    <li>Producto "Cheesecake de Frambuesa" agotado en stock.</li>
                    <li>Recordatorio: Revisión de promociones para este mes.</li>
                  </ul>
                </div>

                {/* Estadísticas rápidas */}
                <div className="admin-card quick-stats">
                  <h3>Resumen rápido</h3>
                  <p>Pedidos pendientes: 5</p>
                  <p>Clientes nuevos: 12</p>
                  <p>Productos sin stock: 3</p>
                  <p>Alertas críticas: 2</p>
                </div>
              </div>
            </div>

          )}

          {/* Cuenta */}
          {activeSection === "account" && (
            <div className="datos-cuenta">
              <h2>Datos de tu cuenta</h2>
              <div className="campo"><strong>Correo electrónico:</strong> usuario.demo@example.com</div>
              <div className="campo"><strong>Contraseña:</strong> •••••••••</div>
              <div className="campo"><strong>Nombre:</strong> Joaquín</div>
              <div className="campo"><strong>Apellido:</strong> Riveros</div>
              <div className="campo"><strong>RUT:</strong> 21.345.678-9</div>
              <div className="campo"><strong>Teléfono:</strong> +56 9 2345 6789</div>
              <div className="campo"><strong>Fecha de Nacimiento:</strong> 15/08/2000</div>
              <div className="campo"><strong>Dirección:</strong> Av. Libertad 1234, Santiago</div>
            </div>
          )}

          {/* Ventas */}
          {activeSection === "ventas" && (

            <div className="predictive-sales">
              <h2 className="section-title">Sistema Predictivo de Ventas</h2>
              <p className="section-subtitle">
                Resumen de ventas recientes y tendencias para optimizar precios y cantidades.
              </p>

              <div className="predictive-grid">
                <div className="sales-card highlight">
                  <h3>🔥 Top Productos del Día</h3>
                  <ul>
                    <li>🥐 Croissant – <span>120 vendidos</span></li>
                    <li>☕ Café Latte – <span>95 vendidos</span></li>
                    <li>🍰 Cheesecake – <span>60 vendidos</span></li>
                  </ul>
                </div>

                <div className="sales-card">
                  <h3>📅 Tendencia Semanal</h3>
                  <p>
                    Los productos más pedidos esta semana muestran un crecimiento de{" "}
                    <strong className="positive">+18%</strong> en pastelería.
                  </p>
                </div>

                <div className="sales-card">
                  <h3>💡 Recomendación</h3>
                  <p>
                    📈 Aumentar stock de <strong>Croissant</strong> en un 20% durante la
                    mañana.
                  </p>
                </div>

                <div className="sales-card">
                  <h3>💵 Margen de Ganancia</h3>
                  <p>
                    Los postres premium generan un margen promedio del{" "}
                    <strong className="highlight-number">35%</strong>.
                  </p>
                </div>
              </div>

              <div className="extra-info">
                <h3>Pronóstico de Stock</h3>
                <p>
                  Basado en la demanda actual, se espera un incremento en{" "}
                  <strong>panadería artesanal</strong> en los próximos 7 días.
                </p>
              </div>
            </div>

          )}

          {/* Dashboard Interactivo */}
          {activeSection === "interactivo" && (
            <div className="dashboard-container">
              <h2>Dashboard interactivo</h2>
              <p>Datos digitalizados para tomar mejores decisiones.</p>

              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Artículo</th>
                    <th>Precio Unitario</th>
                    <th>Cantidad Vendida</th>
                    <th>Total</th>
                    <th>Stock</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((item, index) => {
                    const total = item.precio * item.cantidad;
                    const estado =
                      item.stock === 0
                        ? "❌ Sin stock"
                        : item.stock < 5
                          ? "⚠️ Stock bajo"
                          : "✅ Disponible";

                    return (
                      <tr key={index}>
                        <td>{item.nombre}</td>
                        <td>${item.precio.toLocaleString("es-CL")}</td>
                        <td>{item.cantidad}</td>
                        <td>${total.toLocaleString("es-CL")}</td>
                        <td>{item.stock}</td>
                        <td
                          className={
                            estado.includes("Sin")
                              ? "estado-rojo"
                              : estado.includes("bajo")
                                ? "estado-amarillo"
                                : "estado-verde"
                          }
                        >
                          {estado}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Gestion de pedidos */}
          {activeSection === "pedidos" && (
            <div className="order-management">
              <h2>🛒 Gestión de Pedidos</h2>
              <p>Administra los pedidos activos y revisa su historial.</p>

              <div className="orders-list">
                {[...Array(15)].map((_, index) => {
                  const estado = index % 3 === 0 ? "Por entregar" : "Entregado";
                  return (
                    <div key={index} className={`order-card ${estado === "Entregado" ? "delivered" : "pending"}`}>
                      <div className="order-info">
                        <p><strong>Pedido #{1000 + index}</strong></p>
                        <p>Producto: {["Croissant", "Cheesecake", "Cupcake", "Torta de Maracuya"][index % 4]}</p>
                        <p>Cantidad: {Math.floor(Math.random() * 5) + 1}</p>
                        <p>Estado: <span className="order-status">{estado}</span></p>
                      </div>
                      <div className="order-actions">
                        <button className="edit-btn">Modificar</button>
                        <button className="delete-btn">Eliminar</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Vista de Ganancias */}
          {activeSection === "ganancias" && (
            <div className="earnings-container">
              <h2>Visualizar Ganancias</h2>
              <p>Consulta ganancias por día, semana o mes.</p>

              <div className="period-selector">
                {["day", "week", "month"].map(p => (
                  <button
                    key={p}
                    className={period === p ? "active" : ""}
                    onClick={() => setPeriod(p)}
                  >
                    {p === "day" ? "Día" : p === "week" ? "Semana" : "Mes"}
                  </button>
                ))}
              </div>

              <div className="line-chart">
                {data[period].map((point, index) => {
                  const height = (point.value / maxValue) * 100;
                  return (
                    <div key={index} className="chart-point">
                      <div
                        className="line-bar"
                        style={{ height: `${height}%` }}
                        title={`$${point.value.toLocaleString()}`}
                      ></div>
                      <span className="label">{point.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Vista de productos(stock) */}
          {activeSection === "productos" && (
            <div className="products-container">
              <h2>Gestión de productos</h2>
              <p>Agrega, modifica o elimina productos del sistema.</p>

              {/* Botón separado para agregar nuevos productos */}
              <div className="add-product-btn">
                <button>Añadir nuevo producto</button>
              </div>

              <div className="products-list">
                {productos.map((producto, index) => (
                  <div key={index} className="product-card">
                    <div className="product-info">
                      <h4>{producto.nombre}</h4>
                      <p>Precio: ${producto.precio.toLocaleString()}</p>
                      <p>Stock: {producto.stock}</p>
                      <p>Cantidad disponible: {producto.cantidad}</p>
                    </div>
                    <div className="product-actions">
                      <button>Modificar</button>
                      <button>Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          )}

          {/* Vista clientes(Users en la base de datos) */}
          {activeSection === "clientes" && (
            <div className="clients-container">
              <h2>Gestión de clientes</h2>
              <p>Edita o elimina información de clientes registrados.</p>

              <div className="clients-list">
                {clientes.map((cliente, index) => (
                  <div key={index} className="client-card">
                    <div className="client-info">
                      <h4>{cliente.nombre}</h4>
                      <p>Email: {cliente.email}</p>
                      <p>Teléfono: {cliente.telefono}</p>
                    </div>
                    <div className="client-actions">
                      <button>Modificar</button>
                      <button>Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vista de descuentos */}
          {activeSection === "descuentos" && (
            <div className="discounts-container">
              <h2>Crear códigos de descuento</h2>
              <p>Gestiona los descuentos automáticos y modifica el mensaje mostrado a los clientes.</p>

              {/* Mensaje superior */}
              <div className="discount-message">
                <label>Mensaje para clientes:</label>
                <input type="text" placeholder="Feliz cumpleaños, disfruta tu descuento!" />
              </div>

              {/* Lista de códigos de descuento */}
              <div className="discounts-list">
                {[
                  { codigo: "CUMP2025", descripcion: "10% de descuento cumpleaños", vigencia: "30/09/2025" },
                  { codigo: "PROMOSEP", descripcion: "15% de descuento septiembre", vigencia: "30/09/2025" },
                  { codigo: "ENVIOGRATIS", descripcion: "Envío gratis en pedidos mayores a $20.000", vigencia: "31/12/2025" },
                ].map((d, index) => (
                  <div key={index} className="discount-card">
                    <div className="discount-info">
                      <p><strong>Código:</strong> {d.codigo}</p>
                      <p><strong>Descripción:</strong> {d.descripcion}</p>
                      <p><strong>Vigencia:</strong> {d.vigencia}</p>
                    </div>
                    <div className="discount-actions">
                      <button>Modificar</button>
                      <button>Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botón para agregar un nuevo código */}
              <button className="add-discount-btn">Agregar nuevo código</button>
            </div>

          )}

          {/* Configuración */}
          {activeSection === "settings" && (
            <div className="configuracion">
              <h2>Configuración</h2>
              <p>Aquí puedes cambiar ajustes visuales y de tu cuenta.</p>

              <div className="config-item">
                <label htmlFor="color-tema">Tema de color:</label>
                <select id="color-tema">
                  <option value="default">Café (default)</option>
                  <option value="oscuro">Oscuro</option>
                  <option value="claro">Claro</option>
                  <option value="pastel">Pastel</option>
                </select>
              </div>

              <div className="config-item">
                <label htmlFor="modo-oscuro">Modo oscuro</label>
                <input type="checkbox" id="modo-oscuro" />
              </div>

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
                <button className="logout-btn">Cerrar sesión</button>
              </div>
            </div>
          )}

        </main>
      </div>
      <Footer />
    </div>
  );
};

export default UserNormal;
