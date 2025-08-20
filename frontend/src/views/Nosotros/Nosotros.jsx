// Nosotros.jsx
import { Header } from '../../componentes/Header';
import { Footer } from '../../componentes/Footer';
import './Nosotros.css';

import img1 from '../../assets/nosotros/torta.jpg';

// Array de desarrolladores
const teamMembers = [
  {
    name: "Cristóbal Tello",
    role: "Desarrollador",
    img: "https://github.com/Cristobal100.png"
  },
  {
    name: "Kiara Rubio",
    role: "Desarrolladora",
    img: "https://github.com/Ki4ra1109.png",
  },
  {
    name: "Agustín Liberona",
    role: "Desarrollador",
    img: "https://github.com/AgustinnLiberona.png"
  }
];

export default function Nosotros() {
  return (
    <>
      <Header /> 
      <div className="nosotros-container"> 
        <div className="nosotros-card"> 
          <h1 className="nosotros-container-tittle">Sobre Nosotros</h1> 
          <div className="nosotros-container-img"> 
            <img src={img1} alt="Foto sobre nosotros" /> 
            </div> 
            <p> Sandra, la mente y corazón detrás de Sabores de Hogar, comenzó su aventura en la repostería tras 
              finalizar un curso que le permitió equiparse y dar vida a su emprendimiento. Lo que inició como tortas para la familia, pronto se convirtió en pedidos personalizados gracias a la 
              recomendación de sus propios clientes. 
              </p> 
              <p> Durante cinco años, Sandra ha trabajado incansablemente para llevar dulzura a cada celebración, gestionando pedidos y pagos de forma remota. 
                Sin embargo, la comunicación por chat y la gestión manual de los pedidos hacían que el proceso fuera lento y menos eficiente. 
                Por eso, decidió apostar por este sistema web: una herramienta pensada para mejorar la atención, agilizar las transacciones y fortalecer el vínculo con sus clientes. 
                Así, Sabores de Hogar evoluciona para que cada pedido sea más fácil, rápido y lleno de amor. </p> 
                </div> 
        </div>
      <div className="separador">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" style={{ display: 'block', transform: 'scaleY(-1)' }}>
          <path 
            fill="#8B5E3C" 
            fillOpacity="1" 
            d="M0,192 C60,240 120,160 180,200 
              C240,240 300,120 360,180 
              C420,240 480,80 540,160 
              C600,240 660,100 720,180 
              C780,260 840,140 900,200 
              C960,260 1020,100 1080,160 
              C1140,220 1200,140 1260,200 
              C1320,260 1380,120 1440,180 
              L1440,320 L0,320 Z">
          </path>
        </svg>
      </div>
      {/* Sección de desarrolladores */}
      <section className="developers-section">
        <h2 className="developers-title">Nuestros Desarrolladores</h2>
        <div className="developers-grid">
          {teamMembers.map((member, index) => (
            <div key={index} className="developer-card">
              <img
                src={member.img}
                alt={member.name}
                className="developer-img"
              />
              <h3 className="developer-name">{member.name}</h3>
              <p className="developer-role">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
