/** Closed-form eigenvalues and real eigen-directions for 2×2 matrices. */
import { EPS } from "../../LinearTransformationsConstants.js";
import { det, type Mat2, norm, trace, type Vec } from "./LinearAlgebra.js";

export type EigenResult =
  | { kind: "distinct"; values: readonly [number, number]; vectors: readonly [Vec, Vec] }
  | { kind: "scalar"; value: number }
  | { kind: "defective"; value: number; vector: Vec }
  | { kind: "complex"; real: number; imaginary: number };

export function characteristic(m: Mat2): { trace: number; det: number; discriminant: number } {
  const sum = trace(m);
  const determinant = det(m);
  return { trace: sum, det: determinant, discriminant: sum * sum - 4 * determinant };
}

function eigenvector([a, b, c, d]: Mat2, value: number): Vec {
  const first: Vec = [b, value - a];
  const second: Vec = [value - d, c];
  let vector: Vec;
  if (Math.abs(b) > EPS) {
    vector = first;
  } else if (Math.abs(c) > EPS) {
    vector = second;
  } else {
    // Use the longer candidate for diagonal and nearly diagonal matrices.
    vector = norm(first) > norm(second) ? first : second;
  }
  const [x, y] = vector;
  const length = norm(vector);
  const sign = x < 0 || (x === 0 && y < 0) ? -1 : 1;
  return [x === 0 ? 0 : (sign * x) / length, y === 0 ? 0 : (sign * y) / length];
}

export function eigen(m: Mat2): EigenResult {
  const { trace: sum, discriminant } = characteristic(m);
  const midpoint = sum / 2;
  if (discriminant > EPS) {
    const root = Math.sqrt(discriminant) / 2;
    const first = midpoint + root;
    const second = midpoint - root;
    return { kind: "distinct", values: [first, second], vectors: [eigenvector(m, first), eigenvector(m, second)] };
  }
  if (discriminant < -EPS) {
    return { kind: "complex", real: midpoint, imaginary: Math.sqrt(-discriminant) / 2 };
  }

  const [a, b, c, d] = m;
  if (Math.max(Math.abs(a - midpoint), Math.abs(b), Math.abs(c), Math.abs(d - midpoint)) <= EPS) {
    return { kind: "scalar", value: midpoint };
  }
  return { kind: "defective", value: midpoint, vector: eigenvector(m, midpoint) };
}
