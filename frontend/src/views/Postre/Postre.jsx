import React, { useMemo, useState } from "react";
import { Header } from "../../componentes/Header";
import { Footer } from "../../componentes/Footer";
import { useCarrito } from "../../context/carritoContext";
import "./Postre.css";
import tortaPersonalizada from "../../assets/carro/tortaPersonalizada.png";
import cupcakePersonalizado from "../../assets/carro/cupcakePersonalizado.png";
import tartaletaPersonalizada from "../../assets/carro/tartaletaPersonalizada.png";

const precios = {
  basePersona: 1000,
  gananciaFija: 7000,
  bizcocho: 3000,
  relleno: 2500,
  crema: 2000,
  extra: 1500,
};

const PORCIONES_TORTA = [12, 18, 24, 30, 50];

const Postre = () => {
  let ctx;
  try {
    ctx = useCarrito();
  } catch {
    ctx = undefined;
  }

  const [opcion, setOpcion] = useState("");
  const [porcionTorta, setPorcionTorta] = useState(PORCIONES_TORTA[0]);
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

  const cantidadOK =
    opcion === "cupcake" || opcion === "tartaleta"
      ? Math.max(6, Number(cantidad) || 6)
      : undefined;

  const total = useMemo(() => {
    if (!["torta", "cupcake", "tartaleta"].includes(opcion)) return 0;

    let base = 0;
    if (opcion === "torta") base = porcionTorta * precios.basePersona;
    else base = cantidadOK * precios.basePersona;

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
    porcionTorta,
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

    const imagen =
      opcion === "torta"
        ? tortaPersonalizada
        : opcion === "cupcake"
        ? cupcakePersonalizado
        : opcion === "tartaleta"
        ? tartaletaPersonalizada
        : null;

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
        cantidad: opcion === "torta" ? porcionTorta : cantidadOK,
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
      precio: total,
      cantidad: 1,
      imagen,
    };

    if (ctx?.agregarAlCarrito) ctx.agregarAlCarrito(producto);
    else {
      try {
        const current = JSON.parse(localStorage.getItem("carrito") || "[]");
        current.push(producto);
        localStorage.setItem("carrito", JSON.stringify(current));
        window.dispatchEvent(
          new CustomEvent("carrito:agregado", { detail: producto })
        );
      } catch {}
    }

    alert("¡Producto agregado al carrito!");
  };

  const fields = [];

  fields.push(
    <div className="campo" key="cat">
      <label>Categoría</label>
      <select
        value={opcion}
        onChange={(e) => {
          setOpcion(e.target.value);
          setRelleno("");
          setCupcakeConRelleno(false);
          setFruta1("");
          setFruta2("");
          setDecoracion("");
          setMensajeTorta("");
        }}
      >
        <option value="">Selecciona</option>
        <option value="torta">Torta</option>
        <option value="cupcake">Cupcakes</option>
        <option value="tartaleta">Tartaleta</option>
      </select>
    </div>
  );

  if (opcion === "torta") {
    fields.push(
      <div className="campo" key="porciones">
        <label>Porciones de la torta</label>
        <select
          value={porcionTorta}
          onChange={(e) => setPorcionTorta(Number(e.target.value))}
        >
          {PORCIONES_TORTA.map((p) => (
            <option key={p} value={p}>
              {p} personas
            </option>
          ))}
        </select>
      </div>
    );
    fields.push(
      <div className="campo" key="msg">
        <label>Mensaje (gratis)</label>
        <input
          type="text"
          placeholder="Ej: ¡Feliz Cumpleaños!"
          value={mensajeTorta}
          onChange={(e) => setMensajeTorta(e.target.value)}
        />
      </div>
    );
    fields.push(
      <div className="campo" key="biz">
        <label>Tipo de Bizcocho</label>
        <select value={bizcocho} onChange={(e) => setBizcocho(e.target.value)}>
          <option value="">Selecciona</option>
          <option value="vainilla">Vainilla</option>
          <option value="chocolate">Chocolate</option>
          <option value="redvelvet">Red Velvet</option>
          <option value="zanahoria">Zanahoria</option>
        </select>
      </div>
    );
    fields.push(
      <div className="campo" key="rel-torta">
        <label>Tipo de Relleno</label>
        <select
          value={relleno}
          onChange={(e) => setRelleno(e.target.value)}
          disabled={opcion !== "torta"}
        >
          <option value="">Selecciona</option>
          <option value="frutilla">Frutilla</option>
          <option value="manjar">Manjar</option>
          <option value="cremaPastelera">Crema Pastelera</option>
          <option value="zanahoria">Crema de zanahoria</option>
        </select>
      </div>
    );
    fields.push(
      <div className="campo" key="cre">
        <label>Sabor de Crema</label>
        <select value={crema} onChange={(e) => setCrema(e.target.value)}>
          <option value="">Selecciona</option>
          <option value="vainilla">Vainilla</option>
          <option value="chocolate">Chocolate</option>
          <option value="frutilla">Frutilla</option>
          <option value="zanahoria">Zanahoria</option>
        </select>
      </div>
    );
  } else if (opcion === "cupcake") {
    fields.push(
      <div className="campo" key="cant-ck">
        <label>Cantidad (mín. 6)</label>
        <input
          type="number"
          min={6}
          value={cantidadOK}
          onChange={onChangeCantidad}
        />
      </div>
    );
    fields.push(
      <div className="campo" key="biz-ck">
        <label>Tipo de Bizcocho</label>
        <select value={bizcocho} onChange={(e) => setBizcocho(e.target.value)}>
          <option value="">Selecciona</option>
          <option value="vainilla">Vainilla</option>
          <option value="chocolate">Chocolate</option>
          <option value="redvelvet">Red Velvet</option>
          <option value="zanahoria">Zanahoria</option>
        </select>
      </div>
    );
    fields.push(
      <div className="campo" key="rel-ck">
        <label>Tipo de Relleno</label>
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
          <option value="zanahoria">Crema de zanahoria</option>
        </select>
      </div>
    );
    fields.push(
      <div className="campo" key="cre-ck">
        <label>Sabor de Crema</label>
        <select value={crema} onChange={(e) => setCrema(e.target.value)}>
          <option value="">Selecciona</option>
          <option value="vainilla">Vainilla</option>
          <option value="chocolate">Chocolate</option>
          <option value="frutilla">Frutilla</option>
          <option value="zanahoria">Zanahoria</option>
        </select>
      </div>
    );
    // Campo extra para cuadrar filas (si quieres algo útil en vez de filler)
    fields.push(
      <div className="campo" key="presentacion">
        <label>Presentación</label>
        <select value={""} onChange={() => {}}>
          <option value="">Caja estándar</option>
          <option value="mini">Mini cupcakes</option>
          <option value="mix">Mix sabores</option>
        </select>
      </div>
    );
  } else if (opcion === "tartaleta") {
    fields.push(
      <div className="campo" key="cant-ta">
        <label>Cantidad (mín. 6)</label>
        <input
          type="number"
          min={6}
          value={cantidadOK}
          onChange={onChangeCantidad}
        />
      </div>
    );
    fields.push(
      <div className="campo" key="f1">
        <label>Fruta 1</label>
        <select value={fruta1} onChange={(e) => setFruta1(e.target.value)}>
          <option value="">Selecciona</option>
          <option value="frutilla">Frutilla</option>
          <option value="kiwi">Kiwi</option>
          <option value="mango">Mango</option>
          <option value="arándano">Arándano</option>
        </select>
      </div>
    );
    fields.push(
      <div className="campo" key="f2">
        <label>Fruta 2 (opcional)</label>
        <select value={fruta2} onChange={(e) => setFruta2(e.target.value)}>
          <option value="">Selecciona</option>
          <option value="frutilla">Frutilla</option>
          <option value="kiwi">Kiwi</option>
          <option value="mango">Mango</option>
          <option value="arándano">Arándano</option>
        </select>
      </div>
    );
    fields.push(
      <div className="campo" key="deco">
        <label>Decoración (opcional)</label>
        <input
          type="text"
          placeholder="Ej: flores comestibles"
          value={decoracion}
          onChange={(e) => setDecoracion(e.target.value)}
        />
      </div>
    );
    // Campo útil de relleno para cuadrar pares
    fields.push(
      <div className="campo" key="base-tartaleta">
        <label>Base</label>
        <select value={""} onChange={() => {}}>
          <option value="">Masa dulce clásica</option>
          <option value="integral">Masa integral</option>
        </select>
      </div>
    );
  }

  // --- Normalización: mínimo 6 campos (3 filas) y que sea par ---
  const MIN_FIELDS = 6;
  while (fields.length < MIN_FIELDS) {
    fields.push(<div className="campo filler" key={`filler-${fields.length}`} />);
  }
  if (fields.length % 2 !== 0) {
    fields.push(<div className="campo filler" key={`filler-${fields.length}`} />);
  }

  // Extras (ocupan 2 columnas y van al final). Solo para torta/cupcake.
  if (opcion === "torta" || opcion === "cupcake") {
    fields.push(
      <div className="campo campo-extras full" key="extras">
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
          <label>
            <input
              type="checkbox"
              checked={extraChispitas}
              onChange={() => setExtraChispitas((v) => !v)}
            />
            Chispitas de colores
          </label>
          <label>
            <input
              type="checkbox"
              checked={extraFrutasConfitadas}
              onChange={() => setExtraFrutasConfitadas((v) => !v)}
            />
            Frutas confitadas
          </label>
          <label>
            <input
              type="checkbox"
              checked={extraFondant}
              onChange={() => setExtraFondant((v) => !v)}
            />
            Fondant decorativo
          </label>
          <label>
            <input
              type="checkbox"
              checked={extraCaramelo}
              onChange={() => setExtraCaramelo((v) => !v)}
            />
            Cobertura de caramelo
          </label>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="postre-container">
        <div className="postre-card">
          <h2 className="titulo-formulario">Arma tu Postre</h2>
          <div className="postre-form-grid">{fields}</div>
        </div>

        <aside className="resumen-card">
          <h3>Resumen del Pedido</h3>
          <p><strong>Categoría:</strong> {opcion || "-"}</p>
          <p>
            <strong>Cantidad:</strong>{" "}
            {opcion === "torta"
              ? porcionTorta
              : ["cupcake", "tartaleta"].includes(opcion)
              ? cantidadOK
              : "-"}
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