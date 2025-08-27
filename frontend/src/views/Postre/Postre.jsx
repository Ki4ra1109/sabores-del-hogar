import React, { useMemo, useState } from "react";
import { Header } from "../../componentes/Header";
import { Footer } from "../../componentes/Footer";
import { useCarrito } from "../../context/carritoContext";
import "./Postre.css";

const precios = {
  basePersona: 1000,
  gananciaFija: 7000,
  bizcocho: 3000,
  relleno: 2500,
  crema: 2000,
  extra: 1500,
};

const Postre = () => {
  // carrito (si existe el contexto)
  let ctx = undefined;
  try {
    ctx = useCarrito();
  } catch (_) {
    ctx = undefined; // si no hay provider, no rompemos
  }

  // estado general
  const [opcion, setOpcion] = useState("");
  const [personas, setPersonas] = useState(15);   // torta
  const [cantidad, setCantidad] = useState(6);    // cupcakes

  const [bizcocho, setBizcocho] = useState("");
  const [relleno, setRelleno] = useState("");
  const [crema, setCrema] = useState("");

  const [extraChips, setExtraChips] = useState(false);
  const [extraNueces, setExtraNueces] = useState(false);
  const [extraChipsColores, setExtraChipsColores] = useState(false); // solo cupcakes

  // cupcakes: ¿con relleno?
  const [cupcakeConRelleno, setCupcakeConRelleno] = useState(false);

  // cantidad válidas
  const personasOK = Math.max(15, Number.isFinite(+personas) ? +personas : 15);
  const cantidadOK = Math.max(6, Number.isFinite(+cantidad) ? +cantidad : 6);

  // total
  const total = useMemo(() => {
    if (opcion !== "torta" && opcion !== "cupcake") return 0;

    const base = (opcion === "torta" ? personasOK : cantidadOK) * precios.basePersona;
    let t = base + precios.gananciaFija;

    if (bizcocho) t += precios.bizcocho;
    if (crema) t += precios.crema;

    // relleno:
    if (opcion === "torta") {
      if (relleno) t += precios.relleno;
    } else if (opcion === "cupcake") {
      if (cupcakeConRelleno && relleno) t += precios.relleno;
    }

    // extras
    if (extraChips) t += precios.extra;
    if (extraNueces) t += precios.extra;
    if (opcion === "cupcake" && extraChipsColores) t += precios.extra;

    return t;
  }, [
    opcion,
    personasOK,
    cantidadOK,
    bizcocho,
    relleno,
    crema,
    extraChips,
    extraNueces,
    extraChipsColores,
    cupcakeConRelleno,
  ]);

  // handlers cantidad
  const onChangePersonas = (e) => setPersonas(Math.max(15, parseInt(e.target.value || 15, 10)));
  const onChangeCantidad = (e) => setCantidad(Math.max(6, parseInt(e.target.value || 6, 10)));

  // agregar al carrito (contexto si existe; si no, localStorage)
  const handleAgregar = () => {
    if (!opcion || !bizcocho || !crema || (opcion === "torta" && !relleno) || (opcion === "cupcake" && cupcakeConRelleno && !relleno)) {
      alert("Completa los campos requeridos antes de agregar al carrito.");
      return;
    }

    const extras = [
      extraChips ? "Chips de chocolate" : null,
      extraNueces ? "Nueces" : null,
      opcion === "cupcake" && extraChipsColores ? "Chips de colores" : null,
    ].filter(Boolean);

    const producto = {
      id: `postre-${Date.now()}`,
      nombre: opcion === "torta" ? "Torta personalizada" : "Cupcakes personalizados",
      detalle: {
        tipo: opcion,
        cantidad: opcion === "torta" ? personasOK : cantidadOK,
        bizcocho,
        relleno: opcion === "cupcake" ? (cupcakeConRelleno ? relleno : "Sin relleno") : relleno,
        crema,
        extras,
      },
      // Para tu Carrito.jsx: precio * cantidad -> usamos cantidad:1 y precio = total final
      precio: total,
      cantidad: 1,
      imagen: "/assets/personalizado.png",
    };

    // 1) contexto si existe
    if (ctx && typeof ctx.agregarAlCarrito === "function") {
      ctx.agregarAlCarrito(producto);
    }

    // 2) fallback localStorage para no romper
    try {
      const current = JSON.parse(localStorage.getItem("carrito") || "[]");
      current.push(producto);
      localStorage.setItem("carrito", JSON.stringify(current));
      // evento por si tu Header escucha
      window.dispatchEvent(new CustomEvent("carrito:agregado", { detail: producto }));
    } catch (_) {}

    alert("¡Producto agregado al carrito!");
  };

  return (
    <>
      <Header />
      <div className="postre-layout">
        {/* LEFT: formulario */}
        <div className="postre-card">
          <h2>Arma tu Postre</h2>

          <div className="postre-form-grid">
            {/* Categoría */}
            <div className="campo">
              <label>Categoría</label>
              <select
                value={opcion}
                onChange={(e) => {
                  setOpcion(e.target.value);
                  // reset campos dependientes
                  setRelleno("");
                  setCupcakeConRelleno(false);
                }}
              >
                <option value="">Selecciona</option>
                <option value="torta">Torta</option>
                <option value="cupcake">Cupcakes</option>
              </select>
            </div>

            {/* Cantidad */}
            {opcion === "torta" && (
              <div className="campo">
                <label>Cantidad de personas (mín. 15)</label>
                <input type="number" min={15} value={personasOK} onChange={onChangePersonas} />
              </div>
            )}
            {opcion === "cupcake" && (
              <div className="campo">
                <label>Cantidad de cupcakes (mín. 6)</label>
                <input type="number" min={6} value={cantidadOK} onChange={onChangeCantidad} />
              </div>
            )}

            {/* Bizcocho */}
            <div className="campo">
              <label>Tipo de Bizcocho</label>
              <select value={bizcocho} onChange={(e) => setBizcocho(e.target.value)}>
                <option value="">Selecciona</option>
                <option value="vainilla">Vainilla</option>
                <option value="chocolate">Chocolate</option>
                <option value="redvelvet">Red Velvet</option>
              </select>
            </div>

            {/* Relleno */}
            <div className="campo">
              <label>Tipo de Relleno</label>

              {opcion === "cupcake" ? (
                <>
                  <div className="checkbox-inline">
                    <label>
                      <input
                        type="checkbox"
                        checked={cupcakeConRelleno}
                        onChange={() => {
                          setCupcakeConRelleno((v) => !v);
                          setRelleno("");
                        }}
                      />
                      ¿Con relleno?
                    </label>
                  </div>
                  <select
                    value={relleno}
                    onChange={(e) => setRelleno(e.target.value)}
                    disabled={!cupcakeConRelleno}
                  >
                    <option value="">Selecciona</option>
                    <option value="frambuesa">Frambuesa</option>
                    <option value="manjar">Manjar</option>
                    <option value="chocolate">Chocolate</option>
                    <option value="cremaVainilla">Crema de vainilla</option>
                  </select>
                </>
              ) : (
                <select value={relleno} onChange={(e) => setRelleno(e.target.value)} disabled={opcion !== "torta"}>
                  <option value="">Selecciona</option>
                  <option value="frutilla">Frutilla</option>
                  <option value="manjar">Manjar</option>
                  <option value="cremaPastelera">Crema Pastelera</option>
                </select>
              )}
            </div>

            {/* Crema */}
            <div className="campo">
              <label>Sabor de Crema</label>
              <select value={crema} onChange={(e) => setCrema(e.target.value)}>
                <option value="">Selecciona</option>
                <option value="vainilla">Vainilla</option>
                <option value="chocolate">Chocolate</option>
                <option value="frutilla">Frutilla</option>
              </select>
            </div>

            {/* Extras */}
            <div className="campo campo-extras">
              <label>Extras (opcionales)</label>
              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={extraChips}
                    onChange={() => setExtraChips((v) => !v)}
                  />
                  Chips de chocolate
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={extraNueces}
                    onChange={() => setExtraNueces((v) => !v)}
                  />
                  Nueces
                </label>
                {opcion === "cupcake" && (
                  <label>
                    <input
                      type="checkbox"
                      checked={extraChipsColores}
                      onChange={() => setExtraChipsColores((v) => !v)}
                    />
                    Chips de colores
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: resumen */}
        <aside className="resumen-card">
          <h3>Resumen del Pedido</h3>
          <p><strong>Categoría:</strong> {opcion || "-"}</p>
          <p><strong>Cantidad:</strong> {opcion === "torta" ? personasOK : opcion === "cupcake" ? cantidadOK : "-"}</p>
          <p><strong>Bizcocho:</strong> {bizcocho || "-"}</p>
          <p><strong>Relleno:</strong> {opcion === "cupcake" ? (cupcakeConRelleno ? (relleno || "-") : "Sin relleno") : (relleno || "-")}</p>
          <p><strong>Crema:</strong> {crema || "-"}</p>
          <p>
            <strong>Extras:</strong>{" "}
            {[
              extraChips ? "Chips de chocolate" : null,
              extraNueces ? "Nueces" : null,
              opcion === "cupcake" && extraChipsColores ? "Chips de colores" : null,
            ]
              .filter(Boolean)
              .join(", ") || "-"}
          </p>

          <div className="total-linia">
            <span>Total:</span>
            <strong>${total.toLocaleString("es-CL")}</strong>
          </div>

          <button className="btn-agregar" onClick={handleAgregar}>
            Agregar al carrito
          </button>
        </aside>
      </div>
      <Footer />
    </>
  );
};
export default Postre;