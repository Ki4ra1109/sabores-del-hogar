import { Footer } from '../../componentes/Footer';
import { Header } from '../../componentes/Header';
import './Catalogo.css';
import carrusel1 from '../../assets/home/carrusel1.jpg';
import carrusel3 from '../../assets/home/carrusel3.jpg';
import { useNavigate } from 'react-router-dom';

const productos = [
  { id: 1, nombre: "Torta Milhoja Manjar Crema", precio: "35.000", imagen: carrusel1 },
  { id: 2, nombre: "Torta Milhoja Manjar Lúcuma", precio: "18.500", imagen: carrusel3 },
  { id: 3, nombre: "Torta Milhoja Manjar Crema", precio: "35.000", imagen: carrusel1 },
  { id: 4, nombre: "Torta Milhoja Manjar Lúcuma", precio: "18.500", imagen: carrusel3 },
  { id: 5, nombre: "Torta Milhoja Manjar Crema", precio: "35.000", imagen: carrusel1 },
  { id: 6, nombre: "Torta Milhoja Manjar Lúcuma", precio: "18.500", imagen: carrusel3 },
  { id: 7, nombre: "Torta Milhoja Manjar Crema", precio: "35.000", imagen: carrusel1 },
  { id: 8, nombre: "Torta Milhoja Manjar Lúcuma", precio: "18.500", imagen: carrusel3 },
];

export default function Catalogo() {
  const navigate = useNavigate();

  const irAlProducto = (id) => {
    navigate(`/catalogo/${id}`);
  };

  return (
    <div className="catalogo-container">
      <Header />
      <div className="productos">
        {productos.map(producto => (
          <div 
            key={producto.id} 
            className="producto-card"
            onClick={() => irAlProducto(producto.id)}
            style={{ cursor: 'pointer' }}
          >
            <div className="producto-img-container">
              <img src={producto.imagen} alt={producto.nombre} className="producto-img" />
            </div>
            <div className="producto-info">
              <h2 className="producto-nombre">{producto.nombre}</h2>
              <span className="producto-precio">${producto.precio}</span>
            </div>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
}
