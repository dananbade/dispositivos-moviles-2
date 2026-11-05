import json
from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_ALIGN_VERTICAL, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


PROJECT = Path(r"C:\Users\asini\Downloads\Proyecto")
EVIDENCE = PROJECT / "tmp" / "sesion10" / "evidencias"
RESULTS_PATH = EVIDENCE / "resultados-pruebas.json"
OUTPUT = PROJECT / "Actividad_Sesion_10_Asistente_IA.docx"


def set_font(run, name="Aptos", size=None, bold=None, color=None):
    run.font.name = name
    run._element.get_or_add_rPr().rFonts.set(qn("w:ascii"), name)
    run._element.get_or_add_rPr().rFonts.set(qn("w:hAnsi"), name)
    if size is not None:
        run.font.size = Pt(size)
    if bold is not None:
        run.bold = bold
    if color is not None:
        run.font.color.rgb = RGBColor(*color)


def set_cell_shading(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_cell_margins(cell, top=90, start=90, bottom=90, end=90):
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for margin_name, margin_value in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{margin_name}"))
        if node is None:
            node = OxmlElement(f"w:{margin_name}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(margin_value))
        node.set(qn("w:type"), "dxa")


def set_table_borders(table, color="D9D9D9", size="6"):
    tbl_pr = table._tbl.tblPr
    borders = tbl_pr.find(qn("w:tblBorders"))
    if borders is None:
        borders = OxmlElement("w:tblBorders")
        tbl_pr.append(borders)
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        tag = f"w:{edge}"
        border = borders.find(qn(tag))
        if border is None:
            border = OxmlElement(tag)
            borders.append(border)
        border.set(qn("w:val"), "single")
        border.set(qn("w:sz"), size)
        border.set(qn("w:space"), "0")
        border.set(qn("w:color"), color)


def repeat_table_header(row):
    tr_pr = row._tr.get_or_add_trPr()
    tbl_header = OxmlElement("w:tblHeader")
    tbl_header.set(qn("w:val"), "true")
    tr_pr.append(tbl_header)


def prevent_row_split(row):
    tr_pr = row._tr.get_or_add_trPr()
    cant_split = OxmlElement("w:cantSplit")
    tr_pr.append(cant_split)


def set_cell_width(cell, width_inches):
    cell.width = Inches(width_inches)
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_w = tc_pr.find(qn("w:tcW"))
    if tc_w is None:
        tc_w = OxmlElement("w:tcW")
        tc_pr.append(tc_w)
    tc_w.set(qn("w:w"), str(int(width_inches * 1440)))
    tc_w.set(qn("w:type"), "dxa")


def style_table(table, widths, header=True, font_size=9):
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    set_table_borders(table)
    for row_index, row in enumerate(table.rows):
        prevent_row_split(row)
        for col_index, cell in enumerate(row.cells):
            set_cell_width(cell, widths[col_index])
            set_cell_margins(cell)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            if header and row_index == 0:
                set_cell_shading(cell, "17324D")
            elif header and row_index % 2 == 0:
                set_cell_shading(cell, "EEF4F8")
            for paragraph in cell.paragraphs:
                paragraph.paragraph_format.space_after = Pt(0)
                paragraph.paragraph_format.line_spacing = 1.05
                for run in paragraph.runs:
                    set_font(
                        run,
                        size=font_size,
                        bold=True if header and row_index == 0 else None,
                        color=(255, 255, 255) if header and row_index == 0 else (0, 0, 0),
                    )
    if header:
        repeat_table_header(table.rows[0])


def add_heading(doc, text, level=1):
    paragraph = doc.add_heading(text, level=level)
    paragraph.alignment = WD_ALIGN_PARAGRAPH.LEFT
    paragraph.paragraph_format.left_indent = Inches(0)
    paragraph.paragraph_format.right_indent = Inches(0)
    paragraph.paragraph_format.first_line_indent = Inches(0)
    paragraph.paragraph_format.keep_with_next = True
    return paragraph


def remove_paragraph_borders(paragraph_or_style):
    p_pr = paragraph_or_style._element.get_or_add_pPr()
    borders = p_pr.find(qn("w:pBdr"))
    if borders is not None:
        p_pr.remove(borders)


def add_body(doc, text, bold_lead=None):
    paragraph = doc.add_paragraph()
    paragraph.paragraph_format.space_after = Pt(6)
    paragraph.paragraph_format.line_spacing = 1.12
    if bold_lead and text.startswith(bold_lead):
        first = paragraph.add_run(bold_lead)
        set_font(first, bold=True)
        rest = paragraph.add_run(text[len(bold_lead):])
        set_font(rest)
    else:
        run = paragraph.add_run(text)
        set_font(run)
    return paragraph


def add_picture_with_alt(paragraph, image_path, width, alt_text):
    run = paragraph.add_run()
    picture = run.add_picture(str(image_path), width=Inches(width))
    picture._inline.docPr.set("descr", alt_text)
    return picture


def add_caption(doc, text):
    paragraph = doc.add_paragraph(style="Caption")
    paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    paragraph.paragraph_format.space_before = Pt(3)
    paragraph.paragraph_format.space_after = Pt(8)
    paragraph.paragraph_format.keep_with_previous = True
    run = paragraph.add_run(text)
    set_font(run, size=9, color=(70, 70, 70))
    return paragraph


def add_page_number(paragraph):
    paragraph.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    prefix = paragraph.add_run("Página ")
    set_font(prefix, size=9, color=(95, 95, 95))
    field = OxmlElement("w:fldSimple")
    field.set(qn("w:instr"), "PAGE")
    run = OxmlElement("w:r")
    r_pr = OxmlElement("w:rPr")
    color = OxmlElement("w:color")
    color.set(qn("w:val"), "5F5F5F")
    r_pr.append(color)
    run.append(r_pr)
    text = OxmlElement("w:t")
    text.text = "1"
    run.append(text)
    field.append(run)
    paragraph._p.append(field)


def add_code_line(doc, text):
    paragraph = doc.add_paragraph()
    paragraph.paragraph_format.left_indent = Inches(0.28)
    paragraph.paragraph_format.space_after = Pt(2)
    paragraph.paragraph_format.keep_together = True
    run = paragraph.add_run(text)
    set_font(run, name="Consolas", size=8.5, color=(35, 35, 35))


def add_figure_pair(doc, left_path, left_alt, left_caption, right_path, right_alt, right_caption):
    table = doc.add_table(rows=2, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    widths = [3.25, 3.25]
    for row in table.rows:
        for index, cell in enumerate(row.cells):
            set_cell_width(cell, widths[index])
            set_cell_margins(cell, top=40, start=80, bottom=40, end=80)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.TOP
    for index, (image_path, alt_text, caption) in enumerate((
        (left_path, left_alt, left_caption),
        (right_path, right_alt, right_caption),
    )):
        image_cell = table.cell(0, index)
        paragraph = image_cell.paragraphs[0]
        paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
        add_picture_with_alt(paragraph, image_path, 2.65, alt_text)
        caption_cell = table.cell(1, index)
        caption_paragraph = caption_cell.paragraphs[0]
        caption_paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
        caption_paragraph.paragraph_format.space_after = Pt(0)
        run = caption_paragraph.add_run(caption)
        set_font(run, size=8.5, color=(70, 70, 70))
    return table


with RESULTS_PATH.open("r", encoding="utf-8") as file:
    test_data = json.load(file)

doc = Document()
section = doc.sections[0]
section.page_width = Inches(8.5)
section.page_height = Inches(11)
section.top_margin = Inches(0.65)
section.bottom_margin = Inches(0.65)
section.left_margin = Inches(0.65)
section.right_margin = Inches(0.65)

styles = doc.styles
normal = styles["Normal"]
normal.font.name = "Aptos"
normal._element.rPr.rFonts.set(qn("w:ascii"), "Aptos")
normal._element.rPr.rFonts.set(qn("w:hAnsi"), "Aptos")
normal.font.size = Pt(10.5)
normal.font.color.rgb = RGBColor(0, 0, 0)

title_style = styles["Title"]
title_style.font.name = "Aptos Display"
title_style._element.rPr.rFonts.set(qn("w:ascii"), "Aptos Display")
title_style._element.rPr.rFonts.set(qn("w:hAnsi"), "Aptos Display")
title_style.font.size = Pt(22)
title_style.font.bold = True
title_style.font.color.rgb = RGBColor(0, 0, 0)
remove_paragraph_borders(title_style)

for style_name, size in (("Heading 1", 15), ("Heading 2", 12)):
    style = styles[style_name]
    style.font.name = "Aptos Display"
    style._element.rPr.rFonts.set(qn("w:ascii"), "Aptos Display")
    style._element.rPr.rFonts.set(qn("w:hAnsi"), "Aptos Display")
    style.font.size = Pt(size)
    style.font.bold = True
    style.font.color.rgb = RGBColor(0, 0, 0)
    style.paragraph_format.space_before = Pt(10)
    style.paragraph_format.space_after = Pt(5)

footer = section.footer.paragraphs[0]
add_page_number(footer)

title = doc.add_paragraph(style="Title")
title.alignment = WD_ALIGN_PARAGRAPH.CENTER
title.paragraph_format.space_after = Pt(6)
remove_paragraph_borders(title)
title_run = title.add_run("Actividad Sesión 10 Integración de IA local en el inventario")
set_font(title_run, name="Aptos Display", size=22, bold=True)

subtitle = doc.add_paragraph()
subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
subtitle.paragraph_format.space_after = Pt(14)
subtitle_run = subtitle.add_run("Programación para Dispositivos Móviles II")
set_font(subtitle_run, size=12, bold=True)

metadata = doc.add_table(rows=4, cols=2)
metadata_data = [
    ("Grupo", "S841A"),
    ("Fecha", "1 de noviembre de 2026"),
    ("Proyecto", r"C:\Users\asini\Downloads\Proyecto"),
    ("Archivo de entrada", "App.js"),
]
for row, (label, value) in zip(metadata.rows, metadata_data):
    row.cells[0].text = label
    row.cells[1].text = value
    row.cells[0].paragraphs[0].runs[0].bold = True
style_table(metadata, [1.4, 5.5], header=False, font_size=9.5)

add_heading(doc, "Resultado general", 1)
add_body(
    doc,
    "Integramos un asistente local en el inventario existente y conservamos las pantallas de Inventario, "
    "Sensores y Cámara. La prueba en Google Chrome sobre Windows terminó con 10 de 10 casos cumplidos, "
    "sin errores de consola. La frase negativa se clasificó como ubicación; se conserva como limitación "
    "comprobada del modelo basado en coincidencia de palabras."
)

add_heading(doc, "Integrantes y aportes", 1)
team = doc.add_table(rows=1, cols=2)
team.rows[0].cells[0].text = "Integrante"
team.rows[0].cells[1].text = "Aporte asignado en la entrega"
for name, contribution in [
    ("Jorwin Andres Sinisterra", "Integración del asistente y conexión con los datos del inventario."),
    ("Daniel Andres Banguero", "Ejecución de la matriz de pruebas y verificación de resultados."),
    ("Alvaro Stiven Farrufia", "Revisión adaptable, organización de capturas y documentación."),
]:
    cells = team.add_row().cells
    cells[0].text = name
    cells[1].text = contribution
style_table(team, [2.35, 4.55], header=True, font_size=9.2)

doc.add_page_break()
add_heading(doc, "Integración en el proyecto", 1)
add_body(
    doc,
    "Elegimos la mejora C y adaptamos el material al elemento real del proyecto. El inventario no guarda "
    "precio ni descripción, por lo que las tres intenciones verificables son nombre, ubicación y estado. "
    "Esta decisión evita crear datos que no existen y mantiene el procedimiento 1-NN indicado en la guía."
)

files = doc.add_table(rows=1, cols=3)
files.rows[0].cells[0].text = "Ubicación"
files.rows[0].cells[1].text = "Tipo"
files.rows[0].cells[2].text = "Función"
file_rows = [
    ("App.js", "Entrada conservada", "Mantiene el contenedor y las tres pestañas existentes."),
    ("src/screens/PantallaInventario.js", "Modificado", "Permite abrir y cerrar el asistente sin perder el inventario."),
    ("src/components/AsistenteIA.jsx", "Nuevo", "Interfaz, selección de equipo, validaciones y respuesta."),
    ("src/components/modeloIA.js", "Nuevo", "Ejemplos, normalización, similitud y clasificación."),
    ("package.json y package-lock.json", "Actualizados", "Expo SDK 57 con el paquete expo 57.0.31."),
]
for location, kind, purpose in file_rows:
    cells = files.add_row().cells
    cells[0].text = location
    cells[1].text = kind
    cells[2].text = purpose
style_table(files, [2.55, 1.25, 3.1], header=True, font_size=8.8)

add_heading(doc, "Funcionamiento del clasificador", 1)
add_body(
    doc,
    "El modelo convierte la pregunta a minúsculas, elimina tildes, signos y palabras comunes, y compara "
    "conjuntos de palabras. Conserva la mejor similitud por intención. Si la puntuación es menor que 0,20 "
    "o la diferencia frente a la segunda intención es menor que 0,08, devuelve una respuesta alternativa. "
    "La similitud mostrada no es una probabilidad de certeza."
)
add_code_line(doc, "<AsistenteIA equipos={equipos} />")
add_code_line(doc, "const resultado = clasificar(pregunta);")
add_code_line(doc, "const valor = equipo[resultado.intencion];")
add_body(
    doc,
    "El componente se integra dentro de PantallaInventario porque allí se mantiene el arreglo equipos. "
    "El asistente y la lista se alternan dentro del mismo componente, de modo que ambos consultan la misma "
    "fuente de datos y no se crea un segundo catálogo."
)

add_heading(doc, "Validaciones técnicas", 2)
checks = doc.add_table(rows=1, cols=2)
checks.rows[0].cells[0].text = "Comprobación"
checks.rows[0].cells[1].text = "Resultado"
for check, result in [
    ("npx expo lint", "Sin errores"),
    ("Comprobación de JavaScript con TypeScript", "Sin errores"),
    ("npx expo install --check", "Dependencias al día"),
    ("npx expo-doctor", "21 de 21 comprobaciones aprobadas"),
    ("Exportación web", "Generada correctamente"),
]:
    cells = checks.add_row().cells
    cells[0].text = check
    cells[1].text = result
style_table(checks, [3.2, 3.7], header=True, font_size=9)

doc.add_page_break()
add_heading(doc, "Evidencias de las tres intenciones", 1)
add_body(
    doc,
    "Las capturas siguientes corresponden al mismo equipo INV-0001 y muestran datos que existen en el inventario."
)
add_figure_pair(
    doc,
    EVIDENCE / "01-nombre.png",
    "Asistente en ancho de 390 píxeles que reconoce la intención nombre y muestra PC Escritorio 01.",
    "Figura 1 Respuesta para la intención nombre",
    EVIDENCE / "02-ubicacion.png",
    "Asistente en ancho de 390 píxeles que reconoce la intención ubicación y muestra Oficina Admin.",
    "Figura 2 Respuesta para la intención ubicación",
)

doc.add_page_break()
add_heading(doc, "Evidencias de estado y respuesta alternativa", 1)
add_body(
    doc,
    "La primera captura completa las tres intenciones. La segunda demuestra el rechazo de una pregunta fuera del alcance."
)
add_figure_pair(
    doc,
    EVIDENCE / "03-estado.png",
    "Asistente en ancho de 390 píxeles que reconoce la intención estado y muestra Operativo.",
    "Figura 3 Respuesta para la intención estado",
    EVIDENCE / "04-respuesta-alternativa.png",
    "Asistente que responde con una alternativa a la pregunta sobre el clima.",
    "Figura 4 Respuesta alternativa para una pregunta no reconocida",
)

doc.add_page_break()
add_heading(doc, "Matriz de pruebas", 1)
add_body(
    doc,
    "Entorno probado: Google Chrome 156 en Windows, con anchos de 390 y 1280 píxeles. El catálogo temporal "
    "usado para el caso de dato ausente se restauró después de la prueba."
)

matrix = doc.add_table(rows=1, cols=6)
headers = ["N", "Caso", "Entrada o acción", "Esperado", "Observado", "Cumple"]
for index, header in enumerate(headers):
    matrix.rows[0].cells[index].text = header

for index, item in enumerate(test_data["resultados"], start=1):
    cells = matrix.add_row().cells
    cells[0].text = str(index)
    cells[1].text = item["caso"]
    cells[2].text = item["entrada"]
    cells[3].text = item["esperado"]
    cells[4].text = item["observado"]
    cells[5].text = "Sí" if item["cumple"] else "No"
    cells[0].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
    cells[5].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER

style_table(matrix, [0.32, 0.8, 1.3, 1.55, 2.3, 0.55], header=True, font_size=7.8)
add_body(
    doc,
    "En el caso de negación, Cumple significa que el error esperado fue reproducido y documentado; no significa "
    "que el clasificador comprendió correctamente la frase."
)

doc.add_page_break()
add_heading(doc, "Mejora propia", 1)
add_body(
    doc,
    "La mejora C adapta el asistente al inventario de equipos. El selector cambia el equipo consultado y la "
    "respuesta se actualiza con su ubicación real. La interfaz también cambia de columna a fila cuando el ancho "
    "aumenta, sin añadir un segundo desplazamiento vertical."
)

paragraph = doc.add_paragraph()
paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
add_picture_with_alt(
    paragraph,
    EVIDENCE / "06-ancho-amplio.png",
    6.75,
    "Asistente en ancho de 1280 píxeles con el campo de pregunta y el botón Consultar en una misma fila.",
)
add_caption(
    doc,
    "Figura 5 Interfaz en 1280 píxeles con INV-0002 seleccionado y respuesta de Soporte Técnico"
)

doc.add_page_break()
add_heading(doc, "Explicación de la mejora", 1)
explanation_lines = [
    "Adaptamos el asistente a equipos porque el proyecto no contiene precios ni descripciones.",
    "Mantuvimos tres intenciones verificables: nombre, ubicación y estado.",
    "Los ejemplos etiquetados se ajustaron al vocabulario del inventario.",
    "El asistente recibe el mismo arreglo equipos que usa la pantalla de inventario.",
    "El selector Siguiente equipo permite comprobar que la respuesta cambia con el registro.",
    "Las preguntas vacías, desconocidas, ambiguas y los datos ausentes producen mensajes claros.",
    "La interfaz se apila a 390 píxeles y se organiza en fila a 1280 píxeles.",
    "Las diez pruebas pasaron y la negación quedó documentada como limitación del modelo.",
]
for line in explanation_lines:
    paragraph = doc.add_paragraph(style="List Number")
    paragraph.paragraph_format.space_after = Pt(3)
    run = paragraph.add_run(line)
    set_font(run, size=10)

add_heading(doc, "Limitaciones comprobadas", 1)
limitations = [
    "La pregunta No quiero saber la ubicación se clasifica como ubicación porque el modelo compara palabras y no interpreta la negación.",
    "El orden de las palabras y el significado profundo no forman parte de la representación usada.",
    "La validación de interfaz se realizó en Google Chrome sobre Windows; no se ejecutó en un dispositivo físico Android ni iOS.",
    "La inferencia funciona localmente y no consulta servicios externos, pero la carga inicial de Expo puede requerir conexión.",
]
for limitation in limitations:
    paragraph = doc.add_paragraph(style="List Bullet")
    paragraph.paragraph_format.space_after = Pt(3)
    run = paragraph.add_run(limitation)
    set_font(run, size=10)

add_heading(doc, "Conclusión", 1)
add_body(
    doc,
    "El asistente quedó integrado sin reemplazar las funciones anteriores. Las respuestas provienen del equipo "
    "seleccionado, los casos no reconocidos reciben una alternativa y el dato ausente no se inventa. Los resultados "
    "confirman el comportamiento esperado en la plataforma probada y también muestran la limitación de la negación."
)

add_heading(doc, "Fuentes", 1)
sources = [
    "Guía Autónoma Sesión 10 IA local en la aplicación que ya construimos.",
    "Archivos de apoyo AsistenteIA.jsx y modeloIA.js suministrados para la sesión.",
    "Expo SDK 57 https://docs.expo.dev/versions/v57.0.0/",
    "React Native 0.86 TextInput https://reactnative.dev/docs/0.86/textinput",
    "React Native 0.86 Pressable https://reactnative.dev/docs/0.86/pressable",
]
for source in sources:
    paragraph = doc.add_paragraph(style="List Bullet")
    paragraph.paragraph_format.space_after = Pt(2)
    run = paragraph.add_run(source)
    set_font(run, size=9)

core = doc.core_properties
core.title = "Actividad Sesión 10 Integración de IA local en el inventario"
core.subject = "Integración y pruebas de un clasificador local 1-NN en React Native y Expo"
core.author = "Jorwin Andres Sinisterra, Daniel Andres Banguero y Alvaro Stiven Farrufia"
core.keywords = "React Native, Expo, IA local, 1-NN, inventario, pruebas"

doc.save(OUTPUT)
print(OUTPUT)
