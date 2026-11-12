from zipfile import ZipFile
from pathlib import Path
from hashlib import sha256
from lxml import etree
import json, sys

source = Path(sys.argv[1])
output = Path(sys.argv[2])
if source.resolve() == output.resolve():
    raise SystemExit('Output must be a separate copy.')
NS = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
W = '{%s}' % NS['w']
XML_SPACE = '{http://www.w3.org/XML/1998/namespace}space'

def q(name): return W + name

def replace_paragraph(p, label, value):
    for child in list(p):
        if child.tag != q('pPr'):
            p.remove(child)
    run = etree.SubElement(p, q('r'))
    t = etree.SubElement(run, q('t'))
    t.text = label
    etree.SubElement(run, q('br'))
    run2 = etree.SubElement(p, q('r'))
    t2 = etree.SubElement(run2, q('t'))
    if value.startswith(' ') or value.endswith(' '): t2.set(XML_SPACE, 'preserve')
    t2.text = value

def replace_cell(tc, value):
    ps = tc.findall(q('p'))
    p = ps[0] if ps else etree.SubElement(tc, q('p'))
    for child in list(p):
        if child.tag != q('pPr'): p.remove(child)
    run = etree.SubElement(p, q('r'))
    t = etree.SubElement(run, q('t'))
    t.text = value
    for extra in ps[1:]: tc.remove(extra)

with ZipFile(source, 'r') as zin:
    original_names = zin.namelist()
    original_hashes = {n: sha256(zin.read(n)).hexdigest() for n in original_names}
    doc = etree.fromstring(zin.read('word/document.xml'))
    body = doc.find('.//' + q('body'))
    paragraphs = body.findall(q('p'))
    tables = body.findall(q('tbl'))
    if len(paragraphs) != 34 or [len(t.findall(q('tr'))) for t in tables] != [8,6,3]:
        raise SystemExit('Unexpected document structure; stopping.')

    replace_paragraph(paragraphs[0], '', 'Prueba de usabilidad del inventario de equipos')
    replace_paragraph(paragraphs[1], '', 'Sesión 12 · Grupo 8 · Escenario de persona primeriza simulado; sustituir por resultados reales')
    fields = {
      3: ('Proyecto y grupo:', 'Inventario de Equipos (Smart System), Grupo 8.'),
      4: ('Integrantes o autoría individual:', 'Jorwin Andres Guaza Sinisterra; Daniel Andres Banguero Delgado; Alvaro Stiven Farrufia Rodriguez.'),
      5: ('Tareas principales y observación de la revisión anterior:', 'Encontrar y consultar INV-0049; registrar y corregir un dato obligatorio; editar la ubicación de INV-0049; iniciar y cancelar la eliminación de un equipo de prueba. La revisión anterior identificó falta de búsqueda directa, poca claridad de campos obligatorios, contexto de edición mejorable y confirmación de eliminación poco explícita. No hubo observación con participantes.'),
      6: ('Versión inicial y archivos involucrados:', 'Versión inicial indicada por el equipo: 1.0. Comparación con la versión actualizada tras los cambios. Archivo involucrado: src/screens/PantallaInventario.js.'),
      7: ('Instrucción neutral para el participante:', 'En la aplicación, realiza estas tareas: encuentra INV-0049 y revisa su ubicación; registra un equipo dejando vacío un dato obligatorio y corrígelo; cambia la ubicación de INV-0049 y confirma que se actualizó; por último, inicia la eliminación de un equipo de prueba y cancélala. Avísame al terminar cada tarea.'),
      8: ('Pantalla inicial y resultado esperado:', 'Inicio en Inventario. Se espera que la persona complete las cuatro tareas: encuentre INV-0049 (Servidor Dell PowerEdge, Piso 3 - Pasillo B); registre un equipo corrigiendo el dato obligatorio; cambie y confirme la ubicación; y cancele el borrado dejando el equipo en la lista.'),
      9: ('Inicio/final del cronómetro y límite acordado:', 'Iniciar al terminar de leer cada tarea; detener al completarla y verificar el resultado. Límites propuestos: búsqueda 1 min; registro/corrección 3 min; edición 2 min; eliminación/cancelación 1 min. En la simulación ilustrativa se usan tiempos hipotéticos, no mediciones.'),
      10: ('Qué está implementado y qué está simulado:', 'Implementado en src/screens/PantallaInventario.js: búsqueda por nombre/código, filtros combinables, etiquetas y validación de campos, modo de edición con confirmación y diálogo para eliminar/cancelar. Simulado: el perfil P01 primerizo, sus reacciones y todos los tiempos/resultados ilustrativos. No equivalen a una sesión real.'),
      12: ('Estado de la sesión:', 'No se realizó una sesión con una persona real. Los resultados de P01 incluidos en este documento son una simulación didáctica de una persona que usa la app por primera vez. Sustituirlos por observaciones reales antes de presentarlos como evidencia.'),
      15: ('Hechos observados en la comparación de versiones (revisión de código):', 'Antes: no había búsqueda directa; el formulario no destacaba claramente los campos requeridos; el modo de edición y su confirmación podían identificar mejor el registro/cambio; el diálogo de borrado debía aclarar mejor el elemento y la irreversibilidad. Después: se identifican los cambios en el código, pero no se han observado usuarios.'),
      16: ('Hipótesis sobre la causa:', 'La falta de búsqueda puede obligar a recorrer registros; campos obligatorios poco visibles pueden dificultar corregir formularios; falta de contexto al editar y de una advertencia explícita al borrar puede provocar dudas o errores.'),
      17: ('Prioridad y justificación:', 'Alta provisional: las cuatro tareas afectan operaciones centrales del inventario. Búsqueda reduce esfuerzo de localización; formulario ayuda a completar datos; edición y eliminación requieren evitar cambios equivocados o pérdida de registros. Confirmar con participantes.'),
      18: ('Cambios concretos y archivo modificado:', 'Búsqueda por código/nombre y mensaje sin coincidencias; etiquetas obligatorias/opcionales, errores y foco al primer campo inválido; contexto identificable al editar y confirmación de nueva ubicación; confirmación de borrado con nombre/código, advertencia y opciones claras. Archivo: src/screens/PantallaInventario.js.'),
      19: ('Condiciones observables para comprobar la mejora:', 'Búsqueda: localizar INV-0049 ≤1 min. Registro: corregir el campo obligatorio y guardar ≤3 min. Edición: guardar la nueva ubicación y reconocer confirmación ≤2 min. Eliminación: cancelar y comprobar que el equipo continúa en la lista ≤1 min. Registrar ayuda y errores en cada tarea.'),
      20: ('Resultado y evidencia antes/después:', 'SIMULACIÓN, NO DATO REAL. Antes: búsqueda hipotética no completada al minuto; formulario hipotético requiere ayuda; edición genera duda de confirmación; borrado genera duda sobre cancelar. Después hipotético: 0:35 búsqueda, 1:50 registro, 0:55 edición y 0:30 cancelación, sin ayuda. Reemplazar tiempos y resultados por los observados. Las capturas reales van en la fila Evidencia de la tabla 2.'),
      22: ('Comprobaciones y límites:', 'La revisión confirma cambios en el código fuente. No se ejecutó la app en dispositivo durante esta sesión; no se midió ancho, persistencia ni comportamiento real. Marcar las comprobaciones como “No probado” hasta ejecutarlas. La simulación P01 no es evidencia técnica ni de usuario.'),
      24: ('Participación y aportes:', 'Integrantes: Jorwin Andres Guaza Sinisterra, Daniel Andres Banguero Delgado y Alvaro Stiven Farrufia Rodriguez. P01 es un perfil hipotético primerizo; no es participante real. Distribución individual de aportes: completar según lo realizado por cada integrante.'),
      27: ('Corrección final aplicada:', 'Se implementaron las cuatro mejoras descritas en búsqueda, registro/corrección, edición y eliminación. Los cambios están en src/screens/PantallaInventario.js. Las pruebas con personas siguen pendientes.'),
      28: ('Prueba adicional y resultado:', 'No se realizó una prueba adicional real. Plan: repetir las cuatro tareas con participante primerizo, registrar alias anónimo, versión, dispositivo, tiempos, ayudas y resultado. Añadir capturas reales de ambas versiones.'),
      29: ('¿Repitió participante? ¿Qué limitaciones hubo?:', 'No. No hubo participante real ni repetición. Limitaciones: tiempos/resultados P01 son hipotéticos, sin dispositivo ni ancho medidos, sin capturas reales de prueba y sin revisión docente registrada.'),
      30: ('Conclusión (máximo 8 líneas):', 'Se comparó el código anterior y el actualizado en cuatro tareas de inventario. Se implementaron búsqueda directa, mejor guía para corregir el registro, contexto/confirmación de edición y confirmación clara de borrado. El perfil primerizo y sus tiempos en este documento son simulados. Aún no se puede afirmar una mejora observada. Se deben ejecutar las cuatro tareas con una persona real y reemplazar la simulación por datos y capturas auténticos.'),
      31: ('Código y ubicación de evidencias:', 'Código: src/screens/PantallaInventario.js. En la tabla “Registro de intentos”, fila Evidencia: pegar capturas de la versión anterior en columna Antes y capturas de la nueva en Después. Véase la guía de capturas escrita en esas celdas.'),
      32: ('Siguiente paso para la presentación:', 'Ejecutar la prueba con una persona que no haya usado la app. Usar las mismas instrucciones y condiciones en ambas versiones. Cronometrar cada tarea; anotar éxito, ayudas, dudas y retrocesos; tomar las capturas señaladas en la tabla; sustituir el escenario P01 simulado.'),
      33: ('Verificación final:', 'Cuatro tareas incluidas; cambios de código identificados; P01 y tiempos claramente simulados; no hay resultados reales de participante; capturas reales pendientes; verificar la versión instalada y completar los aportes reales del grupo antes de entregar.')
    }
    for i,(label,value) in fields.items(): replace_paragraph(paragraphs[i], label, value)

    attempt_rows = [
      ('Versión','1.0 antes de los cambios.','1.0 con el código actualizado; comprobar versión de la copia instalada.'),
      ('Alias y experiencia previa','P01 SIMULADO; perfil de primera vez, nunca ha usado la app.','Mismo perfil hipotético P01; no es participante observado.'),
      ('Plataforma, dispositivo y ancho','No definidos; no se realizó sesión ni captura.','No definidos; no se ejecutó en dispositivo.'),
      ('Resultado y tiempo','SIMULADO: búsqueda >1:00/no completa; registro con ayuda ~3:00; edición duda ~1:35; cancelar borrado con duda ~0:50.','SIMULADO: búsqueda 0:35; registro 1:50; edición 0:55; cancelar borrado 0:30. Ejemplo hipotético, no medición.'),
      ('Ayudas, dudas y retrocesos','SIMULADO: recorre lista, duda qué campo es obligatorio, pregunta si guardó edición y confirma qué botón cancela.','SIMULADO: busca por código, corrige error, identifica equipo editado y cancela; sin ayuda hipotética.'),
      ('Evidencia','PEGAR AQUÍ capturas reales de la versión anterior: A1 lista sin búsqueda; A2 formulario; A3 edición; A4 diálogo de borrado. Si no existen, escribir “captura anterior no disponible”.','PEGAR AQUÍ capturas reales de la versión nueva: D1 resultado INV-0049; D2 error y guardado; D3 edición/confirmación; D4 cancelar y equipo conservado. Capturarlas durante una ejecución real.'),
      ('Cambio de condiciones','Línea base descrita por comparación de código; no ejecutada.','Comparación real pendiente. Usar mismas tareas, dispositivo y participante; reemplazar simulación por mediciones.')
    ]
    for ri,vals in enumerate(attempt_rows,1):
      for ci,val in enumerate(vals): replace_cell(tables[0].findall(q('tr'))[ri].findall(q('tc'))[ci],val)

    tech_rows = [
      ('Búsqueda','Encontrar INV-0049 y ver Piso 3 - Pasillo B.','Código actualizado contiene búsqueda por código/nombre; no ejecutado.','No probado en ejecución; evidencia: src/screens/PantallaInventario.js.'),
      ('Registro/corrección','Campo obligatorio vacío muestra error, enfoca campo y permite guardar tras corregirlo.','Código contiene validación y referencias de foco; no ejecutado.','No probado en ejecución; capturas D2 pendientes.'),
      ('Edición','La nueva ubicación se guarda y se confirma con nombre/código.','Código contiene contexto de edición y aviso de ubicación; no ejecutado.','No probado en ejecución; captura D3 pendiente.'),
      ('Eliminación/cancelación','Cancelar conserva registro y lo confirma; confirmar elimina.','Código contiene diálogo y acciones; no ejecutado.','No probado en ejecución; capturas D4 pendientes.'),
      ('Repetición de tareas','Mismas cuatro tareas comparadas bajo condiciones iguales.','No se hizo repetición con persona real.','Pendiente; no declarar cumple hasta ejecutar y registrar.')
    ]
    for ri,vals in enumerate(tech_rows,1):
      for ci,val in enumerate(vals): replace_cell(tables[1].findall(q('tr'))[ri].findall(q('tc'))[ci],val)

    review_rows = [
      ('Revisión docente no registrada','Grupo 8: solicitar y anotar la retroalimentación real.','Pendiente de revisión.'),
      ('Participante P01 simulado; aportes individuales por confirmar','Grupo 8: realizar sesión real y describir tareas reales de cada integrante.','P01/tiempos son simulados; completar evidencia de participante y aportes.')
    ]
    for ri,vals in enumerate(review_rows,1):
      for ci,val in enumerate(vals): replace_cell(tables[2].findall(q('tr'))[ri].findall(q('tc'))[ci],val)

    # Enable repeated headers for all table continuations without changing table structure.
    for table in tables:
      first = table.find(q('tr'))
      trpr = first.find(q('trPr'))
      if trpr is None:
        trpr = etree.Element(q('trPr')); first.insert(0,trpr)
      if trpr.find(q('tblHeader')) is None: etree.SubElement(trpr,q('tblHeader'))

    xml_bytes = etree.tostring(doc, xml_declaration=True, encoding='UTF-8', standalone=True)
    output.parent.mkdir(parents=True,exist_ok=True)
    with ZipFile(output,'w') as zout:
      zout.comment = zin.comment
      for info in zin.infolist():
        zout.writestr(info, xml_bytes if info.filename=='word/document.xml' else zin.read(info.filename))

# Package integrity and content checks.
with ZipFile(output,'r') as z:
  if set(z.namelist()) != set(original_names): raise SystemExit('Package parts changed.')
  changed=[n for n in original_names if n!='word/document.xml' and sha256(z.read(n)).hexdigest()!=original_hashes[n]]
  if changed: raise SystemExit(f'Unexpected package edits: {changed}')
  result=etree.fromstring(z.read('word/document.xml'))
  texts=result.xpath('.//w:t/text()',namespaces=NS)
  all_text=' '.join(texts)
  if 'P01 SIMULADO' not in all_text or 'capturas reales' not in all_text or 'chatbot' in all_text.lower():
    raise SystemExit('Simulation/evidence/content checks failed.')
  print(json.dumps({'output':str(output),'parts':len(original_names),'only_changed':'word/document.xml','simulated_participant_marked':True,'four_tests_only':True,'evidence_placeholders':True},ensure_ascii=False))
