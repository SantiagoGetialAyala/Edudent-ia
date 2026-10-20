"use client";

import Image from "next/image";
import {
  BarChart3,
  BookOpen,
  Bot,
  BriefcaseMedical,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Crosshair,
  Home,
  Library,
  MapPin,
  Mouse,
  Move3d,
  PanelTop,
  RotateCcw,
  RotateCw,
  Search,
  Settings,
  Sparkles,
  Upload,
  UserRound
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import DentalModelViewer, {
  type DentalModelViewerHandle
} from "@/components/DentalModelViewer";

import DentalTraining, { readTrainingResults, RESULTS_KEY, type TrainingResult } from "@/components/DentalTraining";
import type { ArchVisibility } from "@/components/dentalGeometry";
import type { ToothModel } from "@/lib/toothModels";

const navItems = [
  { label: "Inicio", icon: Home },
  { label: "Practica", icon: Sparkles },
  { label: "Progreso", icon: BriefcaseMedical },
  { label: "Biblioteca", icon: Library }
];

const sideItems = [
  { label: "Explorar dientes", icon: ToothIcon },
  { label: "Modo practica", icon: ClipboardList },
  { label: "Biblioteca anatomica", icon: BookOpen },
  { label: "Mis resultados", icon: BarChart3 },
  { label: "IA Tutor", icon: Bot },
  { label: "Configuracion", icon: Settings }
];

const viewOptions = [
  "Vista Vestibular",
  "Vista Palatina",
  "Vista Mesial",
  "Vista Distal",
  "Vista Oclusal",
  "Vista Radicular"
];

const teeth = [
  { name: "Incisivo Central Superior", number: "11", type: "Incisivos" },
  { name: "Incisivo Lateral Superior", number: "12", type: "Incisivos" },
  { name: "Canino Superior", number: "13", type: "Caninos" },
  { name: "Primer Premolar Superior", number: "14", type: "Premolares" },
  { name: "Segundo Premolar Superior", number: "15", type: "Premolares" },
  { name: "Primer Molar Superior", number: "16", type: "Molares" },
  { name: "Segundo Molar Superior", number: "17", type: "Molares" }
];

const filters = ["Todos", "Incisivos", "Caninos", "Premolares", "Molares"];

const modelTitle = "Arcadas dentales completas";

type TutorMessage = {
  role: "student" | "assistant";
  text: string;
};

function ToothIcon({
  className,
  size = 24,
  strokeWidth = 1.8
}: {
  className?: string;
  size?: number;
  strokeWidth?: number;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M9.3 3.8C12 2.7 14.2 4.5 16 4.5c1.8 0 4-1.8 6.7-.7 4.8 2 4.1 8.4 2.5 13.1-1.6 4.7-1.5 11.3-5.1 11.3-2.1 0-1.7-5.8-4.1-5.8s-2 5.8-4.1 5.8c-3.6 0-3.5-6.6-5.1-11.3C5.2 12.2 4.5 5.8 9.3 3.8Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.2 8.5c1.5-.6 2.9.5 4.8.5s3.3-1.1 4.8-.5"
        stroke="currentColor"
        strokeWidth={Math.max(1.2, strokeWidth - 0.4)}
        strokeLinecap="round"
      />
    </svg>
  );
}

function ToothThumb({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`relative mx-auto ${compact ? "h-12 w-10" : "h-20 w-16"} drop-shadow-[0_8px_18px_rgba(255,255,255,0.16)]`}
      aria-hidden="true"
    >
      <div className="absolute left-1/2 top-0 h-[48%] w-[78%] -translate-x-1/2 rounded-[45%_45%_36%_36%] bg-gradient-to-br from-white via-[#eee6d6] to-[#cdbf9b]" />
      <div className="absolute bottom-0 left-1/2 h-[62%] w-[43%] -translate-x-1/2 rounded-b-full bg-gradient-to-b from-[#dfd1aa] to-[#b69b68]" />
      <div className="absolute left-[38%] top-[15%] h-[25%] w-[18%] rounded-full bg-white/55 blur-[3px]" />
    </div>
  );
}

function WireTooth() {
  return (
    <div className="tooth-wire relative h-64 w-48 opacity-75">
      <div className="absolute left-1/2 top-2 h-28 w-32 -translate-x-1/2 rounded-[45%_45%_38%_38%] border border-cyanline/35" />
      <div className="absolute left-1/2 top-20 h-40 w-16 -translate-x-1/2 rounded-b-full border border-cyanline/30" />
      {Array.from({ length: 10 }).map((_, index) => (
        <span
          key={index}
          className="absolute left-1/2 w-36 -translate-x-1/2 border-t border-cyanline/20"
          style={{ top: 24 + index * 19 }}
        />
      ))}
      {Array.from({ length: 7 }).map((_, index) => (
        <span
          key={index}
          className="absolute top-4 h-56 border-l border-cyanline/20"
          style={{ left: 36 + index * 20 }}
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  const viewerRef = useRef<DentalModelViewerHandle>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const tutorMessagesRef = useRef<HTMLDivElement>(null);
  const [activeView, setActiveView] = useState("Vista Vestibular");
  const [activeTab, setActiveTab] = useState("Informacion");
  const [activeSection, setActiveSection] = useState("Inicio");
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [selectedTooth, setSelectedTooth] = useState("16");
  const [toothModels, setToothModels] = useState<Record<string, ToothModel>>({});
  const [toothMode, setToothMode] = useState(false);
  const [catalogReady, setCatalogReady] = useState(false);
  const [uploadedModelUrl, setUploadedModelUrl] = useState<string>();
  const [modelFormat, setModelFormat] = useState<"stl" | "glb">("glb");
  const [opening, setOpening] = useState(0.35);
  const [visibility, setVisibility] = useState<ArchVisibility>("both");
  const [autoRotate, setAutoRotate] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [results, setResults] = useState<TrainingResult[]>([]);
  const [storageNotice, setStorageNotice] = useState("");
  const currentToothName = teeth.find(tooth => tooth.number === selectedTooth)?.name ?? "Primer Molar Superior";
  const [uploadedFileName, setUploadedFileName] = useState<string>();
  const [searchQuery, setSearchQuery] = useState("");
  const [toolMode, setToolMode] = useState("Rotacion libre");
  const [tutorQuestion, setTutorQuestion] = useState("");
  const [tutorMessages, setTutorMessages] = useState<TutorMessage[]>([
    {
      role: "assistant",
      text:
        "Hola, soy tu tutor dental. Preguntame sobre caras, cuspides, raices, referencias anatomicas o pide retroalimentacion."
    }
  ]);
  const [isTutorLoading, setIsTutorLoading] = useState(false);
  const selectedModel = toothMode ? toothModels[selectedTooth] : undefined;
  const displayedModelUrl = uploadedModelUrl ?? selectedModel?.url;
  const displayedTitle = uploadedFileName ? "Modelo importado" : selectedModel ? `${currentToothName} · Diente ${selectedTooth.slice(-1)} (FDI ${selectedTooth})` : modelTitle;

  const refreshToothModels = useCallback(async () => {
    try {
      const response = await fetch("/api/models", { cache: "no-store" });
      if (!response.ok) throw new Error("No se pudo consultar el catálogo de dientes.");
      setToothModels(await response.json());
      setCatalogReady(true);
    } catch {
      setUploadError("No se pudieron consultar los dientes disponibles. Vuelve a seleccionar el diente para reintentar.");
    }
  }, []);

  useEffect(() => {
    void refreshToothModels();
    const refresh = () => { void refreshToothModels(); };
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [refreshToothModels]);

  useEffect(() => { setResults(readTrainingResults()); }, []);
  const focusTraining = useCallback((arch: ArchVisibility, view: string) => {
    setToothMode(false);
    setUploadedModelUrl(undefined);
    setUploadedFileName(undefined);
    setVisibility(arch);
    setActiveView(view);
    setAutoRotate(false);
    viewerRef.current?.resetCamera();
  }, []);
  function completeTraining(result: TrainingResult) {
    const updated = [...results, result].slice(-30);
    setResults(updated);
    try { localStorage.setItem(RESULTS_KEY, JSON.stringify(updated)); }
    catch { setStorageNotice("El resultado permanece en esta sesión; el navegador no permitió guardarlo."); }
  }

  const selectedType = teeth.find(tooth => tooth.number === selectedTooth)?.type ?? "Molares";
  const detailRows = [
    { label: "Grupo", value: selectedType, icon: ToothIcon },
    { label: "Ubicación", value: "Maxilar superior derecho", icon: MapPin },
    { label: "Función", value: selectedType === "Incisivos" ? "Cortar" : selectedType === "Caninos" ? "Desgarrar" : "Triturar", icon: Crosshair },
    { label: "Número FDI", value: selectedTooth, icon: PanelTop }
  ];
  const visibleTeeth = useMemo(() => {
    return teeth.filter((tooth) => {
      const matchesFilter = activeFilter === "Todos" || tooth.type === activeFilter;
      const normalizedQuery = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !normalizedQuery ||
        tooth.name.toLowerCase().includes(normalizedQuery) ||
        tooth.number.includes(normalizedQuery) ||
        tooth.type.toLowerCase().includes(normalizedQuery);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  useEffect(() => {
    return () => {
      if (uploadedModelUrl) {
        URL.revokeObjectURL(uploadedModelUrl);
      }
    };
  }, [uploadedModelUrl]);

  useEffect(() => {
    if (activeTab === "IA Tutor") {
      tutorMessagesRef.current?.scrollTo({
        top: tutorMessagesRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [activeTab, tutorMessages, isTutorLoading]);

  function handleModelUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!/\.(stl|glb)$/i.test(file.name)) {
      setUploadError("Selecciona un archivo .stl o .glb.");
      event.target.value = "";
      return;
    }
    setUploadError("");
    setModelFormat(file.name.toLowerCase().endsWith(".stl") ? "stl" : "glb");
    setUploadedModelUrl(URL.createObjectURL(file));
    setUploadedFileName(file.name);
    viewerRef.current?.resetCamera();
    event.target.value = "";
  }

  function handleToothSelect(toothNumber: string) {
    setSelectedTooth(toothNumber);
    setToothMode(true);
    setUploadedModelUrl(undefined);
    setUploadedFileName(undefined);
    setUploadError("");
    setAutoRotate(false);
    setToolMode("Rotacion libre");
    setActiveView("Vista Vestibular");
    viewerRef.current?.resetCamera();
    void refreshToothModels();
  }

  function handleNav(label: string) {
    setActiveSection(label);

    if (label === "Practica") setActiveTab("Practica");
    if (label === "Progreso") setActiveTab("Progreso");
    if (label === "Biblioteca") setActiveTab("Estructuras");
    if (label === "Inicio") setActiveTab("Informacion");
  }

  function handleSideNav(label: string) {
    if (label === "Explorar dientes") setActiveTab("Informacion");
    if (label === "Modo practica") setActiveTab("Practica");
    if (label === "Biblioteca anatomica") setActiveTab("Estructuras");
    if (label === "Mis resultados") setActiveTab("Progreso");
    if (label === "IA Tutor") setActiveTab("IA Tutor");
    if (label === "Configuracion") setActiveTab("Notas");
  }

  function scrollTeeth(direction: "left" | "right") {
    carouselRef.current?.scrollBy({
      left: direction === "left" ? -340 : 340,
      behavior: "smooth"
    });
  }

  async function handleTutorSubmit() {
    const question = tutorQuestion.trim();

    if (!question || isTutorLoading) return;

    setTutorMessages((messages) => [...messages, { role: "student", text: question }]);
    setTutorQuestion("");
    setIsTutorLoading(true);

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          tooth: currentToothName,
          activeView
        })
      });
      const data = await response.json();

      setTutorMessages((messages) => [
        ...messages,
        {
          role: "assistant",
          text: data.answer ?? data.error ?? "No pude generar retroalimentacion."
        }
      ]);
    } catch {
      setTutorMessages((messages) => [
        ...messages,
        {
          role: "assistant",
          text: "No pude conectar con el tutor. Revisa el servidor y la configuracion del .env."
        }
      ]);
    } finally {
      setIsTutorLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden text-slate-100">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#07111d]/90 px-4 py-3 backdrop-blur-xl lg:px-7">
        <div className="mx-auto flex max-w-[1720px] items-center gap-4">
          <div className="flex min-w-[240px] items-center gap-3">
            <div className="flex h-14 w-28 items-center justify-center rounded-xl border border-white/12 bg-white px-2 shadow-sm">
              <Image
                src="/models/logou.png"
                alt="Universidad Cooperativa de Colombia"
                width={1622}
                height={559}
                className="max-h-10 w-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-black leading-none tracking-normal md:text-3xl">
                Edudent<span className="text-cyanline">-IA</span>
              </h1>
              <p className="mt-1 text-sm text-slate-400">Aprende. Explora. Comprende.</p>
            </div>
          </div>

          <label className="hidden h-12 min-w-[260px] max-w-xl flex-1 items-center gap-3 rounded-full border border-white/12 bg-white/[0.07] px-5 text-slate-400 shadow-inner md:flex">
            <Search size={19} />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-400"
              placeholder="Buscar diente, estructura o tema..."
            />
          </label>

          <nav className="ml-auto hidden items-center gap-3 lg:flex">
            {navItems.map(({ label, icon: Icon }) => {
              const active = activeSection === label;

              return (
              <button
                key={label}
                onClick={() => handleNav(label)}
                className={`group grid min-w-24 place-items-center gap-1 rounded-lg px-3 py-1.5 text-sm transition ${
                  active ? "text-cyanline" : "text-slate-300 hover:text-white"
                }`}
              >
                <Icon size={21} strokeWidth={active ? 2.4 : 1.8} />
                <span>{label}</span>
                <span className={`h-0.5 w-12 rounded-full ${active ? "bg-cyanline" : "bg-transparent"}`} />
              </button>
              );
            })}
          </nav>

          <button className="flex min-w-fit items-center gap-3 rounded-2xl px-2 py-1 text-left transition hover:bg-white/[0.06]">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-200/15 text-slate-200">
              <UserRound size={29} />
            </div>
            <span className="hidden sm:block">
              <span className="block text-sm font-semibold">Brayan</span>
              <span className="block text-sm text-slate-400">Estudiante</span>
            </span>
            <ChevronDown className="hidden text-slate-300 sm:block" size={20} />
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1720px] grid-cols-1 gap-4 p-4 lg:grid-cols-[240px_minmax(0,1fr)_410px] lg:p-5">
        <aside className="glass-panel hidden min-h-[calc(100vh-112px)] rounded-3xl p-4 lg:block">
          <div className="space-y-2">
            {sideItems.map(({ label, icon: Icon }) => {
              const active =
                (label === "Explorar dientes" && activeTab === "Informacion") ||
                (label === "Modo practica" && activeTab === "Practica") ||
                (label === "Biblioteca anatomica" && activeTab === "Estructuras") ||
                (label === "Mis resultados" && activeTab === "Progreso") ||
                (label === "IA Tutor" && activeTab === "IA Tutor") ||
                (label === "Configuracion" && activeTab === "Notas");

              return (
              <button
                key={label}
                onClick={() => handleSideNav(label)}
                className={`flex h-16 w-full items-center gap-4 rounded-xl px-4 text-left transition ${
                  active
                    ? "border-l-4 border-cyanline bg-cyanline/12 text-white"
                    : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                <Icon className={active ? "text-cyanline" : "text-slate-300"} size={27} />
                <span className="text-sm font-medium">{label}</span>
              </button>
              );
            })}
          </div>

          <div className="mt-20 flex justify-center">
            <WireTooth />
          </div>
          <div className="mt-8 px-4">
            <p className="text-lg leading-relaxed text-slate-200">
              “El conocimiento tambien se construye desde todos los angulos”
            </p>
            <div className="mt-5 h-0.5 w-9 bg-cyanline" />
            <p className="mt-8 text-sm text-slate-400">
              <span className="block text-slate-200">Edudent-IA</span>
              Universidad Cooperativa de Colombia
            </p>
          </div>
        </aside>

        <section className="min-w-0 space-y-4">
          <div className="glass-panel relative min-h-[620px] overflow-hidden rounded-3xl">
            <div className="absolute inset-x-8 bottom-0 h-56 opacity-70 viewer-grid" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(110,190,220,0.20),transparent_32%)]" />

            <div className="relative z-10 flex h-full min-h-[620px]">
              <div className="pointer-events-none absolute left-6 top-6">
                <h2 className="text-xl font-bold md:text-2xl">{displayedTitle}</h2>
                {displayedModelUrl && <p className="mt-2 text-lg text-slate-400">{activeView}</p>}
                <div className="mt-3 h-0.5 w-9 bg-cyanline" />
              </div>

              {displayedModelUrl && <select aria-label="Vista anatómica" value={activeView} onChange={event => setActiveView(event.target.value)} className="absolute left-6 top-24 z-20 max-w-[210px] rounded-xl border border-white/15 bg-[#101d2c] p-2 text-sm xl:hidden">
                {viewOptions.map(view => <option key={view} value={view}>{view}</option>)}
              </select>}

              <div className="absolute right-4 top-24 z-30">
                <input
                  id="dental-model-upload"
                  type="file"
                  accept=".stl,.glb,model/stl,model/gltf-binary"
                  className="sr-only"
                  onChange={handleModelUpload}
                />
                <label
                  htmlFor="dental-model-upload"
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-cyanline/45 bg-[#07111d]/78 px-4 py-2 text-sm font-semibold text-cyanline shadow-glow backdrop-blur transition hover:bg-cyanline/12"
                  title="Cargar modelo STL o GLB"
                >
                  <Upload size={18} />
                  <span className="hidden sm:inline">
                    {uploadedFileName ? uploadedFileName : "Cargar STL / GLB"}
                  </span>
                </label>
              </div>

              <div className="absolute left-2 top-36 z-20 grid w-14 md:left-4 md:w-16 overflow-hidden rounded-xl border border-white/10 bg-[#07111d]/68 backdrop-blur">
                {[
                  { label: "Rotar", icon: RotateCw, action: () => setToolMode("Rotacion libre") },
                  { label: "Zoom", icon: Search, action: () => setToolMode("Zoom activo") },
                  { label: "Mover", icon: Move3d, action: () => setToolMode("Desplazamiento activo") },
                  { label: "Restablecer", icon: RotateCcw, action: () => viewerRef.current?.resetCamera() }
                ].map(({ label, icon: Icon, action }) => (
                  <button
                    key={label}
                    onClick={action}
                    className="grid h-16 place-items-center border-b border-white/10 px-2 text-xs text-slate-200 transition last:border-b-0 hover:bg-cyanline/12 hover:text-white"
                    title={label}
                  >
                    <Icon size={29} />
                    <span>{label === "Restablecer" ? "Centrar" : label}</span>
                  </button>
                ))}
              </div>

              <div className="absolute inset-0 z-0 pb-40 pt-28">
                <DentalModelViewer
                  ref={viewerRef}
                  activeView={activeView}
                  modelUrl={displayedModelUrl}
                  modelFormat={uploadedModelUrl ? modelFormat : selectedModel?.format}
                  isolatedTooth={!uploadedModelUrl && !!selectedModel}
                  toolMode={toolMode}
                  opening={opening}
                  visibility={visibility}
                  autoRotate={autoRotate}
                />
              </div>

              {displayedModelUrl && <div className="absolute right-4 top-36 z-20 hidden w-28 space-y-2 xl:block">
                {viewOptions.map((view) => (
                  <button
                    key={view}
                    onClick={() => setActiveView(view)}
                    className={`w-full rounded-xl border p-2 text-xs transition ${
                      activeView === view
                        ? "cyan-focus bg-cyanline/12 text-white"
                        : "border-white/10 bg-[#07111d]/62 text-slate-200 hover:border-cyanline/40"
                    }`}
                  >
                    <span className="mt-1 block">{view}</span>
                  </button>
                ))}
              </div>}

              <div className="absolute inset-x-3 bottom-3 z-20 space-y-3 rounded-2xl border border-white/12 bg-[#101d2c]/95 p-3 text-sm backdrop-blur">
                {uploadError && <p role="alert" className="text-rose-300">{uploadError}</p>}
                {toothMode && !selectedModel && !uploadedModelUrl && catalogReady && <p role="status" className="text-amber-200">El diente {selectedTooth.slice(-1)} (FDI {selectedTooth}) aún no tiene modelo individual disponible. Se muestran las arcadas completas.</p>}
                <div className="flex flex-wrap items-center gap-2">
                  {([['both', 'Ambas arcadas'], ['upper', 'Superior'], ['lower', 'Inferior']] as const).map(([value, label]) => <button key={value} disabled={!!displayedModelUrl} aria-pressed={!displayedModelUrl && visibility === value} onClick={() => setVisibility(value)} className={`rounded-lg px-3 py-2 disabled:opacity-40 ${!displayedModelUrl && visibility === value ? 'bg-cyanline/20 text-cyanline' : 'bg-white/5'}`}>{label}</button>)}
                  <button aria-pressed={autoRotate} onClick={() => setAutoRotate(v => !v)} className="rounded-lg border border-white/15 px-3 py-2">{autoRotate ? 'Pausar giro' : 'Giro automático'}</button>
                  {(displayedModelUrl || toothMode) && <button onClick={() => { setToothMode(false); setUploadedModelUrl(undefined); setUploadedFileName(undefined); setVisibility("both"); setActiveView("Vista Vestibular"); viewerRef.current?.resetCamera(); }} className="rounded-lg px-3 py-2 text-cyanline">Restaurar boca</button>}
                </div>
                {!displayedModelUrl && <label className="flex items-center gap-3">Apertura <input aria-label="Apertura de la boca" type="range" min="0" max="1" step="0.01" value={opening} onChange={event => setOpening(Number(event.target.value))} className="min-w-0 flex-1 accent-cyan-300" /><span>{Math.round(opening * 100)}%</span></label>}
                <p className="text-xs text-slate-400">{toolMode} · Rueda: zoom · Clic derecho: mover · En móvil: arrastra o pellizca.</p>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-4 md:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
              <h2 className="text-xl font-bold md:text-2xl">Selecciona un diente</h2>
              <div className="flex flex-wrap gap-2 xl:ml-6">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`rounded-xl px-5 py-2 text-sm transition ${
                      activeFilter === filter
                        ? "bg-cyanline/18 text-cyanline"
                        : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 flex items-stretch gap-3">
              <button
                onClick={() => scrollTeeth("left")}
                className="hidden w-12 shrink-0 place-items-center rounded-xl text-slate-300 hover:bg-white/[0.06] md:grid"
              >
                <ChevronLeft size={26} />
              </button>
              <div ref={carouselRef} className="scrollbar-hide flex flex-1 gap-3 overflow-x-auto pb-1">
                {visibleTeeth.map((tooth) => (
                  <button
                    key={tooth.number}
                    onClick={() => handleToothSelect(tooth.number)}
                    aria-pressed={toothMode && selectedTooth === tooth.number}
                    className={`w-36 shrink-0 rounded-xl border p-3 text-center transition ${
                      toothMode && selectedTooth === tooth.number
                        ? "cyan-focus bg-cyanline/8"
                        : "border-white/10 bg-white/[0.035] hover:border-cyanline/40"
                    }`}
                  >
                    <ToothThumb />
                    <span className="mt-2 block text-sm font-semibold leading-tight">{tooth.name}</span>
                    <span className="text-sm text-slate-300">Diente {tooth.number.slice(-1)} · FDI {tooth.number}</span>
                    <span className={`mt-1 block text-xs ${toothModels[tooth.number] ? "text-cyanline" : "text-slate-400"}`}>{!catalogReady ? "Consultando modelos…" : toothModels[tooth.number] ? "Abrir diente 3D" : "Modelo pendiente"}</span>
                  </button>
                ))}
                {visibleTeeth.length === 0 ? (
                  <div className="grid min-h-32 flex-1 place-items-center rounded-xl border border-dashed border-white/12 text-sm text-slate-400">
                    No hay dientes que coincidan con la busqueda.
                  </div>
                ) : null}
              </div>
              <button
                onClick={() => scrollTeeth("right")}
                className="hidden w-12 shrink-0 place-items-center rounded-xl text-slate-300 hover:bg-white/[0.06] md:grid"
              >
                <ChevronRight size={26} />
              </button>
            </div>
          </div>
        </section>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <div className="glass-panel flex min-h-0 flex-col rounded-3xl p-5">
            <div className="grid grid-cols-3 gap-2 border-b border-white/10 pb-4">
              {["Informacion", "Practica", "Progreso", "Estructuras", "IA Tutor", "Notas"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-lg px-2 py-2 text-sm transition ${
                    activeTab === tab
                      ? "bg-white/[0.06] text-cyanline shadow-[inset_0_-2px_0_#38e8ff]"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="min-h-0 pt-6">
              {activeTab === "Informacion" ? (
                <>
                  <h2 className="text-2xl font-bold">{displayedTitle}</h2>
                  <p className="mt-3 leading-relaxed text-slate-300">
                    {uploadedModelUrl ? "Explora el modelo importado con giro libre, zoom y vistas anatómicas." : selectedModel
                      ? "Explora este diente individual: arrastra para girarlo y usa las vistas vestibular, palatina, mesial, distal, oclusal y radicular. El color de esmalte y raíz es ilustrativo."
                      : "Explora el maxilar superior y la mandíbula inferior. Ajusta la apertura, oculta una arcada o gira la boca. Selecciona una ficha con modelo disponible para abrir solo ese diente. Los colores de esmalte y encía son ilustrativos."}
                  </p>
                  <p className="mt-3 text-sm text-cyanline">Ficha de estudio: {currentToothName} ({selectedTooth})</p>
                  <div className="my-5 h-px bg-white/14" />
                  <div className="space-y-2">
                    {detailRows.map(({ label, value, icon: Icon }) => (
                      <div
                        key={label}
                        className="grid grid-cols-[28px_1fr_1.1fr] items-center gap-3 rounded-xl border border-white/8 bg-white/[0.045] px-4 py-3"
                      >
                        <Icon className="text-slate-300" size={21} />
                        <span className="text-sm text-slate-300">{label}</span>
                        <span className="text-sm text-slate-100">{value}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setActiveTab("Practica")}
                    className="mt-5 flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-cyanline font-bold text-[#061321] shadow-glow transition hover:brightness-110"
                  >
                    Iniciar entrenamiento
                    <ChevronRight size={20} />
                  </button>
                </>
              ) : activeTab === "IA Tutor" ? (
                <div className="flex min-h-0 flex-col space-y-4 lg:h-[calc(100vh-250px)]">
                  <h2 className="text-xl font-semibold text-white">IA Tutor</h2>
                  <div
                    ref={tutorMessagesRef}
                    className="h-[min(420px,45vh)] min-h-0 space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.035] p-3 lg:h-auto lg:flex-1"
                  >
                    {tutorMessages.map((message, index) => (
                      <div
                        key={`${message.role}-${index}`}
                        className={`whitespace-pre-wrap break-words rounded-xl px-4 py-3 text-sm leading-relaxed ${
                          message.role === "student"
                            ? "ml-8 bg-cyanline/15 text-white"
                            : "mr-8 bg-[#07111d]/78 text-slate-200"
                        }`}
                      >
                        {message.text}
                      </div>
                    ))}
                    {isTutorLoading ? (
                      <div className="mr-8 rounded-xl bg-[#07111d]/78 px-4 py-3 text-sm text-slate-300">
                        Generando retroalimentacion...
                      </div>
                    ) : null}
                  </div>
                  <textarea
                    value={tutorQuestion}
                    onChange={(event) => setTutorQuestion(event.target.value)}
                    className="min-h-24 w-full shrink-0 resize-none rounded-xl border border-white/10 bg-[#07111d]/78 p-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyanline/70 lg:min-h-28"
                    placeholder="Pregunta algo: por ejemplo, explicame la cara oclusal del primer molar superior..."
                  />
                  <button
                    onClick={handleTutorSubmit}
                    disabled={isTutorLoading}
                    className="flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-cyanline font-bold text-[#061321] shadow-glow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Enviar al tutor
                    <ChevronRight size={19} />
                  </button>
                </div>
              ) : activeTab === "Practica" ? (
                <DentalTraining onFocus={focusTraining} onComplete={completeTraining} />
              ) : activeTab === "Progreso" ? (
                <div className="space-y-4 rounded-2xl border border-white/10 p-5">
                  <h2 className="text-xl font-semibold">Mis resultados</h2>
                  {storageNotice && <p role="status" className="text-sm text-amber-200">{storageNotice}</p>}
                  {results.length === 0 ? <p className="text-slate-300">Completa un entrenamiento para registrar tus aciertos.</p> : <>
                    <p className="text-cyanline">{results.length} sesiones · {Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.reduce((sum, r) => sum + r.total, 0) * 100)}% de aciertos</p>
                    <div className="max-h-80 space-y-2 overflow-y-auto">{[...results].reverse().map((result, i) => <div key={`${result.date}-${i}`} className="rounded-xl bg-white/5 p-3"><span className="font-bold">{result.score} / {result.total}</span><span className="ml-3 text-sm text-slate-400">{new Date(result.date).toLocaleString("es-CO")}</span></div>)}</div>
                  </>}
                </div>
              ) : (
                <div className="min-h-[420px] rounded-2xl border border-dashed border-white/15 p-5 text-slate-300">
                  <h2 className="text-xl font-semibold text-white">{activeTab}</h2>
                  <p className="mt-3 leading-relaxed">
                    Este espacio queda preparado para conectar contenido anatomico, notas del
                    estudiante y futuras funciones de aprendizaje.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className={`glass-panel relative min-h-64 overflow-hidden rounded-3xl p-6 ${activeTab === "IA Tutor" ? "hidden" : ""}`}>
            <p className="max-w-[260px] text-lg leading-relaxed text-slate-200">
              “La tecnologia tambien puede formar mejores profesionales de la salud.”
            </p>
            <div className="mt-5 h-0.5 w-9 bg-cyanline" />
            <div className="absolute bottom-0 right-0 h-40 w-full opacity-65">
              {Array.from({ length: 18 }).map((_, index) => (
                <span
                  key={index}
                  className="absolute bottom-0 h-28 w-[135%] rounded-[50%] border-t border-cyanline/35"
                  style={{
                    right: "-28%",
                    transform: `translateY(${index * 7}px) rotate(${-10 + index * 0.8}deg)`
                  }}
                />
              ))}
            </div>
            <div className="absolute bottom-6 right-7 text-right text-sm text-slate-400">
              <span className="block text-base font-semibold text-slate-200">Edudent-IA</span>
              Odontologia + Tecnologia
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
