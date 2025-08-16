import './Home.css';
import { useState, useEffect } from 'react';
import { obtenerSiguienteIndice, obtenerAnteriorIndice } from './carrusel';


import img1 from '../../assets/home/carrusel1.jpg';
import img2 from '../../assets/home/carrusel2.jpg';
import img3 from '../../assets/home/carrusel3.jpg';

const imagenes = [img1, img2, img3];

export default function Home() {
  const [actual, setActual] = useState(0);
  const [prev, setPrev] = useState(0);
  const [direccion, setDireccion] = useState('');
  const [animado, setAnimado] = useState(false);

  useEffect(() => {
    const temporizador = setInterval(() => {
      mover('derecha');
    }, 3000); // en caso de querer cambiar en un futuro el intervalo de las fotos del carrusel cambiar esto, ahora está en 3s
    return () => clearInterval(temporizador);
  }, [actual]);

  // de preferencia no cambiar nada de acá para que no se rompa la animación del carrusel
  const mover = (dir) => {
    if (animado) return;
    setDireccion(dir);
    setPrev(actual);
    setAnimado(true);
    setTimeout(() => {
      setActual(dir === 'derecha'
        ? obtenerSiguienteIndice(actual, imagenes.length)
        : obtenerAnteriorIndice(actual, imagenes.length)
      );
      setAnimado(false);
    }, 600);
  };

  const anterior = () => mover('izquierda');
  const siguiente = () => mover('derecha');

  const idxIzquierda = obtenerAnteriorIndice(actual, imagenes.length);
  const idxDerecha = obtenerSiguienteIndice(actual, imagenes.length);

  return (
    <div className="home-container">
      <div className="home-carrusel">
        {!animado && (
          <>
            <img
              src={imagenes[idxIzquierda]}
              alt="Imagen anterior en el carrusel"
              className="home-carrusel-img side izquierda"
            />
            <img
              src={imagenes[actual]}
              alt="Imagen actual del carrusel"
              className="home-carrusel-img principal"
            />
            <img
              src={imagenes[idxDerecha]}
              alt="Imagen siguiente en el carrusel"
              className="home-carrusel-img side derecha"
            />
          </>
        )}
        
        {animado && (
          <>
            <img
              src={imagenes[prev]}
              alt="imagen previa animada"
              className={`home-carrusel-img principal ${direccion === 'izquierda' ? 'to-derecha' : 'to-izquierda'}`}
            />
            <img
              src={imagenes[direccion === 'izquierda' ? idxIzquierda : idxDerecha]}
              alt="nueva imagen animada"
              className={`home-carrusel-img principal ${direccion === 'izquierda' ? 'from-izquierda' : 'from-derecha'}`}
            />
          </>
        )}
        
        <button
          onClick={anterior}
          className="home-carrusel-btn izquierda"
          aria-label="anterior"
        >
          ‹
        </button>
        <button
          onClick={siguiente}
          className="home-carrusel-btn derecha"
          aria-label="siguiente"
        >
          ›
        </button>
      </div>
      <h1>¡Bienvenido a Sabores de Hogar!</h1>
      <p>Repostería casera con amor</p>
    </div>
  );
}
