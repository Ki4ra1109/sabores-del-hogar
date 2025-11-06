import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import "./Dashboard.css";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState("6");
  const [selectedCategory, setSelectedCategory] = useState("");

  const fetchData = async (range = "6") => {
    try {
      const base = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

      let from = "";
      if (range !== "all") {
        const months = parseInt(range);
        const date = new Date();
        date.setMonth(date.getMonth() - months);
        from = date.toISOString().split("T")[0];
      }

      const queryParams = new URLSearchParams();
      if (from) queryParams.append("from", from);
      if (selectedCategory) queryParams.append("categoria", selectedCategory);
      const query = queryParams.toString() ? `?${queryParams.toString()}` : "";

      const [timeseriesRes, forecastRes] = await Promise.all([
        fetch(`${base}/api/prediccion/timeseries-mensual${query}`),
        fetch(`${base}/api/prediccion/forecast`),
      ]);

      const timeseriesJson = await timeseriesRes.json();
      const forecastJson = await forecastRes.json();

      const timeseries = timeseriesJson.data || [];
      const forecast = forecastJson.forecast || [];

      const totalVentas = timeseries.reduce((acc, e) => acc + (e.ventas || 0), 0);
      const promedioMensual = totalVentas / (timeseries.length || 1);
      const pedidosCompletados = timeseries.reduce(
        (acc, e) => acc + (e.ordenes || 0),
        0
      );

      setData({
        timeseries,
        forecast,
        ventasTotales: totalVentas,
        promedioMensual,
        pedidosCompletados,
      });
    } catch (error) {
      console.error("Error cargando predicción:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedRange);
  }, [selectedRange, selectedCategory]);

  if (loading) return <p className="dashboard-loading">Cargando datos...</p>;

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">📊 Dashboard Interactivo</h2>

      <div className="dashboard-filters">
        <label>
          Rango de meses:
          <select
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value)}
            className="dashboard-select"
          >
            <option value="3">Últimos 3 meses</option>
            <option value="6">Últimos 6 meses</option>
            <option value="12">Último año</option>
            <option value="all">Todos</option>
          </select>
        </label>

        <label>
          Categoría:
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="dashboard-select"
          >
            <option value="">Todas</option>
            <option value="torta">Tortas</option>
            <option value="cupcake">Cupcakes</option>
            <option value="tartaleta">Tartaletas</option>
          </select>
        </label>

        <button
          className="dashboard-refresh"
          onClick={() => fetchData(selectedRange)}
        >
          🔄 Actualizar
        </button>
      </div>

      <div className="dashboard-kpis">
        <div className="kpi-card">
          <h3>Ventas Totales</h3>
          <p>${data?.ventasTotales?.toLocaleString("es-CL") || "—"}</p>
        </div>
        <div className="kpi-card">
          <h3>Promedio Mensual</h3>
          <p>${data?.promedioMensual?.toLocaleString("es-CL") || "—"}</p>
        </div>
        <div className="kpi-card">
          <h3>Pedidos Completados</h3>
          <p>{data?.pedidosCompletados ?? "—"}</p>
        </div>
      </div>

      <div className="dashboard-section">
        <h3>Evolución Mensual de Ventas</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={data?.timeseries || []}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#572420" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#572420" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5d5cb" />
            <XAxis
              dataKey="mes"
              tickFormatter={(v) =>
                new Date(v).toLocaleDateString("es-ES", {
                  month: "short",
                  year: "2-digit",
                })
              }
            />
            <YAxis />
            <Tooltip
              formatter={(v) => `$${v.toLocaleString("es-CL")}`}
              labelFormatter={(v) =>
                new Date(v).toLocaleDateString("es-ES", {
                  month: "long",
                  year: "numeric",
                })
              }
            />
            <Area
              type="monotone"
              dataKey="ventas"
              stroke="#572420"
              fillOpacity={1}
              fill="url(#colorVentas)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="dashboard-section">
        <h3>Predicción Próximos Meses</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data?.forecast || []}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5d5cb" />
            <XAxis
              dataKey="mes"
              tickFormatter={(v) =>
                new Date(v).toLocaleDateString("es-ES", {
                  month: "short",
                  year: "2-digit",
                })
              }
            />
            <YAxis />
            <Tooltip
              formatter={(v) => `$${v.toLocaleString("es-CL")}`}
              labelFormatter={(v) =>
                new Date(v).toLocaleDateString("es-ES", {
                  month: "long",
                  year: "numeric",
                })
              }
            />
            <Line
              type="monotone"
              dataKey="estimado"
              stroke="#8b5e3c"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}