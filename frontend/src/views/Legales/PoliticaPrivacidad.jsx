import { useEffect } from "react";
import { Header } from "../../componentes/Header";
import { Footer } from "../../componentes/Footer";
import "./PoliticaPrivacidad.css";

const SCROLL_OFFSET = 140;

export default function PoliticaPrivacidad() {
  useEffect(() => {
    document.body.classList.add("route-privacidad");

    // Scroll suave con compensación por header fijo
    const onLinkClick = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;

      e.preventDefault();
      const y = Math.max(0, el.getBoundingClientRect().top + window.pageYOffset - SCROLL_OFFSET);
      window.scrollTo({ top: y, behavior: "smooth" });
      history.replaceState(null, "", id);
    };

    document.querySelector(".ppg")?.addEventListener("click", onLinkClick);
    return () => {
      document.querySelector(".ppg")?.removeEventListener("click", onLinkClick);
      document.body.classList.remove("route-privacidad");
    };
  }, []);

  return (
    <>
      <Header />

      <section className="ppg" id="top">
        <header className="ppg-hero">
          <div className="ppg-hero-inner">
            <h1>Política de Privacidad</h1>
            <p className="ppg-sub">Cuidamos tus datos y te contamos, de forma clara, cómo los tratamos.</p>
            <p className="ppg-date"><strong>Última actualización:</strong> 01/09/2025</p>
          </div>
        </header>

        <div className="ppg-wrap">
          <aside className="ppg-aside" aria-label="Tabla de contenido">
            <nav className="ppg-toc">
              <strong>Contenido</strong>
              <a href="#responsable">Responsable</a>
              <a href="#alcance">Ámbito de aplicación</a>
              <a href="#datos">Datos que recopilamos</a>
              <a href="#finalidades">Finalidades del tratamiento</a>
              <a href="#base-legal">Base legal</a>
              <a href="#terceros">Encargados y terceros</a>
              <a href="#conservacion">Plazos de conservación</a>
              <a href="#cookies">Cookies necesarias</a>
              <a href="#seguridad">Seguridad y brechas</a>
              <a href="#derechos">Tus derechos y cómo ejercerlos</a>
              <a href="#menores">Menores de edad</a>
              <a href="#cambios-contacto">Cambios y contacto</a>
            </nav>
          </aside>

          <article className="ppg-card">
            <section id="responsable">
              <h2>Responsable</h2>
              <p><strong>Sabores del Hogar</strong> es el responsable del tratamiento de los datos personales tratados en este sitio y en la tienda en línea.</p>
              <p>Correo: <a href="mailto:soporte@saboresdelhogar.cl">soporte@saboresdelhogar.cl</a></p>
              <p>Domicilio comercial de referencia: <em>(completar si corresponde)</em>.</p>
            </section>

            <section id="alcance">
              <h2>Ámbito de aplicación</h2>
              <p>Aplica al sitio web, tienda en línea, formularios de contacto, gestión de pedidos y atención al cliente de Sabores del Hogar dentro de nuestro radio de operación local.</p>
            </section>

            <section id="datos">
              <h2>Datos que recopilamos</h2>
              <ul>
                <li><strong>Cuenta y perfil:</strong> nombre, apellido, email, teléfono, dirección, fecha de nacimiento.</li>
                <li><strong>Pedidos y pagos:</strong> productos, montos, dirección de entrega y estado. <em>No almacenamos los datos completos de tu tarjeta</em>; el cobro se procesa con la pasarela de pago.</li>
                <li><strong>Soporte y comunicaciones:</strong> mensajes que nos envías por formularios o correo.</li>
                <li><strong>Registros técnicos:</strong> IP y fecha/hora en los registros del servidor para seguridad y diagnóstico.</li>
              </ul>
            </section>

            <section id="finalidades">
              <h2>Finalidades del tratamiento</h2>
              <ul>
                <li>Gestionar tu cuenta e identificarte al iniciar sesión.</li>
                <li>Procesar pedidos, despachos locales, cambios y devoluciones.</li>
                <li>Emitir boletas/facturas y cumplir obligaciones contables.</li>
                <li>Atender consultas, soporte y postventa.</li>
                <li>Prevenir fraude y mantener la seguridad del sitio.</li>
                <li>Mejorar el servicio a partir de información agregada y no identificable.</li>
              </ul>
            </section>

            <section id="base-legal">
              <h2>Base legal</h2>
              <ul>
                <li><strong>Ejecución de contrato</strong> (gestión de pedidos y servicios).</li>
                <li><strong>Obligación legal</strong> (contabilidad y tributación).</li>
                <li><strong>Interés legítimo</strong> (seguridad y prevención de fraude).</li>
                <li><strong>Consentimiento</strong> (formularios específicos cuando proceda).</li>
              </ul>
            </section>

            <section id="terceros">
              <h2>Encargados y terceros</h2>
              <p>Compartimos datos solo con proveedores necesarios para operar:</p>
              <ul>
                <li>Hosting del sitio y copias de seguridad.</li>
                <li>Pasarela de pagos y prevención de fraude.</li>
                <li>Correo transaccional (confirmaciones de pedido).</li>
                <li>Logística y despacho dentro de la zona de cobertura, si aplica.</li>
              </ul>
              <p>También podremos compartir datos con autoridades cuando la ley lo exija. <strong>No vendemos</strong> datos personales.</p>
            </section>

            <section id="conservacion">
              <h2>Plazos de conservación</h2>
              <ul>
                <li><strong>Cuenta</strong>: mientras mantengas relación activa.</li>
                <li><strong>Pedidos y documentos tributarios</strong>: por los plazos legales aplicables.</li>
                <li><strong>Soporte</strong>: el tiempo necesario para gestionar y justificar la atención.</li>
              </ul>
              <p>Al vencer los plazos, anonimizamos o eliminamos la información de forma segura.</p>
            </section>

            <section id="cookies">
              <h2>Cookies necesarias</h2>
              <p>Usamos únicamente cookies/almacenamiento local estrictamente necesarios para el funcionamiento del sitio (por ejemplo, sesión y carrito). <strong>No utilizamos</strong> cookies de analítica ni publicidad.</p>
              <ul>
                <li><strong>Necesarias</strong>: sesión, carrito, seguridad.</li>
              </ul>
              <p>Puedes gestionarlas desde la configuración de tu navegador.</p>
            </section>

            <section id="seguridad">
              <h2>Seguridad y brechas</h2>
              <p>Aplicamos medidas razonables (cifrado en tránsito, controles de acceso, registros). Si ocurriera una brecha que te afecte materialmente, tomaremos medidas de contención y te informaremos cuando corresponda.</p>
            </section>

            <section id="derechos">
              <h2>Tus derechos y cómo ejercerlos</h2>
              <p>Puedes solicitar acceso, rectificación, actualización, oposición, portabilidad, limitación o eliminación de tus datos, según la normativa aplicable. Escríbenos a <a href="mailto:soporte@saboresdelhogar.cl">soporte@saboresdelhogar.cl</a> indicando:</p>
              <ul>
                <li>Nombre completo y medio de contacto.</li>
                <li>Descripción clara de tu solicitud.</li>
                <li>Documento que permita verificar tu identidad.</li>
              </ul>
              <p>Responderemos dentro de plazos razonables y legales.</p>
            </section>

            <section id="menores">
              <h2>Menores de edad</h2>
              <p>El sitio no está dirigido a menores de 14 años. Si detectamos datos de menores sin autorización, los eliminaremos razonablemente.</p>
            </section>

            <section id="cambios-contacto">
              <h2>Cambios y contacto</h2>
              <p>Publicaremos aquí cualquier cambio relevante de esta política. Si el cambio es sustancial, podremos notificar por medios visibles en el sitio.</p>
              <p>Dudas o solicitudes: <a href="mailto:soporte@saboresdelhogar.cl">soporte@saboresdelhogar.cl</a>.</p>
            </section>

            <div className="ppg-backtop">
              <a href="#top">Volver arriba</a>
            </div>
          </article>
        </div>
      </section>

      <Footer />
    </>
  );
}
