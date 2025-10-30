import { createContext, useContext, useEffect, useState } from "react";

const CarritoContext = createContext();

export const CarritoProvider = ({ children }) => {
  const [carrito, setCarrito] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("carrito") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("carrito", JSON.stringify(carrito));
    } catch {}
  }, [carrito]);

  useEffect(() => {
    const sync = () => {
      try {
        const data = JSON.parse(localStorage.getItem("carrito") || "[]");
        setCarrito(Array.isArray(data) ? data : []);
      } catch {}
    };
    window.addEventListener("carrito:actualizado", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("carrito:actualizado", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <CarritoContext.Provider value={{ carrito, setCarrito }}>
      {children}
    </CarritoContext.Provider>
  );
};

export const useCarrito = () => useContext(CarritoContext);
