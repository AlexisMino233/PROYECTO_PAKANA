/* ==========================================================================
   PAKÁNA · Carrusel de imágenes (index.html)
   Usa los elementos ya existentes en el HTML: #carrusel, #atras, #adelante
   ========================================================================== */
document.addEventListener('DOMContentLoaded', function () {
  const carrusel = document.getElementById('carrusel');
  const botonAtras = document.getElementById('atras');
  const botonAdelante = document.getElementById('adelante');

  if (!carrusel || !botonAtras || !botonAdelante) return;

  const items = carrusel.querySelectorAll('.carrusel-item');
  const total = items.length;
  let indiceActual = 0;

  function irAImagen(indice) {
    // Permite que el índice "dé la vuelta" en ambos sentidos (carrusel infinito)
    indiceActual = (indice + total) % total;
    const ancho = carrusel.clientWidth;
    carrusel.scrollTo({
      left: ancho * indiceActual,
      behavior: 'smooth'
    });
  }

  botonAdelante.addEventListener('click', function () {
    irAImagen(indiceActual + 1);
  });

  botonAtras.addEventListener('click', function () {
    irAImagen(indiceActual - 1);
  });

  // Si el usuario redimensiona la ventana, recalcula la posición
  // para que la imagen actual siga alineada correctamente
  window.addEventListener('resize', function () {
    irAImagen(indiceActual);
  });

  // Si el usuario desliza manualmente (touch/scroll), mantiene sincronizado
  // el índice actual una vez que termina el desplazamiento
  let temporizadorScroll;
  carrusel.addEventListener('scroll', function () {
    clearTimeout(temporizadorScroll);
    temporizadorScroll = setTimeout(function () {
      const ancho = carrusel.clientWidth;
      indiceActual = Math.round(carrusel.scrollLeft / ancho);
    }, 100);
  });

  // Auto-avance opcional cada 6 segundos (quítalo si no lo quieres)
  setInterval(function () {
    irAImagen(indiceActual + 1);
  }, 6000);
});