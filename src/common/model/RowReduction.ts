/** Recorded Gauss–Jordan operations and the solution set of a two-variable system. */
import { EPS } from "../../LinearTransformationsConstants.js";
import { norm, scale, type Vec } from "./LinearAlgebra.js";

type Row = readonly [number, number, number];
type RowIndex = 0 | 1;
export type Augmented = readonly [Row, Row];

export type RowOp =
  | { kind: "swap" }
  | { kind: "scale"; row: RowIndex; factor: number }
  | { kind: "replace"; target: RowIndex; source: RowIndex; multiple: number };

export type Step = { op: RowOp; after: Augmented };

export type Solution =
  | { kind: "unique"; x: Vec }
  | { kind: "infinite"; particular: Vec; direction: Vec }
  | { kind: "all" }
  | { kind: "none" };

function clean(value: number): number {
  return Math.abs(value) <= EPS ? 0 : value;
}

function cleanRow([x, y, right]: Row): Row {
  return [clean(x), clean(y), clean(right)];
}

export function rref(m: Augmented): { steps: readonly Step[]; result: Augmented } {
  const rows: [Row, Row] = [m[0], m[1]];
  const steps: Step[] = [];
  let pivotRow: RowIndex = 0;

  const record = (op: RowOp): void => {
    rows[0] = cleanRow(rows[0]);
    rows[1] = cleanRow(rows[1]);
    steps.push({ op, after: [rows[0], rows[1]] });
  };

  for (const column of [0, 1] as const) {
    if (Math.abs(rows[pivotRow][column]) <= EPS) {
      if (pivotRow === 1 || Math.abs(rows[1][column]) <= EPS) {
        continue;
      }
      [rows[0], rows[1]] = [rows[1], rows[0]];
      record({ kind: "swap" });
    }

    const pivot = rows[pivotRow][column];
    if (pivot !== 1) {
      const factor = 1 / pivot;
      const [x, y, right] = rows[pivotRow];
      const scaled: [number, number, number] = [x * factor, y * factor, right * factor];
      scaled[column] = 1;
      rows[pivotRow] = scaled;
      record({ kind: "scale", row: pivotRow, factor });
    }

    const otherRow = pivotRow === 0 ? 1 : 0;
    const multiple = rows[otherRow][column];
    if (Math.abs(multiple) > EPS) {
      const [x, y, right] = rows[otherRow];
      const [px, py, pright] = rows[pivotRow];
      const replaced: [number, number, number] = [x - multiple * px, y - multiple * py, right - multiple * pright];
      replaced[column] = 0;
      rows[otherRow] = replaced;
      record({ kind: "replace", target: otherRow, source: pivotRow, multiple });
    }

    if (pivotRow === 1) {
      break;
    }
    pivotRow = 1;
  }

  return { steps, result: [cleanRow(rows[0]), cleanRow(rows[1])] };
}

export function classify(result: Augmented): Solution {
  const rows = result.map(cleanRow);
  if (rows.some(([x, y, right]) => x === 0 && y === 0 && right !== 0)) {
    return { kind: "none" };
  }
  const [first, second] = rows.filter(([x, y]) => x !== 0 || y !== 0);
  if (first && second) {
    return { kind: "unique", x: [first[2], second[2]] };
  }
  if (!first) {
    return { kind: "all" };
  }
  const [p, q, r] = first;
  const perpendicular: Vec = [-q, p];
  return {
    kind: "infinite",
    particular: p !== 0 ? [r / p, 0] : [0, r / q],
    direction: scale(1 / norm(perpendicular), perpendicular),
  };
}

/** Format a row operation as mathematical notation using the caller's number format. */
export function formatOp(op: RowOp, fmt: (value: number) => string): string {
  const rows = ["R₁", "R₂"] as const;
  switch (op.kind) {
    case "swap":
      return "R₁ ↔ R₂";
    case "scale":
      return `${rows[op.row]} ← ${fmt(op.factor)}·${rows[op.row]}`;
    case "replace": {
      const target = rows[op.target];
      const sign = op.multiple < 0 ? "+" : "−";
      return `${target} ← ${target} ${sign} ${fmt(Math.abs(op.multiple))}·${rows[op.source]}`;
    }
  }
}
