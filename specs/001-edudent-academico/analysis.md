# Análisis de consistencia y convergencia SDD

**Método:** contraste estático entre Constitución, especificación, plan, tareas y archivos actuales; las afirmaciones de ejecución se registran por separado en `verification.md`.

## Matriz requisito–código–verificación

| Requisito | Código relacionado | Verificación propuesta | Brecha identificada |
| --- | --- | --- | --- |
| FR-01 | `DentalModelViewer.tsx`, `dentalGeometry.ts`, STL en `public/models` | Inicio y carga de arcadas; comprobación de consola/red. | Geometría no segmentada; paleta por altura ilustrativa. |
| FR-02 | `DentalModelViewer.tsx`, controles en `app/page.tsx` | Interactuar con cámara, vistas, apertura y visibilidad. | Ninguna brecha de alcance identificada por inspección estática. |
| FR-03 | `lib/toothModels.ts`, `app/api/models/route.ts` | Consultar catálogo y verificar mapeo de nombre incluido. | El catálogo depende de que los archivos estén presentes en el filesystem del despliegue. |
| FR-04 | `app/page.tsx`, `lib/toothModels.ts` | Seleccionar el 16 y una ficha sin activo. | Solo hay un STL individual y un GLB incisivo incluidos. |
| FR-05 | `app/page.tsx`, `DentalModelViewer.tsx` | Importar STL/GLB válidos y rechazar otra extensión. | Se valida extensión, no integridad semántica ni tamaño máximo. |
| FR-06 | `DentalTraining.tsx` | Completar cinco preguntas y confirmar puntaje/explicaciones. | Sin suite automatizada en el repositorio. |
| FR-07 | `app/page.tsx`, `DentalTraining.tsx` | Completar sesión, recargar, revisar historial y límite documentado. | Datos vinculados al navegador; escritura puede fallar por cuota o política del usuario. |
| FR-08 | `app/page.tsx`, `app/api/tutor/route.ts` | JSON malformado, pregunta vacía, pregunta mayor a 1200; caso válido con proveedor configurado pendiente. | La ruta depende de Gemini; no hay garantía de exactitud o continuidad del proveedor. |
| NFR-01–05 | `package.json`, `.env.local.example`, `.gitignore`, README | Lint, TypeScript, build, ejecución y comprobaciones descritas. | `lint` comprueba estática; no equivale a prueba de flujo funcional. |

## Hallazgos de coherencia

1. **Sin base de datos real:** `localStorage` y archivos del servidor son los únicos mecanismos de datos observados. El diagrama distingue esos mecanismos y evita una entidad relacional ficticia.
2. **Tutor como integración opcional:** la interfaz está disponible sin clave, pero el endpoint devuelve un error de configuración. La especificación no hace de Gemini requisito para usar la práctica o el visor.
3. **Modelos visuales educativos:** se mantienen los límites de segmentación y coloración descritos en código y README; no se atribuye precisión clínica.
4. **Trazabilidad de tareas:** T-01–T-10 conectan análisis, artefactos y verificación. T-11 es una tarea colaborativa externa, no una acción que el agente pueda certificar unilateralmente.
5. **Alcance de pruebas:** la documentación establece escenarios manuales, pero no confunde una revisión de requisitos ni un build exitoso con cobertura automatizada de comportamiento.

## Resultado

Los artefactos son consistentes con la arquitectura observada. La convergencia final queda sujeta a los resultados reales de la ejecución de verificaciones y al juicio de revisión del equipo. Las brechas de persistencia multiusuario, automatización de UI, contenido anatómico amplio y validación clínica se mantienen explícitamente fuera de alcance.
