import { Box3, BufferAttribute, BufferGeometry, Color, Vector3 } from "three";

export type Arch = "upper" | "lower";
export type ArchVisibility = "both" | Arch;

// Both scans share a coordinate system: Z is up; the arch faces diagonally in XY.
// Apply one transform to the pair so their original bite registration survives.
export function prepareDentalArches(upperSource: BufferGeometry, lowerSource: BufferGeometry) {
  const upper = upperSource.clone();
  const lower = lowerSource.clone();
  const bounds = new Box3();
  for (const geometry of [upper, lower]) {
    geometry.computeBoundingBox();
    bounds.union(geometry.boundingBox!);
  }
  const center = bounds.getCenter(new Vector3());
  const size = bounds.getSize(new Vector3());
  const scale = 3.4 / Math.max(size.x, size.y, size.z, 1);
  for (const [arch, geometry] of [["upper", upper], ["lower", lower]] as const) {
    const positions = geometry.getAttribute("position");
    const colors = new Float32Array(positions.count * 3);
    const enamel = new Color("#fff4df");
    const gum = new Color("#ca7182");
    const color = new Color();
    for (let i = 0; i < positions.count; i++) {
      // STL has no tissue labels. Height provides an illustrative, soft gum line.
      const height = arch === "upper" ? positions.getZ(i) : -positions.getZ(i);
      const blend = Math.max(0, Math.min(1, (height - 8) / 5));
      color.copy(enamel).lerp(gum, blend * blend * (3 - 2 * blend));
      color.toArray(colors, i * 3);
    }
    geometry.setAttribute("color", new BufferAttribute(colors, 3));
    geometry.translate(-center.x, -center.y, -center.z);
    // Align the anterior midpoint with the frontal camera (same rotation for both scans).
    geometry.rotateZ(-Math.PI * 0.62);
    geometry.rotateX(-Math.PI / 2);
    geometry.scale(scale, scale, scale);
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
  }
  return { upper, lower };
}
