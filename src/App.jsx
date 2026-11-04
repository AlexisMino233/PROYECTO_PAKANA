import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Nosotros from './pages/Nosotros';
import Catalogo from './pages/Catalogo';
import './index.css';
import Login from './pages/Login';
import Admin from './pages/Admin';
import RutaProtegida from './components/RutaProtegida';

function App() {
  return (
    <BrowserRouter>
      <Header />
      
      <Routes>
        {<Route path="/" element={<Home />} />}
        {<Route path="/nosotros" element={<Nosotros />} />}
        {<Route path="/catalogo" element={<Catalogo />} />}
        {<Route path="/login" element={<Login />} />}
        {<Route path="/admin" element={<RutaProtegida><Admin /></RutaProtegida>} />}
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}
export default App;