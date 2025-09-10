import { useEffect, useMemo, useState } from "react";
import { Header } from "../../componentes/Header";
import { Footer } from "../../componentes/Footer";
import "./Contacto.css";

const initial = { nombre: "", email: "", telefono: "", asunto: "", mensaje: "", hp: "" };

export default function Contacto() {
  useEffect(() => {
    document.body.classList.add("route-contacto");
    return () => document.body.classList.remove("route-contacto");
  }, []);

  const [form, setForm] = useState(initial);
  const [sending, setSending] = useState(false);
  const [okMsg, setOkMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");

  const baseUrl = useMemo(() => import.meta.env.VITE_API_URL ?? "http://localhost:5000", []);

  const errors = useMemo(() => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "Ingresa tu nombre";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Correo no válido";
    if (!form.mensaje.trim() || form.mensaje.trim().length < 10) e.mensaje = "Escribe al menos 10 caracteres";
    return e;
  }, [form]);

  const onChange = (ev) => {
    const { name, value } = ev.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    setOkMsg("");
    setErrMsg("");

    if (form.hp) {
      setOkMsg("Mensaje recibido.");
      setForm(initial);
      return;
    }
    if (Object.keys(errors).length) {
      setErrMsg("Revisa los datos del formulario.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch(`${baseUrl}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre.trim(),
          email: form.email.trim(),
          telefono: form.telefono.trim(),
          asunto: form.asunto.trim(),
          mensaje: form.mensaje.trim(),
        }),
      });

      if (!res.ok) {
        const drafts = JSON.parse(localStorage.getItem("sdh_contact_drafts") || "[]");
        drafts.push({ ...form, ts: new Date().toISOString() });
        localStorage.setItem("sdh_contact_drafts", JSON.stringify(drafts));
        throw new Error("No se pudo enviar. Guardamos un borrador local.");
      }

      setOkMsg("¡Gracias! Tu mensaje fue enviado correctamente.");
      setForm(initial);
    } catch (err) {
      setErrMsg(err.message || "Error al enviar el mensaje.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Header />

      <section className="contacto">
        <header className="contacto-hero">
          <div className="contacto-hero-inner">
            <h1>Contacto</h1>
            <p className="contacto-sub">Estamos para ayudarte. Escríbenos y te responderemos a la brevedad.</p>
          </div>
        </header>

        <div className="contacto-wrap">
          <aside className="contacto-aside" aria-label="Información de contacto">
            <div className="card info-card">
              <h2>Datos de contacto</h2>
              <ul>
                <li><span className="lbl">Email:</span> <a href="mailto:soporte@saboresdelhogar.cl">soporte@saboresdelhogar.cl</a></li>
                <li><span className="lbl">Teléfono:</span> +56 9 1234 5678</li>
                <li><span className="lbl">Dirección:</span> Av. Libertad 1234, Santiago</li>
                <li><span className="lbl">Horario:</span> Lun–Vie 09:00–18:00</li>
              </ul>
              <div className="small-note">
                ¿Dudas sobre pedidos o devoluciones? Incluye tu número de orden para acelerar la gestión.
              </div>
            </div>

            <div className="card info-card">
              <h3>Redes sociales</h3>
              <ul className="rrss">
                <li><a href="https://www.instagram.com/sabores_del_hogar_2025" target="_blank" rel="noreferrer">Instagram</a></li>
                <li><a href="https://web.facebook.com/profile.php?id=61579258721818" target="_blank" rel="noreferrer">Facebook</a></li>
                <li><a href="https://x.com/SDHogar2025" target="_blank" rel="noreferrer">Twitter</a></li>
                <li><a href="https://www.tiktok.com/@saboresdelhogar2" target="_blank" rel="noreferrer">TikTok</a></li>
              </ul>
            </div>
          </aside>

          <article className="card contacto-card">
            <h2>Escríbenos</h2>

            {okMsg && <div className="alert ok">{okMsg}</div>}
            {errMsg && <div className="alert err">{errMsg}</div>}

            <form onSubmit={onSubmit} noValidate>
              <input
                type="text"
                name="hp"
                value={form.hp}
                onChange={onChange}
                className="hp-field"
                autoComplete="off"
                tabIndex={-1}
              />

              <div className="grid">
                <label>
                  <span>Nombre</span>
                  <input
                    name="nombre"
                    type="text"
                    value={form.nombre}
                    onChange={onChange}
                    aria-invalid={!!errors.nombre}
                    required
                  />
                  {errors.nombre && <small className="fld-error">{errors.nombre}</small>}
                </label>

                <label>
                  <span>Correo</span>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={onChange}
                    aria-invalid={!!errors.email}
                    required
                  />
                  {errors.email && <small className="fld-error">{errors.email}</small>}
                </label>

                <label>
                  <span>Teléfono (opcional)</span>
                  <input
                    name="telefono"
                    type="tel"
                    value={form.telefono}
                    onChange={onChange}
                  />
                </label>

                <label>
                  <span>Asunto (opcional)</span>
                  <input
                    name="asunto"
                    type="text"
                    value={form.asunto}
                    onChange={onChange}
                  />
                </label>
              </div>

              <label>
                <span>Mensaje</span>
                <textarea
                  name="mensaje"
                  rows={6}
                  value={form.mensaje}
                  onChange={onChange}
                  aria-invalid={!!errors.mensaje}
                  required
                />
                {errors.mensaje && <small className="fld-error">{errors.mensaje}</small>}
              </label>

              <button className="btn-primary" type="submit" disabled={sending}>
                {sending ? "Enviando..." : "Enviar mensaje"}
              </button>
            </form>
          </article>
        </div>
      </section>

      <Footer />
    </>
  );
}
