import "./App.css"

// Pantalla principal: presenta el registro y la lista de pacientes.
function App() {
  return (
    <div className="contenedor">
      <h1>Sistema de Pacientes</h1>
      {/* Campos visuales: el boton aun no tiene un evento para guardar pacientes. */}
      <div className="formulario">
        <h2>
          Registrar Paciente
        </h2>
        <input type="text" placeholder="Nombre del Paciente" />
        <input type="number" placeholder="Edad" />
        <input type="text" placeholder="Especialidad" />
        <button>Guardar Paciente</button>
      </div>
      {/* Estado inicial de la lista; todavia no se muestran datos desde un estado de React. */}
      <div className="lista">
        <h2>Lista de Pacientes</h2>
        <p>No hay pacientes registrados</p>
      </div>
    </div>
  )
}

export default App