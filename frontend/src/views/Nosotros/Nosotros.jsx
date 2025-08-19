import { Header } from '../../componentes/Header';
import { Footer } from '../../componentes/Footer';
import './Nosotros.css';

export default function Nosotros() {
  return (
    <>
      <Header />
      <div className="nosotros-container">
        <h1>Sobre Nosotros</h1>
        <p>
          Sandra, la mente y corazón detrás de Sabores de Hogar, comenzó su aventura en la repostería tras finalizar un curso que le permitió equiparse y dar vida a su emprendimiento. Lo que inició como tortas para la familia, pronto se convirtió en pedidos personalizados gracias a la recomendación de sus propios clientes.
        </p>
        <p>
          Durante cinco años, Sandra ha trabajado incansablemente para llevar dulzura a cada celebración, gestionando pedidos y pagos de forma remota. Sin embargo, la comunicación por chat y la gestión manual de los pedidos hacían que el proceso fuera lento y menos eficiente. Por eso, decidió apostar por este sistema web: una herramienta pensada para mejorar la atención, agilizar las transacciones y fortalecer el vínculo con sus clientes. Así, Sabores de Hogar evoluciona para que cada pedido sea más fácil, rápido y lleno de amor.
        </p>
      </div>
      <Footer />
    </>
  );
}
