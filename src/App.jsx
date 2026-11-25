import "./App.css"
import { useState } from "react"


// Pantalla principal: presenta el registro y la lista de pacientes.
function App() {

  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");
  const [especialidad, setEspecialidad] = useState("");

  const [pacientes, setPacientes] = useState([]);
  const [intentoGuardar, setIntentoGuardar] = useState(false);

  // Los avisos aparecen al guardar y se ocultan al completar cada campo.
  const faltaNombre = intentoGuardar && !nombre.trim();
  const faltaEdad = intentoGuardar && !edad.trim();
  const faltaEspecialidad = intentoGuardar && !especialidad.trim();

  const guardarPaciente = () => {
    setIntentoGuardar(true);
    // Detiene el registro si falta un dato o solo se escribieron espacios.
    if (!nombre.trim() || !edad.trim() || !especialidad.trim()) {
      window.alert("No es posible registrar un paciente sin completar todos los datos: nombre, edad y especialidad.");
      return;
    }
    const nuevoPaciente = {
      id: Date.now(),
      nombre: nombre,
      edad: edad,
      especialidad: especialidad,
    };

    setPacientes([...pacientes, nuevoPaciente]);
    setIntentoGuardar(false);
    setNombre("");
    setEdad("");
    setEspecialidad("");
  };

  // Recibe el id de la tarjeta y conserva los demas pacientes.
  const eliminarPaciente = (id) => {
    setPacientes((listaActual) => listaActual.filter((paciente) => paciente.id !== id));
  };

  return (
    <div className="contenedor">
      <h1>Sistema de Pacientes</h1>
      {/* Los campos actualizan el estado y el boton agrega el paciente a la lista. */}
      <div className="formulario">
        <h2>
          Registrar Paciente
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
        <button onClick={guardarPaciente}>Guardar Paciente</button>
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