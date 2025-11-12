import { createContext, useContext, useEffect, useState } from "react";

const CarritoContext = createContext();
const CART_KEY = "carrito";
const KEEP_KEY = "keep_cart";

export const CarritoProvider = ({ children }) => {
  const [carrito, setCarrito] = useState(() => {
    try {
      const legacy = localStorage.getItem(CART_KEY);
      if (legacy && legacy !== "[]") {
        sessionStorage.setItem(CART_KEY, legacy);
        localStorage.removeItem(CART_KEY);
      }
    } catch {}
    try {
      return JSON.parse(sessionStorage.getItem(CART_KEY) || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(CART_KEY, JSON.stringify(carrito));
    } catch {}
  }, [carrito]);

  useEffect(() => {
    const sync = () => {
      try {
        const data = JSON.parse(sessionStorage.getItem(CART_KEY) || "[]");
        setCarrito(Array.isArray(data) ? data : []);
      } catch {}
    };
    const beforeUnload = () => {
      try {
        if (sessionStorage.getItem(KEEP_KEY) === "1") return;
        sessionStorage.removeItem(CART_KEY);
      } catch {}
    };
    window.addEventListener("carrito:actualizado", sync);
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      window.removeEventListener("carrito:actualizado", sync);
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, []);

  const clearCart = () => {
    try {
      sessionStorage.removeItem(CART_KEY);
    } catch {}
    setCarrito([]);
    window.dispatchEvent(new Event("carrito:actualizado"));
  };

  const setKeepCart = (on) => {
    try {
      if (on) sessionStorage.setItem(KEEP_KEY, "1");
      else sessionStorage.removeItem(KEEP_KEY);
    } catch {}
  };

  return (
    <CarritoContext.Provider value={{ carrito, setCarrito, clearCart, setKeepCart }}>
      {children}
    </CarritoContext.Provider>
  );
};

export const useCarrito = () => useContext(CarritoContext);