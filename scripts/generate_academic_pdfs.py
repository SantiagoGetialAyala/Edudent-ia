from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate,
    Flowable,
    Frame,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf"
NAVY = colors.HexColor("#102A43")
BLUE = colors.HexColor("#167D9A")
CYAN = colors.HexColor("#DDF3F6")
PALE = colors.HexColor("#F2F6F8")
INK = colors.HexColor("#243B53")
MUTED = colors.HexColor("#52606D")
GOLD = colors.HexColor("#D6A84F")
WHITE = colors.white


styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="CoverTitleCustom", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=29, leading=35, textColor=WHITE, alignment=TA_LEFT, spaceAfter=12))
styles.add(ParagraphStyle(name="CoverSubCustom", parent=styles["Normal"], fontName="Helvetica", fontSize=14, leading=21, textColor=colors.HexColor("#D8E9F2")))
styles.add(ParagraphStyle(name="SectionCustom", parent=styles["Heading1"], fontName="Helvetica-Bold", fontSize=19, leading=23, textColor=NAVY, spaceBefore=8, spaceAfter=10, keepWithNext=True))
styles.add(ParagraphStyle(name="SubsectionCustom", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=12.5, leading=16, textColor=BLUE, spaceBefore=9, spaceAfter=5, keepWithNext=True))
styles.add(ParagraphStyle(name="BodyCustom", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.4, leading=14, textColor=INK, spaceAfter=6))
styles.add(ParagraphStyle(name="SmallCustom", parent=styles["BodyText"], fontName="Helvetica", fontSize=8, leading=11, textColor=MUTED, spaceAfter=4))
styles.add(ParagraphStyle(name="BulletCustom", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.2, leading=13.2, leftIndent=13, firstLineIndent=-8, bulletIndent=0, textColor=INK, spaceAfter=4))
styles.add(ParagraphStyle(name="CellCustom", parent=styles["BodyText"], fontName="Helvetica", fontSize=7.8, leading=10.2, textColor=INK, spaceAfter=0))
styles.add(ParagraphStyle(name="CellHeadCustom", parent=styles["BodyText"], fontName="Helvetica-Bold", fontSize=8, leading=10, textColor=WHITE, spaceAfter=0))
styles.add(ParagraphStyle(name="CalloutCustom", parent=styles["BodyText"], fontName="Helvetica-Bold", fontSize=9.3, leading=14, textColor=NAVY, backColor=CYAN, borderColor=BLUE, borderWidth=0.6, borderPadding=8, spaceBefore=5, spaceAfter=9))
styles.add(ParagraphStyle(name="SpeakerCustom", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.5, leading=14.3, textColor=INK, spaceAfter=7))
styles.add(ParagraphStyle(name="QuoteCustom", parent=styles["BodyText"], fontName="Helvetica-Oblique", fontSize=9.3, leading=14, leftIndent=9, rightIndent=9, textColor=NAVY, backColor=PALE, borderPadding=7, spaceBefore=3, spaceAfter=8))


def P(text, style="BodyCustom"):
    return Paragraph(text, styles[style])


def bullets(items):
    return [Paragraph("- " + item, styles["BulletCustom"]) for item in items]


def make_table(headers, rows, widths, font="CellCustom"):
    data = [[P(str(value), "CellHeadCustom") for value in headers]]
    for row in rows:
        data.append([P(str(value), font) for value in row])
    table = Table(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, PALE]),
        ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#CAD5DF")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return table


class SystemDiagram(Flowable):
    def __init__(self, mode="architecture", width=170 * mm, height=64 * mm):
        super().__init__()
        self.width = width
        self.height = height
        self.mode = mode

    def draw(self):
        c = self.canv
        if self.mode == "architecture":
            nodes = [
                (7, 39, 39, 17, "Estudiante", "#DDF3F6"),
                (58, 39, 46, 17, "Interfaz Next.js", "#DDF3F6"),
                (117, 48, 43, 15, "Visor 3D", "#E8F2FA"),
                (117, 27, 43, 15, "Práctica", "#E8F2FA"),
                (174, 49, 44, 15, "Modelos STL/GLB", "#FFF3D6"),
                (174, 27, 44, 15, "localStorage", "#FFF3D6"),
                (117, 5, 43, 15, "API Tutor", "#E8F2FA"),
                (174, 5, 44, 15, "Gemini opcional", "#F9E7E7"),
            ]
            scale = (self.width - 4 * mm) / (225 * mm)
            yscale = (self.height - 2 * mm) / (72 * mm)
            def xy(x, y): return (2 * mm + x * scale * mm, 1 * mm + y * yscale * mm)
            for x1, y1, x2, y2 in [(46, 47, 58, 47), (104, 47, 117, 55), (104, 45, 117, 34), (160, 55, 174, 56), (160, 34, 174, 34), (104, 42, 117, 12), (160, 12, 174, 12)]:
                a, b = xy(x1, y1), xy(x2, y2)
                c.setStrokeColor(BLUE)
                c.setLineWidth(1.1)
                c.line(a[0], a[1], b[0], b[1])
                c.setFillColor(BLUE)
                c.circle(b[0], b[1], 1.2 * mm, fill=1, stroke=0)
            for x, y, w, h, label, fill in nodes:
                px, py = xy(x, y)
                pw, ph = w * scale * mm, h * yscale * mm
                c.setFillColor(colors.HexColor(fill))
                c.setStrokeColor(colors.HexColor("#AFC4D3"))
                c.roundRect(px, py, pw, ph, 2 * mm, fill=1, stroke=1)
                c.setFillColor(NAVY)
                c.setFont("Helvetica-Bold", 7.4)
                c.drawCentredString(px + pw / 2, py + ph / 2 - 2.4, label)
        else:
            steps = ["Inicio", "Arcadas 3D", "Elegir diente", "Practicar", "Ver resultados"]
            gap = 3 * mm
            boxw = (self.width - gap * (len(steps) - 1)) / len(steps)
            y = self.height / 2 - 8 * mm
            for i, label in enumerate(steps):
                x = i * (boxw + gap)
                c.setFillColor(CYAN if i != 3 else colors.HexColor("#FFF3D6"))
                c.setStrokeColor(BLUE)
                c.roundRect(x, y, boxw, 16 * mm, 2 * mm, fill=1, stroke=1)
                c.setFillColor(NAVY)
                c.setFont("Helvetica-Bold", 7.2)
                c.drawCentredString(x + boxw / 2, y + 8 * mm - 2, label)
                if i < len(steps) - 1:
                    c.setStrokeColor(BLUE)
                    c.line(x + boxw, y + 8 * mm, x + boxw + gap, y + 8 * mm)


def cover(title, subtitle, edition):
    return [
        Spacer(1, 26 * mm),
        P("EDUDENT-IA  |  INGENIERÍA WEB", "SmallCustom"),
        Spacer(1, 10 * mm),
        P(title, "CoverTitleCustom"),
        P(subtitle, "CoverSubCustom"),
        Spacer(1, 24 * mm),
        P(edition, "CoverSubCustom"),
        Spacer(1, 7 * mm),
        P("Documento académico basado en el código y el paquete SDD del proyecto.", "CoverSubCustom"),
        PageBreak(),
    ]


class AcademicDoc(BaseDocTemplate):
    def __init__(self, filename, label):
        super().__init__(str(filename), pagesize=A4, leftMargin=19 * mm, rightMargin=19 * mm, topMargin=20 * mm, bottomMargin=17 * mm, title=label, author="Equipo Edudent-IA")
        frame = Frame(self.leftMargin, self.bottomMargin, self.width, self.height, id="normal", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        self.addPageTemplates([PageTemplate(id="all", frames=[frame], onPage=self.decorate)])

    def decorate(self, canvas, doc):
        canvas.saveState()
        if doc.page == 1:
            canvas.setFillColor(NAVY)
            canvas.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)
            canvas.setFillColor(BLUE)
            canvas.rect(0, 0, 11 * mm, A4[1], fill=1, stroke=0)
            canvas.setFillColor(GOLD)
            canvas.roundRect(A4[0] - 48 * mm, 24 * mm, 29 * mm, 2.2 * mm, 1 * mm, fill=1, stroke=0)
        else:
            canvas.setStrokeColor(colors.HexColor("#D8E2EA"))
            canvas.setLineWidth(0.5)
            canvas.line(19 * mm, A4[1] - 13 * mm, A4[0] - 19 * mm, A4[1] - 13 * mm)
            canvas.setFont("Helvetica-Bold", 7.5)
            canvas.setFillColor(BLUE)
            canvas.drawString(19 * mm, A4[1] - 10 * mm, "EDUDENT-IA")
            canvas.setFont("Helvetica", 7.5)
            canvas.setFillColor(MUTED)
            canvas.drawRightString(A4[0] - 19 * mm, A4[1] - 10 * mm, self.title[:52])
            canvas.line(19 * mm, 12 * mm, A4[0] - 19 * mm, 12 * mm)
            canvas.drawString(19 * mm, 8 * mm, "Ingeniería Web | Documento de trabajo")
            canvas.drawRightString(A4[0] - 19 * mm, 8 * mm, f"Página {doc.page}")
        canvas.restoreState()


def section(title):
    return P(title, "SectionCustom")


def build_study_guide():
    story = cover(
        "Guía de estudio del proyecto",
        "Comprende Edudent-IA: propósito, arquitectura, datos, funciones y límites reales.",
        "Material de preparación para el equipo | 2026",
    )
    story += [
        section("Cómo usar esta guía"),
        P("Estudia primero el recorrido del usuario y después relaciona cada función con su componente. Las palabras <b>implementado</b>, <b>límite</b> y <b>propuesta</b> se usan con precisión: no atribuyas al producto funciones que solo aparecen como idea futura."),
        P("Al terminar deberías poder explicar qué hace la aplicación, cómo se conectan sus módulos, dónde se guardan los datos, qué depende de Gemini y qué no se debe interpretar como una función clínica."),
        section("1. Propósito y alcance"),
        P("Edudent-IA es una aplicación web educativa para explorar modelos dentales tridimensionales y practicar conceptos básicos de anatomía. El estudiante puede recorrer las arcadas, abrir un diente individual si hay un archivo disponible, completar cinco preguntas y consultar resultados guardados en el navegador. El tutor de IA es opcional."),
        P("El sistema no diagnostica, recomienda tratamientos ni simula clínicamente la mordida. Los colores de los STL son ilustrativos: se calculan aproximadamente por altura porque el formato de escaneo no aporta etiquetas de esmalte o encía."),
        P("Objetivos de aprendizaje", "SubsectionCustom"),
        *bullets(["Describir el recorrido principal desde el inicio hasta la consulta de resultados.", "Explicar qué responsabilidad tiene cada módulo principal.", "Distinguir los recursos estáticos, el almacenamiento local del navegador y la llamada externa a Gemini.", "Defender el alcance con evidencia de código y reconocer limitaciones sin exagerar la cobertura de pruebas."]),
        section("2. Arquitectura en una página"),
        P("La interfaz se construye con Next.js y React. El visor 3D utiliza React Three Fiber sobre Three.js. Las rutas del servidor descubren el catálogo de archivos y, por separado, actúan como proxy de Gemini. No existe una base de datos ni una capa de autenticación."),
        SystemDiagram("architecture", height=42 * mm),
        P("Lectura del diagrama: el navegador pide el catálogo al servidor; este lee nombres de archivos de <i>public/models</i>. Los resultados del cuestionario se escriben en <i>localStorage</i>. La pregunta del tutor llega a una ruta de servidor y desde allí a Gemini con la clave del servidor.", "SmallCustom"),
        P("Tecnologías y responsabilidad", "SubsectionCustom"),
        make_table(["Tecnología", "Uso en el proyecto"], [
            ("Next.js 14 / React 18", "Interfaz, rutas App Router y respuesta HTTP."),
            ("TypeScript", "Tipos para estado, resultados, geometría y contratos de API."),
            ("Three.js + React Three Fiber + Drei", "Carga de STL/GLB, geometría, cámara, luces y controles 3D."),
            ("Tailwind CSS", "Estilos de la interfaz."),
            ("Gemini", "Proveedor externo opcional del tutor; requiere una clave privada del servidor."),
        ], [48 * mm, 118 * mm]),
        PageBreak(),
        section("3. Módulos que debes reconocer"),
        make_table(["Módulo", "Responsabilidad", "Archivo"], [
            ("Página principal", "Navegación, selección, carga local, estado del tutor y progreso.", "app/<br/>page.tsx"),
            ("Visor 3D", "Dibuja arcadas y dientes, cambia cámara y controla órbita.", "components/<br/>DentalModelViewer.tsx"),
            ("Geometría", "Transforma ambas arcadas juntas y asigna color ilustrativo por altura.", "components/<br/>dentalGeometry.ts"),
            ("Práctica", "Presenta cinco preguntas, corrige y devuelve el puntaje.", "components/<br/>DentalTraining.tsx"),
            ("Catálogo", "Convierte nombres de archivos en códigos FDI y URL públicas.", "lib/<br/>toothModels.ts"),
            ("API de modelos", "Lee el directorio de modelos y responde JSON sin caché.", "app/api/models/route.ts"),
            ("API del tutor", "Valida la entrada y consulta Gemini desde el servidor.", "app/api/tutor/route.ts"),
        ], [34 * mm, 86 * mm, 46 * mm]),
        section("4. Flujos principales"),
        P("A. Explorar las arcadas", "SubsectionCustom"),
        *bullets(["Al iniciar, el visor carga los STL superior e inferior.", "La geometría recibe una transformación común para mantener su registro espacial.", "El usuario puede rotar, ampliar, desplazar, seleccionar seis vistas y controlar visibilidad/apertura ilustrativa.", "La cámara usa controles de órbita; los activos se cargan desde <i>public/models</i>."]),
        P("B. Abrir un diente individual", "SubsectionCustom"),
        P("La página consulta <i>GET /api/models</i>. La ruta escanea nombres con el patrón de diente, número y extensión STL/GLB. Los alias 1-8 se convierten a FDI 11-18 (por ejemplo, 6 equivale a 16). Un número FDI explícito tiene prioridad. Si no hay modelo para una ficha, se conserva la boca completa."),
        P("C. Practicar y consultar progreso", "SubsectionCustom"),
        P("DentalTraining guía la vista, presenta una pregunta a la vez, permite una respuesta, muestra explicación y calcula el resultado sobre cinco preguntas. Al finalizar, la página guarda puntaje, total y fecha en <i>localStorage</i> con la clave <i>edudent-training-v1</i>; conserva hasta 30 intentos."),
        P("D. Consultar al tutor", "SubsectionCustom"),
        P("El navegador envía pregunta, diente y vista a <i>POST /api/tutor</i>. El servidor valida JSON y límites de texto, arma el contexto y llama a Gemini usando <i>GEMINI_API_KEY</i>. Sin esa variable, la aplicación principal sigue disponible, pero el tutor responde con un error de configuración. La respuesta no está verificada como consejo clínico."),
        P("E. Importar un modelo", "SubsectionCustom"),
        P("El usuario selecciona un archivo STL o GLB en su dispositivo. La URL temporal la crea el navegador; el archivo no se sube ni se guarda en el servidor. Se acepta la extensión, pero no se comprueba que la geometría sea anatómicamente válida."),
        section("5. Datos: dónde viven y qué significa"),
        make_table(["Dato", "Ubicación", "Consecuencia"], [
            ("Resultados", "localStorage del navegador", "No se sincronizan con otros dispositivos; borrar datos del sitio puede eliminarlos."),
            ("Modelos del catálogo", "Archivos estáticos en public/models", "El catálogo depende de que esos activos se incluyan en el despliegue."),
            ("Conversación del tutor", "Estado en memoria de la página", "No hay historial persistente del chat."),
            ("Clave Gemini", "Variable del entorno del servidor", "No debe incluirse en el repositorio ni en el navegador."),
        ], [40 * mm, 54 * mm, 72 * mm]),
        P("Respuesta corta a la pregunta típica '¿qué base de datos usan?': ninguna; los resultados usan almacenamiento local del navegador y los modelos se leen de archivos del proyecto.", "CalloutCustom"),
        section("6. Cómo ejecutar y recorrer"),
        P("En la raíz del proyecto: <b>npm install</b>, opcionalmente copiar <i>.env.local.example</i> a <i>.env.local</i> y añadir la clave Gemini, y ejecutar <b>npm run dev</b>. Abrir <i>http://localhost:3000</i>. Para producción: <b>npm run build</b> y <b>npm start</b>."),
        P("Recorrido sugerido para estudiar: inicio y arcadas; ficha FDI 16; ficha sin modelo; cuestionario completo; Mis resultados; tutor si hay clave. El guion de exposición separado contiene el reparto de roles y tiempos."),
        section("7. Criterios, verificación y límites"),
        make_table(["Área evaluada", "Evidencia en el proyecto"], [
            ("Artefactos SDD", "Constitución, especificación, plan, tareas, checklist y análisis en specs/001-edudent-academico."),
            ("Aplicación", "Visor, catálogo, práctica, progreso local y ruta de tutor opcional."),
            ("Calidad", "Validación de entradas del tutor, manejo de errores y secreto en entorno del servidor."),
            ("Pruebas", "Lint, TypeScript, build y smoke tests HTTP registrados en verification.md."),
            ("Documentación/demo", "README, registro de decisiones, límites y guion de demostración."),
            ("Colaboración", "Rama developer y commits; el PR y los aportes de todos requieren participación real del equipo."),
        ], [44 * mm, 122 * mm]),
        P("Pruebas ejecutadas en esta entrega: ESLint sin advertencias; TypeScript sin diagnósticos; build de Next.js correcto; GET /api/models y errores del tutor para JSON inválido, pregunta vacía y pregunta sobre el límite respondieron según lo esperado. No se probó la respuesta exitosa de Gemini con una clave real ni se registró un recorrido manual de toda la interfaz.", "SmallCustom"),
        P("Límites importantes", "SubsectionCustom"),
        *bullets(["No es diagnóstico ni software clínico.", "No hay cuentas, roles, base de datos, sincronización ni guardado de archivos cargados.", "Los modelos individuales disponibles son pocos; varias fichas están pendientes.", "El tutor depende de Internet, configuración y disponibilidad de Google.", "Una compilación exitosa no prueba por sí sola toda la experiencia del navegador."]),
        section("8. Preguntas de repaso")
    ]
    qa = [
        ("¿Cuál es la diferencia entre API de modelos y API del tutor?", "La primera enumera archivos del servidor; la segunda reenvía una pregunta educativa a Gemini."),
        ("¿Por qué no se documentó PostgreSQL?", "El proyecto no tiene base de datos ni persistencia de servidor. Añadirla sería un alcance nuevo."),
        ("¿Qué ocurre si no hay clave Gemini?", "El visor, catálogo y práctica siguen; el endpoint del tutor comunica que falta la configuración."),
        ("¿Cómo se calcula el color de la encía?", "Es una aproximación por altura de los vértices porque STL no tiene etiquetas de tejidos."),
        ("¿Cómo se relaciona una ficha con el archivo?", "El endpoint descubre nombres de archivo y los normaliza a FDI; alias 6 se interpreta como FDI 16."),
        ("¿Qué muestra el equipo como verificación?", "Resultados observados de lint, TypeScript, build y smoke tests; además, se declara qué validaciones manuales y externas faltan."),
    ]
    for q, a in qa:
        story.append(P("<b>" + q + "</b><br/>" + a, "BodyCustom"))
    story.append(P("Archivos de referencia del equipo: README.md y el paquete specs/001-edudent-academico. La presente guía resume su contenido para estudio; ante discrepancias, prevalece el código observado y la verificación registrada.", "SmallCustom"))
    return story


def build_presentation():
    story = cover(
        "Guion de exposición",
        "Edudent-IA presentado por cuatro integrantes ante la profesora de Ingeniería Web.",
        "Duración sugerida: 8-10 minutos | Reparto equilibrado: 2-2.5 minutos por persona",
    )
    story += [
        section("Propósito y reglas de uso"),
        P("Este guion reparte la explicación, la demo y la evidencia de acuerdo con los seis aspectos de evaluación: artefactos SDD, aplicación funcional, calidad técnica, trabajo colaborativo, pruebas, documentación y demostración."),
        P("Reemplacen [Nombre] antes de exponer. No digan que una prueba manual se ejecutó si no la hicieron en el ensayo. No muestren claves, tokens ni archivos .env.local. Si Gemini no está configurado, expliquen esa dependencia sin improvisar una respuesta de IA."),
        SystemDiagram("journey", height=34 * mm),
        section("Distribución de roles"),
        make_table(["Persona", "Parte", "Tiempo", "Evidencia principal"], [
            ("Integrante 1", "Problema, objetivo, usuario y alcance", "2 min", "Inicio de la app; spec.md"),
            ("Integrante 2", "Arquitectura, componentes y datos", "2-2.5 min", "Diagrama; plan.md; data-model.md"),
            ("Integrante 3", "Demostración de funciones", "2.5-3 min", "Visor, catálogo, práctica y tutor opcional"),
            ("Integrante 4", "SDD, calidad, pruebas, límites y cierre", "2-2.5 min", "Checklist, verification.md, Git y README"),
        ], [28 * mm, 52 * mm, 27 * mm, 59 * mm]),
        P("Ensayen el cambio entre personas: quien termina presenta a quien sigue. Así la exposición se siente como un solo recorrido del proyecto.", "CalloutCustom"),
        section("Integrante 1 - propósito y alcance"),
        P("<b>Texto sugerido</b>", "SubsectionCustom"),
        P("“Buenos días, profesora. Somos [Nombre 1], [Nombre 2], [Nombre 3] y [Nombre 4]. Presentamos Edudent-IA, una aplicación web educativa para explorar modelos dentales en tres dimensiones y practicar conceptos básicos de anatomía dental." , "QuoteCustom"),
        P("“El problema que abordamos es que estudiar la forma y orientación de los dientes puede ser más claro cuando se puede observar un modelo desde varios ángulos y después comprobar lo aprendido con preguntas. El usuario principal es el estudiante de odontología." , "QuoteCustom"),
        P("“El alcance actual contiene exploración de arcadas, selección de algunos dientes con modelo, importación local de STL o GLB, una práctica de cinco preguntas y consulta de resultados en el navegador. El tutor con Gemini es opcional. El proyecto es educativo: no diagnostica, no recomienda tratamientos y no simula clínicamente una mordida.”", "QuoteCustom"),
        P("<b>Mostrar:</b> pantalla inicial y las secciones de navegación. No empezar por la arquitectura; primero fijar qué necesidad resuelve.", "SmallCustom"),
        P("<b>Transición:</b> “Ahora [Nombre 2] explicará cómo conectamos estas funciones y dónde viven los datos.”", "SmallCustom"),
        section("Integrante 2 - arquitectura y datos"),
        P("<b>Texto sugerido</b>", "SubsectionCustom"),
        P("“La aplicación usa Next.js, React y TypeScript. El visor se implementa con React Three Fiber y Three.js. La página principal coordina la interfaz; el visor carga geometrías y controla cámara; el entrenamiento administra preguntas y puntaje.”", "QuoteCustom"),
        P("“Hay dos rutas de servidor. GET /api/models lee el directorio public/models y devuelve un catálogo normalizado. POST /api/tutor valida la solicitud y consulta Gemini desde el servidor. La clave se configura mediante una variable de entorno y no se expone al navegador.”", "QuoteCustom"),
        P("“No usamos una base de datos. El avance de práctica se guarda en localStorage del navegador, hasta 30 sesiones. Eso significa que no se sincroniza entre dispositivos y puede perderse al borrar los datos del sitio. Los modelos del catálogo son archivos estáticos del proyecto.”", "QuoteCustom"),
        P("<b>Mostrar:</b> el diagrama del plan SDD o este diagrama; señalar la separación entre cliente, rutas, archivos y proveedor externo.", "SmallCustom"),
        P("<b>Transición:</b> “Con esta estructura explicada, [Nombre 3] mostrará el flujo principal en la aplicación.”", "SmallCustom"),
        PageBreak(),
        section("Integrante 3 - demostración funcional"),
        P("<b>Guion de acciones en vivo</b>", "SubsectionCustom"),
        make_table(["Acción", "Qué decir o comprobar"], [
            ("Explorar arcadas", "“El visor carga las arcadas superior e inferior. Voy a cambiar la vista y a rotar/ampliar el modelo.”"),
            ("Elegir diente 16", "“La ficha abre el STL incluido cuando hay un modelo asociado. El catálogo traduce el alias 6 a FDI 16.”"),
            ("Elegir ficha sin modelo", "“Cuando no hay archivo individual, la aplicación conserva la boca completa y señala el estado disponible.”"),
            ("Completar práctica", "Responder las cinco preguntas, mostrar explicación y resultado final."),
            ("Consultar progreso", "“El resultado queda en este navegador; no es un historial de cuenta.”"),
            ("Tutor opcional", "Si está configurado: enviar una pregunta breve. Si no: mostrar el aviso de configuración y explicar que el resto funciona sin IA."),
        ], [40 * mm, 126 * mm]),
        P("<b>Precaución para esta demo:</b> importar STL/GLB solo si tienen un archivo preparado. La carga local no sube el modelo al servidor. Los colores de tejidos son ilustrativos, no una segmentación anatómica.", "CalloutCustom"),
        P("<b>Transición:</b> “Ya vimos el flujo. [Nombre 4] relacionará la implementación con SDD y la evidencia de calidad.”", "SmallCustom"),
        section("Integrante 4 - SDD, pruebas y cierre"),
        P("<b>Texto sugerido</b>", "SubsectionCustom"),
        P("“Aplicamos SDD a un proyecto existente, es decir, Brownfield. Primero revisamos el código y documentamos el alcance real. Después organizamos Constitución, especificación con Non-Goals, plan técnico, tareas, checklist y análisis de coherencia. Las decisiones y la convergencia también están registradas.”", "QuoteCustom"),
        P("“Para calidad se validan las entradas del tutor: JSON inválido, pregunta vacía y pregunta mayor de 1200 caracteres responden con error controlado. La clave Gemini permanece en el servidor. En esta entrega ejecutamos ESLint, TypeScript, build de producción y pruebas HTTP del catálogo y de esos errores. Los resultados están escritos en verification.md.”", "QuoteCustom"),
        P("“También delimitamos lo que falta: no probamos una respuesta exitosa de Gemini con una clave real y el recorrido visual completo necesita ensayo manual en navegador. En Git el trabajo quedó en la rama developer con commits descriptivos. La revisión y el pull request del equipo son pasos de colaboración que deben realizarse con todos los integrantes; no se sustituyen por esta documentación.”", "QuoteCustom"),
        P("“En conclusión, Edudent-IA permite explorar y practicar anatomía dental con un alcance educativo claro. La documentación permite rastrear qué se prometió, qué está implementado y qué límites deben tenerse presentes. Muchas gracias.”", "QuoteCustom"),
        section("Mapa rápido contra criterios de evaluación"),
        make_table(["Criterio", "Qué señalar a la profesora"], [
            ("1. Artefactos SDD", "constitution.md, spec.md, plan.md, tasks.md; checklist y análisis."),
            ("2. Aplicación funcional", "Visor, catálogo de dientes, práctica y resultados locales; tutor opcional."),
            ("3. Calidad técnica", "TypeScript, validación del endpoint, manejo de fallos y secreto en entorno servidor."),
            ("4. Colaboración Git", "Rama developer, commits y enlace al PR; describir aportes reales de cada integrante."),
            ("5. Pruebas", "Resultados de lint, tipos, build y smoke tests; distinguir lo manual pendiente."),
            ("6. Documentación/demo", "README, decisiones, límites, esta exposición y recorrido del producto."),
        ], [43 * mm, 123 * mm]),
        section("Preguntas probables de la profesora"),
    ]
    questions = [
        ("¿Por qué no hay base de datos?", "El proyecto no persiste en un servidor. Para la función actual el navegador usa localStorage; una base multiusuario sería un requisito y diseño nuevo."),
        ("¿Qué pasa si Gemini no funciona?", "El tutor puede fallar por clave, red o proveedor. La interfaz comunica el error y visor/práctica no dependen de esa integración."),
        ("¿Los colores muestran encía real?", "No. En STL no hay etiquetas de tejido y el color se aproxima por altura. Lo declaramos en la interfaz y documentación."),
        ("¿Qué evidencia demuestra que funciona?", "Lint, verificación de tipos, build y smoke tests HTTP registrados. La experiencia WebGL y la respuesta real de Gemini requieren además revisión manual/configuración."),
        ("¿Qué significa Brownfield aquí?", "Documentar y mejorar un repositorio existente, respetando sus patrones y límites, en vez de inventar una arquitectura nueva."),
    ]
    for q, a in questions:
        story.append(P("<b>" + q + "</b><br/>" + a, "BodyCustom"))
    story += [
        section("Lista de ensayo del equipo"),
        *bullets(["Reemplazar los nombres y confirmar el orden de participación.", "Instalar dependencias y abrir el proyecto antes de la clase.", "Probar que los STL carguen y que el cuestionario pueda completarse.", "Decidir si Gemini se mostrará con una clave válida; no proyectar archivos de secretos.", "Practicar el recorrido con cronómetro: nadie debe depender de un integrante para explicar su parte.", "Tener abierto el paquete SDD y verification.md para respaldar preguntas.", "No afirmar que ya existe PR aprobado ni pruebas manuales que no se hayan realizado."]),
        P("Este guion es una base editable para el equipo. Ajusten nombres, duración y reparto de la demo a la participación real de cada integrante.", "SmallCustom"),
    ]
    return story


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    files = [
        (OUTPUT / "Guia_de_estudio_Edudent-IA.pdf", "Guía de estudio Edudent-IA", build_study_guide()),
        (OUTPUT / "Exposicion_Edudent-IA_4_integrantes.pdf", "Exposición Edudent-IA - cuatro integrantes", build_presentation()),
    ]
    for path, title, story in files:
        doc = AcademicDoc(path, title)
        doc.build(story)
        print(f"Creado: {path}")


if __name__ == "__main__":
    main()
