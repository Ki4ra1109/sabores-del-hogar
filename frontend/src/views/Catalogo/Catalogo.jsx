import { Footer } from '../../componentes/Footer';
import { Header } from '../../componentes/Header';
import productos from '../../data/productos';
import './Catalogo.css';
import { useNavigate } from 'react-router-dom';

export default function Catalogo() {
  const navigate = useNavigate();

  const irAlProducto = (id) => {
    navigate(`/catalogo/${id}`);
  };

  return (
    <div className="productos-container">
      <Header />
      <div className="catalogo-body">
        <h1>Nuestro Catálogo de Tortas</h1>
        <div className="productos-grid">
          {productos.map(producto => (
            <div 
              key={producto.id} 
              className="producto-card"
              onClick={() => irAlProducto(producto.id)}
            >
              <img src={producto.imagen} alt={producto.nombre} />
              <h2>{producto.nombre}</h2>
              <p className="precio">${producto.precio}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
