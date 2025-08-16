import './Home.css';

export default function Home() {
  return (
    <div className="home-container">
      <header>
        <nav className="FondoHeader">
          <img src='../../../public/logoFondoBlanco.svg'></img>
          <h1 className='NombreEmpresa'>Sabores del hogar</h1>
          
          <div className="buscar-container">
            <input
              type="text"
              placeholder="Buscar..."
              className="buscar-input"
            />
            <span className="buscar-icon">🔍</span>
          </div>

        </nav>
        <navbar>

        </navbar>
      </header>
      <h1>¡Bienvenido a Sabores de Hogar!</h1>
      <p>Repostería casera con amor 💖</p>
    </div>
  );
}