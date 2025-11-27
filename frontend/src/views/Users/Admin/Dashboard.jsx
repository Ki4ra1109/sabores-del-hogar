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
  const [selectedYear, setSelectedYear] = useState(""); // <-- AÑADIDO

  const fetchData = useCallback(
    async (range = "6") => {
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

        const totalVentas = timeseries.reduce(
          (acc, e) => acc + (e.ventas || 0),
          0
        );
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
    },
    [selectedCategory]
  );

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

  const fmtCurrency = (v) =>
    typeof v === "number" ? `$${v.toLocaleString("es-CL")}` : "—";

  const fmtDateLong = (v) =>
    new Date(v).toLocaleDateString("es-ES", {
      month: "long",
      year: "numeric",
    });

  const fmtMonthName = (v) =>
    new Date(v).toLocaleDateString("es-ES", {
      month: "long",
      year: "numeric",
    });

  /* COLORES CONSISTENTES POR MES */
  const dynamicColors = {
    agosto: "#C0392B",
    septiembre: "#27AE60",
    octubre: "#F1C40F",
    noviembre: "#2a6ebdff",
    diciembre: "#8E44AD",
    enero: "#FF6384",
    febrero: "#36A2EB",
    marzo: "#FFCE56",
    abril: "#4BC0C0",
    mayo: "#9966FF",
    junio: "#FF9F40",
    julio: "#C9CBCF",
  };

  const getColorFor = (categoria) => {
    if (!categoria) return "#8b5e3c";
    const lower = categoria.toLowerCase();
    for (const key of Object.keys(dynamicColors)) {
      if (lower.includes(key)) return dynamicColors[key];
    }
    return "#8b5e3c";
  };

  const uniqueMonths = React.useMemo(() => {
    let ts = data?.timeseries || [];
    // Filtra por rango de meses primero
    if (selectedRange !== "all") {
      const months = parseInt(selectedRange);
      ts = ts.slice(-months);
    }
    // Luego filtra por año si corresponde
    if (selectedYear) {
      ts = ts.filter((r) => new Date(r.mes).getFullYear().toString() === selectedYear);
    }
    return [...new Set(ts.map((r) => fmtMonthName(r.mes)))];
  }, [data, selectedYear, selectedRange]);

  const uniqueYears = React.useMemo(() => {
    const ts = data?.timeseries || [];
    const years = ts.map((r) => new Date(r.mes).getFullYear());
    return [...new Set(years)];
  }, [data]);

  const filteredTimeseries = React.useMemo(() => {
    let arr = data?.timeseries || [];
    if (selectedMonths.length > 0) {
      arr = arr.filter((d) => selectedMonths.includes(fmtMonthName(d.mes)));
    }
    if (selectedYear) {
      arr = arr.filter(
        (d) => new Date(d.mes).getFullYear().toString() === selectedYear
      );
    }
    return arr;
  }, [data, selectedMonths, selectedYear]);

  /* PIE DATA ARREGLADA */
  const pieData = React.useMemo(() => {
    const ts = filteredTimeseries;
    const list = {};

    for (const r of ts) {
      const label = fmtMonthName(r.mes); // Ej: "septiembre de 2025"
      list[label] = (list[label] || 0) + (r.ventas || 0);
    }

    return Object.entries(list).map(([categoria, ventas]) => ({
      categoria,
      ventas,
      color: getColorFor(categoria),
    }));
  }, [filteredTimeseries]);

  const renderPieLabel = (entry) =>
    `${entry.categoria}: ${fmtCurrency(entry.ventas)}`;

  const ChartTooltip = ({ active, label, payload, title }) => {
    if (!active || !payload?.length) return null;
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
                {typeof item.value === "number"
                  ? fmtCurrency(item.value)
                  : item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  useEffect(() => {
    setSelectedMonths(uniqueMonths);
  }, [uniqueMonths]);

  if (loading) return <p className="dashboard-loading">Cargando datos...</p>;

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">📊 Dashboard Interactivo</h2>

      {/* FILTROS */}
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

        <label>
          Año:
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="dashboard-select"
          >
            <option value="">Todos</option>
            {uniqueYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>

        <button
          className="dashboard-refresh"
          onClick={() => {
            fetchData(selectedRange);
            setSelectedMonths(uniqueMonths);
          }}
        >
          🔄 Actualizar
        </button>
      </div>

      {/* KPIS */}
      <div className="dashboard-kpis">
        <div className="kpi-card">
          <h3>Ventas Totales</h3>
          <p>${data?.ventasTotales?.toLocaleString("es-CL")}</p>
        </div>
        <div className="kpi-card">
          <h3>Promedio Mensual</h3>
          <p>${data?.promedioMensual?.toLocaleString("es-CL")}</p>
        </div>
        <div className="kpi-card">
          <h3>Compras Realizadas</h3>
          <p>{data?.pedidosCompletados}</p>
        </div>
      </div>

      {/* SELECTOR DE MESES */}
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

      {/* AREA CHART */}
      <div className="dashboard-section">
        <h3>Evolución Mensual de Ventas</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={filteredTimeseries}
            margin={{
              top: 20,
              right: 50,
              left: 50,
              bottom: 20,
            }}
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

      {/* FORECAST LINE */}
      <div className="dashboard-section">
        <h3>Predicción Próximos Meses</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data?.forecast || []}
            margin={{
              top: 20,
              right: 50,
              left: 50,
              bottom: 20,
            }}
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

      {/* PIE CHART (CORREGIDO) */}
      <div className="dashboard-section">
        <h3>Distribución de Ventas por Mes</h3>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Tooltip content={<ChartTooltip title="Ventas por categoría" />} />

            <Legend
              payload={pieData.map((item) => ({
                id: item.categoria,
                value: item.categoria,
                type: "square",
                color: item.color,
              }))}
            />

            <Pie
              data={pieData}
              dataKey="ventas"
              nameKey="categoria"
              cx="50%"
              cy="50%"
              outerRadius={110}
              labelLine={true}
              label={renderPieLabel}
              stroke="#fffdfb"
            >
              {pieData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>



      {/* RADAR CHART */}
      <div className="dashboard-section">
        <h3>Rendimiento por Mes</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={pieData}>
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
