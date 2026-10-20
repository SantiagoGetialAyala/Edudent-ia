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

Guarda los modelos en `public/models` como `Diente numero 6.stl`, `Diente numero 16.stl`, `diente-16.glb`, etc. Los números del 1 al 8 representan posiciones del cuadrante superior derecho (6 corresponde a FDI 16); los números de dos cifras se interpretan como FDI. Si existen ambos nombres, se prefiere el FDI explícito. Los STL individuales se orientan suponiendo corona hacia Z negativo y raíz hacia Z positivo, como el archivo del diente 6 incluido.

El catálogo se consulta al entrar, volver a la ventana y seleccionar un diente; basta agregar el archivo correspondiente a una ficha existente. Las fichas sin archivo indican «Modelo pendiente» y mantienen la boca completa. El incisivo central también utiliza el GLB ya incluido.

## Entrenamiento

Modo práctica contiene cinco preguntas con vistas guiadas, respuestas, corrección y puntuación. Mis resultados guarda hasta 30 sesiones en el almacenamiento local del navegador. Funciona sin una API de IA.

El tutor de IA es una función independiente que utiliza la configuración del servidor indicada en `.env.local.example`. Crea tu propio `.env.local` para configurarlo; las claves privadas no se incluyen en el paquete.

## Verificación

`npm run lint`, `npx tsc --noEmit` y `npm run build` comprueban el código.
