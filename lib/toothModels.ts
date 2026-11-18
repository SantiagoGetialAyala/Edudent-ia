import { readdir } from "node:fs/promises";
import path from "node:path";

/**
 * Representa un modelo tridimensional de una pieza dental disponible en el catálogo público.
 * - `url`: Ruta pública codificada para cargar el archivo en el visor 3D.
 * - `format`: Formato geométrico soportado por el cargador (`stl` o `glb`).
 */
export type ToothModel = { url: string; format: "stl" | "glb" };

/**
 * Explora el directorio de modelos 3D (`public/models` por defecto) y construye un mapa
 * indexado por código dental FDI (ej. `"14"`, `"16"`).
 *
 * Convenciones de nombres soportadas:
 * - Un solo dígito (1-8) se interpreta como posición dentro del cuadrante superior derecho
 *   (por ejemplo, `6` equivale a FDI `16`).
 * - Dos dígitos válidos (`11`-`48`) se interpretan directamente como notación FDI.
 *
 * @param directory Ruta absoluta del directorio que contiene los modelos 3D.
 * @returns Diccionario que asocia cada código FDI con su metadato de carga (`ToothModel`).
 */
// Single digits mean position in the upper-right quadrant: 6 corresponds to FDI 16.
export async function discoverToothModels(directory = path.join(process.cwd(), "public/models")) {
  // Se listan únicamente archivos regulares y se ordenan alfabéticamente para garantizar determinismo.
  const files = (await readdir(directory, { withFileTypes: true }))
    .filter(entry => entry.isFile())
    .map(entry => entry.name)
    .sort();
  const models: Record<string, ToothModel> = {};
  for (const file of files) {
    // Coincide con nombres tipo "Diente 14.stl", "diente_numero_6.glb", etc.
    const match = /^diente[\s_-]*(?:n[uú]mero[\s_-]*)?(\d{1,2})\.(stl|glb)$/i.exec(file);
    if (!match) continue;
    const number = Number(match[1]);
    // Normaliza números de un dígito al cuadrante 1 (superior derecho) según la convención del proyecto.
    const fdi = number >= 1 && number <= 8 ? `1${number}` : String(number);
    // Verifica que el código resultante pertenezca a un cuadrante (1-4) y pieza (1-8) válidos en FDI.
    if (!/^[1-4][1-8]$/.test(fdi)) continue;
    // Explicit FDI filenames take priority over position aliases.
    if (!models[fdi] || number >= 11) {
      models[fdi] = { url: `/models/${encodeURIComponent(file)}`, format: match[2].toLowerCase() as ToothModel["format"] };
    }
  }
  return models;
}
