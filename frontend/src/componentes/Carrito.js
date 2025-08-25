import React from "react";
import "./Carrito.css";
import { useCarrito } from "../context/CarritoContext";

const Carrito = () => {
  const { carrito, vaciarCarrito } = useCarrito();

  const calcularTotal = () => {
    return carrito.reduce((acc, item) => acc + item.total, 0);
  };

  return (
    <div className="carrito-container">
      <h3>Tu Carrito</h3>
      {carrito.length === 0 ? (
        <p>El carrito está vacío</p>
      ) : (
        <ul>
          {carrito.map((item, index) => (
            <li key={index} className="carrito-item">
              <p><strong>{item.categoria}</strong></p>
              {item.bizcocho && <p>Bizcocho: {item.bizcocho}</p>}
              {item.crema && <p>Crema: {item.crema}</p>}
              {item.relleno && <p>Relleno: {item.relleno}</p>}
              {item.extras?.length > 0 && (
                <p>Extras: {item.extras.join(", ")}</p>
              )}
              <p>Cantidad: {item.cantidad}</p>
              <p><strong>Total: ${item.total}</strong></p>
            </li>
          ))}
        </ul>
      )}

      <div className="carrito-footer">
        <h4>Total general: ${calcularTotal()}</h4>
        <button className="btn-vaciar" onClick={vaciarCarrito}>Vaciar Carrito</button>
        <button className="btn-comprar">Finalizar Compra</button>
      </div>
    </div>
  );
};

export default Carrito;
