import { NextResponse } from "next/server";
import { discoverToothModels } from "@/lib/toothModels";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json(await discoverToothModels(), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("No se pudo leer el catálogo de dientes", error);
    return NextResponse.json({ error: "No se pudieron consultar los modelos disponibles." }, { status: 500 });
  }
}
