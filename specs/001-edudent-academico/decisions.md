# Registro de decisiones

## D-01: Aplicar SDD como documentación Brownfield del producto

- **Decisión:** describir primero lo observado y conservar el stack existente.
- **Motivo:** el repositorio ya contiene una aplicación Next.js funcional; la guía recomienda minimizar el radio del cambio en Brownfield.
- **Consecuencia:** los documentos capturan el alcance existente y no convierten el ejemplo de gestión documental ni una arquitectura hipotética en requisitos.

## D-02: No inventar una base de datos

- **Decisión:** documentar `localStorage` para resultados y filesystem para modelos.
- **Motivo:** no hay motor, esquema ni migraciones en el código.
- **Consecuencia:** el historial es local al navegador; persistencia multiusuario queda como propuesta futura.

## D-03: Mantener Gemini como integración opcional

- **Decisión:** el tutor no bloquea el visor ni el cuestionario y la clave se conserva en servidor.
- **Motivo:** el endpoint y `.env.local.example` describen una integración externa opcional.
- **Consecuencia:** el caso exitoso depende de configuración y disponibilidad de Google; las respuestas no se presentan como consejo clínico.

## D-04: Validar el contrato entrante del tutor

- **Decisión:** devolver HTTP 400 para JSON malformado, cuerpo que no sea objeto, pregunta ausente/vacía y preguntas mayores de 1200 caracteres; limitar los campos contextuales.
- **Motivo:** estas entradas no pueden producir una solicitud educativa válida y deben fallar de forma controlada.
- **Consecuencia:** se acota el prompt de entrada y se mejora la respuesta de error sin alterar el contrato exitoso.

## D-05: No añadir base de datos, login ni suite E2E a esta adaptación

- **Decisión:** dejarlos como Non-Goals y pendientes de decisión del equipo.
- **Motivo:** no son necesarios para el alcance actual y aumentarían de forma considerable el cambio para la entrega documental.
- **Consecuencia:** la evidencia se limita a lint, tipos, build y smoke tests HTTP; la revisión manual de WebGL sigue siendo necesaria.
