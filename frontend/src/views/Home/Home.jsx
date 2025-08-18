import { Footer } from '../../componentes/Footer';
import { Header } from '../../componentes/Header';
import './Home.css';

export default function Home() {
  return (
    <div className="home-container">
      <Header/>
      <h1>¡Bienvenido a Sabores de Hogar!</h1>
      <p>Repostería casera con amor 💖</p>
      <Footer/>
    </div>
  );
}