/** Vector and matrix operations in the plane. */
import { EPS } from "../../LinearTransformationsConstants.js";

export type Vec = readonly [number, number];

/** Row-major [[a, b], [c, d]]. The columns are (a, c) and (b, d). */
export type Mat2 = readonly [number, number, number, number];

export const IDENTITY: Mat2 = [1, 0, 0, 1];

export function mat(a: number, b: number, c: number, d: number): Mat2 {
  return [a, b, c, d];
}

export function column1([a, , c]: Mat2): Vec {
  return [a, c];
}

export function column2([, b, , d]: Mat2): Vec {
  return [b, d];
}

export function fromColumns(u: Vec, w: Vec): Mat2 {
  return mat(u[0], w[0], u[1], w[1]);
}

export function apply([a, b, c, d]: Mat2, [x, y]: Vec): Vec {
  return [a * x + b * y, c * x + d * y];
}

/** Compose two transformations with n acting first. */
export function multiply(m: Mat2, n: Mat2): Mat2 {
  return fromColumns(apply(m, column1(n)), apply(m, column2(n)));
}

export function det([a, b, c, d]: Mat2): number {
  return a * d - b * c;
}

export function trace([a, , , d]: Mat2): number {
  return a + d;
}

export function transpose([a, b, c, d]: Mat2): Mat2 {
  return mat(a, c, b, d);
}

export function inverse(m: Mat2): Mat2 | null {
  const determinant = det(m);
  if (Math.abs(determinant) <= EPS) {
    return null;
  }
  const [a, b, c, d] = m;
  return mat(d / determinant, -b / determinant, -c / determinant, a / determinant);
}

export function lerp(m: Mat2, n: Mat2, t: number): Mat2 {
  const interpolate = (from: number, to: number) => (1 - t) * from + t * to;
  return mat(interpolate(m[0], n[0]), interpolate(m[1], n[1]), interpolate(m[2], n[2]), interpolate(m[3], n[3]));
}

export function rotation(radians: number): Mat2 {
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  return mat(cosine, -sine, sine, cosine);
}

export function diag(p: number, q: number): Mat2 {
  return mat(p, 0, 0, q);
}

export function add([x, y]: Vec, [u, v]: Vec): Vec {
  return [x + u, y + v];
}

export function sub([x, y]: Vec, [u, v]: Vec): Vec {
  return [x - u, y - v];
}

export function scale(k: number, [x, y]: Vec): Vec {
  return [k * x, k * y];
}

export function dotProduct([x, y]: Vec, [u, v]: Vec): number {
  return x * u + y * v;
}

export function cross([x, y]: Vec, [u, v]: Vec): number {
  return x * v - y * u;
}

export function norm([x, y]: Vec): number {
  return Math.hypot(x, y);
}

export function normalize(v: Vec): Vec | null {
  const length = norm(v);
  return length <= EPS ? null : scale(1 / length, v);
}

export function nearlyEqual(x: number, y: number, tolerance = EPS): boolean {
  return Math.abs(x - y) <= tolerance;
}
