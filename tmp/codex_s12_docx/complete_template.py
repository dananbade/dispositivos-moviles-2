from zipfile import ZipFile
from pathlib import Path
from hashlib import sha256
from lxml import etree
import json, sys

source = Path(sys.argv[1])
output = Path(sys.argv[2])
baseline_json = Path(sys.argv[3])
expected_source_sha = 'dc14f19957afc24aec7d3ab2aa9e9eff24c1ed2acf2a1cba35c0a9a88c5496cc'
source_bytes = source.read_bytes()
if sha256(source_bytes).hexdigest() != expected_source_sha:
    raise SystemExit('Reference SHA-256 changed; stopping before editing.')
if source.resolve() == output.resolve():
    raise SystemExit('Output must differ from the retained reference.')

NS = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
W = '{%s}' % NS['w']
XML_SPACE = '{http://www.w3.org/XML/1998/namespace}space'

def q(tag):
    return W + tag

def add_text(run, value):
    t = etree.SubElement(run, q('t'))
    if value.startswith(' ') or value.endswith(' '):
        t.set(XML_SPACE, 'preserve')
    t.text = value
    return t

def clear_content(p):
    for child in list(p):
        if child.tag != q('pPr'):
            p.remove(child)

def set_plain(p, value):
    clear_content(p)
    run = etree.SubElement(p, q('r'))
    add_text(run, value)

def set_labeled(p, label, value):
    clear_content(p)
    run = etree.SubElement(p, q('r'))
    add_text(run, label)
    etree.SubElement(run, q('br'))
    run_value = etree.SubElement(p, q('r'))
    add_text(run_value, value)

def set_cell(tc, value):
    paras = tc.findall(q('p'))
    if not paras:
        p = etree.SubElement(tc, q('p'))
    else:
        p = paras[0]
    set_plain(p, value)
    for extra in paras[1:]:
        tc.remove(extra)

# Keep all source parts except the intended editable Word body part byte-for-byte.
with ZipFile(source, 'r') as zin:
    document = etree.fromstring(zin.read('word/document.xml'))
    body = document.find('.//' + q('body'))
    paragraphs = body.findall(q('p'))
    tables = body.findall(q('tbl'))
    if len(paragraphs) != 34 or len(tables) != 3:
        raise SystemExit(f'Unexpected template structure: {len(paragraphs)} body paragraphs, {len(tables)} tables.')

    # Keep each table's column labels visible when Word carries rows onto another page.
    for table in tables:
        first_row = table.find(q('tr'))
        tr_pr = first_row.find(q('trPr'))
        if tr_pr is None:
            tr_pr = etree.Element(q('trPr'))
            first_row.insert(0, tr_pr)
        if tr_pr.find(q('tblHeader')) is None:
            etree.SubElement(tr_pr, q('tblHeader'))

    set_plain(paragraphs[0], 'Prueba de usabilidad del inventario de equipos')
    set_plain(paragraphs[1], 'Sesión 12 · Dispositivos Móviles II · UNIAJC · Protocolo completado; prueba con participante pendiente')

    protocol = {
        3: ('Proyecto y grupo:', 'App móvil de inventario de equipos · Dispositivos Móviles II · UNIAJC · Grupo no informado.'),
        4: ('Integrantes o autoría individual:', 'Nombres no proporcionados; confirmar la autoría real antes de entregar.'),
        5: ('Tarea principal y observación de la revisión anterior:', 'Localizar un equipo por código y consultar su ubicación. La revisión del código encontró filtros de estado, pero no búsqueda directa; no hubo participante.'),
        6: ('Versión inicial y archivos involucrados:', 'Proyecto 1.0.0 (Expo 58.0.22, React Native 0.88.1). Línea base previa sin búsqueda en src/screens/PantallaInventario.js.'),
        7: ('Instrucción neutral que se leerá al participante:', 'Encuentra el equipo INV-0049 y revisa su ubicación.'),
        8: ('Pantalla inicial y resultado esperado:', 'Inicio en Inventario. Éxito: encontrar Servidor Dell PowerEdge, código INV-0049, y señalar “Piso 3 - Pasillo B” sin ayuda.'),
        9: ('Inicio y final del cronómetro y límite acordado:', 'Iniciar al terminar de leer la instrucción; detener cuando señale código y ubicación correctos. Límite propuesto: 2 minutos; aún no validado.'),
        10: ('Qué está implementado y qué está simulado:', 'Búsqueda por nombre/código y filtros implementados en código. El asistente es local; sensores web usan simulación. Esta tarea no requiere sensores ni cámara.'),
        15: ('Hecho observado (sin interpretar intenciones):', 'Revisión de código, no prueba con persona: había filtros por estado y no existía campo para buscar por nombre o código.'),
        16: ('Hipótesis sobre la causa:', 'Sin búsqueda directa, localizar un activo puede exigir recorrer muchas tarjetas. Es una hipótesis de eficiencia; falta observar a una persona.'),
        17: ('Prioridad y justificación:', 'Media provisional: afecta una tarea central y puede aumentar el tiempo. Elevar a alta si la prueba impide completar la búsqueda.'),
        18: ('Cambio concreto y archivo modificado:', 'Campo de búsqueda por código/nombre, combinado con filtros, botón para limpiar y mensaje sin coincidencias. src/screens/PantallaInventario.js.'),
        19: ('Condición observable para comprobar la mejora:', 'Una persona ajena al desarrollo encuentra INV-0049 y su ubicación en ≤2 min, sin ayuda, con la misma instrucción y dispositivo antes y después.'),
        20: ('Resultado real y evidencia antes/después:', 'No probado con participante: no hay tiempos ni evidencia de uso. El cambio está en el código; no afirmar mejora hasta repetir la tarea.'),
    }
    for index, (label, value) in protocol.items():
        set_labeled(paragraphs[index], label, value)

    set_plain(paragraphs[12], 'Estado de la sesión: no se realizó una prueba con participante ni una autoevaluación manual de la interfaz. No hay alias, tiempos, ayudas ni resultados observados; las comprobaciones de código no sustituyen esos datos.')
    set_plain(paragraphs[22], 'Los anchos indicados abajo son condiciones propuestas, no medidas reales. Web, Android e iOS requieren comprobaciones separadas; el acelerómetro web es simulado y no forma parte de esta tarea.')
    set_plain(paragraphs[24], 'No se proporcionaron nombres ni aportes reales de integrantes; confirmar y registrar la autoría antes de entregar.')

    continuation = {
        27: ('Corrección final aplicada:', 'Búsqueda por nombre/código, compatible con mayúsculas y tildes, combinada con estado; incluye limpiar y explicar cuando no hay coincidencias. También se implementaron formulario etiquetado, edición identificable, confirmación de borrado y selector directo en el chatbot.'),
        28: ('Prueba adicional (alias, versión, condiciones, resultado y ayudas):', 'Pendiente. Repetir en v1.0.0 con participante ajeno al desarrollo: editar INV-0049 y confirmar su ubicación; abrir borrado y cancelar; seleccionar INV-0049 en el chatbot. Registrar alias, dispositivo, ancho, tiempo, dudas y ayudas reales.'),
        29: ('¿Repitió participante? ¿Qué limitaciones hubo?:', 'No; no se ejecutó sesión. Limitaciones: sin participante, interacción real, dispositivo ni ancho medido. La evidencia actual es revisión de código, no comparación de usabilidad.'),
        30: ('Conclusión de máximo 8 líneas:', 'Se implementó búsqueda directa para agilizar la localización de equipos y se conservan los filtros de estado. La condición observable está definida, pero el efecto todavía no se ha medido. La mejora solo podrá confirmarse con una prueba antes/después con participante y condiciones comparables.'),
        31: ('Enlace al código o archivos adjuntos y ubicación del cambio:', 'Código: src/screens/PantallaInventario.js y src/components/AsistenteIA.jsx, en la carpeta del proyecto. Informe completado: Plantilla_Pruebas_Sesion_12_completada.docx, en la raíz del proyecto. No hay enlace público.'),
        32: ('Siguiente paso para la presentación final:', 'Ejecutar la tarea neutral con una persona que no desarrolló la app. Guardar tiempos, ayudas y capturas sin datos personales; repetir en el mismo dispositivo y completar las celdas “Pendiente” con resultados reales.'),
    }
    for index, (label, value) in continuation.items():
        set_labeled(paragraphs[index], label, value)
    set_plain(paragraphs[33], 'Verificación: cambio confirmado en el código; evidencia de participante y anchos reales pendientes; no se incluyen datos personales; sensores simulados identificados; comparación de usabilidad aún no realizada; archivo local sin permisos de enlace que revisar.')

    # Attempt comparison table: actual experience remains unmeasured.
    attempt_rows = [
        ('Versión', '1.0.0 antes de búsqueda; solo filtros de estado.', '1.0.0 con campo de búsqueda en la copia de trabajo.'),
        ('Alias y experiencia previa', 'No registrados; sin participante.', 'No registrados; sin participante.'),
        ('Plataforma, dispositivo y ancho', 'No medidos.', 'No medidos; completar al probar.'),
        ('Resultado y tiempo', 'Sin ejecución ni cronómetro.', 'Sin ejecución; no hay tiempo real.'),
        ('Ayudas, dudas y retrocesos', 'No observados.', 'No observados; sesión pendiente.'),
        ('Evidencia', 'Código previo: chips de estado, sin búsqueda directa.', 'Campo buscar-inventario en PantallaInventario.js; sin evidencia de usuario.'),
        ('Cambio de condiciones', 'Línea base no ejecutada.', 'Comparación controlada pendiente con misma tarea/dispositivo.'),
    ]
    table0 = tables[0]
    rows0 = table0.findall(q('tr'))
    for row_index, values in enumerate(attempt_rows, start=1):
        cells = rows0[row_index].findall(q('tc'))
        for cell_index, value in enumerate(values):
            set_cell(cells[cell_index], value)

    technical_rows = [
        ('Buscar código', 'Encontrar INV-0049 y leer su ubicación.', 'Búsqueda por código está implementada; app no ejecutada aquí.', 'No probado; falta participante.'),
        ('Buscar nombre', 'Encontrar Servidor Dell PowerEdge.', 'Coincidencia por nombre implementada en código.', 'No probado en interfaz.'),
        ('Combinar filtro', 'El código coincide y el filtro Operativo conserva el equipo.', 'La lógica combina búsqueda y estado.', 'No probado en ejecución.'),
        ('Móvil (390 dp)', 'Campo legible y resultado localizable.', 'No se midió ancho ni se probó en móvil.', 'No probado; 390 dp es objetivo.'),
        ('Ancho (768 dp)', 'Búsqueda disponible con dos columnas.', 'Regla adaptable ≥768 dp en código.', 'No probado en viewport real.'),
    ]
    table1 = tables[1]
    rows1 = table1.findall(q('tr'))
    for row_index, values in enumerate(technical_rows, start=1):
        cells = rows1[row_index].findall(q('tc'))
        for cell_index, value in enumerate(values):
            set_cell(cells[cell_index], value)

    review_rows = [
        ('Revisión docente pendiente', 'Estudiante: solicitar revisión antes de exponer.', 'Aún no hay comentarios ni evidencia.'),
        ('Autoría y aportes reales', 'Completar nombres y responsabilidades reales.', 'No proporcionados; confirmar antes de entregar.'),
    ]
    table2 = tables[2]
    rows2 = table2.findall(q('tr'))
    for row_index, values in enumerate(review_rows, start=1):
        cells = rows2[row_index].findall(q('tc'))
        for cell_index, value in enumerate(values):
            set_cell(cells[cell_index], value)

    document_bytes = etree.tostring(document, xml_declaration=True, encoding='UTF-8', standalone=True)
    output.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(output, 'w') as zout:
        zout.comment = zin.comment
        for info in zin.infolist():
            payload = document_bytes if info.filename == 'word/document.xml' else zin.read(info.filename)
            zout.writestr(info, payload)

# Validate output parts and all non-editable package parts.
base = json.loads(baseline_json.read_text(encoding='utf-8'))
with ZipFile(output, 'r') as zout:
    names = zout.namelist()
    if set(names) != set(base):
        raise SystemExit('Package part set changed unexpectedly.')
    changed = [name for name in names if sha256(zout.read(name)).hexdigest() != base[name]['sha256'] and name != 'word/document.xml']
    if changed:
        raise SystemExit(f'Preserve-only package parts changed: {changed}')
    result_xml = etree.fromstring(zout.read('word/document.xml'))
    result_body = result_xml.find('.//' + q('body'))
    residual = [t.text for t in result_body.xpath('.//w:t', namespaces=NS) if t.text and '_' * 5 in t.text]
    if residual:
        raise SystemExit(f'Unfilled underline placeholders remain: {residual}')
    empty_cells = []
    for ti, tbl in enumerate(result_body.findall(q('tbl'))):
        for ri, row in enumerate(tbl.findall(q('tr'))):
            for ci, cell in enumerate(row.findall(q('tc'))):
                if not ''.join(cell.xpath('.//w:t/text()', namespaces=NS)).strip():
                    empty_cells.append((ti, ri, ci))
    if empty_cells:
        raise SystemExit(f'Empty table cells remain: {empty_cells}')
    validation = {
        'output': str(output),
        'output_sha256': sha256(output.read_bytes()).hexdigest(),
        'package_parts': len(names),
        'only_changed_part': 'word/document.xml',
        'empty_table_cells': empty_cells,
        'placeholder_text_remaining': residual,
    }
    print(json.dumps(validation, ensure_ascii=False, indent=2))
