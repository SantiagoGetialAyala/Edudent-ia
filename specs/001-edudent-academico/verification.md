# Verificación y convergencia

**Fecha:** 2026-11-16  
**Rama:** `developer`  
**Alcance:** comprobaciones estáticas y smoke tests HTTP locales; no se ejecutó una prueba clínica ni una suite de UI automatizada.

## Comandos ejecutados

| Comprobación | Resultado | Evidencia |
| --- | --- | --- |
| `node node_modules/next/dist/bin/next lint` | Aprobado | `No ESLint warnings or errors`. Se usó la ruta directa porque en este entorno `node_modules/.bin` no contiene enlaces ejecutables. |
| `node node_modules/typescript/bin/tsc --noEmit` | Aprobado | Terminó con código 0 y sin diagnósticos. |
| `node node_modules/next/dist/bin/next build` | Aprobado | Compilación de producción completada; se generaron `/`, `/_not-found`, `/api/models` y `/api/tutor`. |
| `git diff --check` | Aprobado | Sin errores de espacios en el diff de trabajo. |

## Smoke tests HTTP ejecutados

Con el servidor de producción local (`next start`), se observaron estas respuestas:

| Caso | Resultado observado |
| --- | --- |
| `GET /api/models` | HTTP 200; incluye el incisivo central FDI 11 en GLB y el diente 16 en STL. |
| `POST /api/tutor` con JSON malformado | HTTP 400 y mensaje de JSON inválido. |
| `POST /api/tutor` con pregunta vacía | HTTP 400 y mensaje para escribir una pregunta. |
| `POST /api/tutor` con pregunta de 1201 caracteres | HTTP 400 y límite de 1200 caracteres comunicado. |

No se envió una pregunta válida al proveedor Gemini para evitar depender de credenciales o consumir el servicio externo. El camino de éxito de Gemini queda pendiente de verificación con una clave de prueba configurada por el equipo.

## Casos manuales para revisión en navegador

Los siguientes escenarios completan la validación del comportamiento visual y requieren observación humana en un navegador con WebGL:

1. Confirmar carga y manipulación de las arcadas, seis vistas y controles de apertura/visibilidad.
2. Seleccionar el diente 16 y una ficha sin modelo; verificar modelo individual y retorno a arcadas.
3. Importar STL/GLB y una extensión no admitida; verificar mensajes y presentación.
4. Completar el cuestionario, confirmar cinco respuestas, explicación y puntaje; recargar y revisar persistencia local.
5. Confirmar el aviso cuando el navegador no permita escribir en `localStorage` (requiere simular o reproducir la condición).

Estos casos no se declaran ejecutados en esta validación automatizada.

## Brechas y convergencia

- **Convergencia documental:** Constitución, especificación, plan, modelo de datos, tareas, checklist y análisis describen capacidades que existen o etiquetan explícitamente sus límites.
- **Convergencia técnica:** lint, chequeo de tipos, build y cuatro smoke tests HTTP pasaron.
- **Pendiente de equipo:** ejecutar/filmar los escenarios de UI, validar Gemini con credencial de prueba y revisar el cambio en un PR compartido.
- **Fuera de alcance:** pruebas clínicas, persistencia multiusuario y automatización E2E; requieren requisitos y decisiones nuevas.

Una compilación exitosa no demuestra el comportamiento completo del visor ni la exactitud educativa. El equipo debe completar el recorrido manual antes de presentar como demostrada la experiencia visual.
