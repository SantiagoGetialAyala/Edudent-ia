"use client";

import { useEffect, useState } from "react";
import type { ArchVisibility } from "./dentalGeometry";

const questions = [
  { prompt: "Observa la arcada superior. ¿En qué hueso se encuentran sus dientes?", options: ["Maxilar", "Mandíbula", "Hueso temporal"], answer: 0, explanation: "Los dientes superiores se alojan en el maxilar; los inferiores, en la mandíbula.", arch: "upper", view: "Vista Vestibular" },
  { prompt: "Observa la arcada inferior desde arriba. ¿Qué superficie de los molares estás viendo?", options: ["Vestibular", "Oclusal", "Mesial"], answer: 1, explanation: "La superficie oclusal de premolares y molares participa en el contacto y la trituración de los alimentos.", arch: "lower", view: "Vista Oclusal" },
  { prompt: "¿Qué grupo de dientes tiene un borde adaptado para cortar los alimentos?", options: ["Molares", "Caninos", "Incisivos"], answer: 2, explanation: "Los incisivos ocupan la región anterior de las arcadas y cortan los alimentos con su borde incisal.", arch: "both", view: "Vista Vestibular" },
  { prompt: "En esta vista lateral, ¿qué grupo de dientes se especializa en triturar?", options: ["Incisivos", "Molares", "Caninos"], answer: 1, explanation: "Los molares tienen superficies oclusales amplias con cúspides que ayudan a triturar los alimentos.", arch: "both", view: "Vista Mesial" },
  { prompt: "¿Cómo se llama la superficie de los dientes superiores orientada hacia el paladar?", options: ["Palatina", "Vestibular", "Distal"], answer: 0, explanation: "La cara interna de los dientes superiores se denomina palatina por su relación con el paladar.", arch: "upper", view: "Vista Palatina" }
] as const;

export type TrainingResult = { score: number; total: number; date: string };
export const RESULTS_KEY = "edudent-training-v1";
export function readTrainingResults(): TrainingResult[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(RESULTS_KEY) ?? "[]");
    return Array.isArray(stored) ? stored.filter((r): r is TrainingResult => r && typeof r.score === "number" && r.total === questions.length && r.score >= 0 && r.score <= r.total && typeof r.date === "string").slice(-30) : [];
  } catch { return []; }
}

export default function DentalTraining({ onFocus, onComplete }: {
  onFocus: (arch: ArchVisibility, view: string) => void;
  onComplete: (result: TrainingResult) => void;
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const question = questions[index];
  useEffect(() => { onFocus(question.arch, question.view); }, [question, onFocus]);
  function answer(option: number) {
    if (selected !== null) return;
    setSelected(option);
    if (option === question.answer) setScore(v => v + 1);
  }
  function next() {
    if (index === questions.length - 1) {
      setFinished(true);
      onComplete({ score, total: questions.length, date: new Date().toISOString() });
    } else { setIndex(v => v + 1); setSelected(null); }
  }
  return <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.035] p-5">
    <h2 className="text-xl font-semibold">Entrenamiento dental</h2>
    {finished ? <>
      <p className="text-3xl font-bold text-cyanline">{score} / {questions.length}</p>
      <p className="text-slate-300">Sesión completada. Puedes consultar este intento en Mis resultados.</p>
      <button className="w-full rounded-xl bg-cyanline p-3 font-bold text-slate-950" onClick={() => { setIndex(0); setSelected(null); setScore(0); setFinished(false); }}>Volver a entrenar</button>
    </> : <>
      <p className="text-sm text-cyanline">Pregunta {index + 1} de {questions.length} · {score} aciertos</p>
      <div className="h-1 overflow-hidden rounded bg-white/10"><div className="h-full bg-cyanline" style={{ width: `${index / questions.length * 100}%` }} /></div>
      <p className="leading-relaxed text-slate-200">{question.prompt}</p>
      <p className="text-sm text-slate-400">Gira y amplía el modelo para explorar antes de responder.</p>
      <div className="space-y-2">{question.options.map((option, i) => <button key={option} disabled={selected !== null} onClick={() => answer(i)} className={`w-full rounded-xl border p-3 text-left transition disabled:cursor-default ${selected !== null && i === question.answer ? "border-emerald-400 bg-emerald-400/15" : selected === i ? "border-rose-400 bg-rose-400/15" : "border-white/15 hover:border-cyanline"}`}>{option}</button>)}</div>
      {selected !== null && <div role="status" className="space-y-3">
        <p className={selected === question.answer ? "text-emerald-300" : "text-rose-300"}>{selected === question.answer ? "¡Correcto!" : "Repasemos esta respuesta."}</p>
        <p className="text-sm leading-relaxed text-slate-300">{question.explanation}</p>
        <button className="w-full rounded-xl bg-cyanline p-3 font-bold text-slate-950" onClick={next}>{index === questions.length - 1 ? "Ver resultado" : "Siguiente pregunta"}</button>
      </div>}
    </>}
  </section>;
}
