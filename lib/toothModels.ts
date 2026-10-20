import { readdir } from "node:fs/promises";
import path from "node:path";

export type ToothModel = { url: string; format: "stl" | "glb" };

// Single digits mean position in the upper-right quadrant: 6 corresponds to FDI 16.
export async function discoverToothModels(directory = path.join(process.cwd(), "public/models")) {
  const files = (await readdir(directory, { withFileTypes: true }))
    .filter(entry => entry.isFile())
    .map(entry => entry.name)
    .sort();
  const models: Record<string, ToothModel> = {};
  for (const file of files) {
    const match = /^diente[\s_-]*(?:n[uú]mero[\s_-]*)?(\d{1,2})\.(stl|glb)$/i.exec(file);
    if (!match) continue;
    const number = Number(match[1]);
    const fdi = number >= 1 && number <= 8 ? `1${number}` : String(number);
    if (!/^[1-4][1-8]$/.test(fdi)) continue;
    // Explicit FDI filenames take priority over position aliases.
    if (!models[fdi] || number >= 11) {
      models[fdi] = { url: `/models/${encodeURIComponent(file)}`, format: match[2].toLowerCase() as ToothModel["format"] };
    }
  }
  if (!models["11"] && files.includes("incisivo-central-superior.glb")) {
    models["11"] = { url: "/models/incisivo-central-superior.glb", format: "glb" };
  }
  return models;
}
