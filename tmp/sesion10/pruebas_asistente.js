const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const URL = 'http://127.0.0.1:8091';
const OUTPUT_DIR = 'C:/Users/asini/Downloads/Proyecto/tmp/sesion10/evidencias';
const STORAGE_KEY = '@inventario_equipos_web';
const EQUIPOS = [
  { id: '1', codigo: 'INV-0001', nombre: 'PC Escritorio 01', ubicacion: 'Oficina Admin', estado: 'Operativo' },
  { id: '2', codigo: 'INV-0002', nombre: 'Laptop Dell 14"', ubicacion: 'Soporte Técnico', estado: 'En reparación' },
  { id: '3', codigo: 'INV-0003', nombre: 'Impresora HP LaserJet', ubicacion: 'Recepción', estado: 'Operativo' },
  { id: '4', codigo: 'INV-0004', nombre: 'PC Escritorio 02', ubicacion: 'Bodega', estado: 'Dado de baja' },
];

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

function normalizar(texto) {
  return String(texto).replace(/\s+/g, ' ').trim();
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  });
  const context = await browser.newContext({ viewport: { width: 390, height: 1000 } });
  await context.addInitScript(({ key, equipos }) => {
    if (!window.localStorage.getItem(key)) {
      window.localStorage.setItem(key, JSON.stringify(equipos));
    }
  }, { key: STORAGE_KEY, equipos: EQUIPOS });

  const page = await context.newPage();
  const erroresConsola = [];
  page.on('console', (mensaje) => {
    if (mensaje.type() === 'error') erroresConsola.push(mensaje.text());
  });
  page.on('pageerror', (error) => erroresConsola.push(error.message));

  const resultados = [];
  const registrar = (caso, entrada, esperado, observado, cumple) => {
    resultados.push({ caso, entrada, esperado, observado: normalizar(observado), cumple });
  };

  async function abrirAsistente() {
    await page.locator('[data-testid="alternar-asistente-ia"]').waitFor();
    const visible = await page.locator('[data-testid="asistente-ia"]').count();
    if (!visible) await page.locator('[data-testid="alternar-asistente-ia"]').click();
    await page.locator('[data-testid="asistente-ia"]').waitFor();
  }

  async function consultar(pregunta) {
    const entrada = page.locator('[data-testid="pregunta-ia"]');
    await entrada.fill(pregunta);
    await page.locator('[data-testid="consultar-ia"]').click();
    return page.locator('[data-testid="resultado-ia"]').innerText();
  }

  async function capturar(nombre) {
    await page.locator('[data-testid="resultado-ia"]').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(OUTPUT_DIR, nombre), fullPage: false });
  }

  await page.goto(URL, { waitUntil: 'networkidle' });
  await abrirAsistente();

  let observado = await consultar('¿Dónde está ubicado?');
  registrar(
    'Ubicación',
    '¿Dónde está ubicado?',
    'Reconocer ubicación y mostrar Oficina Admin.',
    observado,
    observado.includes('ubicación') && observado.includes('Oficina Admin')
  );
  await capturar('02-ubicacion.png');

  observado = await consultar('¿Cómo se llama?');
  registrar(
    'Nombre',
    '¿Cómo se llama?',
    'Reconocer nombre y mostrar PC Escritorio 01.',
    observado,
    observado.includes('nombre') && observado.includes('PC Escritorio 01')
  );
  await capturar('01-nombre.png');

  observado = await consultar('¿En qué estado se encuentra?');
  registrar(
    'Estado',
    '¿En qué estado se encuentra?',
    'Reconocer estado y mostrar Operativo.',
    observado,
    observado.includes('estado') && observado.includes('Operativo')
  );
  await capturar('03-estado.png');

  observado = await consultar('   ');
  registrar(
    'Vacío',
    'Enviar tres espacios.',
    'Solicitar que se escriba una pregunta.',
    observado,
    observado.includes('Escribe una pregunta')
  );

  observado = await consultar('¿Va a llover mañana?');
  registrar(
    'Fuera de alcance',
    '¿Va a llover mañana?',
    'Mostrar una respuesta alternativa.',
    observado,
    observado.includes('No identifico una sola intención')
  );
  await capturar('04-respuesta-alternativa.png');

  observado = await consultar('nombre estado');
  registrar(
    'Ambigüedad',
    'nombre estado',
    'Mostrar una respuesta alternativa por empate.',
    observado,
    observado.includes('No identifico una sola intención')
  );

  await page.evaluate(({ key }) => {
    const equipoSinUbicacion = [
      { id: 'x', codigo: 'INV-PRUEBA', nombre: 'Equipo temporal', estado: 'Operativo' },
    ];
    window.localStorage.setItem(key, JSON.stringify(equipoSinUbicacion));
  }, { key: STORAGE_KEY });
  await page.reload({ waitUntil: 'networkidle' });
  await abrirAsistente();
  observado = await consultar('¿Dónde está ubicado?');
  registrar(
    'Dato ausente',
    'Equipo temporal sin ubicación.',
    'Mostrar Dato no registrado sin inventar contenido.',
    observado,
    observado.includes('Dato no registrado en el inventario')
  );

  await page.evaluate(({ key, equipos }) => {
    window.localStorage.setItem(key, JSON.stringify(equipos));
  }, { key: STORAGE_KEY, equipos: EQUIPOS });
  await page.reload({ waitUntil: 'networkidle' });
  await abrirAsistente();

  observado = await consultar('No quiero saber la ubicación');
  registrar(
    'Negación',
    'No quiero saber la ubicación.',
    'Registrar la limitación del modelo basado en palabras.',
    observado,
    observado.includes('ubicación') && observado.includes('Oficina Admin')
  );

  await page.locator('[data-testid="siguiente-equipo"]').click();
  const equipoSeleccionado = await page.locator('[data-testid="equipo-seleccionado"]').innerText();
  observado = await consultar('¿Dónde está ubicado?');
  registrar(
    'Cambio de equipo',
    'Seleccionar el siguiente equipo y consultar ubicación.',
    'Mostrar Laptop Dell 14 y Soporte Técnico.',
    `${equipoSeleccionado}. ${observado}`,
    equipoSeleccionado.includes('Laptop Dell 14') && observado.includes('Soporte Técnico')
  );
  await capturar('05-cambio-equipo.png');

  const entradaPequena = await page.locator('[data-testid="pregunta-ia"]').boundingBox();
  const botonPequeno = await page.locator('[data-testid="consultar-ia"]').boundingBox();
  const apilado = botonPequeno.y >= entradaPequena.y + entradaPequena.height;

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.waitForTimeout(250);
  const entradaAmplia = await page.locator('[data-testid="pregunta-ia"]').boundingBox();
  const botonAmplio = await page.locator('[data-testid="consultar-ia"]').boundingBox();
  const enFila = Math.abs(botonAmplio.y - entradaAmplia.y) <= 4 && botonAmplio.x > entradaAmplia.x;
  registrar(
    'Adaptación',
    'Comparar anchos de 390 px y 1280 px.',
    'Formulario apilado en ancho pequeño y en fila en ancho amplio.',
    `390 px: ${apilado ? 'apilado' : 'no apilado'}. 1280 px: ${enFila ? 'en fila' : 'fuera de fila'}.`,
    apilado && enFila
  );
  await capturar('06-ancho-amplio.png');

  const salida = {
    plataforma: 'Google Chrome en Windows',
    anchos: [390, 1280],
    fecha: new Date().toISOString(),
    resultados,
    total: resultados.length,
    aprobados: resultados.filter((resultado) => resultado.cumple).length,
    erroresConsola,
  };
  fs.writeFileSync(path.join(OUTPUT_DIR, 'resultados-pruebas.json'), JSON.stringify(salida, null, 2));
  console.log(JSON.stringify(salida, null, 2));

  await browser.close();
  if (salida.aprobados !== 10 || erroresConsola.length) process.exit(1);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
