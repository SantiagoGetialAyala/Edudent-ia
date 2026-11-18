import { NextResponse } from "next/server";
import { askGroq, TutorError, type Turn } from "@/lib/tutor/groq";
import { findKnowledge, formatReferences, type Knowledge } from "@/lib/tutor/knowledge";

export const runtime = "nodejs";
export const maxDuration = 60;
let providerCooldownUntil = 0;
const UNAVAILABLE = "El tutor de IA no está disponible temporalmente. Inténtalo de nuevo en unos momentos. No hay contenido revisado suficiente para responder con el respaldo local.";

function unavailableMessage(error: unknown) {
  if (!(error instanceof TutorError)) return UNAVAILABLE;
  if (error.code === "not_configured") return "Falta configurar la clave del tutor en el servidor (GROQ_API_KEY).";
  if (error.code === "provider_http") {
    if (error.status === 404) return "Groq no permite usar el modelo configurado con esta cuenta. Configura un modelo con acceso confirmado y reinicia el servidor.";
    if ([401, 403].includes(error.status)) return "Groq rechazó el acceso al tutor. Revisa la clave de API y los permisos de su proyecto.";
    if (error.status === 429) return "Groq informa que se alcanzó la cuota o el límite de solicitudes del tutor. Revisa los límites del proyecto y espera antes de volver a intentarlo.";
    if (error.status === 503) return "Groq informa que el modelo del tutor está temporalmente saturado o no disponible. Vuelve a intentarlo en unos minutos.";
  }
  if (["network_or_timeout", "timeout"].includes(error.code)) return "El servidor no pudo obtener una respuesta de Groq a tiempo. Comprueba su conexión a Internet y vuelve a intentarlo.";
  return UNAVAILABLE;
}

function reply(body: object, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  let body;
  try { body = await request.json(); } catch { return reply({ error: "La solicitud no contiene JSON válido." }, 400); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return reply({ error: "Solicitud inválida." }, 400);
  const question = typeof body.question === "string" ? body.question.trim() : "";
  if (!question || question.length > 4000) return reply({ error: "Escribe una pregunta de hasta 4000 caracteres." }, 400);
  const activeView = typeof body.activeView === "string" ? body.activeView.slice(0, 80) : "No indicada";
  const scope = ["tooth", "upper", "lower", "both", "uploaded"].includes(body.scope) ? body.scope : "both";
  const fdi = scope === "tooth" && typeof body.fdi === "string" && /^[1-4][1-8]$/.test(body.fdi) ? body.fdi : undefined;
  // Explicit tooth questions take precedence over the current viewer selection.
  const mentioned = [...question.matchAll(/\b([1-4][1-8])\b/g)].map(match => match[1]);
  const searchFdi = mentioned.length === 1 ? mentioned[0] : mentioned.length > 1 ? undefined : fdi;
  const arch = searchFdi ? Number(searchFdi[0]) <= 2 ? "upper" : "lower" : scope === "upper" || scope === "lower" ? scope : "both";
  const history: Turn[] = Array.isArray(body.history) ? body.history.slice(-8).filter((turn: Turn) =>
    turn && ["student", "assistant"].includes(turn.role) && typeof turn.text === "string" && turn.text.length <= 4000
  ).map((turn: Turn) => ({ role: turn.role, text: turn.text })) : [];
  // A sliced conversation can begin with an assistant turn; Groq history starts with the student.
  while (history[0]?.role === "assistant") history.shift();
  const context = scope === "tooth" && fdi
    ? `Pieza permanente FDI ${fdi}${fdi === "14" ? ": primer premolar superior derecho" : ""}; ${activeView}`
    : scope === "uploaded" ? `Modelo importado sin identificación anatómica verificada; ${activeView}`
    : `Arcadas: ${scope}; sin diente individual identificado; ${activeView}`;
  let records: Knowledge[] = [];
  try { records = await findKnowledge(question, searchFdi, arch); }
  catch { console.error("tutor_knowledge_unavailable", { code: "database_query_failed" }); }
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new TutorError("not_configured");
    if (Date.now() < providerCooldownUntil) throw new TutorError("provider_cooldown", 503, providerCooldownUntil - Date.now());
    const answer = await askGroq({ question, context, history, references: formatReferences(records) }, {
      apiKey, model: process.env.GROQ_MODEL ?? "openai/gpt-oss-20b", signal: request.signal
    });
    return reply({ answer, source: "groq" });
  } catch (error) {
    if (error instanceof TutorError && error.retryAfterMs > 0) providerCooldownUntil = Math.max(providerCooldownUntil, Date.now() + error.retryAfterMs);
    console.error("tutor_request_failed", { code: error instanceof TutorError ? error.code : "internal", status: error instanceof TutorError ? error.status : 503 });
    if (request.signal.aborted) return reply({ error: "Solicitud cancelada." }, 499);
    if (records.length) return reply({
      answer: `El tutor de IA no está disponible. Material de consulta revisado (puede cubrir solo parte de tu pregunta; no es una respuesta generada):\n\n${formatReferences(records)}`,
      source: "validated_database",
      references: records.map(({ id, source_url, source_title }) => ({ id, url: source_url, title: source_title }))
    });
    return reply({ error: unavailableMessage(error) }, 503);
  }
}
