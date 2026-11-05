// Clasificador local de preguntas sobre el inventario.
const SINONIMOS = {
  nombre: ['nombre', 'llama', 'llamado', 'codigo', 'identificacion', 'identificar'],
  ubicacion: ['ubicacion', 'donde', 'lugar', 'sitio', 'localizacion', 'encuentra'],
  estado: ['estado', 'condicion', 'operativo', 'reparacion', 'baja', 'funciona', 'funcionamiento'],
  precio: ['precio', 'cuesta', 'costo', 'coste', 'valor', 'vale', 'cuanto', 'pagar'],
  caracteristicas: ['descripcion', 'descripciones', 'caracteristica', 'caracteristicas', 'especificacion', 'especificaciones', 'marca', 'modelo', 'memoria', 'ram', 'almacenamiento', 'capacidad', 'resolucion', 'puertos', 'pulgadas', 'procesador', 'tecnico'],
  responsable: ['responsable', 'asignado', 'asignada', 'usuario', 'encargado', 'dueno', 'propietario'],
  serie: ['serie', 'serial'],
  resumen: ['resumen', 'informacion', 'detalles', 'ficha', 'todo'],
};

export function normalizar(texto = '') {
  return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean).join(' ');
}

export function clasificar(pregunta) {
  const texto = normalizar(pregunta);
  const palabras = new Set(texto.split(' ').filter(Boolean));
  const intenciones = Object.entries(SINONIMOS)
    .filter(([, sinonimos]) => sinonimos.some((palabra) => palabras.has(palabra)))
    .map(([intencion]) => intencion);

  if (intenciones.includes('resumen')) {
    return { intencion: 'resumen', intenciones: ['nombre', 'ubicacion', 'estado', 'precio', 'caracteristicas'], ambigua: false, puntuacion: 1 };
  }

  const pideVariosDatos = /\b(y|tambien|ademas|junto|todos|completo|completa)\b/.test(texto);
  const ambigua = intenciones.length > 1 && !pideVariosDatos;
  return {
    intencion: intenciones.length === 1 ? intenciones[0] : null,
    intenciones,
    ambigua,
    puntuacion: intenciones.length ? 1 : 0,
  };
}