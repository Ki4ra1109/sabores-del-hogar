import './Home.css';
import { useState } from 'react';

import img1 from '../../assets/home/carrusel1.jpg';
import img2 from '../../assets/home/carrusel2.jpg';
import img3 from '../../assets/home/carrusel3.jpg';

// Funcion para manejar el carrusel de imágenes, si quieren copiarlo y pegarlo para las otras vistas en caso de que sirva
const images = [img1, img2, img3];
export default function Home() {
  const [current, setCurrent] = useState(0);
  const prevSlide = () => setCurrent((current - 1 + images.length) % images.length);
  const nextSlide = () => setCurrent((current + 1) % images.length);

  return (
    <div className="home-container">
      <div className="home-carousel">
        {images.length > 0 ? (
          <>
            <img
              src={images[current]}
              alt={`slide-${current}`}
              className="home-carousel-img"
            />
            <button
              onClick={prevSlide}
              className="home-carousel-btn left"
            >
              ‹
            </button>
            <button
              onClick={nextSlide}
              className="home-carousel-btn right"
            >
              ›
            </button>
          </>
        ) : (
          <div style={{ color: 'red', textAlign: 'center', padding: '2rem' }}>
            No se encontraron imágenes para el carrusel.<br />
            Verifica las rutas y nombres de los archivos en <code>src/assets/home/</code>.
          </div>
        )}
      </div>
      <h1>¡Bienvenido a Sabores de Hogar!</h1>
      <p>Repostería casera con amor 💖</p>
    </div>
  );
}