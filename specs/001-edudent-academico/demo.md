# Guion de demostración (4–6 minutos)

## Preparación

1. Instalar dependencias con `npm install` y arrancar con `npm run dev`.
2. Abrir `http://localhost:3000` en un navegador con aceleración WebGL disponible.
3. Para mostrar el tutor, configurar `GEMINI_API_KEY` en `.env.local` antes de iniciar. Si no se dispone de credencial, explicar que el servicio es opcional y mostrar el error de configuración sin revelar secretos.
4. Preparar datos del sitio limpios si se desea que el historial inicie vacío.

## Recorrido

1. **Inicio y arcadas (1 min):** identificar propósito educativo y esperar carga de los modelos. Rotar, ampliar y desplazar; cambiar vista, apertura y visibilidad.
2. **Ficha de diente (1 min):** seleccionar el primer molar FDI 16 con STL disponible. Después seleccionar una ficha pendiente y explicar que la boca completa permanece visible.
3. **Importación local (30 s):** importar un STL o GLB de ejemplo y señalar que se visualiza localmente y no se sube al servidor. Si no hay archivo de ejemplo, omitir esta parte.
4. **Práctica (1–2 min):** completar cinco preguntas, observar corrección y explicación, y consultar el puntaje.
5. **Resultados (30 s):** abrir Mis resultados; explicar que se guardan hasta 30 intentos en el almacenamiento del navegador.
6. **Tutor opcional y arquitectura (1 min):** enviar una pregunta educativa contextual si Gemini está configurado. Cerrar señalando que el proyecto no es clínico, no tiene base de datos ni sincroniza historial.

## Mensaje de cierre sugerido

“Edudent-IA permite estudiar morfología dental con modelos 3D y práctica guiada. El alcance es educativo: los colores son ilustrativos, el progreso permanece en este navegador y el tutor depende de un proveedor externo. La arquitectura, las restricciones y los casos de verificación están documentados en el paquete SDD.”
