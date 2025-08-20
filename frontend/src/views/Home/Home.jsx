import { Footer } from '../../componentes/Footer';
import { Header } from '../../componentes/Header';
import productos from '../../data/productos';
import './Home.css';
import { useState, useEffect } from 'react';
import { obtenerSiguienteIndice, obtenerAnteriorIndice } from './carrusel';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// en caso de querer agregar más imagenes al carrusel tienen que importarlas acá primero y luego agregarlas en el const imagenes
// imagenes del carrusel
import img1 from '../../assets/home/carrusel4.jpg';
import img2 from '../../assets/home/carrusel5.jpg';
import img3 from '../../assets/home/carrusel6.jpg';

// Imagenes sobre nosotros y trayectoria
import img4 from '../../assets/nosotros/sobrenosotros.jpg';
import img5 from '../../assets/nosotros/trayectoria.jpg';

const imagenes = [img1, img2, img3];

export default function Home() {
  const [actual, setActual] = useState(0);
  const [prev, setPrev] = useState(0);
  const [direccion, setDireccion] = useState('');
  const [animado, setAnimado] = useState(false);
  const navigate = useNavigate();

  // función para ir al producto específico
  const irAlProducto = (id) => {
    navigate(`/catalogo/${id}`);
  };
  const destacados = productos.slice(0, 4); // con esto seleccionamos los primeros 4 productos del catalogo definifidos en el data para que se muestren como productos destacados

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
      <Header/>
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
        
        {/* estos son los botones del carrusel, los hice importando unos iconos del node.js asi que si los quieren reutilizar solo copienlo
        y lo pegan en sus codigos, tambien el css hay que copiarlo*/}
        <button
          onClick={anterior}
          className="home-carrusel-btn izquierda"
          aria-label="anterior"
        >
          <FaChevronLeft size={28} />
        </button>
        <button
          onClick={siguiente}
          className="home-carrusel-btn derecha"
          aria-label="siguiente"
        >
          <FaChevronRight size={28} />
        </button>
      </div>

      <div className="bienvenida">
        <h1>¡Bienvenido a Sabores del Hogar!</h1>
        <p>Repostería casera con amor de la Tía Sandra</p>
      </div>

      {/* separador debajo del carrusel, efecto visual de "crema" para reutilizarlo*/}
      <div className="separador">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" style={{ display: 'block', transform: 'scaleY(-1)' }}>
          <path 
            fill="#8B5E3C" 
            fillOpacity="1" 
            d="M0,192 C60,240 120,160 180,200 
              C240,240 300,120 360,180 
              C420,240 480,80 540,160 
              C600,240 660,100 720,180 
              C780,260 840,140 900,200 
              C960,260 1020,100 1080,160 
              C1140,220 1200,140 1260,200 
              C1320,260 1380,120 1440,180 
              L1440,320 L0,320 Z">
          </path>
        </svg>
      </div>

      {/* cards de "sobre nosotros" y "nuestra trayectoria" */}
      <div className="historia-card">
        <h2 className="historia-card-title">¿Cómo comenzó todo?</h2>
        <div className="historia-card-content">
          <div className="sobre-nosotros-card">
            <div className="sobre-nosotros-card-img">
              <img src={img4} alt="Foto sobre nosotros" />
            </div>
            <div className="sobre-nosotros-card-info">
              <h2>Sobre Nosotros</h2>
              <p>
                ¿Sabías que detrás de cada postre hay una historia de esfuerzo y pasión? Sandra, nuestra fundadora, decidió transformar su emprendimiento de repostería casera en una experiencia digital para estar más cerca de sus clientes y hacer crecer su sueño. Descubre cómo la tecnología y el amor por los postres se unieron para crear Sabores de Hogar.
              </p>
              <button
                className="sobre-nosotros-btn"
                onClick={() => navigate("/nosotros")}
              >
                Saber más
              </button>
            </div>
          </div>

          <div className="trayectoria-card">
            <div className="trayectoria-card-img">
              <img src={img5} alt="Foto trayectoria" />
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
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" style={{ display: 'block', transform: 'scaleY(-1)' }}>
          <path 
            fill="#8B5E3C" 
            fillOpacity="1" 
            d="M0,192 C60,240 120,160 180,200 
              C240,240 300,120 360,180 
              C420,240 480,80 540,160 
              C600,240 660,100 720,180 
              C780,260 840,140 900,200 
              C960,260 1020,100 1080,160 
              C1140,220 1200,140 1260,200 
              C1320,260 1380,120 1440,180 
              L1440,320 L0,320 Z">
          </path>
        </svg>
      </div>
      {/* productos destacados */}
      <div className="productos-destacados">
        <h2 className="productos-destacados-title">✨ Nuestros Productos Destacados ✨</h2>
        <div className="productos-grid">
          {destacados.map(producto => (
            <div 
              key={producto.id} 
              className="producto-card"
              onClick={() => irAlProducto(producto.id)}
            >
              <img src={producto.imagen} alt={producto.nombre} />
              <h3>{producto.nombre}</h3>
              <p className="precio">${producto.precio}</p>
            </div>
          ))}
        </div>
        {/* boton catalogo*/}
        <div className="ver-catalogo-btn-container">
          <button 
            className="ver-catalogo-btn"
            onClick={() => navigate("/catalogo")}
          >
            Ver Catálogo Completo
          </button>
        </div>
      </div>
      <div className="separador">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" style={{ display: 'block', transform: 'scaleY(-1)' }}>
          <path 
            fill="#8B5E3C" 
            fillOpacity="1" 
            d="M0,192 C60,240 120,160 180,200 
              C240,240 300,120 360,180 
              C420,240 480,80 540,160 
              C600,240 660,100 720,180 
              C780,260 840,140 900,200 
              C960,260 1020,100 1080,160 
              C1140,220 1200,140 1260,200 
              C1320,260 1380,120 1440,180 
              L1440,320 L0,320 Z">
          </path>
        </svg>
      </div>
      {/* arma tu postre*/}
      <div className="arma-tu-postre-card">
        <div className="arma-tu-postre-content">
          <h2>Arma tu postre</h2>
          <p>Próximamente...</p>
        </div>
      </div>
      <Footer/>
    </div>
  );
}