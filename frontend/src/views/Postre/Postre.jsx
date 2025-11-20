import React, { useMemo, useState } from "react";
import { Header } from "../../componentes/Header";
import { Footer } from "../../componentes/Footer";
import "./Postre.css";

import tortaPersonalizada from "../../assets/carro/tortaPersonalizada.png";
import cupcakePersonalizado from "../../assets/carro/cupcakePersonalizado.png";
import tartaletaPersonalizada from "../../assets/carro/tartaletaPersonalizada.png";

const precios = {
  basePersona: 1000,
  gananciaTorta: 7000,
  gananciaCupcake: 7000,
  gananciaTartaleta: 3000,
  bizcocho: 3000,
  relleno: 2500,
  crema: 2000,
  extra: 500,
};

const PORCIONES_TORTA = [12, 18, 24, 30, 50];
const PORCIONES_TARTALETA = [8, 12, 16, 20];

const Postre = () => {
  const [opcion, setOpcion] = useState("");

  const [porcionTorta, setPorcionTorta] = useState(PORCIONES_TORTA[0]);

  const [porcionTartaleta, setPorcionTartaleta] = useState(PORCIONES_TARTALETA[0]);
  const [cantidadCupcake, setCantidadCupcake] = useState(6);

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

  const cantidadCupcakeOK = Math.max(6, Number(cantidadCupcake) || 6);

  const total = useMemo(() => {
    if (!opcion) return 0;

    let porciones = 0;
    let ganancia = 0;

    if (opcion === "torta") {
      porciones = porcionTorta;
      ganancia = precios.gananciaTorta;
    }

    if (opcion === "cupcake") {
      porciones = cantidadCupcakeOK;
      ganancia = precios.gananciaCupcake;
    }

    if (opcion === "tartaleta") {
      porciones = porcionTartaleta;
      ganancia = precios.gananciaTartaleta;
    }

    let t = porciones * precios.basePersona + ganancia;

    if (bizcocho) t += precios.bizcocho;
    if (crema) t += precios.crema;

    if (opcion === "torta" && relleno) t += precios.relleno;
    if (opcion === "cupcake" && cupcakeConRelleno && relleno) t += precios.relleno;
    if (opcion === "tartaleta") {
    }
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
    porcionTartaleta,
    cantidadCupcakeOK,
    bizcocho,
    crema,
    relleno,
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
      extraChips && "Chips de chocolate",
      extraNueces && "Nueces",
      extraChispitas && "Chispitas de colores",
      extraFrutasConfitadas && "Frutas confitadas",
      extraFondant && "Fondant decorativo",
      extraCaramelo && "Cobertura de caramelo",
    ].filter(Boolean);

    const imagen =
      opcion === "torta"
        ? tortaPersonalizada
        : opcion === "cupcake"
        ? cupcakePersonalizado
        : tartaletaPersonalizada;

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
        cantidad:
          opcion === "torta"
            ? porcionTorta
            : opcion === "cupcake"
            ? cantidadCupcakeOK
            : porcionTartaleta,
        bizcocho,
        crema,
        relleno:
          opcion === "cupcake"
            ? cupcakeConRelleno
              ? relleno
              : "Sin relleno"
            : opcion === "torta"
            ? relleno
            : undefined,
        frutas:
          opcion === "tartaleta" ? [fruta1, fruta2].filter(Boolean) : undefined,
        decoracion: opcion === "tartaleta" ? decoracion || "Sin decoración" : undefined,
        mensajeTorta: opcion === "torta" ? mensajeTorta || "Sin mensaje" : undefined,
        extras,
      },
      precio: total,
      cantidad: 1,
      imagen,
    };

    const current = JSON.parse(localStorage.getItem("carrito") || "[]");
    current.push(producto);
    localStorage.setItem("carrito", JSON.stringify(current));

    alert("¡Producto agregado al carrito!");
  };

  const renderFormFields = () => {
    const fields = [];

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

      /* INGREDIENTES */
      fields.push(
        <div className="campo" key="bizcocho">
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
        <div className="campo" key="relleno">
          <label>Tipo de Relleno</label>
          <select value={relleno} onChange={(e) => setRelleno(e.target.value)}>
            <option value="">Selecciona</option>
            <option value="frutilla">Frutilla</option>
            <option value="manjar">Manjar</option>
            <option value="cremaPastelera">Crema Pastelera</option>
            <option value="zanahoria">Crema de zanahoria</option>
          </select>
        </div>
      );

      fields.push(
        <div className="campo" key="crema">
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
    }

    if (opcion === "cupcake") {
      fields.push(
        <div className="campo" key="cantidadCupcake">
          <label>Cantidad (mín. 6)</label>
          <input
            type="number"
            min={6}
            value={cantidadCupcakeOK}
            onChange={(e) => setCantidadCupcake(e.target.value)}
          />
        </div>
      );

      fields.push(
        <div className="campo" key="bizcochoCup">
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
        <div className="campo" key="rellenoCup">
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
        <div className="campo" key="cremaCup">
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
    }

    if (opcion === "tartaleta") {
      fields.push(
        <div className="campo" key="porcionTartaleta">
          <label>Porciones de la tartaleta</label>
          <select
            value={porcionTartaleta}
            onChange={(e) => setPorcionTartaleta(Number(e.target.value))}
          >
            {PORCIONES_TARTALETA.map((p) => (
              <option key={p} value={p}>
                {p} porciones
              </option>
            ))}
          </select>
        </div>
      );

      fields.push(
        <div className="campo" key="fruta1">
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
        <div className="campo" key="fruta2">
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
        <div className="campo" key="decoracion">
          <label>Decoración (opcional)</label>
          <input
            type="text"
            placeholder="Ej: flores comestibles"
            value={decoracion}
            onChange={(e) => setDecoracion(e.target.value)}
          />
        </div>
      );
    }
    if (["torta", "cupcake", "tartaleta"].includes(opcion)) {
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

    return fields;
  };

  return (
    <>
      <Header />
      <div className="postre-container">
        <div className="postre-card">
          <h2 className="titulo-formulario">Arma tu Postre</h2>

          <div className="postre-categoria-selector">
            <button
              className={`cat-pill ${opcion === "torta" ? "active" : ""}`}
              onClick={() => setOpcion("torta")}
            >
              Torta
            </button>

            <button
              className={`cat-pill ${opcion === "cupcake" ? "active" : ""}`}
              onClick={() => setOpcion("cupcake")}
            >
              Cupcakes
            </button>

            <button
              className={`cat-pill ${opcion === "tartaleta" ? "active" : ""}`}
              onClick={() => setOpcion("tartaleta")}
            >
              Tartaleta
            </button>
          </div>

          {opcion ? (
            <div className="postre-form-grid">{renderFormFields()}</div>
          ) : (
            <p className="mensaje-inicial">Selecciona una categoría para empezar a personalizar tu postre.</p>
          )}
        </div>

        <aside className="resumen-card">
          <h3>Resumen del Pedido</h3>
          <p>
            <strong>Categoría:</strong> {opcion || "-"}
          </p>

          <p>
            <strong>Cantidad:</strong>{" "}
            {opcion === "torta"
              ? porcionTorta
              : opcion === "cupcake"
              ? cantidadCupcakeOK
              : opcion === "tartaleta"
              ? porcionTartaleta
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