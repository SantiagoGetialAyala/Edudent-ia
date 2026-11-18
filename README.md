# Edudent-IA

Aplicación de exploración dental 3D y entrenamiento construida con Next.js, React y Three.js.

## Ejecutar

```sh
npm install
npm run dev
```

Abre http://localhost:3000. Para una compilación de producción: `npm run build` y `npm start`.

## Boca 3D

Los modelos incluidos en `public/models/healthreport_upper.stl` y `healthreport_lower.stl` se cargan juntos al abrir la aplicación. Ambos conservan una transformación común para mantener su registro, con la arcada superior arriba y la inferior abajo. La vista frontal se orienta según estos escaneos y la escala se adapta automáticamente.

- Arrastrar para girar; rueda o pellizco para ampliar; clic derecho para desplazar.
- Los botones Rotar, Zoom y Mover cambian la acción del arrastre principal.
- Apertura permite separar y rotar la mandíbula de forma ilustrativa.
- Superior, Inferior y Ambas arcadas controlan la visibilidad.
- Giro automático y las vistas predefinidas facilitan la exploración.
- Cargar STL / GLB permite inspeccionar un archivo individual. Restaurar boca vuelve a los dos STL originales.

Los STL no contienen colores ni etiquetas de tejidos: el esmalte y la encía se colorean mediante una aproximación por altura. No hay segmentación del escaneo ni simulación clínica de la mordida.

## Dientes individuales

Al pulsar una ficha con modelo disponible, el visor muestra únicamente su archivo y conserva el giro libre, zoom, desplazamiento y las seis vistas anatómicas. «Restaurar boca» vuelve a las arcadas completas. El STL individual recibe colores ilustrativos de esmalte marfil y raíz cálida; los GLB conservan sus materiales.

Guarda los modelos en `public/models` como `Diente numero 14.stl`, `Diente numero 16.stl`, `diente-16.glb`, etc. Los números del 1 al 8 representan posiciones del cuadrante superior derecho; los números de dos cifras se interpretan como FDI. Si existen ambos nombres, se prefiere el FDI explícito. Los STL individuales se orientan suponiendo corona hacia Z negativo y raíz hacia Z positivo, como el archivo del diente 14 incluido.

El catálogo se consulta al entrar, volver a la ventana y seleccionar un diente; basta agregar el archivo correspondiente a una ficha existente. Las fichas sin archivo indican «Modelo pendiente» y mantienen la boca completa. El modelo individual incluido es `Diente numero 14.stl`: primer premolar superior derecho (FDI 14), que reemplaza al GLB anterior en el catálogo.

## Entrenamiento

Modo práctica contiene 15 preguntas con vistas guiadas, respuestas, corrección y puntuación. Incluye identificación y morfología habitual de la pieza FDI 14, variaciones anatómicas y límites de interpretación del STL. El material fuente compartido está pendiente de revisión docente. Mis resultados guarda hasta 30 sesiones en el almacenamiento local del navegador y conserva intentos anteriores aunque cambie el número de preguntas. Funciona sin una API de IA.

El tutor de IA es una función independiente que utiliza la configuración del servidor indicada en `.env.local.example`. Crea tu propio `.env.local` para configurarlo; las claves privadas no se incluyen en el paquete.

## Verificación

`npm run lint`, `npx tsc --noEmit` y `npm run build` comprueban el código. `npm test` ejecuta las pruebas controladas del tutor y la regresión geométrica. Para incluir PostgreSQL real, usa `TEST_DATABASE_URL=postgresql://... npm test` contra una base de pruebas: crea y elimina un esquema aislado; nunca uses una base de producción.

## Estabilidad del tutor y respaldo PostgreSQL

La integración existente está en Next.js (`app/api/tutor/route.ts`); este repositorio no contiene Django. No se añadió otro backend. `GROQ_API_KEY`, `GROQ_MODEL` y `DATABASE_URL` son exclusivamente del servidor. El modelo inicial es `openai/gpt-oss-20b`. Se conserva el modelo configurado, sin cambiar entre modelos para eludir cuotas.

El tutor realiza hasta tres intentos para errores temporales HTTP 408, 429, 500, 502, 503 y 504 o fallos de red, con espera exponencial y jitter. Respeta `Retry-After` (segundos o fecha). Si la espera excede el presupuesto, pasa al respaldo sin reintentar antes de tiempo. El servidor conserva el plazo indicado por el proveedor entre solicitudes de la misma instancia. Cada intento tiene hasta 12 segundos incluyendo el cuerpo; Groq tiene un presupuesto total de 42 segundos. El navegador cancela a los 52 segundos, libera el estado de carga y bloquea envíos simultáneos. Los logs registran códigos/estados, nunca claves, preguntas ni cuerpos del proveedor.

El contexto distingue la pieza individual FDI, las arcadas superior/inferior/ambas y los modelos importados sin identificar. La pieza 14 se identifica como primer premolar superior derecho. Se envían hasta ocho mensajes para seguimientos. El tutor recibe metadatos, no ve la geometría. El panel IA Tutor devuelve respuestas breves en texto plano, sin avisos repetidos de validación ni formato Markdown. Solo aclara límites de observación cuando la pregunta lo requiere; las respuestas nunca se guardan automáticamente como contenido validado.

Configura `GROQ_API_KEY` y `GROQ_MODEL=openai/gpt-oss-20b` en `.env.local` y reinicia `npm run dev`. No pegues claves en el chat ni en archivos públicos. La integración usa la API REST oficial `https://api.groq.com/openai/v1/chat/completions`, con mensajes de sistema, historial y contexto FDI. El campo `source` de la respuesta vale `groq`; el frontend conserva el mismo contrato `answer`/`error`. La clave y los logs permanecen en el servidor Next.js; este repositorio no contiene Django.

Para comprobar el acceso de la cuenta, consulta `GET https://api.groq.com/openai/v1/models` con autenticación Bearer desde el servidor y después realiza una pregunta sobre la pieza 14 en el panel. Que el modelo aparezca en la lista no garantiza que una generación funcione: también debe comprobarse una respuesta real. Sin clave válida no se considera verificada la conexión.

Para activar el respaldo:

1. Configura `DATABASE_URL` en `.env.local` con una base PostgreSQL existente y ejecuta `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f database/001_dental_knowledge.sql` desde un entorno que tenga esa variable exportada. Next.js lee `.env.local`, pero `psql` no lo hace automáticamente.
2. Un docente odontólogo debe contrastar, corregir y completar los registros iniciales con las fuentes citadas y registrar `reviewed_by` y `reviewed_at` en cada fila aprobada. Los resúmenes iniciales son borradores, sin revisión científica certificada. No hay respuestas validadas precargadas ni cobertura local garantizada de todas las preguntas (incluidas raíces y comparaciones).
3. Añade contenidos revisados para las demás piezas, variaciones y preguntas frecuentes en la misma tabla. El índice de búsqueda en español permite reutilizarlos; solo se consultan filas con fuente HTTPS, revisor y fecha. Después de editar contenido aprobado, borra ambos campos de revisión hasta una nueva revisión. El usuario de la aplicación solo necesita permiso SELECT; aplica el SQL con un usuario de migraciones.

Sin base configurada, sin registros revisados o ante una falla de PostgreSQL, Groq sigue funcionando; si tampoco está disponible, aparece una limitación clara. El respaldo devuelve extractos literales y sus fuentes, identificados como material de consulta que puede cubrir solo parte de la pregunta. No sintetiza una respuesta ni inventa contenido. Los logs actuales pertenecen al servidor Next.js, no a Django. En despliegues con varias instancias, las cuotas globales deben administrarse en infraestructura compartida; el bloqueo de envíos es por panel.

Las arcadas usan ahora esmalte `#f0eada` (antes `#fff4df`), un marfil ligeramente más oscuro bajo las luces actuales. La encía, las luces, la exposición, los materiales y geometría de dientes individuales, los STL y los controles no se modificaron por este ajuste.

La documentación de diseño, especificación, plan, tareas, decisiones, verificación y demo está en [`specs/001-edudent-academico/`](specs/001-edudent-academico/README.md). Los casos manuales de la entrega inicial se registran en [`specs/001-edudent-academico/verification.md`](specs/001-edudent-academico/verification.md), y la guía de demostración en [`specs/001-edudent-academico/demo.md`](specs/001-edudent-academico/demo.md).
