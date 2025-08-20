import React, { useState } from 'react';
import "./UserNormal.css";
import { Footer } from '../../../componentes/Footer';
import { Header } from '../../../componentes/Header';


const UserNormal = () => {
    const [activeSection, setActiveSection] = useState("home");

    const orders = [
        {
            id: 1,
            date: "14 de septiembre de 2024",
            status: "Entregado",
            deliveredDate: "17 de septiembre",
            title: "Cheesecake de Frambuesa",
            quantity: 1,
            store: "Sobores del Hogar",
            seller: "Valor: $6.000",
            img: "https://assets.tmecosys.com/image/upload/t_web_rdp_recipe_584x480/img/recipe/ras/Assets/FE68C7EE-020B-456D-BF9D-8F10D39DA6A6/Derivates/52175A9A-FAEF-44C1-B1F7-CAAA169F5771.jpg", // reemplaza con la url real
        },
        {
            id: 2,
            date: "14 de septiembre de 2024",
            status: "Entregado",
            deliveredDate: "17 de septiembre",
            title: "Muffin de Arrandanos",
            quantity: 3,
            store: "Sobores del Hogar",
            seller: "Valor: $7.000",
            img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgFvz1oTsnaZm-Tlk4fRH7LIUrDzbGECDHMcWGLBWeOTWw9N5hksZDdHyo47NWIyS71CwyS19MSncIQDovmbQin_Dq3PCs3HsJuUW1dd4Ls4HOc0C7W5G3FKLbpf89PebLuTGyR6c96Csw/s1600/muffins-caseros-de-maiz-arandanos-frescos.jpg",
        },
    ];

    return (
        <div>
            <Header />
            <div className="user-container">
                {/* Sidebar */}
                <aside className="sidebar">
                    <ul>
                        <li onClick={() => setActiveSection("home")}>Inicio</li>
                        <li onClick={() => setActiveSection("account")}>Cuenta</li>
                        <li onClick={() => setActiveSection("orders")}>Mis Órdenes</li>
                        <li onClick={() => setActiveSection("settings")}>Configuración</li>
                    </ul>
                </aside>

                {/* Contenido central */}
                <main className="main-content">
                    {activeSection === "home" && (
                        <div className="inicio-container">
                            {/* Sección de bienvenida */}
                            <div className="bienvenida">
                                <h3>Bienvenido al inicio 👋</h3>
                                <p>Aquí puedes ver novedades y anuncios.</p>
                            </div>

                            {/* Fila con Sobre Nosotros y Postre */}
                            <div className="fila-inferior">
                                {/* Sección Sobre Nosotros */}
                                <div className="sobre-nosotros">
                                    <h3>Sobre Nosotros</h3>
                                    <p>
                                        Somos una pastelería dedicada a ofrecer los mejores postres artesanales,
                                        usando ingredientes frescos y de alta calidad. ¡Endulza tu día con nosotros!
                                    </p>
                                </div>

                                {/* Card de postre en oferta */}
                                <div className="postre-card">
                                    <img src="https://assets.tmecosys.com/image/upload/t_web_rdp_recipe_584x480/img/recipe/ras/Assets/FE68C7EE-020B-456D-BF9D-8F10D39DA6A6/Derivates/52175A9A-FAEF-44C1-B1F7-CAAA169F5771.jpg" alt="Postre destacado" />
                                    <div className="postre-info">
                                        <h4>Cheesecake de Frambuesa</h4>
                                        <p>¡Oferta especial! Solo $4.990</p>
                                        <button>Comprar</button>
                                    </div>
                                </div>

                                <div className="postre-card">
                                    <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgFvz1oTsnaZm-Tlk4fRH7LIUrDzbGECDHMcWGLBWeOTWw9N5hksZDdHyo47NWIyS71CwyS19MSncIQDovmbQin_Dq3PCs3HsJuUW1dd4Ls4HOc0C7W5G3FKLbpf89PebLuTGyR6c96Csw/s1600/muffins-caseros-de-maiz-arandanos-frescos.jpg" alt="Postre destacado" />
                                    <div className="postre-info">
                                        <h4>Muffin de arandanos</h4>
                                        <p>¡Oferta especial! Solo $2.590</p>
                                        <button>Comprar</button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}
                    {activeSection === "account" && (
                        <div className="datos-cuenta">
                            <h2>Datos de tu cuenta</h2>

                            <div className="campo">
                                <strong>Correo electrónico:</strong>
                                <span>usuario.demo@example.com</span>
                            </div>

                            <div className="campo">
                                <strong>Contraseña:</strong>
                                <span>•••••••••</span>
                            </div>

                            <div className="campo">
                                <strong>Nombre:</strong>
                                <span>Joaquín</span>
                            </div>

                            <div className="campo">
                                <strong>Apellido:</strong>
                                <span>Riveros</span>
                            </div>

                            <div className="campo">
                                <strong>RUT:</strong>
                                <span>21.345.678-9</span>
                            </div>

                            <div className="campo">
                                <strong>Teléfono:</strong>
                                <span>+56 9 2345 6789</span>
                            </div>

                            <div className="campo">
                                <strong>Fecha de Nacimiento:</strong>
                                <span>15/08/2000</span>
                            </div>

                            <div className="campo">
                                <strong>Dirección:</strong>
                                <span>Av. Libertad 1234, Santiago</span>
                            </div>
                        </div>

                    )}
                    {activeSection === "orders" && (
                        <div className="orders-history">
                            <h2>Historial De Ordenes</h2>
                            {orders.map((order) => (
                                <div key={order.id} className="order-card">
                                    <div className="order-left">
                                        <img src={order.img} alt={order.title} />
                                        <div>
                                            <p className="order-status">{order.status}</p>
                                            <p className="order-date">Llegó el {order.deliveredDate}</p>
                                            <p className="order-title">{order.title}</p>
                                            <p className="order-quantity">{order.quantity} unidad</p>
                                        </div>
                                    </div>
                                    <div className="order-right">
                                        <p className="order-store">{order.store}</p>
                                        <p className="order-seller">{order.seller}</p>
                                        <button className="btn-primary">Ver compra</button>
                                        <button className="btn-secondary">Volver a comprar</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {activeSection === "settings" && (
                        <div class="configuracion">
                            <h2>Configuración</h2>
                            <p>Aquí puedes cambiar ajustes visuales y de tu cuenta.</p>

                            <div class="config-item">
                                <label for="color-tema">Tema de color:</label>
                                <select id="color-tema">
                                    <option value="default">Café (default)</option>
                                    <option value="oscuro">Oscuro</option>
                                    <option value="claro">Claro</option>
                                    <option value="pastel">Pastel</option>
                                </select>
                            </div>

                            <div class="config-item">
                                <label for="modo-oscuro">Modo oscuro</label>
                                <input type="checkbox" id="modo-oscuro" />
                            </div>

                            <div class="config-item">
                                <label for="notificaciones">Notificaciones</label>
                                <input type="checkbox" id="notificaciones" checked />
                            </div>

                            <div class="config-item">
                                <label for="fuente">Tamaño de fuente:</label>
                                <select id="fuente">
                                    <option value="pequena">Pequeña</option>
                                    <option value="media" selected>Media</option>
                                    <option value="grande">Grande</option>
                                </select>
                            </div>

                            <div class="config-item">
                                <label for="idioma">Idioma:</label>
                                <select id="idioma">
                                    <option value="es" selected>Español</option>
                                    <option value="en">Inglés</option>
                                    <option value="pt">Portugués</option>
                                </select>
                            </div>

                            <div class="config-item">
                                <label for="perfil">Mostrar foto de perfil</label>
                                <input type="checkbox" id="perfil" checked />
                            </div>

                            <div class="config-item">
                                <button class="logout-btn">Cerrar sesión</button>
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
