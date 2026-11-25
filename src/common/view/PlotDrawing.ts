import { EPS, GRID_LINES } from "../../LinearTransformationsConstants.js";
import { dot, line, type Plane } from "../LabView.js";
import { add, apply, cross, type Mat2, norm, normalize, scale, sub, type Vec } from "../model/LinearAlgebra.js";

const LINE_EXTENT = 20;
const DASH_PATTERN = [6, 5];
const ORIGIN: Vec = [0, 0];

export const F_SHAPE: readonly Vec[] = [
  [0, 0],
  [0, 2],
  [1.2, 2],
  [1.2, 1.6],
  [0.4, 1.6],
  [0.4, 1.2],
  [1, 1.2],
  [1, 0.8],
  [0.4, 0.8],
  [0.4, 0],
];

export function drawTransformedGrid(ctx: CanvasRenderingContext2D, plane: Plane, m: Mat2, color: string): void {
  for (let k = -GRID_LINES; k <= GRID_LINES; k++) {
    line(ctx, [plane.project(apply(m, [k, -LINE_EXTENT])), plane.project(apply(m, [k, LINE_EXTENT]))], color);
    line(ctx, [plane.project(apply(m, [-LINE_EXTENT, k])), plane.project(apply(m, [LINE_EXTENT, k]))], color);
  }
}

export function drawParallelogram(
  ctx: CanvasRenderingContext2D,
  plane: Plane,
  u: Vec,
  w: Vec,
  fill: string,
  stroke: string,
): void {
  const corners: [Vec, Vec, Vec, Vec] = [ORIGIN, u, add(u, w), w];
  if (Math.abs(cross(u, w)) > EPS) {
    line(ctx, corners.map(plane.project), stroke, 1, fill);
    return;
  }

  // For rank one, find the full image of the square along the surviving direction.
  const axis = Math.max(Math.abs(u[0]), Math.abs(w[0])) >= Math.max(Math.abs(u[1]), Math.abs(w[1])) ? 0 : 1;
  corners.sort((a, b) => a[axis] - b[axis]);
  const start = corners[0];
  const end = corners[3];
  if (norm(sub(end, start)) <= EPS) {
    dot(ctx, plane.project(start), stroke, 1.5);
  } else {
    line(ctx, [plane.project(start), plane.project(end)], stroke, 3);
  }
}

export function drawPolygon(
  ctx: CanvasRenderingContext2D,
  plane: Plane,
  m: Mat2,
  points: readonly Vec[],
  stroke: string,
  lineWidth = 3,
): void {
  const projected = points.map((point) => plane.project(apply(m, point)));
  const first = projected[0];
  if (first) {
    line(ctx, [...projected, first], stroke, lineWidth);
  }
}

/** Draw the image of the unit circle, including collapsed images. @public */
export function drawCircleImage(
  ctx: CanvasRenderingContext2D,
  plane: Plane,
  m: Mat2,
  stroke: string,
  samples = 128,
): void {
  const points = Array.from({ length: samples }, (_, index): Vec => {
    const angle = (2 * Math.PI * index) / samples;
    return [Math.cos(angle), Math.sin(angle)];
  });
  drawPolygon(ctx, plane, m, points, stroke);
}

/** Draw a line along a nonzero model direction. @public */
export function drawLineThroughOrigin(
  ctx: CanvasRenderingContext2D,
  plane: Plane,
  direction: Vec,
  color: string,
  dashed = true,
): void {
  const unit = normalize(direction);
  if (unit) {
    ctx.save();
    ctx.setLineDash(dashed ? DASH_PATTERN : []);
    line(ctx, [plane.project(scale(-LINE_EXTENT, unit)), plane.project(scale(LINE_EXTENT, unit))], color);
    ctx.restore();
  }
}

/** Draw a right-angle marker next to the given corner. @public */
export function drawRightAngle(
  ctx: CanvasRenderingContext2D,
  plane: Plane,
  corner: Vec,
  along: Vec,
  perpendicular: Vec,
  color: string,
  size = 0.25,
): void {
  const u = normalize(along);
  const w = normalize(perpendicular);
  if (u && w) {
    const a = add(corner, scale(size, u));
    const b = add(corner, scale(size, w));
    line(ctx, [a, add(a, scale(size, w)), b].map(plane.project), color);
  }
}
