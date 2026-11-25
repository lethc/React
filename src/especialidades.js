// Permite buscar sin tildes y mantiene el nombre oficial al guardar.
export function normalizarEspecialidad(texto) {
  return texto.trim().normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("es");
}

export function buscarEspecialidad(catalogo, texto) {
  const nombre = texto.trim();
  if (catalogo.includes(nombre)) return nombre;

  const busqueda = normalizarEspecialidad(nombre);
  return catalogo.find((opcion) => normalizarEspecialidad(opcion) === busqueda);
}
