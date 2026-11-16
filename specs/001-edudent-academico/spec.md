# Especificación de producto: Edudent-IA

**Tipo:** documentación Brownfield del producto académico existente  
**Estado:** especifica el alcance implementado observado en la revisión del 16 de noviembre de 2026  
**Usuario principal:** estudiante de odontología

## Problema y objetivo

El estudiante necesita observar modelos dentales en tres dimensiones y practicar conceptos de anatomía en un flujo accesible desde el navegador. Edudent-IA reúne la exploración de arcadas, fichas de dientes, un cuestionario breve y, de forma opcional, un tutor generativo.

## Alcance del producto

1. Visualizar conjuntamente las arcadas superior e inferior y manipular la cámara y la apertura ilustrativa.
2. Mostrar una selección de vistas anatómicas predefinidas y controlar qué arcada aparece.
3. Consultar el catálogo de modelos individuales disponible en el directorio de activos y abrir el modelo asociado a una ficha.
4. Importar un STL o GLB local para visualizarlo en la sesión del navegador.
5. Responder cinco preguntas de práctica con corrección, explicación y puntuación.
6. Consultar en el mismo navegador hasta 30 resultados de práctica.
7. Enviar una pregunta educativa contextual al tutor Gemini cuando exista configuración válida.

## Requisitos funcionales

| ID | Requisito verificable | Evidencia de implementación |
| --- | --- | --- |
| FR-01 | Al abrir el inicio, el visor debe cargar las dos arcadas STL de los activos incluidos, conservando una transformación común. | `components/DentalModelViewer.tsx`, `components/dentalGeometry.ts` |
| FR-02 | El usuario debe poder rotar, ampliar, desplazar y cambiar entre seis vistas; controles de la interfaz deben cambiar la visibilidad y apertura ilustrativa. | `components/DentalModelViewer.tsx`, `app/page.tsx` |
| FR-03 | El catálogo debe descubrir archivos con nombre de diente y formato STL/GLB y dar prioridad a nombres FDI explícitos; debe incluir el GLB central si no hay otro modelo 11. | `app/api/models/route.ts`, `lib/toothModels.ts` |
| FR-04 | Al seleccionar una ficha con un modelo, el visor debe mostrar el modelo individual; una ficha sin modelo conserva la boca completa y presenta su disponibilidad. | `app/page.tsx`, `lib/toothModels.ts` |
| FR-05 | El usuario debe poder seleccionar un archivo STL o GLB local y visualizarlo sin subirlo al servidor; formatos distintos deben rechazarse con un mensaje. | `app/page.tsx`, `components/DentalModelViewer.tsx` |
| FR-06 | La práctica debe presentar cinco preguntas, aceptar una respuesta por pregunta, indicar acierto y explicación y calcular el puntaje al terminar. | `components/DentalTraining.tsx` |
| FR-07 | Al completar una práctica, el sistema debe guardar el puntaje y fecha en el navegador, conservar como máximo 30 sesiones y permitir consultarlas en Progreso. | `app/page.tsx`, `components/DentalTraining.tsx` |
| FR-08 | El tutor debe rechazar JSON inválido, cuerpos que no sean objetos, preguntas vacías y preguntas mayores de 1200 caracteres con HTTP 400. Con credenciales de servidor, debe consultar Gemini incluyendo el diente y la vista actuales, limitados a 120 y 80 caracteres. Si falta la clave o falla el proveedor, debe responder con un error. | `app/api/tutor/route.ts`, `app/page.tsx` |

## Requisitos no funcionales

| ID | Requisito | Criterio |
| --- | --- | --- |
| NFR-01 | La aplicación principal debe poder ejecutarse sin proveedor de IA configurado. | Inicio, catálogo y práctica no dependen de la clave Gemini. |
| NFR-02 | La clave del tutor no debe exponerse en código cliente ni guardarse en Git. | Uso en ruta de servidor y plantilla `.env.local.example`; `.env.local` excluido por `.gitignore`. |
| NFR-03 | La interfaz y las rutas deben comunicar errores relevantes y acotar entradas no válidas. | Mensajes en español; la ruta rechaza pregunta vacía, JSON malformado y pregunta mayor de 1200 caracteres. |
| NFR-04 | La representación visual de color STL debe identificarse como ilustrativa, no como segmentación clínica. | Aviso en la interfaz y en README. |
| NFR-05 | El alcance debe ser ejecutable con el stack descrito y pasos reproducibles. | `npm install`, `npm run dev`; compilación mediante `npm run build`. |

## Reglas de negocio y comportamiento

- Los números 1–8 del nombre de un archivo representan posiciones del cuadrante superior derecho y se convierten a FDI 11–18. Un número FDI explícito prevalece sobre ese alias.
- El catálogo acepta únicamente extensiones STL y GLB en nombres que cumplan el patrón documentado por `discoverToothModels`.
- Los resultados se aíslan por navegador y origen; borrar datos del navegador o cambiar de dispositivo puede perderlos. Se guardan como máximo los últimos 30.
- Los STL no incluyen etiquetas de esmalte o encía. El color por altura y la separación de mandíbula son ilustrativos.
- La importación local crea una URL de objeto en el navegador y no persiste el archivo.
- El tutor es opcional, depende de disponibilidad y configuración de Gemini y ofrece asistencia educativa no clínica.

## Non-Goals explícitos

- Diagnóstico odontológico, recomendación de tratamiento, planificación clínica o simulación validada de mordida.
- Segmentación anatómica automática o identificación semántica de tejidos a partir de STL.
- Registro, autenticación, roles, perfiles o sincronización multiusuario.
- Base de datos, almacenamiento remoto de modelos o persistencia de archivos importados.
- Historial del tutor, moderación clínica, garantía de exactitud de respuestas o disponibilidad de IA.
- Catálogo completo de todas las piezas dentales: las fichas actuales y sus modelos disponibles son limitados.
- Implementar una nueva funcionalidad clínica o cambiar la arquitectura solo para ajustarse a un ejemplo Greenfield.

## Criterios de aceptación de la entrega

- Existe un paquete SDD versionado con constitución, requisitos, plan, tareas, checklist y análisis de coherencia.
- Cada requisito tiene evidencia de código o un límite explícito; no hay funciones propuestas presentadas como existentes.
- El README permite instalar, configurar y ejecutar el producto, describe los datos y advierte sobre límites.
- Los casos de verificación y la demo son reproducibles y registran resultados observados.
- Los cambios se realizan sobre `developer` y tienen commits descriptivos; no se hace push ni merge.
