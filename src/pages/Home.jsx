import { useState } from 'react';

const imagenes = [
  { src: '/assets/Pakana_carrusel.jpeg', alt: 'Pakana paisaje' },
  { src: '/assets/Curcuma_carrusel.jpeg', alt: 'Curcuma raiz' },
  { src: '/assets/Condimentos_carrusel.jpeg', alt: 'Varios condimentos' },
  { src: '/assets/Hojas_carrusel.jpeg', alt: 'Hojas curcuma' },
];

function Home() {
  const [index, setIndex] = useState(0);

  const atras = () => {
    setIndex((prev) => (prev === 0 ? imagenes.length - 1 : prev - 1));
  };

  const adelante = () => {
    setIndex((prev) => (prev === imagenes.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <div className="carrusel-container">
        <div
          className="carrusel"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {imagenes.map((img) => (
            <div className="carrusel-item" key={img.src}>
              <img src={img.src} alt={img.alt} />
            </div>
          ))}
        </div>

        <button className="carrusel-button prev" onClick={atras}>
          ❮
        </button>
        <button className="carrusel-button next" onClick={adelante}>
          ❯
        </button>
      </div>

      <main>
        <section className="pakana-introduccion">
          <p>
            PAKÁNA es un emprendimiento familiar dedicado a la elaboración y
            comercialización de condimentos molidos, teniendo como producto
            principal la cúrcuma. Seleccionamos cuidadosamente nuestros
            ingredientes y cuidamos cada etapa del proceso para ofrecer productos
            con buen color, aroma y sabor, ideales para acompañar una gran
            variedad de preparaciones.
          </p>
          <p>
            Nuestra esencia nace de la tradición y del gusto por compartir los
            sabores que forman parte de nuestra cocina. En PAKÁNA buscamos llevar
            a cada hogar condimentos de calidad, combinando el trabajo familiar
            con una presentación moderna y cercana, para que nuestros productos
            sean parte de esos momentos especiales que se viven alrededor de la
            mesa.
          </p>
        </section>
      </main>
    </>
  );
}

export default Home;