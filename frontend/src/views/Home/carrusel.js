export function obtenerSiguienteIndice(actual, total) {
  return (actual + 1) % total;
}

export function obtenerAnteriorIndice(actual, total) {
  return (actual - 1 + total) % total;
}