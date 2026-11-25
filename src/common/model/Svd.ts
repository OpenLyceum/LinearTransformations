/** Singular values, orthogonal factors, and the three stages from the identity to a matrix. */
import { EPS } from "../../LinearTransformationsConstants.js";
import {
  apply,
  column1,
  column2,
  det,
  diag,
  dotProduct,
  fromColumns,
  IDENTITY,
  type Mat2,
  multiply,
  norm,
  rotation,
  scale,
  type Vec,
} from "./LinearAlgebra.js";

export type Svd = { sigma: readonly [number, number]; u: Mat2; v: Mat2; rank: 0 | 1 | 2; condition: number };
export type SvdAnimation = { theta: number; phi: number; s1: number; s2: number };

export function svd(m: Mat2): Svd {
  const firstColumn = column1(m);
  const secondColumn = column2(m);
  const diagonalDifference = dotProduct(firstColumn, firstColumn) - dotProduct(secondColumn, secondColumn);
  const offDiagonal = dotProduct(firstColumn, secondColumn);

  // The half-angle diagonalizes AᵀA and places the larger eigenvalue first.
  const angle = diagonalDifference === 0 && offDiagonal === 0 ? 0 : Math.atan2(2 * offDiagonal, diagonalDifference) / 2;
  const v = rotation(angle);
  const firstImage = apply(m, column1(v));
  const sigma1 = norm(firstImage);
  const tolerance = EPS * Math.max(1, sigma1);
  const determinant = det(m);

  // The product of singular values is |det A|. This avoids cancellation in the smaller eigenvalue.
  const sigma2 = sigma1 === 0 ? 0 : Math.min(sigma1, Math.abs(determinant) / sigma1);
  const sigma = [sigma1, sigma2] as const;
  if (sigma1 <= tolerance) {
    return { sigma, u: IDENTITY, v: IDENTITY, rank: 0, condition: Infinity };
  }

  const u1 = scale(1 / sigma1, firstImage);
  const perpendicular: Vec = [-u1[1], u1[0]];
  const rank = sigma2 <= tolerance ? 1 : 2;

  // In exact arithmetic A·v₂/σ₂ is this perpendicular with the orientation of A.
  const u2 = rank === 2 && determinant < 0 ? scale(-1, perpendicular) : perpendicular;
  return { sigma, u: fromColumns(u1, u2), v, rank, condition: rank === 2 ? sigma1 / sigma2 : Infinity };
}

function directionAngle([x, y]: Vec): number {
  const angle = Math.atan2(y, x);
  return angle === -Math.PI ? Math.PI : angle;
}

export function svdAnimation(m: Mat2): SvdAnimation {
  const {
    sigma: [s1, sigma2],
    u,
    v,
  } = svd(m);
  return {
    theta: directionAngle(column1(v)),
    phi: directionAngle(column1(u)),
    s1,
    // The sign is needed even for small negative determinants to reconstruct full-rank matrices.
    s2: det(m) < 0 ? -sigma2 : sigma2,
  };
}

export function svdStageMatrix({ theta, phi, s1, s2 }: SvdAnimation, t: number): Mat2 {
  if (t === 0) {
    return IDENTITY;
  }
  if (t <= 1) {
    return rotation(-theta * t);
  }
  const rotated = rotation(-theta);
  if (t <= 2) {
    const fraction = t - 1;
    return multiply(diag(1 + (s1 - 1) * fraction, 1 + (s2 - 1) * fraction), rotated);
  }
  return multiply(rotation(phi * (t - 2)), multiply(diag(s1, s2), rotated));
}
