import { Link } from 'react-router-dom';
import logo from '../assets/logo_pakana.jpg';

function Header() {
  return (
    <header className="site-header">
      <Link to="/">
        <img className="img-logo" src={logo} alt="Logo Pakána" />
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
          <li>
            <Link to="/contacto">Contacto</Link>
          </li>
          <li>
            <Link to="/login">Login</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;