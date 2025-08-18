import React from 'react'
import "./Header.css";

export const Header = () => {
    return (
        <header>
            <div class="mensaje-banner">
                <p>🎉 Bienvenido a mi página — Ofertas especiales todo el mes 🎉 - aqui debemos mas adelante implementar mensaje escrito por el admin</p>
            </div>
            <nav className="Header-nav">
                <a href="/">
                    <img
                        src="../../public/logoFondoBlanco.svg"
                        className="Header-icon"
                        alt="Logo Sabores del Hogar"
                    />
                </a>

                <h1 className="NombreEmpresa">Sabores del hogar</h1>

                <div className="buscar-container">
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="buscar-input"
                    />
                    <span className="buscar-icon">🔍</span>
                </div>

                {/*aqui luego ira la direccion de la view del carrito de compras*/}
                <a href="/">
                    <img
                        src="../../public/Carrito-icon.png"
                        className="Header-carrito-icon"
                        alt="icono carrito de compras"
                    />
                </a>

                {/* aqui luego ira la direccion de la view login*/}
                <a href="/">
                    <img
                        src="../../public/Login-icon.png"
                        className="Header-login-icon"
                        alt="icono login/registro de session"
                    />
                </a>

            </nav>

            <hr></hr>

            <navbar className='navbar'>
                <ul className="navbar-list">
                    <li><a href="/">Inicio</a></li>
                    <li><a href="/productos">Productos</a></li>
                    <li><a href="/nosotros">Nosotros</a></li>
                    <li><a href="/contacto">Contacto</a></li>
                    <li><a href='/'>link extra</a></li>
                    <li><a href='/'>link extra</a></li>
                    <li><a href='/'>link extra</a></li>
                    <li><a href='/'>link extra</a></li>
                </ul>
            </navbar>
        </header>
    )
}
