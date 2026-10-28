import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <Header />
      
      <Routes>
        {/* tus páginas */}
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}
export default App;