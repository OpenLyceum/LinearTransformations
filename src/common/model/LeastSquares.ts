/** Line fitting by normal equations and orthogonal projection in the plane. */
import { EPS } from "../../LinearTransformationsConstants.js";
import { dotProduct, type Mat2, mat, normalize, scale, sub, type Vec } from "./LinearAlgebra.js";

export type Fit = { slope: number; intercept: number; sse: number } | null;

export function fitLine(points: readonly Vec[]): Fit {
  let sumX = 0;
  let sumY = 0;
  let sumXX = 0;
  let sumXY = 0;
  for (const [x, y] of points) {
    sumX += x;
    sumY += y;
    sumXX += x * x;
    sumXY += x * y;
  }

  const count = points.length;
  const determinant = count * sumXX - sumX * sumX;
  if (determinant <= EPS) {
    return null;
  }
  const intercept = (sumXX * sumY - sumX * sumXY) / determinant;
  const slope = (count * sumXY - sumX * sumY) / determinant;
  return { slope, intercept, sse: sse(points, slope, intercept) };
}

export function sse(points: readonly Vec[], slope: number, intercept: number): number {
  return points.reduce((sum, [x, y]) => sum + (y - (slope * x + intercept)) ** 2, 0);
}

export function projectOntoLine(a: Vec, b: Vec): { p: Vec; e: Vec } | null {
  const direction = normalize(a);
  if (!direction) {
    return null;
  }
  const p = scale(dotProduct(direction, b), direction);
  return { p, e: sub(b, p) };
}

export function projectionMatrix(a: Vec): Mat2 | null {
  const direction = normalize(a);
  if (!direction) {
    return null;
  }
  const [x, y] = direction;
  return mat(x * x, x * y, x * y, y * y);
}
