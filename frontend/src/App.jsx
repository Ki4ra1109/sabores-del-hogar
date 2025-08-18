import React, { useState, useEffect } from "react";
import './index.css';
import AppRouter from "./routes/AppRouter";
import Loader from "./componentes/Loader";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {loading ? <Loader /> : <AppRouter />}
    </>
  );
}

export default App;
