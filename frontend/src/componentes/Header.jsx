import React from 'react'
import "./Header.css";
import { FaSearch } from "react-icons/fa";
import { FaShoppingCart } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import { Link } from 'react-router-dom';

export const Header = () => {
    return (
        <header>
            
            <div className="mensaje-banner">
                <p>🎉 Bienvenido a mi página — Ofertas especiales todo el mes 🎉 - aqui debemos mas adelante implementar mensaje escrito por el admin</p>
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

                <a href="/" className="Header-carrito-icon">
                    <FaShoppingCart size={30} color="#fff" />
                </a>

                <a href="/Login">
                    <FaUser className="Header-login-icon" size={26} color="#fff" />
                </a>
            </nav>

      
            <hr />

            
            <nav className="navbar">
                <ul className="navbar-list">
                    <li><a href="/">Inicio</a></li>
                    <li>
                        <Link to="/Productos">Productos</Link>
                    </li>
                    <li><a href="/nosotros">Nosotros</a></li>
                    <li><a href="/contacto">Contacto</a></li>
                    <li><a href="/">link extra</a></li>
                    <li><a href="/">link extra</a></li>
                    <li><a href="/">link extra</a></li>
                    <li><a href="/">link extra</a></li>
                </ul>
            </nav>
        </header>
    )
}
