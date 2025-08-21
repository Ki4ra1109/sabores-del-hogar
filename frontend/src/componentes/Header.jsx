import React, { useMemo, useState, useRef, useEffect } from 'react';
import "./Header.css";
import { FaSearch, FaShoppingCart, FaUser } from "react-icons/fa";
import Carrito from './Carrito';
import productos from '../data/productos';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const [abrirCarrito, setAbrirCarrito] = useState(false);
  const [carrito, setCarrito] = useState([]);
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const buscadorRef = useRef(null);
  const navigate = useNavigate();

  const resultados = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return productos.filter(p => p.nombre.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!buscadorRef.current) return;
      if (!buscadorRef.current.contains(e.target)) setShowResults(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const irADetalle = (id) => {
    setShowResults(false);
    setQuery("");
    navigate(`/catalogo/${id}`);
  };

  const onSubmitBuscar = (e) => {
    e.preventDefault();
    if (resultados.length > 0) irADetalle(resultados[0].id);
  };

  return (
    <header>
      <div className="mensaje-banner">
        <p>🎉 Bienvenido a mi página — Ofertas especiales todo el mes 🎉</p>
      </div>

      {/* BARRA SUPERIOR */}
      <nav className="Header-nav">
        {/* Logo a la izquierda */}
        <a href="/">
          <img
            src="/logoFondoBlanco.svg"
            className="Header-icon"
            alt="Logo Sabores del Hogar"
          />
        </a>

        {/* Nombre grande centrado */}
        <h1 className="NombreEmpresa">Sabores del hogar</h1>

        {/* Buscador + iconos a la derecha */}
        <div className="header-actions">
          <form className="buscar-container" onSubmit={onSubmitBuscar} ref={buscadorRef}>
            <input
              type="text"
              placeholder="Buscar..."
              className="buscar-input"
              value={query}
              onChange={(e)=>{ setQuery(e.target.value); setShowResults(true); }}
              onFocus={()=> setShowResults(true)}
            />
            <button className="buscar-submit" aria-label="buscar" type="submit">
              <FaSearch />
            </button>

            {showResults && resultados.length > 0 && (
              <ul className="buscar-dropdown">
                {resultados.map(r => (
                  <li key={r.id} onMouseDown={()=> irADetalle(r.id)}>
                    <img src={r.imagen} alt={r.nombre} />
                    <div>
                      <span className="res-nombre">{r.nombre}</span>
                      <span className="res-precio">{r.precio}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </form>

          <button
            className="Header-carrito-icon"
            onClick={(e)=>{ e.preventDefault(); setAbrirCarrito(true); }}
            title="Carrito"
          >
            <FaShoppingCart size={30} color="#fff" />
          </button>

          <a href="/Login" title="Iniciar sesión">
            <FaUser className="Header-login-icon" size={26} color="#fff" />
          </a>
        </div>
      </nav>

      <hr />

      {/* MENÚ INFERIOR */}
      <nav className="navbar">
        <ul className="navbar-list">
          <li><a href="/">Inicio</a></li>

          <li className="has-submenu">
            <a href="/Catalogo">Catálogo</a>
            <ul className="submenu">
              <li><a href="/Catalogo?cat=tortas">Tortas</a></li>
              <li><a href="/Catalogo?cat=dulces">Dulces</a></li>
            </ul>
          </li>

          <li><a href="/nosotros">Nosotros</a></li>
          <li><a href="/contacto">Contacto</a></li>
          <li><a href="/UserNormal">Vista User Normal</a></li>
          <li><a href="/UserAdmin">Vista User Admin</a></li>
        </ul>
      </nav>

      {/* Carrito Sidebar */}
      <Carrito
        carrito={carrito}
        setCarrito={setCarrito}
        abrir={abrirCarrito}
        setAbrir={setAbrirCarrito}
      />
    </header>
  );
}
