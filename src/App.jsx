import "./App.css"
import { useEffect, useState } from "react"
import { solicitarPacientes } from "./pacientesApi.js"


const PACIENTES_POR_PAGINA = 2;

// Pantalla principal: presenta el registro y la lista de pacientes.
function App() {

  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");
  const [especialidad, setEspecialidad] = useState("");

  const [pacientes, setPacientes] = useState([]);
  const [intentoGuardar, setIntentoGuardar] = useState(false);
  const [pagina, setPagina] = useState(1);
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

    return () => { activo = false; };
  }, []);

  const totalPaginas = Math.max(1, Math.ceil(pacientes.length / PACIENTES_POR_PAGINA));
  const inicioPagina = (pagina - 1) * PACIENTES_POR_PAGINA;
  // Invierte una copia para mostrar los más recientes primero sin mutar el estado.
  const pacientesPorRecencia = [...pacientes].reverse();
  const pacientesVisibles = pacientesPorRecencia.slice(inicioPagina, inicioPagina + PACIENTES_POR_PAGINA);

  // El ID del paciente seleccionado activa el modo de edición.
  const [idPacienteEditando, setIdPacienteEditando] = useState(null);
  const modoEdicion = idPacienteEditando !== null;

  // Los avisos aparecen al guardar y se ocultan al completar cada campo.
  const faltaNombre = intentoGuardar && !nombre.trim();
  const faltaEdad = intentoGuardar && !edad.trim();
  const faltaEspecialidad = intentoGuardar && !especialidad.trim();

  // Vuelve al modo de registro al guardar o cancelar la edición.
  const limpiarFormulario = () => {
    setNombre("");
    setEdad("");
    setEspecialidad("");
    setIntentoGuardar(false);
    setIdPacienteEditando(null);
  };

  const guardarPaciente = async () => {
    setIntentoGuardar(true);
    if (!nombre.trim() || !edad.trim() || !especialidad.trim()) {
      window.alert("Completa el nombre, la edad y la especialidad antes de guardar.");
      return;
    }

    const datosPaciente = { nombre, edad: Number(edad), especialidad };
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

      // Si se vacía la última página, vuelve a la última que tenga registros.
      const ultimaPagina = Math.max(1, Math.ceil(pacientesRestantes.length / PACIENTES_POR_PAGINA));
      setPagina((actual) => Math.min(actual, ultimaPagina));
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
  };

  return (
    <div className="contenedor">
      <h1>Sistema de Pacientes</h1>
      {/* El formulario sirve para registrar y editar pacientes. */}
      <div className="formulario">
        <h2>
          {modoEdicion ? "Editar Paciente" : "Registrar Paciente"}
        </h2>
        {faltaNombre && (
          <p id="error-nombre" className="mensaje-error" role="alert">
            <span aria-hidden="true">⚠️</span> Ingresa el nombre del paciente.
          </p>
        )}
        <input type="text" aria-label="Nombre del paciente" aria-invalid={faltaNombre} aria-describedby={faltaNombre ? "error-nombre" : undefined} placeholder="Nombre del Paciente" value={nombre} disabled={procesando} onChange={(e) => setNombre(e.target.value)} />
        {faltaEdad && (
          <p id="error-edad" className="mensaje-error" role="alert">
            <span aria-hidden="true">⚠️</span> Ingresa la edad del paciente.
          </p>
        )}
        <input type="number" aria-label="Edad" aria-invalid={faltaEdad} aria-describedby={faltaEdad ? "error-edad" : undefined} placeholder="Edad" value={edad} disabled={procesando} onChange={(e) => setEdad(e.target.value)} />
        {faltaEspecialidad && (
          <p id="error-especialidad" className="mensaje-error" role="alert">
            <span aria-hidden="true">⚠️</span> Ingresa la especialidad.
          </p>
        )}
        <input type="text" aria-label="Especialidad" aria-invalid={faltaEspecialidad} aria-describedby={faltaEspecialidad ? "error-especialidad" : undefined} placeholder="Especialidad" value={especialidad} disabled={procesando} onChange={(e) => setEspecialidad(e.target.value)} />
        <div className="formulario-acciones">
          <button type="button" onClick={guardarPaciente} disabled={procesando || !cargaCompleta}>
            {modoEdicion ? "Guardar cambios" : "Guardar Paciente"}
          </button>
          {modoEdicion && (
            <button type="button" className="boton-cancelar" onClick={limpiarFormulario} disabled={procesando}>
              Cancelar
            </button>
          )}
        </div>
      </div>
      {/* Muestra los registros cargados desde MongoDB. */}
      <div className="lista">
        <div className="lista-encabezado">
          <h2>Lista de Pacientes</h2>
          <span className="lista-contador">{pacientes.length} registrados</span>
        </div>
        {cargando && <p role="status">Cargando pacientes…</p>}
        {errorServidor && <p className="mensaje-error" role="alert">{errorServidor}</p>}
        {cargaCompleta && pacientes.length === 0 && (
          <p className="lista-vacia">Todavía no hay pacientes. Completa el formulario para registrar el primero.</p>
        )}
        {pacientes.length > 0 && (
          <div className="pacientes-tarjetas">
            {/* Cada tarjeta agrupa el nombre y los datos del paciente. */}
            {pacientesVisibles.map((paciente) => (
              <article className="paciente-tarjeta" key={paciente.id}>
                <dl className="paciente-datos">
                  <div>
                    <dt>Nombre</dt>
                    <dd>{paciente.nombre}</dd>
                  </div>
                  <div>
                    <dt>Edad</dt>
                    <dd>{paciente.edad} {Number(paciente.edad) === 1 ? "año" : "años"}</dd>
                  </div>
                  <div>
                    <dt>Especialidad</dt>
                    <dd>{paciente.especialidad}</dd>
                  </div>
                </dl>
                <div className="paciente-acciones">
                  <button
                    type="button"
                    aria-label={`Editar paciente ${paciente.nombre}`}
                    disabled={procesando}
                    onClick={() => editarPaciente(paciente)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="boton-eliminar"
                    disabled={procesando || paciente.id === idPacienteEditando}
                    aria-label={`Eliminar paciente ${paciente.nombre}`}
                    onClick={() => eliminarPaciente(paciente)}
                  >
                    Eliminar paciente
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
        {totalPaginas > 1 && (
          <nav className="pacientes-paginacion" aria-label="Paginación de pacientes">
            <button
              type="button"
              aria-label="Página anterior"
              disabled={pagina === 1}
              onClick={() => setPagina(pagina - 1)}
            >
              <span aria-hidden="true">&lsaquo;</span>
            </button>
            <span aria-live="polite">Página {pagina} de {totalPaginas}</span>
            <button
              type="button"
              aria-label="Página siguiente"
              disabled={pagina === totalPaginas}
              onClick={() => setPagina(pagina + 1)}
            >
              <span aria-hidden="true">&rsaquo;</span>
            </button>
          </nav>
        )}
      </div>
    </div>
  )
}

export default App