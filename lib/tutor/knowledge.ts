import { Pool } from "pg";

/**
 * Registro de conocimiento anatómico dental previamente revisado y validado por un humano.
 * Se utiliza tanto para fundamentar las respuestas del tutor IA (RAG) como para servir
 * un respaldo literal seguro cuando el proveedor externo no está disponible.
 */
export type Knowledge = { id: number; title: string; content: string; source_url: string; source_title: string; fdi: string | null };

/** Pool de conexiones compartido de PostgreSQL (inicializado de forma diferida). */
let pool: Pool | undefined;

/**
 * Busca fragmentos de conocimiento dental verificados que coincidan con la consulta del estudiante,
 * filtrando estrictamente por la pieza dental (FDI) y la arcada indicadas.
 *
 * @param question Pregunta en lenguaje natural formulada por el estudiante.
 * @param fdi Código FDI de la pieza dental consultada (ej. `"14"`), si aplica.
 * @param arch Arcada dental activa (`"upper"`, `"lower"` o `"both"`).
 * @returns Lista de hasta 5 registros validados ordenados por relevancia textual.
 */
export async function findKnowledge(question: string, fdi?: string, arch = "both"): Promise<Knowledge[]> {
  // Si no hay base de datos configurada, el tutor opera únicamente con el contexto del visor y el modelo IA.
  if (!process.env.DATABASE_URL) return [];
  if (!pool) {
    // Tiempos de espera acotados para no bloquear la experiencia interactiva si la base de datos tarda en responder.
    pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3, connectionTimeoutMillis: 1500, query_timeout: 2000, statement_timeout: 2000, allowExitOnIdle: true });
    pool.on("error", () => console.error("tutor_knowledge_connection_lost", { code: "database_pool_error" }));
  }
  // Only human-reviewed records may ground the tutor or be served as fallback.
  // Search stays within the requested tooth/arch; never use 14 as a generic fallback.
  const result = await pool.query<Knowledge>(`
    SELECT id, title, content, source_url, source_title, fdi
    FROM dental_knowledge
    WHERE reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL
      AND source_url ~ '^https://' AND length(trim(reviewed_by)) > 0
      AND ($2::text IS NULL OR fdi = $2 OR fdi IS NULL)
      AND ($3 = 'both' OR arch = $3 OR arch = 'both')
      AND (search_document @@ plainto_tsquery('spanish', $1) OR ($2::text IS NOT NULL AND fdi = $2))
    ORDER BY ts_rank(search_document, plainto_tsquery('spanish', $1)) DESC, id
    LIMIT 5`, [question, fdi ?? null, arch]);
  return result.rows;
}

/**
 * Formatea una colección de registros verificados en texto plano estructurado
 * con su título, contenido y cita de fuente para inyectarlos en el prompt o mostrarlos como respaldo.
 *
 * @param records Lista de registros de conocimiento dental recuperados.
 * @returns Cadena de texto con las referencias separadas por doble salto de línea.
 */
export function formatReferences(records: Knowledge[]) {
  return records.map(record => `${record.title}\n${record.content}\nFuente: ${record.source_title} — ${record.source_url}`).join("\n\n");
}
