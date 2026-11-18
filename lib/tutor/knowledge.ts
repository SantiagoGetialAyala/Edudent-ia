import { Pool } from "pg";

export type Knowledge = { id: number; title: string; content: string; source_url: string; source_title: string; fdi: string | null };
let pool: Pool | undefined;
export async function findKnowledge(question: string, fdi?: string, arch = "both"): Promise<Knowledge[]> {
  if (!process.env.DATABASE_URL) return [];
  if (!pool) {
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
export function formatReferences(records: Knowledge[]) {
  return records.map(record => `${record.title}\n${record.content}\nFuente: ${record.source_title} — ${record.source_url}`).join("\n\n");
}
