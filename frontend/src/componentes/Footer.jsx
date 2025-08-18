import React from 'react'
import "./Footer.css";
import { useState } from 'react';

export const Footer = () => {

    const redes = [
        { nombre: 'Instagram', url: 'https://www.instagram.com/agustin.l.s/#', img: '../../public/instagram.png' },
        { nombre: 'Facebook', url: 'https://www.facebook.com/saboresdelhogar', img: '../../public/facebook.png' },
        { nombre: 'Twitter', url: 'https://twitter.com/saboresdelhogar', img: '../../public/twitter.png' },
        { nombre: 'Otra red', url: '/', img: '../../public/vite.svg' },
        { nombre: 'Otra red', url: '/', img: '../../public/vite.svg' },
        { nombre: 'Otra red', url: '/', img: '../../public/vite.svg' },
    ];

    const [comentario, setComentario] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (comentario.trim() === '') {
            alert('Por favor escribe un comentario antes de enviar.');
            return;
        }
        alert(`Comentario enviado: ${comentario}`);
        setComentario(''); // limpia el campo
    };


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

            <div className='Sobre-Nosotros'>
                <h1>Sobre nosotros</h1>
                <p>
                    Somos un grupo apasaionado por la resposteria haciendo postres caseros siguiendo las recetas <br/> de 
                    la creadora Tia Sandra la cual ha preparado estas mismas durante un largo tiempo.
                </p>
            </div>

            <div className="comentarios-box">
                <h3 className='texto-indicacion'>Déjanos tus comentarios</h3>
                <form onSubmit={handleSubmit} className='from-comentarios'>
                    <textarea
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                        placeholder="Escribe aquí tu opinión..."
                    />
                    <button type="submit">Enviar</button>
                </form>
            </div>

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
