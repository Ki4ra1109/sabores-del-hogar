import { Footer } from '../../componentes/Footer';
import { Header } from '../../componentes/Header';
import './Productos.css';

const tortas = [
  { nombre: 'Torta de Chocolate', precio: '$25.000 - $75.000', img: 'https://plus.unsplash.com/premium_photo-1715015439764-1e8d37d5c6c9?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { nombre: 'Torta de Mora', precio: '$20.000 - $65.000', img: 'https://images.unsplash.com/photo-1559620192-032c4bc4674e?q=80&w=729&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { nombre: 'Torta de Frutilla', precio: '$22.000 - $70.000', img: 'https://plus.unsplash.com/premium_photo-1672192166851-71d218e64544?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { nombre: 'Torta de Zanahoria', precio: '$18.000 - $60.000', img: 'https://plus.unsplash.com/premium_photo-1714669899928-eb0b28430295?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { nombre: 'Torta Red Velvet', precio: '$30.000 - $80.000', img: 'https://plus.unsplash.com/premium_photo-1713920189815-876dbdf5f56e?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { nombre: 'Torta de Limón', precio: '$20.000 - $65.000', img: 'https://plus.unsplash.com/premium_photo-1716918178946-5922b4e8645d?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { nombre: 'Torta de Piña', precio: '$25.000 - $75.000', img: 'https://images.unsplash.com/photo-1633062781822-e32867fe7d4a?q=80&w=1166&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { nombre: 'Torta de Bizcocho Crema', precio: '$28.000 - $78.000', img: 'https://plus.unsplash.com/premium_photo-1671395156605-88b8bccad6c8?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { nombre: 'Torta Selva Negra', precio: '$24.000 - $72.000', img: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?q=80&w=1026&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
];

export default function Productos() {
  return (
    <div className="productos-container">
      <Header />

      <main className="catalogo-body">
        <h1>Tortas</h1>

        <div className="productos-grid">
          {tortas.map((torta, index) => (
            <div key={index} className="producto-card">
              <img src={torta.img} alt={torta.nombre} />
              <h2>{torta.nombre}</h2>
              <p className="precio">{torta.precio}</p>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
