import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";


export const Footer = () => {
  const redes = [
    { nombre: "Instagram", url: "https://www.instagram.com/sabores_del_hogar_2025", img: "https://cdn-icons-png.flaticon.com/128/3955/3955024.png" },
    { nombre: "Facebook", url: "https://web.facebook.com/profile.php?id=61579258721818", img: "https://cdn-icons-png.flaticon.com/128/2504/2504903.png" },
    { nombre: "Twitter", url: "https://x.com/SDHogar2025", img: "https://cdn-icons-png.flaticon.com/512/5968/5968830.png" },
    { nombre: "TiktoK", url: "https://www.tiktok.com/@saboresdelhogar2", img: "https://cdn-icons-png.flaticon.com/128/3116/3116491.png" },
  ];

  return (
    <footer>
      <Link to="/">
        <img
          src="/logoFondoBlanco.svg"
          className="Footer-icon"
          alt="Logo Sabores del Hogar"
        />
      </Link>

      <ul className="redes-lista">
        {redes.map((red, index) => (
          <li key={index} className={`red ${red.nombre}`}>
            <a href={red.url} target="_blank" rel="noopener noreferrer">
              <img src={red.img} alt={red.nombre} />
              <span>{red.nombre}</span>
            </a>
          </li>
        ))}
      </ul>

      <hr />

      <div className="footer-links">
            <Link to="/politica-privacidad">Política de Privacidad</Link>
            <Link to="/terminos-condiciones">Términos y Condiciones</Link>
            <Link to="/contacto">Contacto</Link>
     </div>

      <p className="veri-sitio">© 2025 Sabores del hogar</p>
    </footer>
  );
};
