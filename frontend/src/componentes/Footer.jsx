import React from 'react'
import "./Footer.css";

export const Footer = () => {

    const redes = [
        { nombre: 'Instagram', url: 'https://www.instagram.com/sabores_del_hogar_2025', img: '../../public/instagram.png' },
        { nombre: 'Facebook', url: 'https://web.facebook.com/profile.php?id=61579258721818', img: '../../public/facebook.png' },
        { nombre: 'Twitter', url: 'https://x.com/SDHogar2025', img: '../../public/twitter.png' },
        { nombre: 'TiktoK', url: 'https://www.tiktok.com/@saboresdelhogar2', img: '../../public/tiktok-icono.png' },
    ];

    return (
        <footer>
            <a href="/">
                <img
                    src="../../public/logoFondoBlanco.svg"
                    className="Footer-icon"
                    alt="Logo Sabores del Hogar"
                />
            </a>

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

            <hr></hr>
            
            <div className="footer-links">
                <a href="#">Política de Privacidad</a>
                <a href="#">Términos y Condiciones</a>
                <a href="#">Contacto</a>
            </div>

            <p className='veri-sitio'>
                © 2025 Sabores del hogar
            </p>

        </footer>
    )
}
