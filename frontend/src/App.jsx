import React, { useState, useEffect } from "react";
import "./index.css";
import AppRouter from "./routes/AppRouter";
import Loader from "./componentes/Loader";
import { CarritoProvider } from "./context/CarritoContext";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <CarritoProvider>
      <div className="app-shell">
        {loading ? <Loader /> : <div className="app-content"><AppRouter /></div>}
      </div>
    </CarritoProvider>
  );
}

export default App;
