import React, { useEffect, useState } from "react";
import "./GestionPedidos.css";

const API_BASE = import.meta.env?.VITE_API_URL || "http://localhost:5000";

function GestionPedidos() {
  const [q, setQ] = useState("");
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Función para asignar clases de color según estado
  const getEstadoClass = (estado) => {
    if (!estado) return "";
    const e = estado.toLowerCase();
    if (["entregado", "pagado", "completado"].includes(e)) return "success";
    if (["pendiente", "en proceso"].includes(e)) return "warning";
    if (["cancelado", "rechazado"].includes(e)) return "danger";
    return "";
  };

  // Fetch de pedidos
  useEffect(() => {
    let mounted = true;
    const fetchPedidos = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/pedidos`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (mounted) setPedidos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error al obtener pedidos:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchPedidos();
    return () => { mounted = false; };
  }, []);

  const refrescarPedidos = () => {
    setLoading(true);
    fetch(`${API_BASE}/api/pedidos`)
      .then((r) => r.json())
      .then((d) => setPedidos(Array.isArray(d) ? d : []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  // Filtro combinado: busca por ID o nombre de cliente
  const list = pedidos.filter((p) => {
    if (!q.trim()) return true;
    const query = q.toLowerCase();
    const idMatch = String(p.id_pedido).includes(query);
    const nombreMatch = p.nombre_cliente?.toLowerCase().includes(query);
    return idMatch || nombreMatch;
  });

  return (
    <div className="card pedidos-card">
      <div className="card-head">
        <h2>Gestión de pedidos</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            className="pedidos-search"
            type="text"
            placeholder="Buscar por # de pedido o nombre del cliente..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button
            type="button"
            className="btn sm"
            onClick={refrescarPedidos}
          >
            Refrescar
          </button>
        </div>
      </div>

      {loading && (
        <div className="empty">
          <p>Cargando pedidos...</p>
        </div>
      )}

      {!loading && list.length === 0 && (
        <div className="empty">
          <p>No se encontraron pedidos que coincidan con la búsqueda.</p>
        </div>
      )}

      {!loading && list.length > 0 && (
        <div className="pedidos-list">
          {list.map((p) => (
            <div key={p.id_pedido} className="pedido-item">
              <div className="pedido-info">
                <h4>Pedido #{p.id_pedido}</h4>
                <p>
                  Cliente: <strong>{p.nombre_cliente || "N/A"}</strong>
                </p>
                <p>
                  Estado:{" "}
                  <span className={`status-chip ${getEstadoClass(p.estado)}`}>
                    {p.estado}
                  </span>
                </p>
                <p>Fecha: {new Date(p.fecha_pedido).toLocaleDateString()}</p>
                <p>Total: ${p.total?.toLocaleString("es-CL")}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GestionPedidos;