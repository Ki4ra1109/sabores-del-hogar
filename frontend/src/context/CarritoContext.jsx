import { createContext, useContext, useState } from "react";

const CarritoContext = createContext();

export const CarritoProvider = ({ children }) => {
    const [carrito, setCarrito] = useState([]);

    return (
        <CarritoContext.Provider value={{ carrito, setCarrito }}>
            {children}
        </CarritoContext.Provider>
    );
};

export const useCarrito = () => useContext(CarritoContext);
