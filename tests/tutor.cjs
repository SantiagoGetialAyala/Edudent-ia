const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { askGroq, retryDelay } = require(path.join(process.env.EDUDENT_TEST_BUILD, 'lib/tutor/groq.js'));
const input = { question: '¿Cuántas cúspides tiene la pieza 14?', context: 'FDI 14: primer premolar superior derecho; Vista Oclusal', references: '', history: [] };
const ok = () => Response.json({ choices: [{ finish_reason: 'stop', message: { role: 'assistant', reasoning: 'privado', content: 'Dos cúspides habitualmente.' } }] });
const base = { apiKey: 'test-secret', model: 'test-model', random: () => 0 };
for (const status of [408, 429, 500, 502, 503, 504]) {
  test(`HTTP ${status}: reintenta con espera exponencial y conserva el modelo`, async () => {
    let calls = 0; const waits = []; const urls = [];
    const text = await askGroq(input, { ...base, fetcher: async url => { urls.push(url); return ++calls < 3 ? Response.json({}, { status }) : ok(); }, sleep: async ms => { waits.push(ms); } });
    assert.equal(calls, 3); assert.deepEqual(waits, [1000, 2000]); assert.equal(new Set(urls).size, 1); assert.equal(text, 'Dos cúspides habitualmente.');
  });
}
test('respeta Retry-After segundos y fecha', () => {
  assert.equal(retryDelay(new Response('', { headers: { 'retry-after': '5' } })), 5000);
  assert.equal(retryDelay(new Response('', { headers: { 'retry-after': 'Thu, 01 Jan 1970 00:00:08 GMT' } }), 1000), 7000);
  assert.equal(retryDelay(new Response('', { headers: { 'retry-after': 'invalid' } })), 0);
});
test('no acorta cooldown superior al presupuesto ni realiza otro intento', async () => {
  let calls = 0;
  await assert.rejects(askGroq(input, { ...base, fetcher: async () => { calls++; return Response.json({}, { status: 429, headers: { 'retry-after': '120' } }); }, sleep: async () => assert.fail('no debe esperar') }), error => error.status === 429);
  assert.equal(calls, 1);
});
for (const status of [400, 401, 403, 404]) test(`HTTP ${status}: no reintenta ni expone cuerpo sensible`, async () => {
  let calls = 0;
  await assert.rejects(askGroq(input, { ...base, fetcher: async () => { calls++; return Response.json({ error: { message: 'test-secret' } }, { status }); } }), error => error.message === 'provider_http' && !error.message.includes('test-secret'));
  assert.equal(calls, 1);
});
test('fallos de conexión: hasta tres intentos', async () => {
  let calls = 0;
  await assert.rejects(askGroq(input, { ...base, fetcher: async () => { calls++; throw new TypeError('fetch failed'); }, sleep: async () => {} }));
  assert.equal(calls, 3);
});
test('respuesta vacía, JSON inválido, bloqueo y salida truncada no son respuestas válidas', async () => {
  for (const response of [Response.json({}), new Response('not-json'), Response.json({ choices: [{ finish_reason: 'content_filter', message: { content: 'bloqueado' } }] }), Response.json({ choices: [{ finish_reason: 'length', message: { content: 'incompleto' } }] })]) {
    await assert.rejects(askGroq(input, { ...base, fetcher: async () => response }));
  }
});
test('contexto FDI 14, instrucciones en español e historial llegan a Groq; pensamientos internos se omiten', async () => {
  const text = await askGroq({ ...input, history: [{ role: 'student', text: '¿Y la palatina?' }, { role: 'assistant', text: 'Respuesta anterior.' }] }, { ...base, model: 'openai/gpt-oss-20b', fetcher: async (url, init) => {
    const body = JSON.parse(init.body);
    assert.equal(url, 'https://api.groq.com/openai/v1/chat/completions');
    assert.match(body.messages[0].content, /FDI 14/);
    assert.match(body.messages[0].content, /español/);
    assert.match(body.messages.at(-1).content, /primer premolar superior derecho/);
    assert.equal(body.messages[1].content, '¿Y la palatina?');
    assert.deepEqual(body.messages[2], { role: 'assistant', content: 'Respuesta anterior.' });
    assert.equal(init.headers.Authorization, `Bearer ${base.apiKey}`);
    assert.equal(body.model, 'openai/gpt-oss-20b');
    assert.equal(body.reasoning_effort, 'low');
    assert.equal(body.include_reasoning, false);
    assert.equal(body.max_completion_tokens, 1800);
    assert.equal(body.stream, false);
    return ok();
  } });
  assert.equal(text, 'Dos cúspides habitualmente.');
});
test('cancelación del cliente impide solicitudes nuevas', async () => {
  const controller = new AbortController(); controller.abort();
  await assert.rejects(askGroq(input, { ...base, signal: controller.signal, fetcher: async () => assert.fail('cancelada') }));
});
test('timeout incluye lectura de un cuerpo que nunca termina', async () => {
  const started = Date.now();
  const keepAlive = setInterval(() => {}, 50);
  try { await assert.rejects(askGroq(input, { ...base, budgetMs: 80, attemptTimeoutMs: 20, fetcher: async (_, init) => ({ ok: true, json: () => new Promise((resolve, reject) => {
    init.signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
  }) }) }));
  assert.ok(Date.now() - started < 1000);
  } finally { clearInterval(keepAlive); }
});
test('arcadas: posiciones, normales y encía idénticas; solo esmalte ligeramente más oscuro', () => {
  const { BufferGeometry, Float32BufferAttribute, Color } = require('three');
  const { prepareDentalArches } = require(path.join(process.env.EDUDENT_TEST_BUILD, 'components/dentalGeometry.js'));
  const source = new BufferGeometry(); source.setAttribute('position', new Float32BufferAttribute([0, 0, 0, 1, 0, 15, 0, 1, 15], 3));
  const lower = source.clone(); lower.scale(1, 1, -1);
  const result = prepareDentalArches(source, lower);
  const previousSource = fs.readFileSync('components/dentalGeometry.ts', 'utf8').replace('#f0eada', '#fff4df');
  // Evaluate the compiled function with only its old enamel constant for regression comparison.
  const compiled = fs.readFileSync(path.join(process.env.EDUDENT_TEST_BUILD, 'components/dentalGeometry.js'), 'utf8');
  const originalModule = { exports: {} };
  new Function('require', 'exports', compiled.replace('#f0eada', '#fff4df'))(require, originalModule.exports);
  const original = originalModule.exports.prepareDentalArches(source, lower);
  for (const arch of ['upper', 'lower']) {
    assert.deepEqual(result[arch].attributes.position.array, original[arch].attributes.position.array);
    assert.deepEqual(result[arch].attributes.normal.array, original[arch].attributes.normal.array);
    const colors = result[arch].attributes.color;
    const gum = new Color('#ca7182');
    assert.ok(Math.abs(colors.getX(1) - gum.r) < 1e-6);
    assert.ok(Math.abs(colors.getY(1) - gum.g) < 1e-6);
    assert.ok(colors.getX(0) < original[arch].attributes.color.getX(0));
  }
  assert.equal(source.getAttribute('color'), undefined);
  assert.match(previousSource, /#fff4df/);
});
test('PostgreSQL real: migración idempotente, solo contenido revisado, aislamiento por pieza y respaldo literal', { skip: !process.env.TEST_DATABASE_URL }, async () => {
  const { Client } = require('pg');
  const client = new Client({ connectionString: process.env.TEST_DATABASE_URL });
  const schema = `edudent_test_${process.pid}`;
  await client.connect();
  try {
    await client.query(`CREATE SCHEMA ${schema}`);
    await client.query(`SET search_path TO ${schema}`);
    const sql = fs.readFileSync('database/001_dental_knowledge.sql', 'utf8');
    await client.query(sql); await client.query(sql);
    const url = new URL(process.env.TEST_DATABASE_URL);
    url.searchParams.set('options', `-c search_path=${schema}`);
    process.env.DATABASE_URL = url.toString();
    const { findKnowledge, formatReferences } = require(path.join(process.env.EDUDENT_TEST_BUILD, 'lib/tutor/knowledge.js'));
    assert.equal((await findKnowledge('cúspides', '14', 'upper')).length, 0);
    // Test fixture approval only, never applied to the application database.
    await client.query("UPDATE dental_knowledge SET reviewed_by = 'TEST FIXTURE ONLY', reviewed_at = now() WHERE slug = '14-caras'");
    const records = await findKnowledge('cúspides', '14', 'upper');
    assert.equal(records.length, 1); assert.match(records[0].content, /dos cúspides/);
    assert.match(formatReferences(records), /https:\/\//);
    assert.equal((await findKnowledge('cúspides', '15', 'upper')).length, 0);
    assert.equal((await findKnowledge('cúspides', undefined, 'lower')).length, 0);
    assert.equal((await findKnowledge("'; DROP TABLE dental_knowledge; --", '14', 'upper')).length, 1);
    const count = await client.query('SELECT count(*)::integer AS count FROM dental_knowledge');
    assert.equal(count.rows[0].count, 4);
  } finally {
    await client.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
    await client.end();
    delete process.env.DATABASE_URL;
  }
});
test('endpoint: contexto correcto, respaldo literal y errores seguros sin sustituir el panel', async () => {
  const groq = require(path.join(process.env.EDUDENT_TEST_BUILD, 'lib/tutor/groq.js'));
  const knowledge = require(path.join(process.env.EDUDENT_TEST_BUILD, 'lib/tutor/knowledge.js'));
  const ask = groq.askGroq; const find = knowledge.findKnowledge;
  const originalKey = process.env.GROQ_API_KEY;
  const { POST } = require(path.join(process.env.EDUDENT_TEST_BUILD, 'app/api/tutor/route.js'));
  const request = body => new Request('http://localhost/api/tutor', { method: 'POST', body: JSON.stringify(body) });
  const fixture = { id: 1, fdi: '14', title: 'TEST: cúspides', content: 'Texto revisado de prueba.', source_title: 'TEST', source_url: 'https://example.org/reference' };
  try {
    process.env.GROQ_API_KEY = 'test-secret';
    knowledge.findKnowledge = async () => [fixture];
    groq.askGroq = async input => { assert.match(input.context, /FDI 14: primer premolar superior derecho/); return 'Respuesta de prueba'; };
    let response = await POST(request({ question: '¿Qué diente es?', scope: 'tooth', fdi: '14' }));
    assert.equal(response.status, 200);
    const success = await response.json();
    assert.equal(success.source, 'groq');
    assert.equal(success.answer, 'Respuesta de prueba');
    groq.askGroq = async () => { throw new groq.TutorError('provider_http', 503); };
    response = await POST(request({ question: '¿Y sus cúspides?', scope: 'tooth', fdi: '14' }));
    let body = await response.json();
    assert.equal(body.source, 'validated_database'); assert.match(body.answer, /Texto revisado de prueba\./); assert.match(body.answer, /no es una respuesta generada/);
    knowledge.findKnowledge = async () => { throw new Error('sensitive-database-url'); };
    response = await POST(request({ question: '¿Y sus cúspides?', scope: 'tooth', fdi: '14' }));
    assert.equal(response.status, 503); assert.doesNotMatch(JSON.stringify(await response.json()), /secret|sensitive|provider_http/);
    assert.equal((await POST(request({ question: ' ' }))).status, 400);
    knowledge.findKnowledge = async () => [];
    delete process.env.GROQ_API_KEY;
    groq.askGroq = async () => assert.fail('No debe llamar al proveedor sin clave');
    const missingKey = await POST(request({ question: '¿Qué diente es?' }));
    assert.equal(missingKey.status, 503);
    assert.match((await missingKey.json()).error, /GROQ_API_KEY/);
    process.env.GROQ_API_KEY = 'test-secret';
    for (const [status, expected] of [[404, /modelo configurado/], [403, /permisos/], [429, /cuota/], [503, /saturado/]]) {
      groq.askGroq = async () => { throw new groq.TutorError('provider_http', status); };
      const failed = await POST(request({ question: '¿Qué diente es?' }));
      assert.equal(failed.status, 503);
      const failure = await failed.json();
      assert.match(failure.error, expected);
      assert.doesNotMatch(JSON.stringify(failure), /test-secret|provider_http/);
    }
    groq.askGroq = async input => { assert.match(input.context, /sin diente individual identificado/); return 'Arcada'; };
    response = await POST(request({ question: 'Ubicación', scope: 'lower', fdi: '14' }));
    assert.equal(response.status, 200);
    groq.askGroq = async input => { assert.match(input.context, /sin identificación anatómica verificada/); return 'Modelo'; };
    assert.equal((await POST(request({ question: 'Ubicación', scope: 'uploaded', fdi: '14' }))).status, 200);
  } finally {
    groq.askGroq = ask; knowledge.findKnowledge = find;
    if (originalKey === undefined) delete process.env.GROQ_API_KEY; else process.env.GROQ_API_KEY = originalKey;
  }
});
test('Retry-After se respeta aunque falle la lectura del cuerpo de error', async () => {
  let calls = 0;
  await assert.rejects(askGroq(input, { ...base, fetcher: async () => {
    calls++;
    return { ok: false, status: 429, headers: new Headers({ 'retry-after': '120' }), json: async () => { throw new TypeError('interrupted'); } };
  }, sleep: async () => assert.fail('no debe reintentar antes del plazo') }), error => error.retryAfterMs === 120000);
  assert.equal(calls, 1);
});
