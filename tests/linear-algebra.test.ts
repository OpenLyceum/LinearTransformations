import { describe, expect, it } from "vitest";
import { characteristic, eigen } from "../src/common/model/Eigen.js";
import { fitLine, projectionMatrix, projectOntoLine, sse } from "../src/common/model/LeastSquares.js";
import {
  add,
  apply,
  column1,
  column2,
  cross,
  det,
  diag,
  dotProduct,
  fromColumns,
  IDENTITY,
  inverse,
  lerp,
  type Mat2,
  mat,
  multiply,
  nearlyEqual,
  norm,
  normalize,
  rotation,
  scale,
  sub,
  transpose,
  type Vec,
} from "../src/common/model/LinearAlgebra.js";
import { MatrixModel } from "../src/common/model/MatrixModel.js";
import { PRESET_IDS, PRESETS } from "../src/common/model/Presets.js";
import { classify, formatOp, rref } from "../src/common/model/RowReduction.js";
import { svd, svdAnimation, svdStageMatrix } from "../src/common/model/Svd.js";

function expectClose(actual: readonly number[], expected: readonly number[]): void {
  expect(actual).toHaveLength(expected.length);
  for (const [index, value] of expected.entries()) {
    expect(actual[index]).toBeCloseTo(value, 9);
  }
}

let seed = 1;
function randomEntry(): number {
  seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
  return (seed / 2 ** 32) * 7 - 3.5;
}

const matrices = Array.from({ length: 200 }, () => mat(randomEntry(), randomEntry(), randomEntry(), randomEntry()));

describe("2×2 matrix and vector operations", () => {
  it("takes determinants and inverts only nonsingular matrices", () => {
    expect(det([1, 2, 3, 4])).toBe(-2);
    const matrix: Mat2 = [2, 1, 1, 3];
    const inverted = inverse(matrix);
    expect(inverted).not.toBeNull();
    expectClose(multiply(matrix, inverted!), IDENTITY);
    expect(inverse([1, 2, 2, 4])).toBeNull();
  });

  it("composes transformations with the rightmost matrix acting first", () => {
    const { rotation90, shear } = PRESETS;
    expectClose(multiply(rotation90, shear), [0, -1, 1, 1]);
    expect(multiply(rotation90, shear)).not.toEqual(multiply(shear, rotation90));
  });

  it("constructs, reads, interpolates, and rotates matrices", () => {
    const matrix = mat(1, 2, 3, 4);
    expect(column1(matrix)).toEqual([1, 3]);
    expect(column2(matrix)).toEqual([2, 4]);
    expect(fromColumns([1, 3], [2, 4])).toEqual(matrix);
    expect(lerp(IDENTITY, matrix, 0.5)).toEqual([1, 1, 1.5, 2.5]);
    expectClose(rotation(Math.PI / 2), PRESETS.rotation90);
  });

  it("adds, normalizes, and compares vectors and scalars", () => {
    expect(add([1, 2], [3, -1])).toEqual([4, 1]);
    expectClose(normalize([3, 4])!, [0.6, 0.8]);
    expect(normalize([0, 0])).toBeNull();
    expect(nearlyEqual(1, 1 + 5e-10)).toBe(true);
    expect(nearlyEqual(1, 1 + 2e-9)).toBe(false);
  });
});

describe("eigen", () => {
  it("orders the eigenvalues and fixes the signs for a symmetric matrix", () => {
    const matrix: Mat2 = [2, 1, 1, 2];
    expect(characteristic(matrix)).toEqual({ trace: 4, det: 3, discriminant: 4 });
    const result = eigen(matrix);
    expect(result.kind).toBe("distinct");
    if (result.kind === "distinct") {
      const component = Math.SQRT1_2;
      expectClose(result.values, [3, 1]);
      expectClose(result.vectors[0], [component, component]);
      expectClose(result.vectors[1], [component, -component]);
    }
  });

  it("chooses the coordinate axes for distinct diagonal eigenvalues", () => {
    expect(eigen([2, 0, 0, 3])).toEqual({
      kind: "distinct",
      values: [3, 2],
      vectors: [
        [0, 1],
        [1, 0],
      ],
    });
  });

  it("classifies scalar, defective, complex, and singular cases", () => {
    expect(eigen([2, 0, 0, 2])).toEqual({ kind: "scalar", value: 2 });
    expect(eigen(PRESETS.shear)).toEqual({ kind: "defective", value: 1, vector: [1, 0] });
    expect(eigen(PRESETS.rotation90)).toEqual({ kind: "complex", real: 0, imaginary: 1 });
    const result = eigen(PRESETS.singular);
    expect(result.kind).toBe("distinct");
    if (result.kind === "distinct") {
      expectClose(result.values, [2, 0]);
    }
  });

  it("satisfies Av = λv for distinct real eigenvalues across the seeded matrices", () => {
    for (const matrix of matrices) {
      const result = eigen(matrix);
      if (result.kind === "distinct") {
        for (const index of [0, 1] as const) {
          const vector = result.vectors[index];
          expect(norm(vector)).toBeCloseTo(1, 9);
          expect(norm(sub(apply(matrix, vector), scale(result.values[index], vector)))).toBeLessThan(1e-9);
        }
      }
    }
  });
});

describe("SVD", () => {
  it("reconstructs the seeded matrices with orthogonal factors and ordered singular values", () => {
    for (const matrix of matrices) {
      const {
        u,
        v,
        sigma: [s1, s2],
      } = svd(matrix);
      expect(s1).toBeGreaterThanOrEqual(s2);
      expect(s2).toBeGreaterThanOrEqual(0);
      expectClose(multiply(transpose(u), u), IDENTITY);
      expectClose(multiply(transpose(v), v), IDENTITY);
      expectClose(multiply(multiply(u, diag(s1, s2)), transpose(v)), matrix);
    }
  });

  it("animates from the identity to each matrix, including a small reflection", () => {
    const smallReflection: Mat2 = [-1e-5, 0, 0, 1e-5];
    for (const matrix of [...matrices, ...Object.values(PRESETS), smallReflection]) {
      const animation = svdAnimation(matrix);
      expectClose(svdStageMatrix(animation, 0), IDENTITY);
      expectClose(svdStageMatrix(animation, 3), matrix);
    }
  });

  it("uses numerical rank and reports an infinite condition number for singular matrices", () => {
    const rankOne: Mat2 = [1, 2, 2, 4];
    const { rank, condition, sigma, u, v } = svd(rankOne);
    expect(rank).toBe(1);
    expect(condition).toBe(Infinity);
    expectClose(multiply(multiply(u, diag(...sigma)), transpose(v)), rankOne);
    expect(svd([0, 0, 0, 0])).toEqual({ rank: 0, condition: Infinity, sigma: [0, 0], u: IDENTITY, v: IDENTITY });
    expect(svd(PRESETS.scale).condition).toBeCloseTo(4, 9);
  });
});

describe("row reduction", () => {
  it("solves a unique system in at most four steps", () => {
    const { steps, result } = rref([
      [1, 1, 3],
      [1, -1, 1],
    ]);
    expect(steps.length).toBeLessThanOrEqual(4);
    expect(result).toEqual([
      [1, 0, 2],
      [0, 1, 1],
    ]);
    expect(classify(result)).toEqual({ kind: "unique", x: [2, 1] });
    expect(steps[0]?.after).toEqual([
      [1, 1, 3],
      [0, -2, -2],
    ]);
  });

  it("classifies inconsistent, rank-one, and zero systems", () => {
    expect(
      classify(
        rref([
          [1, 1, 1],
          [1, 1, 2],
        ]).result,
      ),
    ).toEqual({ kind: "none" });
    const result = classify(
      rref([
        [1, 1, 2],
        [2, 2, 4],
      ]).result,
    );
    expect(result.kind).toBe("infinite");
    if (result.kind === "infinite") {
      const matrix: Mat2 = [1, 1, 2, 2];
      expectClose(apply(matrix, result.particular), [2, 4]);
      expectClose(apply(matrix, result.direction), [0, 0]);
      expect(norm(result.direction)).toBeCloseTo(1, 9);
    }
    expect(
      classify(
        rref([
          [0, 0, 0],
          [0, 0, 0],
        ]).result,
      ),
    ).toEqual({ kind: "all" });
    expect(
      classify(
        rref([
          [0, 2, 4],
          [0, 0, 0],
        ]).result,
      ),
    ).toEqual({
      kind: "infinite",
      particular: [0, 2],
      direction: [-1, 0],
    });
  });

  it("uses the first available pivot and formats each kind of row operation", () => {
    const swapped = rref([
      [0, 1, 1],
      [1, 0, 2],
    ]).steps[0]!;
    const scaled = rref([
      [2, 4, 6],
      [1, 3, 4],
    ]).steps[0]!;
    expect(swapped.op).toEqual({ kind: "swap" });
    expect(scaled.op).toEqual({ kind: "scale", row: 0, factor: 0.5 });
    expect(formatOp(swapped.op, String)).toBe("R₁ ↔ R₂");
    expect(formatOp(scaled.op, String)).toBe("R₁ ← 0.5·R₁");
    expect(formatOp({ kind: "replace", target: 1, source: 0, multiple: 3 }, String)).toBe("R₂ ← R₂ − 3·R₁");
    expect(formatOp({ kind: "replace", target: 1, source: 0, multiple: -3 }, String)).toBe("R₂ ← R₂ + 3·R₁");
  });
});

describe("least squares", () => {
  it("fits exact points on y = 2x + 1", () => {
    const result = fitLine([
      [-1, -1],
      [0, 1],
      [2, 5],
    ])!;
    expectClose([result.slope, result.intercept, result.sse], [2, 1, 0]);
  });

  it("matches the normal equations for the five default points and minimizes SSE", () => {
    const points: readonly Vec[] = [
      [-3, -1.5],
      [-1.5, -1],
      [0, 0.5],
      [1.5, 0.8],
      [3, 2.5],
    ];
    const sumX = 0;
    const sumY = 1.3;
    const sumXX = 22.5;
    const sumXY = 14.7;
    const determinant = points.length * sumXX - sumX ** 2;
    const result = fitLine(points)!;
    expectClose(
      [result.slope, result.intercept],
      [(points.length * sumXY - sumX * sumY) / determinant, (sumXX * sumY - sumX * sumXY) / determinant],
    );
    expect(result.sse).toBeCloseTo(sse(points, result.slope, result.intercept), 9);
    for (const [slope, intercept] of [[0, 0], [1, 1], [-2, 3], ...matrices.map(column1)]) {
      expect(sse(points, slope!, intercept!)).toBeGreaterThanOrEqual(result.sse);
    }
  });

  it("has no unique fit when all x coordinates are equal", () => {
    expect(
      fitLine([
        [1, -1],
        [1, 2],
      ]),
    ).toBeNull();
    expect(fitLine([])).toBeNull();
  });
});

describe("projection", () => {
  it("splits b into components parallel and perpendicular to a", () => {
    const a: Vec = [3, 1];
    const b: Vec = [1, 2.5];
    const { p, e } = projectOntoLine(a, b)!;
    expectClose(add(p, e), b);
    expect(dotProduct(p, e)).toBeCloseTo(0, 9);
    expect(cross(p, a)).toBeCloseTo(0, 9);
    expectClose(apply(projectionMatrix(a)!, b), p);
  });

  it("produces a symmetric idempotent matrix for a nonzero direction", () => {
    const projection = projectionMatrix([3, 1])!;
    expectClose(multiply(projection, projection), projection);
    expectClose(transpose(projection), projection);
    expect(projectionMatrix([0, 0])).toBeNull();
    expect(projectOntoLine([0, 0], [1, 2])).toBeNull();
  });
});

describe("MatrixModel", () => {
  it("synchronizes preset selection and entry edits, and resets both", () => {
    const model = new MatrixModel("identity");
    try {
      model.presetProperty.value = "shear";
      expect(model.matrixProperty.value).toEqual(PRESETS.shear);
      model.aProperty.value = 2;
      expect(model.presetProperty.value).toBe("custom");
      expect(model.matrixProperty.value).toEqual([2, 1, 0, 1]);
      model.reset();
      expect(model.presetProperty.value).toBe("identity");
      expect(model.matrixProperty.value).toEqual(IDENTITY);
    } finally {
      model.dispose();
    }
  });

  it("supports all preset IDs, clamps custom entries, and restores the custom matrix on reset", () => {
    const model = new MatrixModel([1.5, 1, 0, 1]);
    try {
      expect(model.presetProperty.value).toBe("custom");
      for (const preset of PRESET_IDS) {
        model.presetProperty.value = preset;
        if (preset !== "custom") {
          expect(model.matrixProperty.value).toEqual(PRESETS[preset]);
        }
      }
      model.setMatrix([-4, 4, 0, 0]);
      expect(model.matrixProperty.value).toEqual([-3.5, 3.5, 0, 0]);
      expect(model.presetProperty.value).toBe("custom");
      model.reset();
      expect(model.matrixProperty.value).toEqual([1.5, 1, 0, 1]);
      expect(model.presetProperty.value).toBe("custom");
    } finally {
      model.dispose();
    }
  });
});
