import { Footer } from '../../componentes/Footer';
import { Header } from '../../componentes/Header';
import { useState } from 'react';
import { useCarrito } from '../../../context/CarritoContext';
import './Postre.css';

export const Postre = () => {
  const [opcion, setOpcion] = useState('');
  const [bizcocho, setBizcocho] = useState('');
  const [relleno, setRelleno] = useState('');
  const [crema, setCrema] = useState('');
  const [personas, setPersonas] = useState(15);
  const [extras, setExtras] = useState([]);
  const [mensaje, setMensaje] = useState(false);

  const { agregarAlCarrito } = useCarrito();

  const precios = {
    tortaBase: 10000,
    bizcocho: 3000,
    relleno: 2500,
    extra: 1500,
    crema: 2000,
    persona: 1500, // cada persona adicional
  };

  const handleExtraChange = (extra) => {
    if (extras.includes(extra)) {
      setExtras(extras.filter((e) => e !== extra));
    } else {
      setExtras([...extras, extra]);
    }
  };

  const calcularTotal = () => {
    let total = 0;

    if (opcion === 'torta') {
      total += precios.tortaBase;
      if (bizcocho) total += precios.bizcocho;
      if (relleno) total += precios.relleno;
      if (crema) total += precios.crema;
      total += extras.length * precios.extra;
      if (personas > 15) total += (personas - 15) * precios.persona;
    }

    // Ganancia fija de $7000
    total += 7000;
    return total;
  };

  const handleAgregarCarrito = () => {
    const producto = {
      categoria: opcion,
      bizcocho,
      relleno,
      crema,
      extras: [
        ...extras,
        mensaje ? 'Mensaje "Feliz cumpleaños" (sin costo)' : null,
      ].filter(Boolean),
      cantidad: opcion === "torta" ? personas : 1,
      total: calcularTotal(),
    };

    agregarAlCarrito(producto);
  };

  return (
    <>
      <Header />
      <div className="postre-container">
        <div className="pedido-container">
          {/* Formulario */}
          <div className="card">
            <h2>Bienvenido a “Arma tu postre”, selecciona tu categoría</h2>

            <label>Categoría</label>
            <select value={opcion} onChange={(e) => setOpcion(e.target.value)}>
              <option value="">Selecciona</option>
              <option value="torta">Torta</option>
              <option value="galleta">Galletas</option>
              <option value="cupcake">Cupcakes</option>
            </select>

            {opcion === "torta" && (
              <>
                <label>Tipo de Bizcocho</label>
                <select value={bizcocho} onChange={(e) => setBizcocho(e.target.value)}>
                  <option value="">Selecciona</option>
                  <option value="vainilla">Vainilla</option>
                  <option value="chocolate">Chocolate</option>
                  <option value="redvelvet">Red Velvet</option>
                  <option value="zanahoria">Zanahoria</option>
                </select>

                <label>Sabor de Crema</label>
                <select value={crema} onChange={(e) => setCrema(e.target.value)}>
                  <option value="">Selecciona</option>
                  <option value="vainilla">Vainilla</option>
                  <option value="chocolate">Chocolate</option>
                  <option value="frutilla">Frutilla</option>
                </select>

                <label>Cantidad de personas (mín. 15)</label>
                <input
                  type="number"
                  min="15"
                  value={personas}
                  onChange={(e) => setPersonas(Number(e.target.value))}
                />

                <label>Tipo de Relleno</label>
                <select value={relleno} onChange={(e) => setRelleno(e.target.value)}>
                  <option value="">Selecciona</option>
                  <option value="frutilla">Frutilla</option>
                  <option value="manjar">Manjar</option>
                  <option value="cremaPastelera">Crema Pastelera</option>
                </select>

                <label>Extras (opcionales)</label>
                <div className="extras-container">
                  <label>
                    <input
                      type="checkbox"
                      checked={extras.includes("Chips de chocolate")}
                      onChange={() => handleExtraChange("Chips de chocolate")}
                    />
                    Chips de chocolate
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={extras.includes("Nueces")}
                      onChange={() => handleExtraChange("Nueces")}
                    />
                    Nueces
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={extras.includes("Chispitas de estrellas")}
                      onChange={() => handleExtraChange("Chispitas de estrellas")}
                    />
                    Chispitas de estrellas
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={extras.includes("Chispitas de corazones")}
                      onChange={() => handleExtraChange("Chispitas de corazones")}
                    />
                    Chispitas de corazones
                  </label>
                </div>

                <label>
                  <input
                    type="checkbox"
                    checked={mensaje}
                    onChange={(e) => setMensaje(e.target.checked)}
                  />
                  ¿Agregar mensaje "Feliz cumpleaños"? (sin costo)
                </label>
              </>
            )}
          </div>

          {/* Resumen */}
          <div className="card resumen">
            <h3>Resumen del pedido</h3>
            <p><strong>Categoría:</strong> {opcion}</p>
            {opcion === "torta" && (
              <>
                <p><strong>Personas:</strong> {personas}</p>
                <p><strong>Bizcocho:</strong> {bizcocho}</p>
                <p><strong>Crema:</strong> {crema}</p>
                <p><strong>Relleno:</strong> {relleno}</p>
                {extras.length > 0 && (
                  <p><strong>Extras:</strong> {extras.join(", ")}</p>
                )}
                {mensaje && <p><strong>Mensaje:</strong> Feliz cumpleaños</p>}
              </>
            )}
            <h3>Total: ${calcularTotal()}</h3>
            <button className="btn-agregar" onClick={handleAgregarCarrito}>
              Agregar al carrito
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Postre;
