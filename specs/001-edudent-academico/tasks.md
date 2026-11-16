# Tareas SDD y estado de entrega

Las tareas identifican evidencia existente y trabajo documental/técnico realizado en esta adaptación. El estado no pretende atribuir cambios de implementación previos a esta rama.

| ID | Tarea | Requisito / artefacto | Estado | Evidencia |
| --- | --- | --- | --- | --- |
| T-01 | Inspeccionar stack, rutas, componentes, activos y persistencia. | Brownfield | Hecho | `app/`, `components/`, `lib/`, `public/models/`, `package.json`. |
| T-02 | Definir principios y límites comprobables del proyecto. | Constitución | Hecho | `constitution.md`. |
| T-03 | Especificar flujos actuales, reglas, Non-Goals y aceptación. | FR-01–08, NFR-01–05 | Hecho | `spec.md`. |
| T-04 | Documentar arquitectura, responsabilidades, interfaces y fallos. | Plan técnico | Hecho | `plan.md`. |
| T-05 | Representar persistencia real sin inventar una base de datos. | FR-03, FR-07 | Hecho | `data-model.md`. |
| T-06 | Revisar completitud y coherencia de requisitos. | Checklist | Hecho | `checklist.md`. |
| T-07 | Revisar vínculos entre artefactos y código observado. | Análisis | Hecho | `analysis.md`. |
| T-08 | Ejecutar verificaciones solicitadas y registrar resultados observables. | NFR-05 / convergencia | Hecho | `verification.md`: lint, tipos, build y cuatro smoke tests HTTP. |
| T-09 | Preparar README y guion de demo reproducible. | Documentación y demo | Hecho | `README.md`, `demo.md`. |
| T-10 | Guardar avances progresivos en rama `developer`. | Control de versiones | Hecho | Historial Git; commits `3856b36` y `5eb48d1` contienen los hitos revisados. |
| T-11 | Obtener revisión y PR del equipo del curso. | Colaboración | Pendiente externo | Requiere participación de integrantes y acceso al repositorio remoto; no se simula localmente. |

## Orden y dependencias

T-01 precede a T-02–T-05; T-03 orienta T-06 y T-07; T-02–T-07 guían T-08; T-08 y T-09 preceden el cierre T-10. T-11 depende de una revisión humana y del flujo remoto del equipo.

## Trabajo futuro propuesto

No forma parte del alcance implementado: suite automatizada de pruebas de interacción, persistencia multiusuario, autenticación, catálogo anatómico completo y evaluación clínica de modelos. Si alguno se incorpora, debe convertirse primero en requisitos revisados y tareas propias.
