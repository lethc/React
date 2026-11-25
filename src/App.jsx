import "./App.css"
import { useState } from "react"


// Pantalla principal: presenta el registro y la lista de pacientes.
function App() {

  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");
  const [especialidad, setEspecialidad] = useState("");

  const [pacientes, setPacientes] = useState([]);
  const [intentoGuardar, setIntentoGuardar] = useState(false);

  // El ID del paciente seleccionado activa el modo de edición.
  const [idPacienteEditando, setIdPacienteEditando] = useState(null);
  const modoEdicion = idPacienteEditando !== null;

  // Los avisos aparecen al guardar y se ocultan al completar cada campo.
  const faltaNombre = intentoGuardar && !nombre.trim();
  const faltaEdad = intentoGuardar && !edad.trim();
  const faltaEspecialidad = intentoGuardar && !especialidad.trim();

  // Vuelve al modo de registro al guardar, cancelar o eliminar el paciente en edición.
  const limpiarFormulario = () => {
    setNombre("");
    setEdad("");
    setEspecialidad("");
    setIntentoGuardar(false);
    setIdPacienteEditando(null);
  };

  const guardarPaciente = () => {
    setIntentoGuardar(true);
    if (!nombre.trim() || !edad.trim() || !especialidad.trim()) {
      window.alert("Completa el nombre, la edad y la especialidad antes de guardar.");
      return;
    }

    const datosPaciente = { nombre, edad, especialidad };

    // Al editar, conserva el ID y reemplaza solo los datos del paciente seleccionado.
    if (modoEdicion) {
      setPacientes((listaActual) => listaActual.map((paciente) =>
        paciente.id === idPacienteEditando ? { ...paciente, ...datosPaciente } : paciente
      ));
    } else {
      const nuevoPaciente = { id: Date.now(), ...datosPaciente };
      setPacientes((listaActual) => [...listaActual, nuevoPaciente]);
    }

    limpiarFormulario();
  };

  const eliminarPaciente = (id) => {
    setPacientes((listaActual) => listaActual.filter((paciente) => paciente.id !== id));
    if (id === idPacienteEditando) {
      limpiarFormulario();
    }
  };

  // Carga los datos en el formulario para que el usuario pueda modificarlos.
  const editarPaciente = (paciente) => {
    setNombre(paciente.nombre);
    setEdad(paciente.edad);
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
        <input type="text" aria-label="Nombre del paciente" aria-invalid={faltaNombre} aria-describedby={faltaNombre ? "error-nombre" : undefined} placeholder="Nombre del Paciente" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        {faltaEdad && (
          <p id="error-edad" className="mensaje-error" role="alert">
            <span aria-hidden="true">⚠️</span> Ingresa la edad del paciente.
          </p>
        )}
        <input type="number" aria-label="Edad" aria-invalid={faltaEdad} aria-describedby={faltaEdad ? "error-edad" : undefined} placeholder="Edad" value={edad} onChange={(e) => setEdad(e.target.value)} />
        {faltaEspecialidad && (
          <p id="error-especialidad" className="mensaje-error" role="alert">
            <span aria-hidden="true">⚠️</span> Ingresa la especialidad.
          </p>
        )}
        <input type="text" aria-label="Especialidad" aria-invalid={faltaEspecialidad} aria-describedby={faltaEspecialidad ? "error-especialidad" : undefined} placeholder="Especialidad" value={especialidad} onChange={(e) => setEspecialidad(e.target.value)} />
        <div className="formulario-acciones">
          <button type="button" onClick={guardarPaciente}>
            {modoEdicion ? "Guardar cambios" : "Guardar Paciente"}
          </button>
          {modoEdicion && (
            <button type="button" className="boton-cancelar" onClick={limpiarFormulario}>
              Cancelar
            </button>
          )}
        </div>
      </div>
      {/* Muestra el estado pacientes; los registros permanecen solo mientras la pagina esta abierta. */}
      <div className="lista">
        <div className="lista-encabezado">
          <h2>Lista de Pacientes</h2>
          <span className="lista-contador">{pacientes.length} registrados</span>
        </div>
        {pacientes.length === 0 ? (
          <p className="lista-vacia">Todavía no hay pacientes. Completa el formulario para registrar el primero.</p>
        ) : (
          <div className="pacientes-tarjetas">
            {/* Cada tarjeta agrupa el nombre y los datos del paciente. */}
            {pacientes.map((paciente) => (
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
                    onClick={() => editarPaciente(paciente)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="boton-eliminar"
                    aria-label={`Eliminar paciente ${paciente.nombre}`}
                    onClick={() => eliminarPaciente(paciente.id)}
                  >
                    Eliminar paciente
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App