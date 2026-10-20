"use client";

import { Html, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { Component, forwardRef, Suspense, useEffect, useImperativeHandle, useMemo, useRef, useState, type ReactNode } from "react";
import { Box3, BufferAttribute, Color, MOUSE, Vector3 } from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { prepareDentalArches, type ArchVisibility } from "./dentalGeometry";

export type DentalModelViewerHandle = { resetCamera: () => void };
type Props = {
  modelUrl?: string;
  modelFormat?: "stl" | "glb";
  activeView?: string;
  toolMode?: string;
  opening?: number;
  visibility?: ArchVisibility;
  autoRotate?: boolean;
  isolatedTooth?: boolean;
};
const viewPresets: Record<string, [number, number, number]> = {
  "Vista Vestibular": [0, 0.5, 6.6],
  "Vista Palatina": [0, 0.4, -6.6],
  "Vista Mesial": [6.6, 0.3, 0],
  "Vista Distal": [-6.6, 0.3, 0],
  "Vista Oclusal": [0, 6.6, 0.01],
  "Vista Radicular": [0, -6.6, 0.01]
};

class ModelErrorBoundary extends Component<{ children: ReactNode; resetKey: string }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error) { console.error("No se pudo cargar el modelo dental", error); }
  componentDidUpdate(previous: { resetKey: string }) {
    if (previous.resetKey !== this.props.resetKey && this.state.hasError) this.setState({ hasError: false });
  }
  render() {
    return this.state.hasError
      ? <Html center><p role="alert" className="w-56 rounded-xl bg-slate-900 p-4 text-center text-sm text-rose-200">No se pudo cargar el modelo. Comprueba el archivo STL o GLB y vuelve a intentarlo.</p></Html>
      : this.props.children;
  }
}

function DentalArches({ opening, visibility }: { opening: number; visibility: ArchVisibility }) {
  const sources = useLoader(STLLoader, ["/models/healthreport_upper.stl", "/models/healthreport_lower.stl"]);
  const arches = useMemo(() => prepareDentalArches(sources[0], sources[1]), [sources]);
  useEffect(() => () => { arches.upper.dispose(); arches.lower.dispose(); }, [arches]);
  return <group>
    {visibility !== "lower" && <mesh geometry={arches.upper} position={[0, 0.06, 0]}>
      <meshPhysicalMaterial vertexColors roughness={0.34} metalness={0} clearcoat={0.25} clearcoatRoughness={0.3} />
    </mesh>}
    {visibility !== "upper" && <group position={[0, -0.06 - opening * 0.42, -0.9]} rotation={[opening * 0.25, 0, 0]}>
      <mesh geometry={arches.lower} position={[0, 0, 0.9]}>
        <meshPhysicalMaterial vertexColors roughness={0.34} metalness={0} clearcoat={0.25} clearcoatRoughness={0.3} />
      </mesh>
    </group>}
  </group>;
}

function UploadedSTL({ url, isolatedTooth }: { url: string; isolatedTooth: boolean }) {
  const source = useLoader(STLLoader, url);
  const geometry = useMemo(() => {
    const result = source.clone();
    result.center();
    result.rotateX(isolatedTooth ? Math.PI / 2 : -Math.PI / 2);
    result.computeBoundingBox();
    const size = result.boundingBox!.getSize(new Vector3());
    const scale = 3.4 / Math.max(size.x, size.y, size.z, 1);
    result.scale(scale, scale, scale);
    if (isolatedTooth) {
      result.computeBoundingBox();
      const bounds = result.boundingBox!;
      const positions = result.getAttribute("position");
      const colors = new Float32Array(positions.count * 3);
      const enamel = new Color("#fff4df");
      const root = new Color("#d6b781");
      const color = new Color();
      for (let i = 0; i < positions.count; i++) {
        const height = (positions.getY(i) - bounds.min.y) / Math.max(bounds.max.y - bounds.min.y, 0.001);
        const blend = Math.min(1, Math.max(0, (height - 0.45) / 0.2));
        color.copy(root).lerp(enamel, blend * blend * (3 - 2 * blend));
        color.toArray(colors, i * 3);
      }
      result.setAttribute("color", new BufferAttribute(colors, 3));
    }
    result.computeVertexNormals();
    return result;
  }, [source, isolatedTooth]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry}><meshPhysicalMaterial vertexColors={isolatedTooth} color={isolatedTooth ? "#ffffff" : "#fff4df"} roughness={0.3} clearcoat={0.25} /></mesh>;
}

function UploadedGLB({ url }: { url: string }) {
  const gltf = useGLTF(url);
  const { scene, scale, position } = useMemo(() => {
    const scene = gltf.scene.clone(true);
    const box = new Box3().setFromObject(scene);
    const center = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());
    const scale = 3.4 / Math.max(size.x, size.y, size.z, 1);
    return { scene, scale, position: center.multiplyScalar(-scale) };
  }, [gltf.scene]);
  return <primitive object={scene} scale={scale} position={position} />;
}

function CameraViewBridge({ activeView, controlsRef, resetNonce, modelKey }: {
  activeView: string; controlsRef: React.RefObject<OrbitControlsImpl>; resetNonce: number; modelKey: string;
}) {
  const { camera, size } = useThree();
  useEffect(() => {
    const position = new Vector3(...(viewPresets[activeView] ?? viewPresets["Vista Vestibular"]));
    // Keep the full model framed even on a narrow phone viewport.
    position.multiplyScalar(Math.max(1, size.height / Math.max(size.width, 1)));
    camera.position.copy(position);
    camera.lookAt(0, 0, 0);
    controlsRef.current?.target.set(0, 0, 0);
    controlsRef.current?.update();
  }, [activeView, camera, controlsRef, resetNonce, modelKey, size.width, size.height]);
  return null;
}

const DentalModelViewer = forwardRef<DentalModelViewerHandle, Props>(function DentalModelViewer({
  modelUrl, modelFormat = "glb", activeView = "Vista Vestibular", toolMode = "Rotacion libre", opening = 0.35, visibility = "both", autoRotate = false, isolatedTooth = false
}, ref) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const [resetNonce, setResetNonce] = useState(0);
  useImperativeHandle(ref, () => ({ resetCamera: () => setResetNonce(v => v + 1) }));
  const leftButton = toolMode === "Zoom activo" ? MOUSE.DOLLY : toolMode === "Desplazamiento activo" ? MOUSE.PAN : MOUSE.ROTATE;
  return <div className="h-full w-full" aria-label={modelUrl ? "Visor 3D del diente individual" : "Visor 3D de las arcadas dentales"}>
    <Canvas camera={{ position: [0, 0.5, 6.6], fov: 38, near: 0.01, far: 100 }} dpr={[1, 1.75]} gl={{ antialias: true, alpha: true }}>
      <CameraViewBridge activeView={activeView} controlsRef={controlsRef} resetNonce={resetNonce} modelKey={modelUrl ?? "arches"} />
      <ambientLight intensity={1.1} />
      <hemisphereLight args={["#fff5e5", "#687b96", 1.5]} />
      <directionalLight position={[3, 4, 6]} intensity={2.4} />
      <directionalLight position={[-4, 1, 3]} intensity={1.2} />
      <directionalLight position={[0, 2, -5]} intensity={1.6} />
      <ModelErrorBoundary resetKey={modelUrl ?? "arches"}>
        <Suspense fallback={<Html center><p role="status" className="w-48 text-center text-sm text-cyan-100">{modelUrl ? "Cargando diente 3D…" : "Cargando arcadas 3D…"}</p></Html>}>
          {modelUrl ? (modelFormat === "stl" ? <UploadedSTL url={modelUrl} isolatedTooth={isolatedTooth} /> : <UploadedGLB url={modelUrl} />) : <DentalArches opening={opening} visibility={visibility} />}
        </Suspense>
      </ModelErrorBoundary>
      <OrbitControls ref={controlsRef} makeDefault enableDamping enablePan minDistance={2} maxDistance={24} autoRotate={autoRotate} autoRotateSpeed={1.2} mouseButtons={{ LEFT: leftButton, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN }} />
    </Canvas>
  </div>;
});
export default DentalModelViewer;
