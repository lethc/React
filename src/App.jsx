import "./App.css"
import { useEffect, useRef, useState } from "react"
import { solicitarEspecialidades, solicitarPacientes } from "./pacientesApi.js"
import CampoEspecialidad from "./CampoEspecialidad.jsx"
import { buscarEspecialidad } from "./especialidades.js"
import { normalizarTexto } from "./texto.js"


const PACIENTES_POR_PAGINA = 2;

// Pantalla principal: presenta el registro y la lista de pacientes.
function App() {

  const nombreRef = useRef(null);
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [especialidades, setEspecialidades] = useState([]);
  const [errorCatalogo, setErrorCatalogo] = useState(false);
  const catalogoDisponible = especialidades.length > 0;

  const [pacientes, setPacientes] = useState([]);
  const [intentoGuardar, setIntentoGuardar] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEspecialidad, setFiltroEspecialidad] = useState("");
  const [paginaSolicitada, setPagina] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [cargaCompleta, setCargaCompleta] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [errorServidor, setErrorServidor] = useState("");

  useEffect(() => {
    let activo = true;

    solicitarPacientes()
      .then((registros) => {
        if (!activo) return;
        setPacientes(registros);
        setCargaCompleta(true);
      })
      .catch((error) => {
        if (activo) setErrorServidor(`${error.message} Recarga la página para volver a intentar.`);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    solicitarEspecialidades()
      .then((catalogo) => {
        if (!activo) return;
        setEspecialidades(catalogo);
        setErrorCatalogo(catalogo.length === 0);
      })
      .catch(() => {
        if (activo) setErrorCatalogo(true);
      });

    return () => { activo = false; };
  }, []);

  // Incluye especialidades antiguas además de las del catálogo.
  const opcionesFiltro = new Map();
  for (const especialidad of [...pacientes.map((paciente) => paciente.especialidad), ...especialidades]) {
    if (especialidad.trim()) opcionesFiltro.set(normalizarTexto(especialidad), especialidad);
  }
  const especialidadesFiltro = [...opcionesFiltro.values()].sort((a, b) => a.localeCompare(b, "es"));
  // El texto parcial muestra sugerencias. El filtro se aplica cuando coincide con una especialidad completa.
  const especialidadSeleccionada = buscarEspecialidad(especialidadesFiltro, filtroEspecialidad);

  // Filtra todos los registros antes de calcular las páginas.
  const nombreBuscado = normalizarTexto(busqueda);
  const especialidadBuscada = normalizarTexto(especialidadSeleccionada || "");
  const filtrosActivos = Boolean(nombreBuscado || especialidadBuscada);
  const resultados = pacientes.filter((paciente) => {
    const coincideNombre = normalizarTexto(paciente.nombre).includes(nombreBuscado);
    const coincideEspecialidad = !especialidadBuscada || normalizarTexto(paciente.especialidad) === especialidadBuscada;
    return coincideNombre && coincideEspecialidad;
  }).reverse();
  const totalPaginas = Math.max(1, Math.ceil(resultados.length / PACIENTES_POR_PAGINA));
  const pagina = Math.min(paginaSolicitada, totalPaginas);
  const inicioPagina = (pagina - 1) * PACIENTES_POR_PAGINA;
  const pacientesVisibles = resultados.slice(inicioPagina, inicioPagina + PACIENTES_POR_PAGINA);

  // El ID del paciente seleccionado activa el modo de edición.
  const [idPacienteEditando, setIdPacienteEditando] = useState(null);
  const modoEdicion = idPacienteEditando !== null;

  // Los avisos aparecen al guardar y se ocultan al completar cada campo.
  const faltaNombre = intentoGuardar && !nombre.trim();
  const faltaEdad = intentoGuardar && !edad.trim();
  const especialidadValida = buscarEspecialidad(especialidades, especialidad);
  const faltaEspecialidad = intentoGuardar && !especialidadValida;

  // Vuelve al modo de registro al guardar o cancelar la edición.
  const limpiarFormulario = () => {
    setNombre("");
    setEdad("");
    setEspecialidad("");
    setIntentoGuardar(false);
    setIdPacienteEditando(null);
  };

  const guardarPaciente = async () => {
    if (!catalogoDisponible || !cargaCompleta || procesando) return;

    setIntentoGuardar(true);
    if (!nombre.trim() || !edad.trim() || !especialidad.trim()) {
      window.alert("Completa el nombre, la edad y la especialidad antes de guardar.");
      return;
    }

    if (!especialidadValida) return;

    const datosPaciente = { nombre, edad: Number(edad), especialidad: especialidadValida };
    setProcesando(true);
    setErrorServidor("");
    try {
      if (modoEdicion) {
        const actualizado = await solicitarPacientes(`/${idPacienteEditando}`, "PUT", datosPaciente);
        setPacientes((listaActual) => listaActual.map((paciente) =>
          paciente.id === actualizado.id ? actualizado : paciente
        ));
      } else {
        const nuevo = await solicitarPacientes("", "POST", datosPaciente);
        setPacientes((listaActual) => [...listaActual, nuevo]);
        setPagina(1);
      }
      limpiarFormulario();
    } catch (error) {
      setErrorServidor(error.message);
    } finally {
      setProcesando(false);
    }
  };

  const eliminarPaciente = async ({ id, nombre }) => {
    if (id === idPacienteEditando) return;

    const confirmado = window.confirm(`¿Deseas eliminar a ${nombre}? Esta acción no se puede deshacer.`);
    if (!confirmado) return;

    setProcesando(true);
    setErrorServidor("");
    try {
      await solicitarPacientes(`/${id}`, "DELETE");
      const pacientesRestantes = pacientes.filter((paciente) => paciente.id !== id);
      setPacientes(pacientesRestantes);

    } catch (error) {
      setErrorServidor(error.message);
    } finally {
      setProcesando(false);
    }
  };

  // Carga los datos en el formulario para que el usuario pueda modificarlos.
  const editarPaciente = (paciente) => {
    setNombre(paciente.nombre);
    setEdad(String(paciente.edad));
    setEspecialidad(paciente.especialidad);
    setIntentoGuardar(false);
    setIdPacienteEditando(paciente.id);
    nombreRef.current?.focus();
  };

  return (
    <main className="contenedor">
      <header className="cabecera">
        <h1>Sistema de pacientes</h1>
      </header>

      {errorServidor && <p className="aviso-servidor" role="alert">{errorServidor}</p>}

      <div className="paneles">
        <section className="formulario" aria-labelledby="titulo-formulario">
          <h2 id="titulo-formulario">{modoEdicion ? "Editar paciente" : "Registrar paciente"}</h2>

          <form noValidate onSubmit={(evento) => { evento.preventDefault(); guardarPaciente(); }}>
            <div className="campo">
              <label htmlFor="nombre">Nombre del paciente</label>
              {faltaNombre && (
                <p id="error-nombre" className="mensaje-error" role="alert">
                  <span aria-hidden="true">⚠️</span> Ingresa el nombre del paciente.
                </p>
              )}
              <input id="nombre" ref={nombreRef} type="text" placeholder="Nombre completo"
                value={nombre} disabled={procesando} aria-invalid={faltaNombre}
                aria-describedby={faltaNombre ? "error-nombre" : undefined}
                onChange={(evento) => setNombre(evento.target.value)} />
            </div>

            <div className="campo">
              <label htmlFor="edad">Edad</label>
              {faltaEdad && (
                <p id="error-edad" className="mensaje-error" role="alert">
                  <span aria-hidden="true">⚠️</span> Ingresa la edad del paciente.
                </p>
              )}
              <input id="edad" type="number" min="0" placeholder="Años"
                value={edad} disabled={procesando} aria-invalid={faltaEdad}
                aria-describedby={faltaEdad ? "error-edad" : undefined}
                onChange={(evento) => setEdad(evento.target.value)} />
            </div>

            <div className="campo">
              <label htmlFor="especialidad">Especialidad</label>
              {faltaEspecialidad && (
                <p id="error-especialidad" className="mensaje-error" role="alert">
                  <span aria-hidden="true">⚠️</span> Elige una especialidad del catálogo.
                </p>
              )}
              {errorCatalogo && (
                <p id="error-catalogo" className="mensaje-error" role="alert">
                  No se pudo cargar el catálogo. Recarga la página para volver a intentar.
                </p>
              )}
              <CampoEspecialidad
                catalogo={especialidades}
                valor={especialidad}
                seleccionValida={especialidadValida}
                onChange={setEspecialidad}
                deshabilitado={procesando || !catalogoDisponible}
                invalido={faltaEspecialidad}
                descripcion={errorCatalogo ? "error-catalogo" : faltaEspecialidad ? "error-especialidad" : undefined}
                placeholder={catalogoDisponible ? "Escribe o elige una especialidad" : errorCatalogo ? "Catálogo no disponible" : "Cargando especialidades…"}
              />
            </div>

            <div className="formulario-acciones">
              <button type="submit" className="boton boton-principal" disabled={procesando || !cargaCompleta || !catalogoDisponible}>
                {modoEdicion ? "Guardar cambios" : "Guardar paciente"}
                <span className="boton-flecha" aria-hidden="true">→</span>
              </button>
              {modoEdicion && (
                <button type="button" className="boton" onClick={limpiarFormulario} disabled={procesando}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="lista" aria-labelledby="titulo-lista" aria-busy={cargando}>
          <div className="lista-encabezado">
            <h2 id="titulo-lista">Lista de pacientes</h2>
            {cargaCompleta && (
              <span className="lista-contador" role="status">
                {filtrosActivos && `${resultados.length} de `}{pacientes.length} {pacientes.length === 1 ? "registro" : "registros"}
              </span>
            )}
          </div>

          {cargaCompleta && pacientes.length > 0 && (
            <div className="lista-filtros" role="search" aria-label="Búsqueda de pacientes">
              <div className="campo">
                <label htmlFor="buscar-paciente">Buscar por nombre</label>
                <input
                  type="search"
                  id="buscar-paciente"
                  placeholder="Escribe un nombre"
                  value={busqueda}
                  onChange={(evento) => {
                    setBusqueda(evento.target.value);
                    setPagina(1);
                  }}
                />
              </div>
              <div className="campo">
                <label htmlFor="filtrar-especialidad">Filtrar por especialidad</label>
                <CampoEspecialidad
                  id="filtrar-especialidad"
                  catalogo={especialidadesFiltro}
                  valor={filtroEspecialidad}
                  seleccionValida={especialidadSeleccionada}
                  onChange={(valor) => {
                    setFiltroEspecialidad(valor);
                    setPagina(1);
                  }}
                  placeholder="Todas las especialidades"
                />
              </div>
            </div>
          )}
          {filtrosActivos && pacientes.length > 0 && resultados.length === 0 && (
            <p className="lista-estado">No se encontraron pacientes que coincidan con los filtros.</p>
          )}
          {cargando && <p className="lista-estado" role="status">Cargando pacientes…</p>}
          {cargaCompleta && pacientes.length === 0 && (
            <p className="lista-estado">Todavía no hay pacientes registrados.</p>
          )}
          {pacientesVisibles.length > 0 && (
            <div className="pacientes-tarjetas">
              {pacientesVisibles.map((paciente) => (
                <article
                  className="paciente-tarjeta"
                  key={paciente.id}
                  data-editando={paciente.id === idPacienteEditando ? "true" : undefined}
                >
                  <div className="paciente-info">
                    <h3>{paciente.nombre}</h3>
                    <dl className="paciente-datos">
                      <div>
                        <dt>Edad</dt>
                        <dd>{paciente.edad} {Number(paciente.edad) === 1 ? "año" : "años"}</dd>
                      </div>
                      <div>
                        <dt>Especialidad</dt>
                        <dd>{paciente.especialidad}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="paciente-acciones">
                    <button
                      type="button"
                      className="boton boton-editar"
                      aria-label={`Editar paciente ${paciente.nombre}`}
                      disabled={procesando}
                      onClick={() => editarPaciente(paciente)}
                    >
                      Editar <span aria-hidden="true">→</span>
                    </button>
                    <button
                      type="button"
                      className="boton boton-eliminar"
                      disabled={procesando || paciente.id === idPacienteEditando}
                      aria-label={`Eliminar paciente ${paciente.nombre}`}
                      onClick={() => eliminarPaciente(paciente)}
                    >
                      Eliminar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {totalPaginas > 1 && (
            <nav className="pacientes-paginacion" aria-label="Paginación de pacientes">
              <button type="button" aria-label="Página anterior" disabled={pagina === 1}
                onClick={() => setPagina(pagina - 1)}>
                <span aria-hidden="true">‹</span>
              </button>
              <span aria-live="polite">Página {pagina} de {totalPaginas}</span>
              <button type="button" aria-label="Página siguiente" disabled={pagina === totalPaginas}
                onClick={() => setPagina(pagina + 1)}>
                <span aria-hidden="true">›</span>
              </button>
            </nav>
          )}
        </section>
      </div>
    </main>
  );
}

export default App
