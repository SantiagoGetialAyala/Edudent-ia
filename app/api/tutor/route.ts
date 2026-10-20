import { NextResponse } from "next/server";

type TutorRequest = {
  question?: string;
  tooth?: string;
  activeView?: string;
};

const REQUEST_TIMEOUT_MS = 30000;

async function postToGemini(model: string, apiKey: string, prompt: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text:
                  "Eres un tutor de anatomia dental para estudiantes de odontologia. Responde en espanol, con retroalimentacion clara, breve y accionable. Si el estudiante pide evaluacion, senala aciertos, errores y una recomendacion de practica."
              }
            ]
          },
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            maxOutputTokens: 420,
            thinkingConfig: {
              thinkingLevel: "low"
            }
          }
        })
      }
    );
  } finally {
    clearTimeout(timeout);
  }
}

async function readGeminiResponse(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL ?? "gemini-3.8-flash";

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Falta GEMINI_API_KEY en .env.local. Agrega tu llave de Google AI Studio y reinicia el servidor."
      },
      { status: 500 }
    );
  }

  const body = (await request.json()) as TutorRequest;
  const question = body.question?.trim();

  if (!question) {
    return NextResponse.json(
      { error: "Escribe una pregunta para el tutor." },
      { status: 400 }
    );
  }

  const prompt = `Diente actual: ${body.tooth ?? "Primer Molar Superior"}
Vista activa: ${body.activeView ?? "Vista Vestibular"}
Pregunta del estudiante: ${question}`;

  const fallbackModels = ["gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.5-flash"];
  const modelsToTry = [model, ...fallbackModels.filter((fallback) => fallback !== model)];
  let data: any;
  let response: Response | undefined;
  let lastError: unknown;

  for (const modelToTry of modelsToTry) {
    try {
      response = await postToGemini(modelToTry, apiKey, prompt);
      data = await readGeminiResponse(response);
    } catch (error) {
      lastError = error;
      continue;
    }

    if (response.ok || ![404, 429, 503].includes(response.status)) {
      break;
    }
  }

  if (!response?.ok) {
    const isTimeout =
      lastError instanceof Error &&
      (lastError.name === "AbortError" || lastError.message.includes("fetch failed"));

    return NextResponse.json(
      {
        error:
          data?.error?.message ??
          (isTimeout
            ? "Gemini tardo demasiado en responder. Intenta otra vez en unos segundos o usa GEMINI_MODEL=gemini-3.6-flash en .env.local."
            : undefined) ??
          "No se pudo obtener respuesta de Gemini. Revisa la llave o el modelo configurado."
      },
      { status: response?.status ?? 500 }
    );
  }

  const answer =
    data?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text)
      .filter(Boolean)
      .join("\n") ?? "No recibi texto de respuesta.";

  return NextResponse.json({
    answer
  });
}
