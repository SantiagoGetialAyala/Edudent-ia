# Constitución de Edudent-IA

**Estado:** vigente para el alcance académico documentado  
**Producto:** plataforma educativa de exploración y práctica de anatomía dental

## Principios

1. **Aprendizaje educativo y seguro.** La aplicación apoya el estudio de anatomía; no emite diagnósticos, tratamientos ni recomendaciones clínicas individualizadas.
2. **Fidelidad al código.** Las especificaciones y diagramas describen el comportamiento comprobable del repositorio. Toda capacidad futura se etiqueta como propuesta.
3. **Alcance pequeño y coherente.** No se incorporan cuentas, servicios, bases de datos o funciones clínicas sin requisito, decisión y plan explícitos.
4. **Entradas y fallos visibles.** Las rutas de servidor validan los datos recibidos y devuelven errores comprensibles. La interfaz ofrece estados de carga y error donde aplica.
5. **Secretos fuera del cliente y del control de versiones.** Las credenciales de proveedores se leen en el servidor desde variables de entorno; los archivos locales `.env` no se versionan.
6. **Interfaz en español y accesible.** Se conserva el idioma español, se identifican controles y se comunica el estado de carga, error y retroalimentación.
7. **Cambios trazables.** El trabajo se organiza en tareas asociadas a requisitos y cambios acotados; se integra mediante ramas y revisión del equipo cuando este flujo está disponible.
8. **Validación proporcional.** Las afirmaciones de calidad se apoyan en comandos o escenarios ejecutados; se reportan las limitaciones cuando no hay pruebas automatizadas.

## Restricciones técnicas actuales

- Aplicación Next.js 14 con React 18, TypeScript y Tailwind CSS.
- Visualización con Three.js, React Three Fiber y Drei.
- Node.js para la ruta de descubrimiento de modelos y el proxy del tutor.
- Modelos dentales estáticos en `public/models`.
- Resultados de práctica en `localStorage`; no existe base de datos ni autenticación.
- Gemini es una integración externa opcional; su clave solo debe estar en el entorno del servidor.

## Criterio para modificar el alcance

Un cambio debe vincularse a un requisito, preservar el comportamiento fuera de alcance y actualizar primero los artefactos afectados. Una sugerencia de la herramienta de IA o de Spec Kit no sustituye la revisión del equipo.
