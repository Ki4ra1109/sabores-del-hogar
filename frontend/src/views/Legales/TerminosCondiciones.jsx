import { useEffect } from "react";
import { Header } from "../../componentes/Header";
import { Footer } from "../../componentes/Footer";
// Reutilizamos el mismo CSS de la política (misma UI .ppg)
import "./PoliticaPrivacidad.css";

const SCROLL_OFFSET = 140;

export default function TerminosCondiciones() {
  // aplica compensación del header solo en esta vista
  useEffect(() => {
    document.body.classList.add("route-privacidad");

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
            <h1>Términos y Condiciones</h1>
            <p className="ppg-sub">Reglas de uso del sitio, compras y servicio.</p>
            <p className="ppg-date"><strong>Última actualización:</strong> 01/09/2025</p>
          </div>
        </header>

        <div className="ppg-wrap">
          <aside className="ppg-aside" aria-label="Tabla de contenido">
            <nav className="ppg-toc">
              <strong>Contenido</strong>
              <a href="#identificacion">Identificación y alcance</a>
              <a href="#aceptacion">Aceptación</a>
              <a href="#capacidad">Capacidad y cuentas</a>
              <a href="#pedido">Proceso de pedido</a>
              <a href="#precios">Precios y facturación</a>
              <a href="#pago">Pago</a>
              <a href="#personalizados">Pedidos personalizados</a>
              <a href="#entrega">Entrega / retiro</a>
              <a href="#cancelaciones">Cancelaciones y devoluciones</a>
              <a href="#promos">Promociones y cupones</a>
              <a href="#alergenos">Alérgenos e info</a>
              <a href="#propiedad">Propiedad intelectual</a>
              <a href="#uso">Uso del sitio</a>
              <a href="#responsabilidad">Limitación de responsabilidad</a>
              <a href="#fuerza-mayor">Fuerza mayor</a>
              <a href="#privacidad">Privacidad y cookies</a>
              <a href="#soporte">Atención al cliente</a>
              <a href="#cambios">Modificaciones</a>
              <a href="#ley">Ley aplicable</a>
              <a href="#contacto">Contacto</a>
            </nav>
          </aside>

          <article className="ppg-card">
            <section id="identificacion">
              <h2>Identificación y alcance</h2>
              <p><strong>Sabores del Hogar</strong> opera este sitio y la tienda en línea dentro de un radio de operación local. Estos términos aplican a la navegación, registro y compras realizadas en el sitio.</p>
            </section>

            <section id="aceptacion">
              <h2>Aceptación</h2>
              <p>Al usar el sitio aceptas estos Términos y Condiciones. Si no estás de acuerdo, por favor no utilices el sitio.</p>
            </section>

            <section id="capacidad">
              <h2>Capacidad y cuentas</h2>
              <ul>
                <li>Debes ser mayor de 18 años o contar con autorización de tu representante.</li>
                <li>Eres responsable de la veracidad de los datos de tu cuenta y de mantener tu contraseña segura.</li>
              </ul>
            </section>

            <section id="pedido">
              <h2>Proceso de pedido</h2>
              <ul>
                <li>El contrato se forma cuando recibes la confirmación del pedido.</li>
                <li>Las imágenes son referenciales; puede existir variación razonable en presentación.</li>
                <li>Los pedidos están sujetos a disponibilidad de insumos y capacidad de producción.</li>
              </ul>
            </section>

            <section id="precios">
              <h2>Precios y facturación</h2>
              <ul>
                <li>Los precios se muestran en CLP e incluyen impuestos, salvo indicación distinta.</li>
                <li>Emitimos boleta/factura electrónica según normativa vigente.</li>
              </ul>
            </section>

            <section id="pago">
              <h2>Pago</h2>
              <ul>
                <li>Aceptamos los medios informados en el checkout.</li>
                <li>No almacenamos los datos completos de tu tarjeta; el cobro lo procesa la pasarela de pago.</li>
                <li>El pedido puede anularse si el pago no es aprobado.</li>
              </ul>
            </section>

            <section id="personalizados">
              <h2>Pedidos personalizados</h2>
              <ul>
                <li>Se cotizan con anticipación y pueden requerir abono no reembolsable.</li>
                <li>Revisa tamaño, sabores, decoración y alérgenos al confirmar.</li>
              </ul>
            </section>

            <section id="entrega">
              <h2>Entrega / retiro</h2>
              <ul>
                <li>Entregamos en la zona y franjas informadas; los tiempos son estimados.</li>
                <li>Retiro en tienda (si aplica) en el horario confirmado.</li>
                <li>Si no es posible entregar por causas ajenas (dirección errónea, sin receptor), se reprograma con posible recargo.</li>
              </ul>
            </section>

            <section id="cancelaciones">
              <h2>Cancelaciones y devoluciones (alimentos perecibles)</h2>
              <ul>
                <li>Cancelaciones sin costo: hasta 24&nbsp;h antes del retiro/entrega (salvo personalizados).</li>
                <li>Personalizados: pueden no ser reembolsables si ya inició la preparación del pedido.</li>
                <li>Si el producto llega en mal estado o erroneo, avísanos dentro de 24&nbsp;h con fotos y boleta para evaluar reposición o devolución.</li>
                <li>No aceptamos devoluciones de productos abiertos/consumidos salvo defecto comprobado.</li>
              </ul>
            </section>

            <section id="promos">
              <h2>Promociones y cupones</h2>
              <ul>
                <li>Los cupones no son transferibles ni canjeables por dinero.</li>
                <li>Cada campaña indica vigencia, cobertura y exclusiones.</li>
              </ul>
            </section>

            <section id="alergenos">
              <h2>Alérgenos e información</h2>
              <p>Nuestros productos pueden contener o haber estado en contacto con: gluten, huevo, leche, frutos secos, soya. Si tienes alergias, consúltanos antes de comprar.</p>
            </section>

            <section id="propiedad">
              <h2>Propiedad intelectual</h2>
              <p>El contenido del sitio (textos, imágenes, marcas) es propio o usado con autorización. No se puede reproducir sin permiso.</p>
            </section>

            <section id="uso">
              <h2>Uso del sitio</h2>
              <ul>
                <li>No está permitido el uso fraudulento, scraping o acciones que afecten la seguridad/operación.</li>
                <li>Podemos suspender cuentas que incumplan estos términos.</li>
              </ul>
            </section>

            <section id="responsabilidad">
              <h2>Limitación de responsabilidad</h2>
              <p>En la medida permitida por la ley, no somos responsables por daños indirectos o pérdida de datos/ganancia derivados del uso del sitio. Nuestra responsabilidad se limita al valor del pedido afectado.</p>
            </section>

            <section id="fuerza-mayor">
              <h2>Fuerza mayor</h2>
              <p>No seremos responsables por incumplimientos causados por eventos fuera de nuestro control.</p>
            </section>

            <section id="privacidad">
              <h2>Privacidad y cookies</h2>
              <p>El tratamiento de datos personales se rige por nuestra <a href="/politica-privacidad">Política de Privacidad</a>. El sitio puede usar cookies necesarias y, opcionalmente, de preferencia/analítica.</p>
            </section>

            <section id="soporte">
              <h2>Atención al cliente</h2>
              <p>Horario de referencia: <em>(completar si corresponde)</em>. Escribe a <a href="mailto:soporte@saboresdelhogar.cl">soporte@saboresdelhogar.cl</a>.</p>
            </section>

            <section id="cambios">
              <h2>Modificaciones de los términos</h2>
              <p>Podemos actualizar estos términos; publicaremos la versión vigente en esta página. Los cambios sustanciales podrán anunciarse en el sitio.</p>
            </section>

            <section id="ley">
              <h2>Ley aplicable y jurisdicción</h2>
              <p>Estos términos se rigen por las leyes de Chile. Cualquier disputa se someterá a los tribunales de <em>(tu comuna/ciudad)</em>.</p>
            </section>

            <section id="contacto">
              <h2>Contacto</h2>
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
