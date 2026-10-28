import { Link } from 'react-router-dom';
import logo from '../assets/logo_pakana.jpg';  

function Header() {
  return (
    <header className="site-header">
      <Link to="/">
        {/* Mientras no tengas el logo, puedes poner un texto o una imagen temporal */}
        <img className="img-logo" src={logo} alt="Logo" />
      </Link>

      <nav className="Menu-nav">
        <ul>
          <li>
            <Link to="/">Inicio</Link>
          </li>
          <li>
            <Link to="/nosotros">Quienes somos</Link>
          </li>
          <li>
            <Link to="/catalogo">Catalogo</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;