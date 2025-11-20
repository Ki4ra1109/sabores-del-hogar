import React from "react";
import "../UserAdmin.css";
import "./SolicitudesClientes.css";

const READ_LS_KEY = "sdh_contact_read";
const STAR_LS_KEY = "sdh_contact_star";
const ARCHIVE_LS_KEY = "sdh_contact_arch";

const asuntoOptions = ["Felicitaciones", "Sugerencia", "Reclamo", "Otros"];

function safeLoadMap(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function persistMap(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function getItemKey(s) {
  return (
    s.id ??
    s.email ??
    s.correo ??
    s.nombre ??
    String(s.created_at || s.fecha || s.fecha_envio || "")
  );
}

function SolicitudesClientes() {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const [folder, setFolder] = React.useState("bandeja");
  const [tipoFiltro, setTipoFiltro] = React.useState("todas");
  const [tipoOpen, setTipoOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [selectedId, setSelectedId] = React.useState(null);

  const [readMap, setReadMap] = React.useState(() => safeLoadMap(READ_LS_KEY));
  const [starMap, setStarMap] = React.useState(() => safeLoadMap(STAR_LS_KEY));
  const [archiveMap, setArchiveMap] = React.useState(() =>
    safeLoadMap(ARCHIVE_LS_KEY)
  );

  const [replyOpen, setReplyOpen] = React.useState(false);
  const [replyText, setReplyText] = React.useState("");
  const [replySubject, setReplySubject] = React.useState("");
  const [replySending, setReplySending] = React.useState(false);

  React.useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/contacto");
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error al cargar solicitudes", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSolicitudes();
  }, []);

  React.useEffect(() => {
    if (!items.length) {
      setSelectedId(null);
      return;
    }
    setSelectedId((prev) => {
      if (prev && items.some((s) => getItemKey(s) === prev)) return prev;
      return getItemKey(items[0]);
    });
  }, [items]);

  const normalizeSubjectType = (item) =>
    (item.asunto || "").trim().toLowerCase();

  const isRead = (item) => {
    const key = getItemKey(item);
    const stored = !!readMap[key];
    const backend = (item.estado || item.status || "").toLowerCase();
    const backendRead =
      backend.includes("atendido") || backend.includes("resuelto") || backend.includes("respondido");
    return stored || backendRead;
  };

  const isArchived = (item) => !!archiveMap[getItemKey(item)];
  const isStarred = (item) => !!starMap[getItemKey(item)];

  const filteredItems = items
    .filter((item) => {
      const key = getItemKey(item);
      const archived = !!archiveMap[key];

      if (folder === "archivados") {
        if (!archived) return false;
      } else {
        if (archived) return false;
      }

      const read = isRead(item);
      if (folder === "nuevos" && read) return false;
      if (folder === "atendidos" && !read) return false;
      if (folder === "destacados" && !starMap[key]) return false;

      if (tipoFiltro !== "todas") {
        if (normalizeSubjectType(item) !== tipoFiltro.toLowerCase())
          return false;
      }

      if (!q.trim()) return true;
      const query = q.toLowerCase();
      return (
        item.nombre?.toLowerCase().includes(query) ||
        item.email?.toLowerCase().includes(query) ||
        item.correo?.toLowerCase().includes(query) ||
        item.asunto?.toLowerCase().includes(query) ||
        String(item.id || "").includes(query)
      );
    })
    .sort((a, b) => {
      const da = new Date(
        a.created_at || a.fecha || a.fecha_envio || 0
      ).getTime();
      const db = new Date(
        b.created_at || b.fecha || b.fecha_envio || 0
      ).getTime();
      return db - da;
    });

  React.useEffect(() => {
    if (!filteredItems.length) {
      setSelectedId(null);
      return;
    }
    setSelectedId((prev) => {
      if (prev && filteredItems.some((s) => getItemKey(s) === prev)) return prev;
      return getItemKey(filteredItems[0]);
    });
  }, [filteredItems]);

  const selectedItem =
    filteredItems.find((s) => getItemKey(s) === selectedId) || null;

  const formatFecha = (v) => {
    if (!v) return "Sin fecha";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    return d.toLocaleString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const unreadTotal = items.reduce((acc, item) => {
    const key = getItemKey(item);
    if (!key || archiveMap[key]) return acc;
    return isRead(item) ? acc : acc + 1;
  }, 0);

  const starredTotal = items.reduce((acc, item) => {
    const key = getItemKey(item);
    if (!key || archiveMap[key]) return acc;
    return starMap[key] ? acc + 1 : acc;
  }, 0);

  const archivedTotal = items.reduce((acc, item) => {
    const key = getItemKey(item);
    if (!key) return acc;
    return archiveMap[key] ? acc + 1 : acc;
  }, 0);

  const unreadInView = filteredItems.reduce((acc, item) => {
    return isRead(item) ? acc : acc + 1;
  }, 0);

  const etiquetaTipo =
    tipoFiltro === "todas" ? "Todos los tipos de solicitud" : tipoFiltro;

  const seleccionarTipo = (valor) => {
    setTipoFiltro(valor);
    setTipoOpen(false);
  };

  const buildSnippet = (s) => {
    const mensaje = s.mensaje || s.message || "";
    if (!mensaje) return "Sin mensaje";
    return mensaje.length > 90 ? mensaje.slice(0, 90) + "..." : mensaje;
  };

  const handleSelect = (key) => {
    setSelectedId(key);
    setReplyOpen(false);
    setReplyText("");
    setReplySubject("");

    setReadMap((prev) => {
      const next = { ...prev, [key]: true };
      persistMap(READ_LS_KEY, next);
      return next;
    });
  };

  const toggleStar = (item) => {
    const key = getItemKey(item);
    setStarMap((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      persistMap(STAR_LS_KEY, next);
      return next;
    });
  };

  const toggleArchive = (item) => {
    const key = getItemKey(item);
    setArchiveMap((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      persistMap(ARCHIVE_LS_KEY, next);
      return next;
    });
  };

  const markAsUnread = (item) => {
    const key = getItemKey(item);
    setReadMap((prev) => {
      const next = { ...prev, [key]: false };
      persistMap(READ_LS_KEY, next);
      return next;
    });
  };

  const markAllRead = () => {
    setReadMap((prev) => {
      const next = { ...prev };
      filteredItems.forEach((s) => {
        const key = getItemKey(s);
        if (!key) return;
        next[key] = true;
      });
      persistMap(READ_LS_KEY, next);
      return next;
    });
  };

  const clearLocalStates = () => {
    setReadMap({});
    setStarMap({});
    setArchiveMap({});
    persistMap(READ_LS_KEY, {});
    persistMap(STAR_LS_KEY, {});
    persistMap(ARCHIVE_LS_KEY, {});
  };

  const startReply = () => {
    if (!selectedItem) return;
    setReplyOpen(true);

    const nombre = selectedItem.nombre || "";
    const saludo = nombre ? `Hola ${nombre},\n\n` : "Hola,\n\n";
    if (!replyText) {
      setReplyText(
        saludo +
          "Muchas gracias por escribirnos. Lo tendremos en cuenta, muchas gracias.\n"
      );
    }

    const asuntoBase =
      selectedItem.asunto || "Consulta desde Sabores del Hogar";
    if (!replySubject) {
      setReplySubject(`Respuesta: ${asuntoBase}`);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem || !replyText.trim()) return;

    const email = selectedItem.email || selectedItem.correo;
    if (!email) return;

    setReplySending(true);
    try {
      const subjectBase =
        selectedItem.asunto || "Consulta desde Sabores del Hogar";

      const subject =
        (replySubject && replySubject.trim()) ||
        `Respuesta: ${subjectBase}`;

      const res = await fetch(
        "http://localhost:5000/api/contacto/responder",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: selectedItem.id,
            email,
            subject,
            message: replyText.trim(),
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Error al enviar la respuesta");
      }

      const data = await res.json();

      if (data.ok) {
        setItems((prev) =>
          prev.map((s) =>
            s.id === selectedItem.id
              ? { ...s, estado: data.estado || "respondido" }
              : s
          )
        );
      }

      setReplyOpen(false);
      setReplyText("");
      setReplySubject("");
    } catch (err) {
      console.error("Error al enviar la respuesta", err);
    } finally {
      setReplySending(false);
    }
  };

  return (
    <div className="card solicitudes-card">
      <div className="solicitudes-header">
        <div className="solicitudes-header-left">
          <h2>Solicitudes de contacto</h2>
          <p className="solicitudes-sub">
            Bandeja de mensajes enviados desde el formulario de contacto.
          </p>
        </div>

        <div className="solicitudes-header-right">
          <div className="solicitudes-kpi">
            <span className="solicitudes-kpi-label">Nuevos sin leer</span>
            <span className="solicitudes-kpi-value">{unreadTotal}</span>
          </div>
          <div className="solicitudes-header-meta">
            <span>Destacados: {starredTotal}</span>
            <span>·</span>
            <span>Archivados: {archivedTotal}</span>
          </div>
        </div>
      </div>

      <div className="solicitudes-toolbar solicitudes-toolbar-top">
        <div className="solicitudes-filtros">
          <div
            className="chip-group"
            role="tablist"
            aria-label="Carpetas de bandeja"
          >
            <button
              type="button"
              className={`chip ${folder === "bandeja" ? "on" : ""}`}
              onClick={() => setFolder("bandeja")}
            >
              Bandeja
            </button>
            <button
              type="button"
              className={`chip ${folder === "nuevos" ? "on" : ""}`}
              onClick={() => setFolder("nuevos")}
            >
              Nuevos
            </button>
            <button
              type="button"
              className={`chip ${folder === "atendidos" ? "on" : ""}`}
              onClick={() => setFolder("atendidos")}
            >
              Atendidos
            </button>
            <button
              type="button"
              className={`chip ${folder === "destacados" ? "on" : ""}`}
              onClick={() => setFolder("destacados")}
            >
              Destacados
            </button>
            <button
              type="button"
              className={`chip ${folder === "archivados" ? "on" : ""}`}
              onClick={() => setFolder("archivados")}
            >
              Archivados
            </button>
          </div>

          <div className="asunto-select solicitudes-asunto">
            <button
              type="button"
              className="asunto-trigger"
              onClick={() => setTipoOpen((v) => !v)}
            >
              <span>{etiquetaTipo}</span>
            </button>

            <div className={`asunto-menu ${tipoOpen ? "open" : ""}`}>
              <button
                type="button"
                className="asunto-option"
                onClick={() => seleccionarTipo("todas")}
              >
                Todos los tipos de solicitud
              </button>
              {asuntoOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className="asunto-option"
                  onClick={() => seleccionarTipo(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="solicitudes-toolbar-right">
          <div className="solicitudes-search">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nombre, correo o asunto"
            />
          </div>

          <div className="acciones-menu">
            <button
              type="button"
              className="acciones-trigger"
              onClick={() => {}}
            >
              Acciones
            </button>
            <div className="acciones-dropdown">
              <button
                type="button"
                onClick={markAllRead}
                disabled={!filteredItems.length || !unreadInView}
              >
                Marcar todo leído
              </button>
              <button
                type="button"
                onClick={clearLocalStates}
                disabled={
                  !Object.keys(readMap).length &&
                  !Object.keys(starMap).length &&
                  !Object.keys(archiveMap).length
                }
              >
                Limpiar estados locales
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="solicitudes-layout">
          <div className="solicitudes-list-panel skeleton-panel">
            <div className="solicitudes-list-header">
              <div className="solicitudes-list-header-left">
                <span className="solicitudes-list-title">Bandeja de entrada</span>
                <span className="solicitudes-list-counter">Cargando...</span>
              </div>
            </div>
            <div className="skeleton-list">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="skeleton-item">
                  <div className="skeleton-avatar" />
                  <div className="skeleton-lines">
                    <div className="skeleton-line skeleton-line-long" />
                    <div className="skeleton-line skeleton-line-short" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="solicitudes-detail-panel skeleton-panel">
            <div className="skeleton-detail">
              <div className="skeleton-line skeleton-line-title" />
              <div className="skeleton-line skeleton-line-meta" />
              <div className="skeleton-paragraph">
                <div className="skeleton-line skeleton-line-long" />
                <div className="skeleton-line skeleton-line-long" />
                <div className="skeleton-line skeleton-line-short" />
              </div>
              <div className="skeleton-actions">
                <div className="skeleton-btn" />
                <div className="skeleton-btn skeleton-btn-right" />
              </div>
            </div>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="solicitudes-layout-empty">
          <span>No hay solicitudes para los filtros seleccionados.</span>
        </div>
      ) : (
        <div className="solicitudes-layout">
          <div className="solicitudes-list-panel">
            <div className="solicitudes-list-header">
              <div className="solicitudes-list-header-left">
                <span className="solicitudes-list-title">Bandeja de entrada</span>
                <span className="solicitudes-list-counter">
                  {filteredItems.length} mensajes
                </span>
              </div>
              <span className="solicitudes-list-unread">
                Nuevos en vista: {unreadInView}
              </span>
            </div>

            <div className="solicitudes-list">
              {filteredItems.map((s) => {
                const key = getItemKey(s);
                const active = key === selectedId;
                const read = isRead(s);
                const starred = isStarred(s);

                const itemClasses = [
                  "solicitudes-list-item",
                  active ? "solicitudes-list-item-active" : "",
                  read
                    ? "solicitudes-list-item-read"
                    : "solicitudes-list-item-unread",
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <button
                    key={key}
                    type="button"
                    className={itemClasses}
                    onClick={() => handleSelect(key)}
                  >
                    <div className="solicitudes-avatar">
                      {(s.nombre || "S").charAt(0).toUpperCase()}
                    </div>

                    <div className="solicitudes-list-text">
                      <div className="solicitudes-list-line1">
                        <div className="solicitudes-list-line1-left">
                          <span className="solicitudes-list-nombre">
                            {s.nombre || "Sin nombre"}
                          </span>
                          <span className="solicitudes-list-asunto-inline">
                            {s.asunto || "Sin asunto"}
                          </span>
                        </div>
                        <span className="solicitudes-list-fecha">
                          {formatFecha(
                            s.created_at || s.fecha || s.fecha_envio
                          )}
                        </span>
                      </div>

                      <div className="solicitudes-list-line2">
                        <div className="solicitudes-list-snippet">
                          {buildSnippet(s)}
                        </div>
                        <div className="solicitudes-list-tags">
                          <span
                            className={
                              read
                                ? "solicitudes-list-estado-chip leido"
                                : "solicitudes-list-estado-chip nuevo"
                            }
                          >
                            {read ? "Leído" : "Nuevo"}
                          </span>
                          {starred && (
                            <span className="solicitudes-list-star">★</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {!read && (
                      <span
                        className="solicitudes-unread-dot"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="solicitudes-detail-panel">
            {!selectedItem && (
              <div className="solicitudes-detail-empty">
                Selecciona un mensaje de la bandeja para ver el detalle.
              </div>
            )}

            {selectedItem && (
              <div className="solicitudes-detail">
                <div className="mail-detail-header">
                  <div className="mail-detail-main">
                    <h3 className="mail-detail-asunto">
                      {selectedItem.asunto || "Sin asunto"}
                    </h3>
                    <div className="mail-detail-from">
                      <span className="mail-detail-remitente">
                        {selectedItem.nombre || "Sin nombre"}
                      </span>
                      <span className="mail-detail-sep">·</span>
                      <span className="mail-detail-email">
                        {selectedItem.email ||
                          selectedItem.correo ||
                          "Sin correo"}
                      </span>
                      {selectedItem.telefono && (
                        <>
                          <span className="mail-detail-sep">·</span>
                          <span className="mail-detail-phone">
                            {selectedItem.telefono}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mail-detail-meta">
                    <span className="mail-detail-fecha">
                      {formatFecha(
                        selectedItem.created_at ||
                          selectedItem.fecha ||
                          selectedItem.fecha_envio
                      )}
                    </span>
                    <span
                      className={[
                        "badge",
                        "solicitudes-estado-detail",
                        isRead(selectedItem)
                          ? "solicitudes-estado-detail-leido"
                          : "solicitudes-estado-detail-nueva",
                      ].join(" ")}
                    >
                      {isRead(selectedItem) ? "Leído" : "Nuevo"}
                    </span>
                  </div>
                </div>

                <div className="mail-detail-body">
                  <p>{selectedItem.mensaje || selectedItem.message || ""}</p>

                  {replyOpen && (
                    <form
                      className="reply-panel"
                      onSubmit={handleReplySubmit}
                      noValidate
                    >
                      <div className="reply-row">
                        <label>Para</label>
                        <input
                          type="email"
                          value={
                            selectedItem.email ||
                            selectedItem.correo ||
                            "Sin correo"
                          }
                          disabled
                        />
                      </div>
                      <div className="reply-row">
                        <label>Asunto</label>
                        <input
                          type="text"
                          value={replySubject}
                          onChange={(e) => setReplySubject(e.target.value)}
                          placeholder="Asunto de la respuesta"
                        />
                      </div>
                      <div className="reply-row">
                        <label>Mensaje</label>
                        <textarea
                          rows={4}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Escribe la respuesta para el cliente..."
                        />
                      </div>
                      <div className="reply-actions">
                        <button
                          type="submit"
                          className="btn primary"
                          disabled={replySending || !replyText.trim()}
                        >
                          {replySending ? "Enviando..." : "Enviar respuesta"}
                        </button>
                        <button
                          type="button"
                          className="btn ghost"
                          onClick={() => {
                            setReplyOpen(false);
                            setReplyText("");
                            setReplySubject("");
                          }}
                          disabled={replySending}
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                <div className="mail-detail-actions-row">
                  <button
                    type="button"
                    className={`btn sm ${
                      isStarred(selectedItem) ? "primary" : "ghost"
                    }`}
                    onClick={() => toggleStar(selectedItem)}
                  >
                    {isStarred(selectedItem) ? "Quitar destacado" : "Destacar"}
                  </button>
                  <button
                    type="button"
                    className={`btn sm ${
                      isArchived(selectedItem) ? "ghost" : "danger-ghost"
                    }`}
                    onClick={() => toggleArchive(selectedItem)}
                  >
                    {isArchived(selectedItem) ? "Desarchivar" : "Archivar"}
                  </button>
                  {isRead(selectedItem) && (
                    <button
                      type="button"
                      className="btn sm ghost"
                      onClick={() => markAsUnread(selectedItem)}
                    >
                      Marcar como no leído
                    </button>
                  )}
                  <div className="mail-detail-actions-spacer" />
                  <button
                    type="button"
                    className="btn sm primary"
                    onClick={startReply}
                  >
                    Responder
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SolicitudesClientes;