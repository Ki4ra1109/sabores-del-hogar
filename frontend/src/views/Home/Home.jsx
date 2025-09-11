import { Footer } from '../../componentes/Footer';
import { Header } from '../../componentes/Header';
import './Home.css';
import { useState, useEffect } from 'react';
import { obtenerSiguienteIndice, obtenerAnteriorIndice } from './carrusel';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// carrusel
import img1 from '../../assets/home/carrusel4.jpg';
import img2 from '../../assets/home/carrusel5.jpg';
import img3 from '../../assets/home/carrusel6.jpg';

// Sobre nosotros y trayectoria
import img4 from '../../assets/nosotros/sobrenosotros.jpg';
import img5 from '../../assets/nosotros/trayectoria.jpg';

const imagenes = [img1, img2, img3];

export default function Home() {
  const [actual, setActual] = useState(0);
  const [prev, setPrev] = useState(0);
  const [direccion, setDireccion] = useState('');
  const [animado, setAnimado] = useState(false);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const irAlProducto = (sku) => navigate(`/catalogo/${sku}`);

  // fetch productos desde backend
  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/productos")
      .then(res => {
        if (!res.ok) throw new Error("Error al cargar productos");
        return res.json();
      })
      .then(data => {
        setProductos(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // destacados: los primeros 4
  const destacados = productos.slice(0, 4);

  // carrusel
  useEffect(() => {
    const temporizador = setInterval(() => {
      mover('derecha');
    }, 3000);
    return () => clearInterval(temporizador);
  }, [actual]);

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
      <Header />

      {/* Carrusel */}
      <div className="home-carrusel">
        {!animado && (
          <>
            <img src={imagenes[idxIzquierda]} alt="Anterior" className="home-carrusel-img side izquierda" />
            <img src={imagenes[actual]} alt="Actual" className="home-carrusel-img principal" />
            <img src={imagenes[idxDerecha]} alt="Siguiente" className="home-carrusel-img side derecha" />
          </>
        )}
        {animado && (
          <>
            <img
              src={imagenes[prev]}
              alt="Previo animado"
              className={`home-carrusel-img principal ${direccion === 'izquierda' ? 'to-derecha' : 'to-izquierda'}`}
            />
            <img
              src={imagenes[direccion === 'izquierda' ? idxIzquierda : idxDerecha]}
              alt="Nuevo animado"
              className={`home-carrusel-img principal ${direccion === 'izquierda' ? 'from-izquierda' : 'from-derecha'}`}
            />
          </>
        )}
        <button onClick={anterior} className="home-carrusel-btn izquierda" aria-label="anterior">
          <FaChevronLeft size={28} />
        </button>
        <button onClick={siguiente} className="home-carrusel-btn derecha" aria-label="siguiente">
          <FaChevronRight size={28} />
        </button>
      </div>


      {/* Bienvenida */}
      <div className="bienvenida">
        <h1>¡Bienvenido a Sabores del Hogar!</h1>
        <p>Repostería casera con amor de la Tía Sandra</p>
      </div>
      <div className="separador">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          style={{ display: 'block', transform: 'scaleY(-1)', width: '100%', height: 'auto' }}
        >
          <defs>
            {/* chispitas */}
            <pattern id="sprinkles" width="60" height="60" patternUnits="userSpaceOnUse">
              <rect x="10" y="10" width="10" height="3" rx="1.5" fill="#FFD166" transform="rotate(20 15 11)" />
              <rect x="30" y="5" width="10" height="3" rx="1.5" fill="#06D6A0" transform="rotate(-15 35 6)" />
              <rect x="20" y="30" width="10" height="3" rx="1.5" fill="#E63946" transform="rotate(10 25 31)" />
              <rect x="40" y="45" width="10" height="3" rx="1.5" fill="#118AB2" transform="rotate(-25 45 46)" />
            </pattern>
          </defs>

          {/* chocolate */}
          <path
            fill="#572420"
            fillOpacity="1"
            d="M0,192 C60,240 120,160 180,200 
              C240,240 300,120 360,180 
              C420,240 480,80 540,160 
              C600,240 660,100 720,180 
              C780,260 840,140 900,200 
              C960,260 1020,100 1080,160 
              C1140,220 1200,140 1260,200 
              C1320,260 1380,120 1440,180 
              L1440,320 L0,320 Z"
          />

          {/* patron chispitas dentro del chocolates */}
          <path
            fill="url(#sprinkles)"
            d="M0,192 C60,240 120,160 180,200 
              C240,240 300,120 360,180 
              C420,240 480,80 540,160 
              C600,240 660,100 720,180 
              C780,260 840,140 900,200 
              C960,260 1020,100 1080,160 
              C1140,220 1200,140 1260,200 
              C1320,260 1380,120 1440,180 
              L1440,320 L0,320 Z"
          />
        </svg>
      </div>

      {/* Sobre nosotros y trayectoria */}
      <div className="historia-card">
        <h2 className="historia-card-title">¿Cómo comenzó todo?</h2>
        <div className="historia-card-content">
          <div className="sobre-nosotros-card">
            <div className="sobre-nosotros-card-img">
              <img src={img4} alt="Sobre nosotros" />
            </div>
            <div className="sobre-nosotros-card-info">
              <h2>Sobre Nosotros</h2>
              <p>
                ¿Sabías que detrás de cada postre hay una historia de esfuerzo y pasión? Sandra, nuestra fundadora, decidió transformar su emprendimiento de repostería casera en una experiencia digital para estar más cerca de sus clientes y hacer crecer su sueño. Descubre cómo la tecnología y el amor por los postres se unieron para crear Sabores de Hogar.
              </p>
              <button className="sobre-nosotros-btn" onClick={() => navigate("/nosotros")}>
                Saber más
              </button>
            </div>
          </div>

          <div className="trayectoria-card">
            <div className="trayectoria-card-img">
              <img src={img5} alt="Trayectoria" />
            </div>
            <div className="trayectoria-card-info">
              <h2>Nuestra Trayectoria</h2>
              <p>
                Desde un curso de repostería y los primeros encargos familiares, Sandra ha recorrido un camino de cinco años llenos de aprendizaje y crecimiento. Cada pedido, cada cliente y cada celebración han sido parte de una historia que hoy evoluciona con este sistema web, pensado para mejorar la experiencia y atención de todos los que confían en Sabores de Hogar.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="separador">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          style={{ display: 'block', transform: 'scaleY(-1)', width: '100%', height: 'auto' }}
        >
          <defs>
            {/* chispitas */}
            <pattern id="sprinkles" width="60" height="60" patternUnits="userSpaceOnUse">
              <rect x="10" y="10" width="10" height="3" rx="1.5" fill="#FFD166" transform="rotate(20 15 11)" />
              <rect x="30" y="5" width="10" height="3" rx="1.5" fill="#06D6A0" transform="rotate(-15 35 6)" />
              <rect x="20" y="30" width="10" height="3" rx="1.5" fill="#E63946" transform="rotate(10 25 31)" />
              <rect x="40" y="45" width="10" height="3" rx="1.5" fill="#118AB2" transform="rotate(-25 45 46)" />
            </pattern>
          </defs>

          {/* chocolate */}
          <path
            fill="#572420"
            fillOpacity="1"
            d="M0,192 C60,240 120,160 180,200 
              C240,240 300,120 360,180 
              C420,240 480,80 540,160 
              C600,240 660,100 720,180 
              C780,260 840,140 900,200 
              C960,260 1020,100 1080,160 
              C1140,220 1200,140 1260,200 
              C1320,260 1380,120 1440,180 
              L1440,320 L0,320 Z"
          />

          {/* patron chispitas dentro del chocolates */}
          <path
            fill="url(#sprinkles)"
            d="M0,192 C60,240 120,160 180,200 
              C240,240 300,120 360,180 
              C420,240 480,80 540,160 
              C600,240 660,100 720,180 
              C780,260 840,140 900,200 
              C960,260 1020,100 1080,160 
              C1140,220 1200,140 1260,200 
              C1320,260 1380,120 1440,180 
              L1440,320 L0,320 Z"
          />
        </svg>
      </div>

      {/* Productos destacados */}
      <div className="productos-destacados">
        <h2 className="productos-destacados-title">✨ Nuestros Productos Destacados ✨</h2>
        {loading && <p>Cargando productos...</p>}
        {error && <p>Error al cargar productos: {error}</p>}
        <div className="productos-grid">
          {destacados.map(producto => (
            <div
              key={producto.sku}
              className="producto-card"
              onClick={() => irAlProducto(producto.sku)}
            >
              <img src={producto.imagen_url} alt={producto.nombre} />
              <h3>{producto.nombre}</h3>
              <p className="precio">${producto.precio}</p>
            </div>
          ))}
        </div>

        <div className="ver-catalogo-btn-container">
          <button className="ver-catalogo-btn" onClick={() => navigate("/catalogo")}>
            Ver Catálogo Completo
          </button>
        </div>
      </div>
      
      {/* Arma tu postre */}
      <div className="arma-tu-postre-card">
        <div className="arma-tu-postre-content">
          <h2>Arma tu postre</h2>
          <p>¿No te convencen los postres que ofrecemos? ¡Arma tu postre a gusto tuyo!</p>
          <button className="arma-tu-postre-btn" onClick={() => navigate("/postre")}>
            Armar mi postre
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
