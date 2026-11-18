import { NextResponse } from "next/server";
import { discoverToothModels } from "@/lib/toothModels";

/**
 * Fuerza la ejecución dinámica en cada petición para reflejar de inmediato
 * cualquier modelo 3D agregado o reemplazado en `public/models`.
 */
export const dynamic = "force-dynamic";

/**
 * Se requiere el runtime de Node.js porque el descubrimiento de modelos
 * inspecciona el sistema de archivos local mediante `node:fs/promises`.
 */
export const runtime = "nodejs";

/**
 * Endpoint `GET /api/models`
 *
 * Devuelve el catálogo actualizado de modelos dentales disponibles en el servidor
 * indexados por su código FDI, deshabilitando el almacenamiento en caché del navegador.
 */
export async function GET() {
  try {
    return NextResponse.json(await discoverToothModels(), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    // Registra el fallo internamente sin exponer rutas ni detalles del servidor al cliente.
    console.error("No se pudo leer el catálogo de dientes", error);
    return NextResponse.json({ error: "No se pudieron consultar los modelos disponibles." }, { status: 500 });
  }
}
