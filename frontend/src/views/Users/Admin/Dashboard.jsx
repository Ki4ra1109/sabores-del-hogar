import React, { useEffect, useState, useCallback } from "react";
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
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import "./Dashboard.css";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState("6");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMonths, setSelectedMonths] = useState([]);

  const fetchData = useCallback(async (range = "6") => {
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
  }, [selectedCategory]);

  useEffect(() => {
    fetchData(selectedRange);
  }, [selectedRange, fetchData]);

  const toggleMonth = (month) => {
    setSelectedMonths((prev) =>
      prev.includes(month)
        ? prev.filter((m) => m !== month)
        : [...prev, month]
    );
  };

  // Helpers de formato y Tooltip uniforme
  const fmtCurrency = (v) =>
    typeof v === "number" ? `$${v.toLocaleString("es-CL")}` : "—";
  const fmtDateLong = (v) =>
    new Date(v).toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  const fmtMonthName = (v) =>
    new Date(v).toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  const fmtMonthKey = (v) => {
    const d = new Date(v);
    return d.toLocaleDateString("es-ES", { month: "short", year: "2-digit" });
  };

  const pieColors = ["#572420", "#8b5e3c", "#d7a97a", "#c79d77", "#b2845f"];

  const uniqueMonths = React.useMemo(() => {
    const ts = data?.timeseries || [];
    const months = ts.map((r) => fmtMonthName(r.mes));
    return [...new Set(months)];
  }, [data]);

  const filteredTimeseries = React.useMemo(() => {
    if (selectedMonths.length === 0) return data?.timeseries || [];
    return (data?.timeseries || []).filter((d) =>
      selectedMonths.includes(fmtMonthName(d.mes))
    );
  }, [data, selectedMonths]);

  const pieData = React.useMemo(() => {
    const ts = filteredTimeseries;
    const byCat = {};
    let hasCat = false;
    for (const r of ts) {
      if (r.categoria) {
        hasCat = true;
        byCat[r.categoria] = (byCat[r.categoria] || 0) + (r.ventas || 0);
      }
    }
    if (hasCat) {
      return Object.entries(byCat).map(([categoria, ventas]) => ({ categoria, ventas }));
    }
    return ts.map((r) => ({
      categoria: fmtMonthKey(r.mes),
      mes: r.mes,
      ventas: r.ventas || 0,
    }));
  }, [filteredTimeseries]);

  const renderPieLabel = (entry) => {
    const name = entry.categoria || (entry.mes && fmtMonthKey(entry.mes)) || "";
    const value = fmtCurrency(entry.ventas);
    return `${name}: ${value}`;
  };

  const ChartTooltip = ({ active, label, payload, title }) => {
    if (!active || !payload?.length) return null;
    // Usa categoria si existe (pie/radar) o la etiqueta (línea/área/barras)
    const header =
      payload[0]?.payload?.categoria ||
      (label && !isNaN(Date.parse(label)) ? fmtDateLong(label) : label) ||
      title;
    return (
      <div className="chart-tooltip">
        <div className="chart-tooltip__title">{title || header}</div>
        <div className="chart-tooltip__body">
          {payload.map((item) => (
            <div className="chart-tooltip__row" key={item.dataKey}>
              <span
                className="chart-tooltip__dot"
                style={{ backgroundColor: item.color || item.fill }}
              />
              <span className="chart-tooltip__name">
                {item.name || item.dataKey}
              </span>
              <span className="chart-tooltip__value">
                {typeof item.value === "number" ? fmtCurrency(item.value) : item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

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

      {/* Selector de meses interactivo */}
      <div className="month-selector">
        {uniqueMonths.map((month) => {
          const isActive = selectedMonths.includes(month);
          return (
            <button
              key={month}
              className={`month-chip ${isActive ? "active" : ""}`}
              onClick={() => toggleMonth(month)}
            >
              {month}
            </button>
          );
        })}
      </div>

      <div className="dashboard-section">
        <h3>Evolución Mensual de Ventas</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={filteredTimeseries}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#572420" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#572420" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5d5cb" />
            <XAxis dataKey="mes" tickFormatter={fmtMonthName} />
            <YAxis />
            <Tooltip content={<ChartTooltip title="Ventas mensuales" />} />
            <Area
              type="monotone"
              dataKey="ventas"
              name="Ventas"
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
            <XAxis dataKey="mes" tickFormatter={fmtMonthName} />
            <YAxis />
            <Tooltip content={<ChartTooltip title="Predicción" />} />
            <Line
              type="monotone"
              dataKey="estimado"
              name="Estimado"
              stroke="#8b5e3c"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="dashboard-section">
        <h3>Distribución de Ventas por Categoría</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Tooltip content={<ChartTooltip title="Ventas por categoría" />} />
            <Legend
              formatter={(value, entry, index) => {
                const item = pieData[index];
                return item?.categoria || (item?.mes && fmtMonthKey(item.mes)) || value;
              }}
            />
            <Pie
              dataKey="ventas"
              nameKey="categoria"
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={110}
              labelLine={true}
              label={renderPieLabel}
              stroke="#fffdfb"
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={pieColors[index % pieColors.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="dashboard-section">
        <h3>Comparativa de Ventas y Pedidos</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={filteredTimeseries}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5d5cb" />
            <XAxis dataKey="mes" tickFormatter={fmtMonthKey} />
            <YAxis />
            <Tooltip content={<ChartTooltip title="Comparativa mensual" />} />
            <Legend />
            <Bar dataKey="ventas" fill="#572420" name="Ventas" />
            <Bar dataKey="ordenes" fill="#d7a97a" name="Pedidos" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="dashboard-section">
        <h3>Rendimiento por Tipo de Producto</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart
            cx="50%"
            cy="50%"
            outerRadius="80%"
            data={pieData}
          >
            <PolarGrid />
            <PolarAngleAxis dataKey="categoria" />
            <Tooltip content={<ChartTooltip title="Rendimiento por categoría" />} />
            <Legend />
            <Radar
              name="Ventas"
              dataKey="ventas"
              stroke="#8b5e3c"
              fill="#8b5e3c"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}