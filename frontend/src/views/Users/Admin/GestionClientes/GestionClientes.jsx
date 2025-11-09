import React, { useEffect, useState } from "react";
import "./GestionClientes.css";

const API_BASE = import.meta.env?.VITE_API_URL || "http://localhost:5000";

function GestionClientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/clientes`);
        const data = await res.json();
        if (mounted) setClientes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error al obtener clientes", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const eliminarCliente = async (correo) => {
    if (!window.confirm("¿Eliminar este cliente?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/clientes/correo/${correo}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setClientes(c => c.filter(x => x.correo !== correo));
    } catch {
      alert("No se pudo eliminar el cliente.");
    }
  };

  const refrescarClientes = () => {
    setLoading(true);
    fetch(`${API_BASE}/api/clientes`)
      .then((r) => r.json())
      .then((d) => setClientes(Array.isArray(d) ? d : []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const list = clientes.filter(c => {
    if (!q.trim()) return true;
    const s = q.toLowerCase();
    return c.nombre?.toLowerCase().includes(s) || c.correo?.toLowerCase().includes(s);
  });

  return (
    <div className="card clientes-card">
      <div className="card-head">
        <h2>Gestión de clientes</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            className="clientes-search"
            placeholder="Buscar cliente..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button
            type="button"
            className="btn sm"
            onClick={refrescarClientes}
          >
            Refrescar
          </button>
        </div>
      </div>

      {loading && (
        <div className="empty">
          <p>Cargando clientes...</p>
        </div>
      )}

      {!loading && list.length === 0 && (
        <div className="empty">
          <p>No hay clientes registrados o no coinciden con la búsqueda.</p>
        </div>
      )}

      {!loading && list.length > 0 && (
        <div className="clientes-list">
          {list.map((c, i) => (
            <div
              key={c.id || i}
              className={`cliente-item ${c.activo === false ? "inactive" : ""}`}
            >
              <div className="info">
                <h4>{c.nombre || "Sin nombre"}</h4>
                <p>{c.correo || "Sin correo"}</p>
                {c.telefono && <p>{c.telefono}</p>}
              </div>
              <div className="actions">
                <button
                  className="btn sm danger"
                  onClick={() => eliminarCliente(c.correo)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GestionClientes;