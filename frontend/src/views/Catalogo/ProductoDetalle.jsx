import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "../../componentes/Header";
import { Footer } from "../../componentes/Footer";
import "./ProductoDetalle.css";

export default function ProductoDetalle() {
  const { sku } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/productos/${sku}`)
      .then(res => {
        if (!res.ok) throw new Error("Producto no encontrado");
        return res.json();
      })
      .then(data => {
        setProducto(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [sku]);

  if (loading) return <p>Cargando producto...</p>;
  if (error) return (
    <>
      <Header />
      <div className="detalle-fallback">
        <h2>{error}</h2>
        <button className="btn-volver" onClick={() => navigate("/catalogo")}>
          Volver al catálogo
        </button>
      </div>
      <Footer />
    </>
  );

  const safeSrc = producto.imagen_url.startsWith("http") || producto.imagen_url.startsWith("/")
    ? producto.imagen_url
    : "/placeholder.jpg";

  return (
    <div className="detalle-page">
      <Header />
      <div className="detalle-wrap">
        <div className="detalle-img">
          <img src={safeSrc} alt={producto.nombre} loading="lazy" />
        </div>
        <div className="detalle-info">
          <h1 className="detalle-title">{producto.nombre.toUpperCase()}</h1>
          <p className="detalle-rango">${producto.precio}</p>
          <p className="detalle-desc">{producto.descripcion}</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
