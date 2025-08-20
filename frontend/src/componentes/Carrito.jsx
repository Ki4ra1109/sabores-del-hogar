import { FaTimes, FaTrash } from "react-icons/fa";
import './Carrito.css';

export default function Carrito({ carrito, setCarrito, abrir, setAbrir }) {
  
  // eliminar todos los productos
  const vaciarCarrito = () => {
    setCarrito([]);
  };

  // cerrar sidebar
  const cerrarCarrito = () => {
    setAbrir(false);
  };

  // calcular total
  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  return (
    <div className={`carrito-sidebar ${abrir ? 'activo' : ''}`}>
      <div className="carrito-header">
        <h2>Tu Carrito</h2>
        <button className="cerrar-btn" onClick={cerrarCarrito}>
          <FaTimes size={20} />
        </button>
      </div>

      {carrito.length === 0 ? (
        <p className="carrito-vacio">El carrito está vacío</p>
      ) : (
        <div className="carrito-body">
          {carrito.map(item => (
            <div key={item.id} className="carrito-item">
              <img src={item.imagen} alt={item.nombre} />
              <div className="info-item">
                <h3>{item.nombre}</h3>
                <p>Cantidad: {item.cantidad}</p>
                <p>Precio: ${item.precio * item.cantidad}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="carrito-footer">
        <p>Total: ${total}</p>
        <button className="vaciar-btn" onClick={vaciarCarrito}>
          <FaTrash /> Vaciar Carrito
        </button>
        <button className="finalizar-btn">
          Finalizar Compra
        </button>
      </div>
    </div>
  );
}