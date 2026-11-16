# Checklist de calidad SDD

Revisión de completitud de requisitos siguiendo las preguntas de la guía. Esta lista evalúa los artefactos; no sustituye la ejecución del software.

| Revisión | Resultado | Evidencia / observación |
| --- | --- | --- |
| ¿El usuario y el problema están definidos? | Cumple | Estudiante de odontología; exploración y práctica de anatomía dental. |
| ¿Los requisitos describen comportamientos y por qué, sin prescribir prematuramente la implementación? | Cumple | FR se expresan como resultados observables; decisiones técnicas se guardan en el plan. |
| ¿Cada requisito es verificable y está identificado? | Cumple | FR-01–08 y NFR-01–05 tienen criterios observables. |
| ¿Las reglas de negocio y entradas están delimitadas? | Cumple con límite documentado | Alias a FDI, formatos, cinco preguntas y persistencia están descritos. La validación de contenido geométrico es limitada. |
| ¿Se identificaron Non-Goals para controlar el alcance? | Cumple | Diagnóstico, autenticación, persistencia compartida, segmentación y otros límites aparecen explícitos. |
| ¿La persistencia refleja el producto real? | Cumple | Se declara `localStorage` y filesystem; no se inventa una base de datos. |
| ¿El plan técnico corresponde a los componentes presentes? | Cumple | Módulos y rutas se relacionan con archivos del repositorio. |
| ¿Las tareas se derivan de artefactos y se ordenan por dependencias? | Cumple | T-01–T-11 trazan documentación, verificación y revisión externa. |
| ¿Las excepciones y fallos relevantes están documentados? | Cumple parcialmente | Se describen errores conocidos del visor, catálogo, tutor y almacenamiento; la validación automatizada es limitada. |
| ¿El alcance queda libre de funcionalidades sombra? | Cumple | Capacidades futuras se etiquetan como propuesta y no como entregadas. |
| ¿La validación contiene evidencia reproducible? | Cumple parcialmente | Lint, TypeScript, build y cuatro smoke tests HTTP están registrados; el recorrido manual visual queda pendiente del equipo. |

## Riesgos que requieren decisión del equipo

- Definir si el curso espera pruebas automatizadas además de evidencia manual; el repositorio no trae infraestructura de pruebas.
- Confirmar quién revisará el PR y qué integrante presentará cada parte; el historial local de esta adaptación no representa aportes de los demás integrantes.
- Acordar si el comportamiento del tutor externo se demuestra en vivo o se presenta como integración opcional debido a la dependencia de una credencial y servicio externo.
