import React, { useState } from 'react';
import "./Header.css";
import { FaSearch, FaShoppingCart, FaUser } from "react-icons/fa";
import Carrito from './Carrito';

export const Header = () => {
    const [abrirCarrito, setAbrirCarrito] = useState(false);
    const [carrito, setCarrito] = useState([]); 

    return (
        <header>
            <div className="mensaje-banner">
                <p>🎉 Bienvenido a mi página — Ofertas especiales todo el mes 🎉</p>
            </div>
            <nav className="Header-nav">
                <a href="/">
                    <img
                        src="/logoFondoBlanco.svg"  
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
                    <span className="buscar-icon">
                        <FaSearch />
                    </span>
                </div>
                {/* boton carrito funcional */}
                <button 
                    className="Header-carrito-icon" 
                    onClick={(e) => {
                        e.preventDefault();
                        setAbrirCarrito(true)
                    }}
                >
                    <FaShoppingCart size={30} color="#fff" />
                </button>
                <a href="/Login">
                    <FaUser className="Header-login-icon" size={26} color="#fff" />
                </a>
            </nav>
            <hr />
            <nav className="navbar">
                <ul className="navbar-list">
                    <li><a href="/">Inicio</a></li>
                    <li><a href="/Catalogo">Catálogo</a></li>
                    <li><a href="/nosotros">Nosotros</a></li>
                    <li><a href="/contacto">Contacto</a></li>
                </ul>
            </nav>
            {/* carrito Sidebar */}
            <Carrito 
                carrito={carrito} 
                setCarrito={setCarrito} 
                abrir={abrirCarrito} 
                setAbrir={setAbrirCarrito} 
            />
        </header>
    );
}
