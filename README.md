# Edudent-IA

Edudent-IA es una aplicación web educativa para explorar modelos dentales tridimensionales y practicar conceptos básicos de anatomía dental. Es un proyecto académico, no una herramienta de diagnóstico ni de planificación clínica.

## Funciones disponibles

- Explorar las arcadas dentales superior e inferior y cambiar entre vistas anatómicas.
- Ajustar apertura, visibilidad, rotación, zoom y desplazamiento del modelo.
- Consultar modelos individuales STL o GLB disponibles en `public/models` e importar archivos locales en esos formatos.
- Completar una práctica de cinco preguntas y consultar hasta 30 resultados guardados en el almacenamiento local del navegador.
- Consultar un tutor educativo conectado a Gemini cuando el servidor tenga una clave configurada.

Las superficies STL no contienen etiquetas anatómicas de tejido: los colores de esmalte y encía son una aproximación visual basada en la altura de los vértices. La aplicación no segmenta escaneos, no simula clínicamente la oclusión y no persiste cuentas ni resultados en un servidor.

## Requisitos y ejecución

- Node.js compatible con Next.js 14 y npm.
- Una clave de Google AI Studio solo si se desea utilizar el tutor.

```powershell
npm install
Copy-Item .env.local.example .env.local
# Edita .env.local y agrega GEMINI_API_KEY para habilitar el tutor.
npm run dev
```

Abre <http://localhost:3000>. Para una compilación de producción:

```powershell
npm run build
npm start
```

La aplicación principal y el catálogo de modelos funcionan sin configurar Gemini. Sin una clave, el endpoint del tutor responde con un error de configuración esperado.

## Configuración del tutor

Define `GEMINI_API_KEY` en `.env.local`, que está excluido de Git. `GEMINI_MODEL` es opcional y permite indicar el modelo preferido; la plantilla ofrece un valor predeterminado. No incluyas claves reales en el repositorio, capturas o documentación.

## Modelos dentales

Los dos escaneos completos se cargan desde `public/models/healthreport_upper.stl` y `healthreport_lower.stl`, usando una transformación común para conservar su registro espacial. Para añadir un modelo individual, guarda un archivo con nombre como `Diente numero 6.stl`, `diente-16.glb` o `Diente numero 16.stl` en `public/models` y vuelve a consultar el catálogo en la aplicación. Los números 1–8 se interpretan como posiciones del cuadrante superior derecho (6 equivale a FDI 16); los nombres FDI explícitos tienen prioridad. El incisivo central superior también usa el GLB incluido. Las fichas sin archivo conservan la exploración de arcadas y muestran el estado pendiente.

La importación local acepta archivos `.stl` y `.glb` en el navegador; no los carga al servidor. Para STL individuales se supone corona hacia Z negativo y raíz hacia Z positivo, como en el modelo incluido.

## Arquitectura y datos

Next.js 14, React 18, TypeScript y Tailwind CSS conforman la interfaz y las rutas de servidor. React Three Fiber, Three.js y Drei muestran y manipulan la geometría. `GET /api/models` descubre los archivos del catálogo en el sistema de archivos. `POST /api/tutor` valida la pregunta y reenvía una consulta educativa a Gemini; la clave permanece en el servidor. No existe base de datos, autenticación ni backend de persistencia: los resultados se almacenan en `localStorage` bajo `edudent-training-v1`.

La documentación de diseño, especificación, plan, tareas, decisiones, verificación y demo está en [`specs/001-edudent-academico/`](specs/001-edudent-academico/README.md).

## Verificación

```powershell
npm run lint
npx tsc --noEmit
npm run build
```

El proyecto no incorpora por ahora una suite automatizada de pruebas de comportamiento. Los casos manuales representativos y sus resultados para esta entrega se registran en [`specs/001-edudent-academico/verification.md`](specs/001-edudent-academico/verification.md). La guía de demostración está en [`specs/001-edudent-academico/demo.md`](specs/001-edudent-academico/demo.md).
