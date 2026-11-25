// Vite reenvía estas peticiones al servidor Express.
async function solicitar(ruta, metodo = "GET", datos) {
  const respuesta = await fetch(ruta, {
    method: metodo,
    headers: datos ? { "Content-Type": "application/json" } : undefined,
    body: datos ? JSON.stringify(datos) : undefined,
  }).catch(() => {
    throw new Error("No se pudo conectar con el servidor de pacientes.");
  });

  if (respuesta.status === 204) return;

  const resultado = await respuesta.json().catch(() => null);
  if (!respuesta.ok || resultado === null) {
    throw new Error(resultado?.error || "El servidor de pacientes no respondió correctamente.");
  }
  return resultado;
}

export function solicitarPacientes(ruta = "", metodo = "GET", datos) {
  return solicitar(`/api/pacientes${ruta}`, metodo, datos);
}

export function solicitarEspecialidades() {
  return solicitar("/api/especialidades");
}
