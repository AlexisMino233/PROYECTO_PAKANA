import React from "react";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Información de la marca */}
        <div className="footer-section">
          <h2>PAKÁNA</h2>
          <p>
            Condimentos molidos elaborados con dedicación,
            llevando sabor, aroma y tradición a tu cocina.
          </p>
        </div>

        {/* Contacto */}
        <div className="footer-section">
          <h3>Contáctanos</h3>
          <p>📱</p>
          <p>
            ✉️{" "}
            <a href="mailto:contacto.pakana@gmail.com">
              contacto.pakana@gmail.com
            </a>
          </p>
        </div>

        {/* Redes sociales */}
        <div className="footer-section">
          <h3>Síguenos</h3>
          <div className="social-links">
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook
            </a>
            <a
              href="https://www.tiktok.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
            >
              TikTok
            </a>
          </div>
        </div>

      </div>
    </footer>
  )
}

export default Footer;