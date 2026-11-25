// Compara nombres y especialidades sin distinguir mayúsculas ni tildes.
export function normalizarTexto(texto) {
  return texto.trim().normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("es");
}
