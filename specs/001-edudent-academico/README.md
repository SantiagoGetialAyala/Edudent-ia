# Paquete SDD: Edudent-IA

Este paquete aplica el flujo SDD de forma Brownfield: parte de la arquitectura y del comportamiento observados en el repositorio y documenta el producto académico implementado, sin inventar capas que no existen. Separa hechos actuales de límites y trabajo futuro.

## Artefactos

| Artefacto | Propósito |
| --- | --- |
| [Constitución](constitution.md) | Principios, restricciones y acuerdos del proyecto. |
| [Especificación](spec.md) | Necesidades, requisitos funcionales y no funcionales, reglas y Non-Goals. |
| [Plan técnico](plan.md) | Arquitectura actual, componentes, interfaces y decisiones técnicas. |
| [Modelo de datos](data-model.md) | Entidades lógicas y persistencia real del navegador. |
| [Tareas](tasks.md) | Trabajo derivado de requisitos con estado y evidencia. |
| [Checklist](checklist.md) | Revisión de calidad de los requisitos. |
| [Análisis](analysis.md) | Coherencia entre especificación, plan, tareas y código. |
| [Verificación y convergencia](verification.md) | Casos ejecutados, resultados, límites y brechas. |
| [Decisiones](decisions.md) | Decisiones arquitectónicas y sus razones. |
| [Guion de demostración](demo.md) | Recorrido corto reproducible para la exposición. |
| [Guía de estudio (PDF)](../../output/pdf/Guia_de_estudio_Edudent-IA.pdf) | Explicación del propósito, arquitectura, funciones, datos y límites. |
| [Exposición para cuatro integrantes (PDF)](../../output/pdf/Exposicion_Edudent-IA_4_integrantes.pdf) | Reparto de 8-10 minutos, libreto, demostración y preguntas probables. |

## Convención de evidencia

- **Implementado**: existe en el código y puede señalarse en los archivos actuales.
- **Documentado como límite**: el código no proporciona esa capacidad; se evita insinuar lo contrario.
- **Propuesto**: mejora futura que no se considera parte del producto entregado.

La especificación describe las capacidades disponibles hoy; no transforma ideas futuras en requisitos ya cumplidos. La guía de la asignatura presenta también el flujo Greenfield, pero este repositorio es Brownfield: primero se inspecciona, luego se fijan restricciones, se especifica, planifica, divide y verifica.
