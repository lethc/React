import { normalizarTexto } from "./texto.js";

export function buscarEspecialidad(catalogo, texto) {
  const nombre = texto.trim();
  if (catalogo.includes(nombre)) return nombre;

  const busqueda = normalizarTexto(nombre);
  return catalogo.find((opcion) => normalizarTexto(opcion) === busqueda);
}
