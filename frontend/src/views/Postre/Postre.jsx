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

function Chip({ checked, onChange, children }) {
  return (
    <label className={`chip ${checked ? "chip-on" : ""}`}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span>{children}</span>
    </label>
  );
}

function Segmented({ value, onChange, options }) {
  return (
    <div className="segmented" role="tablist" aria-label="Categoría">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={`seg ${value === o.value ? "seg-on" : ""}`}
          onClick={() => onChange(o.value)}
          role="tab"
          aria-selected={value === o.value}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

const fmtCLP = (n) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(Number(n || 0));

const Postre = () => {
  let ctx;
  try { ctx = useCarrito(); } catch { ctx = undefined; }

  const [opcion, setOpcion] = useState("torta");
  const [personas, setPersonas] = useState(15);
  const [cantidad, setCantidad] = useState(6);

  const [bizcocho, setBizcocho] = useState("");
  const [relleno, setRelleno] = useState("");
  const [crema, setCrema] = useState("");

  const [extraChips, setExtraChips] = useState(false);
  const [extraNueces, setExtraNueces] = useState(false);
  const [extraChispitas, setExtraChispitas] = useState(false);
  const [extraFrutasConfitadas, setExtraFrutasConfitadas] = useState(false);
  const [extraFondant, setExtraFondant] = useState(false);
  const [extraCaramelo, setExtraCaramelo] = useState(false);

  const [cupcakeConRelleno, setCupcakeConRelleno] = useState(false);

  const [fruta1, setFruta1] = useState("");
  const [fruta2, setFruta2] = useState("");
  const [decoracion, setDecoracion] = useState("");
  const [mensajeTorta, setMensajeTorta] = useState("");

  const personasOK = Math.max(15, Number.isFinite(+personas) ? +personas : 15);
  const cantidadOK = Math.max(6, Number.isFinite(+cantidad) ? +cantidad : 6);

  const total = useMemo(() => {
    if (!["torta", "cupcake", "tartaleta"].includes(opcion)) return 0;
    const base =
      opcion === "torta"
        ? personasOK * precios.basePersona
        : cantidadOK * precios.basePersona;

    let t = base + precios.gananciaFija;
    if (bizcocho) t += precios.bizcocho;
    if (crema) t += precios.crema;
    if (opcion === "torta" && relleno) t += precios.relleno;
    if (opcion === "cupcake" && cupcakeConRelleno && relleno) t += precios.relleno;
    if (extraChips) t += precios.extra;
    if (extraNueces) t += precios.extra;
    if (extraChispitas) t += precios.extra;
    if (extraFrutasConfitadas) t += precios.extra;
    if (extraFondant) t += precios.extra;
    if (extraCaramelo) t += precios.extra;
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
    extraChispitas,
    extraFrutasConfitadas,
    extraFondant,
    extraCaramelo,
    cupcakeConRelleno,
  ]);

  const onChangePersonas = (e) =>
    setPersonas(Math.max(15, parseInt(e.target.value || 15, 10)));
  const onChangeCantidad = (e) =>
    setCantidad(Math.max(6, parseInt(e.target.value || 6, 10)));

  const handleAgregar = () => {
    if (
      !opcion ||
      (opcion === "torta" && (!bizcocho || !crema || !relleno)) ||
      (opcion === "cupcake" &&
        (!bizcocho || !crema || (cupcakeConRelleno && !relleno))) ||
      (opcion === "tartaleta" && (!fruta1 && !fruta2))
    ) {
      alert("Completa los campos requeridos antes de agregar al carrito.");
      return;
    }

    const extras = [
      extraChips ? "Chips de chocolate" : null,
      extraNueces ? "Nueces" : null,
      extraChispitas ? "Chispitas de colores" : null,
      extraFrutasConfitadas ? "Frutas confitadas" : null,
      extraFondant ? "Fondant decorativo" : null,
      extraCaramelo ? "Cobertura de caramelo" : null,
    ].filter(Boolean);

    const producto = {
      id: `postre-${Date.now()}`,
      nombre:
        opcion === "torta"
          ? "Torta personalizada"
          : opcion === "cupcake"
          ? "Cupcakes personalizados"
          : "Tartaleta personalizada",
      detalle: {
        tipo: opcion,
        cantidad: opcion === "torta" ? personasOK : cantidadOK,
        bizcocho,
        relleno:
          opcion === "cupcake"
            ? cupcakeConRelleno
              ? relleno
              : "Sin relleno"
            : opcion === "torta"
            ? relleno
            : undefined,
        crema,
        frutas:
          opcion === "tartaleta" ? [fruta1, fruta2].filter(Boolean) : undefined,
        decoracion:
          opcion === "tartaleta" ? decoracion || "Sin decoración" : undefined,
        mensajeTorta: opcion === "torta" ? mensajeTorta || "Sin mensaje" : undefined,
        extras,
      },
      precio: Number(total),
      cantidad: 1,
      imagen: "/assets/personalizado.png",
    };

    const keyFrom = (p) => `${p.nombre}|${JSON.stringify(p.detalle)}`;

    const saveToStorageMerging = (nuevo) => {
      const list = JSON.parse(localStorage.getItem("carrito") || "[]");
      const k = keyFrom(nuevo);
      const i = list.findIndex((x) => keyFrom(x) === k);
      if (i >= 0) {
        list[i].cantidad = Number(list[i].cantidad || 0) + Number(nuevo.cantidad || 1);
      } else {
        list.push(nuevo);
      }
      localStorage.setItem("carrito", JSON.stringify(list));
      window.dispatchEvent(new CustomEvent("carrito:agregado", { detail: { open: true } }));
    };

    if (ctx?.agregarAlCarrito) {
      try { ctx.agregarAlCarrito(producto, { merge: true }); }
      catch { saveToStorageMerging(producto); }
    } else {
      saveToStorageMerging(producto);
    }
  };

  return (
    <>
      <Header />
      <div className="postre-container">
        <div className="postre-card">
          <h2 className="titulo-formulario">Arma tu Postre</h2>

          <label className="lab">Categoría</label>
          <Segmented
            value={opcion}
            onChange={(v) => {
              setOpcion(v);
              setRelleno("");
              setCupcakeConRelleno(false);
              setFruta1("");
              setFruta2("");
              setDecoracion("");
              setMensajeTorta("");
            }}
            options={[
              { value: "torta", label: "Torta" },
              { value: "cupcake", label: "Cupcakes" },
              { value: "tartaleta", label: "Tartaleta" },
            ]}
          />

          <div className="postre-form-grid">
            {opcion === "torta" && (
              <>
                <div className="campo">
                  <label className="lab">Cantidad de personas</label>
                  <div className="stepper">
                    <button
                      type="button"
                      onClick={() =>
                        onChangePersonas({ target: { value: personasOK - 1 } })
                      }
                      disabled={personasOK <= 15}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={15}
                      value={personasOK}
                      onChange={onChangePersonas}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        onChangePersonas({ target: { value: personasOK + 1 } })
                      }
                    >
                      +
                    </button>
                  </div>
                  <small className="help">Mínimo 15</small>
                </div>

                <div className="campo">
                  <label className="lab">Mensaje en la torta</label>
                  <input
                    type="text"
                    placeholder="Ej: ¡Feliz Cumpleaños!"
                    value={mensajeTorta}
                    onChange={(e) => setMensajeTorta(e.target.value)}
                  />
                </div>
              </>
            )}

            {opcion !== "" && opcion !== "torta" && (
              <>
                <div className="campo">
                  <label className="lab">Cantidad de unidades</label>
                  <div className="stepper">
                    <button
                      type="button"
                      onClick={() =>
                        onChangeCantidad({ target: { value: cantidadOK - 1 } })
                      }
                      disabled={cantidadOK <= 6}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={6}
                      value={cantidadOK}
                      onChange={onChangeCantidad}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        onChangeCantidad({ target: { value: cantidadOK + 1 } })
                      }
                    >
                      +
                    </button>
                  </div>
                  <small className="help">Mínimo 6</small>
                </div>
                <div className="campo filler" />
              </>
            )}

            {opcion && (
              <>
                <div className="campo">
                  <label>Tipo de Bizcocho</label>
                  <select
                    value={bizcocho}
                    onChange={(e) => setBizcocho(e.target.value)}
                  >
                    <option value="">Selecciona</option>
                    <option value="vainilla">Vainilla</option>
                    <option value="chocolate">Chocolate</option>
                    <option value="redvelvet">Red Velvet</option>
                    <option value="zanahoria">Zanahoria</option>
                  </select>
                </div>

                <div className="campo">
                  <label>Sabor de Crema</label>
                  <select value={crema} onChange={(e) => setCrema(e.target.value)}>
                    <option value="">Selecciona</option>
                    <option value="vainilla">Vainilla</option>
                    <option value="chocolate">Chocolate</option>
                    <option value="frutilla">Frutilla</option>
                    <option value="zanahoria">Zanahoria</option>
                  </select>
                </div>

                {(opcion === "torta" || opcion === "cupcake") && (
                  <div className="campo">
                    <label>Tipo de Relleno</label>

                    {opcion === "cupcake" && (
                      <label className="checkbox-inline">
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
                    )}

                    <select
                      value={relleno}
                      onChange={(e) => setRelleno(e.target.value)}
                      disabled={opcion === "cupcake" && !cupcakeConRelleno}
                    >
                      <option value="">Selecciona</option>
                      <option value="frutilla">Frutilla</option>
                      <option value="manjar">Manjar</option>
                      <option value="chocolate">Chocolate</option>
                      <option value="cremaPastelera">Crema Pastelera</option>
                      <option value="zanahoria">Crema de zanahoria</option>
                    </select>
                  </div>
                )}

                {opcion === "tartaleta" && (
                  <>
                    <div className="campo">
                      <label>Fruta 1</label>
                      <select value={fruta1} onChange={(e) => setFruta1(e.target.value)}>
                        <option value="">Selecciona</option>
                        <option value="frutilla">Frutilla</option>
                        <option value="kiwi">Kiwi</option>
                        <option value="mango">Mango</option>
                        <option value="arándano">Arándano</option>
                      </select>
                    </div>
                    <div className="campo">
                      <label>Fruta 2 (opcional)</label>
                      <select value={fruta2} onChange={(e) => setFruta2(e.target.value)}>
                        <option value="">Selecciona</option>
                        <option value="frutilla">Frutilla</option>
                        <option value="kiwi">Kiwi</option>
                        <option value="mango">Mango</option>
                        <option value="arándano">Arándano</option>
                      </select>
                    </div>
                    <div className="campo">
                      <label>Decoración (opcional)</label>
                      <input
                        type="text"
                        placeholder="Ej: flores comestibles"
                        value={decoracion}
                        onChange={(e) => setDecoracion(e.target.value)}
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {(opcion === "torta" || opcion === "cupcake") && (
              <div className="campo campo-extras full">
                <label>Extras</label>
                <div className="checkbox-group chips">
                  <Chip checked={extraChips} onChange={() => setExtraChips(v => !v)}>
                    Chips de chocolate
                  </Chip>
                  <Chip checked={extraNueces} onChange={() => setExtraNueces(v => !v)}>
                    Nueces
                  </Chip>
                  <Chip checked={extraChispitas} onChange={() => setExtraChispitas(v => !v)}>
                    Chispitas de colores
                  </Chip>
                  <Chip checked={extraFrutasConfitadas} onChange={() => setExtraFrutasConfitadas(v => !v)}>
                    Frutas confitadas
                  </Chip>
                  <Chip checked={extraFondant} onChange={() => setExtraFondant(v => !v)}>
                    Fondant decorativo
                  </Chip>
                  <Chip checked={extraCaramelo} onChange={() => setExtraCaramelo(v => !v)}>
                    Cobertura de caramelo
                  </Chip>
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="resumen-card sticky">
          <h3>Resumen del Pedido</h3>
          <p><strong>Categoría:</strong> {opcion || "-"}</p>
          <p>
            <strong>Cantidad:</strong>{" "}
            {opcion === "torta"
              ? personasOK
              : ["cupcake", "tartaleta"].includes(opcion)
              ? cantidadOK
              : "-"}
          </p>

          {opcion !== "tartaleta" && (
            <>
              <p><strong>Bizcocho:</strong> {bizcocho || "-"}</p>
              <p>
                <strong>Relleno:</strong>{" "}
                {opcion === "cupcake"
                  ? cupcakeConRelleno
                    ? relleno || "-"
                    : "Sin relleno"
                  : relleno || "-"}
              </p>
              <p><strong>Crema:</strong> {crema || "-"}</p>
              {opcion === "torta" && (
                <p><strong>Mensaje:</strong> {mensajeTorta || "-"}</p>
              )}
              <p>
                <strong>Extras:</strong>{" "}
                {[
                  extraChips && "Chips de chocolate",
                  extraNueces && "Nueces",
                  extraChispitas && "Chispitas de colores",
                  extraFrutasConfitadas && "Frutas confitadas",
                  extraFondant && "Fondant decorativo",
                  extraCaramelo && "Cobertura de caramelo",
                ]
                  .filter(Boolean)
                  .join(", ") || "-"}
              </p>
            </>
          )}

          {opcion === "tartaleta" && (
            <>
              <p>
                <strong>Frutas:</strong>{" "}
                {[fruta1, fruta2].filter(Boolean).join(", ") || "-"}
              </p>
              <p><strong>Decoración:</strong> {decoracion || "-"}</p>
            </>
          )}

          <div className="total-linia">
            <span>Total:</span>
            <strong>{fmtCLP(total)}</strong>
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
