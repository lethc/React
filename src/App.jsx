import "./App.css"
import { useState } from "react"


// Pantalla principal: presenta el registro y la lista de pacientes.
function App() {

  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");
  const [especialidad, setEspecialidad] = useState("");

  const [pacientes, setPacientes] = useState([]);

  const guardarPaciente = () => {
    const nuevoPaciente = {
      id: Date.now(),
      nombre: nombre,
      edad: edad,
      especialidad: especialidad,
    };

    setPacientes([...pacientes, nuevoPaciente]);
    setNombre("");
    setEdad("");
    setEspecialidad("");
  };

  return (
    <div className="contenedor">
      <h1>Sistema de Pacientes</h1>
      {/* Los campos actualizan el estado y el boton agrega el paciente a la lista. */}
      <div className="formulario">
        <h2>
          Registrar Paciente
        </h2>
        <input type="text" placeholder="Nombre del Paciente" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <input type="number" placeholder="Edad" value={edad} onChange={(e) => setEdad(e.target.value)} />
        <input type="text" placeholder="Especialidad" value={especialidad} onChange={(e) => setEspecialidad(e.target.value)} />
        <button onClick={guardarPaciente}>Guardar Paciente</button>
      </div>
      {/* Muestra el estado pacientes; los registros permanecen solo mientras la pagina esta abierta. */}
      <div className="lista">
        <h2>Lista de Pacientes</h2>
        {pacientes.length === 0 ? (
          <p>No hay pacientes registrados</p>
        ) : (
          pacientes.map((paciente)=>(
            <div key={paciente.id}>
              <p><strong>Nombre: </strong>{paciente.nombre}</p>
              <p><strong>Edad: </strong>{paciente.edad}</p>
              <p><strong>Especialidad: </strong>{paciente.especialidad}</p>
            <hr />
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default App