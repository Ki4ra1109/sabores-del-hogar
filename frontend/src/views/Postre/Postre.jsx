import { Footer } from '../../componentes/Footer';
import { Header } from '../../componentes/Header';
import { useState } from 'react';
import './Postre.css';

export const Postre = () => {
    const [opcion, setOpcion] = useState('');
    const [bizcocho, setBizcocho] = useState('');
    const [relleno, setRelleno] = useState('');
    const [ingredienteExtra1, setIngredienteExtra1] = useState(false);
    const [ingredienteExtra2, setIngredienteExtra2] = useState(false);
    const [ingredienteExtra3, setIngredienteExtra3] = useState(false);
    const [crema, setCrema] = useState('');
    const [personas, setPersonas] = useState(15); // Para tortas
    const [cantidad, setCantidad] = useState(6); // Para cupcakes

    const precios = {
        basePersona: 1000,
        gananciaFija: 7000,
        bizcocho: 3000,
        relleno: 2500,
        extra: 1500,
        crema: 2000,
    };

    const calcularTotalTorta = () => {
        if (opcion !== 'torta') return 0;
        const cant = Math.max(15, Number(personas) || 15);
        let total = cant * precios.basePersona + precios.gananciaFija;
        if (bizcocho) total += precios.bizcocho;
        if (relleno) total += precios.relleno;
        if (crema) total += precios.crema;
        if (ingredienteExtra1) total += precios.extra;
        if (ingredienteExtra2) total += precios.extra;
        return total;
    };

    const calcularTotalCupcake = () => {
        if (opcion !== 'cupcake') return 0;
        const cant = Math.max(6, Number(cantidad) || 6);
        let total = cant * precios.basePersona + precios.gananciaFija;
        if (bizcocho) total += precios.bizcocho;
        if (relleno) total += precios.relleno;
        if (ingredienteExtra1) total += precios.extra;
        if (ingredienteExtra2) total += precios.extra;
        if (ingredienteExtra3) total += precios.extra;
        if (crema) total += precios.crema;
        return total;
    };

    const onChangePersonas = (e) => {
        const v = Number(e.target.value);
        setPersonas(isNaN(v) ? 15 : Math.max(15, v));
    };

    const onChangeCantidades = (e) => {
        const v = Number(e.target.value);
        setCantidad(isNaN(v) ? 6 : Math.max(6, v));
    };

    return (
        <>
            <Header />
            <div className="postre-container">
                <div className="postre-card">
                    <h2>Arma tu Postre</h2>

                    {/* formulario principal*/}
                    <label>¿Qué deseas preparar?</label>
                    <select value={opcion} onChange={(e) => setOpcion(e.target.value)}>
                        <option value="">Selecciona una opción</option>
                        <option value="torta">Torta</option>
                        <option value="galleta">Galletas</option>
                        <option value="cupcake">Cupcakes</option>
                    </select>

                    {/* Torta */}
                    {opcion === 'torta' && (
                        <>
                            <label>Cantidad de personas (mín. 15)</label>
                            <input
                                type="number"
                                min={15}
                                value={personas}
                                onChange={onChangePersonas}
                            />

                            <label>Tipo de Bizcocho</label>
                            <select value={bizcocho} onChange={(e) => setBizcocho(e.target.value)}>
                                <option value="">Selecciona</option>
                                <option value="vainilla">Vainilla</option>
                                <option value="chocolate">Chocolate</option>
                                <option value="redvelvet">Red Velvet</option>
                            </select>

                            <label>Tipo de Relleno</label>
                            <select value={relleno} onChange={(e) => setRelleno(e.target.value)}>
                                <option value="">Selecciona</option>
                                <option value="frutilla">Frutilla</option>
                                <option value="manjar">Manjar</option>
                                <option value="cremaPastelera">Crema Pastelera</option>
                            </select>

                            <label>Ingredientes Extra (Opcionales)</label>
                            <div className="checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={ingredienteExtra1}
                                        onChange={() => setIngredienteExtra1(!ingredienteExtra1)}
                                    />
                                    Chips de chocolate
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={ingredienteExtra2}
                                        onChange={() => setIngredienteExtra2(!ingredienteExtra2)}
                                    />
                                    Nueces
                                </label>
                            </div>

                            <label>Sabor de Crema</label>
                            <select value={crema} onChange={(e) => setCrema(e.target.value)}>
                                <option value="">Selecciona</option>
                                <option value="vainilla">Vainilla</option>
                                <option value="chocolate">Chocolate</option>
                                <option value="frutilla">Frutilla</option>
                            </select>

                            <div className="total-precio">
                                <h3>Total estimado: <strong>${calcularTotalTorta().toLocaleString('es-CL')}</strong></h3>
                            </div>
                        </>
                    )}

                    {/* Cupcakes */}
                    {opcion === 'cupcake' && (
                        <>
                            <label>Cantidad de cupcakes (mín. 6)</label>
                            <input
                                type="number"
                                min={6}
                                value={cantidad}
                                onChange={onChangeCantidades}
                            />

                            <label>Tipo de Bizcocho</label>
                            <select value={bizcocho} onChange={(e) => setBizcocho(e.target.value)}>
                                <option value="">Selecciona</option>
                                <option value="vainilla">Vainilla</option>
                                <option value="chocolate">Chocolate</option>
                                <option value="redvelvet">Red Velvet</option>
                            </select>

                            <label>Tipo de Relleno</label>
                            <select value={relleno} onChange={(e) => setRelleno(e.target.value)}>
                                <option value="">Selecciona</option>
                                <option value="frutilla">Frutilla</option>
                                <option value="manjar">Manjar</option>
                                <option value="cremaPastelera">Crema Pastelera</option>
                            </select>

                            <label>Ingredientes Extra (Opcionales)</label>
                            <div className="checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={ingredienteExtra1}
                                        onChange={() => setIngredienteExtra1(!ingredienteExtra1)}
                                    />
                                    Chips de chocolate
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={ingredienteExtra2}
                                        onChange={() => setIngredienteExtra2(!ingredienteExtra2)}
                                    />
                                    Nueces
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={ingredienteExtra3}
                                        onChange={() => setIngredienteExtra3(!ingredienteExtra3)}
                                    />
                                    Chips de colores
                                </label>
                            </div>

                            <label>Sabor de Crema</label>
                            <select value={crema} onChange={(e) => setCrema(e.target.value)}>
                                <option value="">Selecciona</option>
                                <option value="vainilla">Vainilla</option>
                                <option value="chocolate">Chocolate</option>
                                <option value="frutilla">Frutilla</option>
                            </select>

                            <div className="total-precio">
                                <h3>Total estimado: <strong>${calcularTotalCupcake().toLocaleString('es-CL')}</strong></h3>
                            </div>
                        </>
                    )}

                    {opcion === 'galleta' && (
                        <div>
                            {/* datos pa la galleta */}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Postre;
