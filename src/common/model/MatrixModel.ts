/** An editable matrix whose entries stay in sync with its selected preset. */
import {
  DerivedProperty,
  Multilink,
  NumberProperty,
  StringUnionProperty,
  type TReadOnlyProperty,
} from "scenerystack/axon";
import { ENTRY_RANGE } from "../../LinearTransformationsConstants.js";
import { IDENTITY, type Mat2, mat, nearlyEqual } from "./LinearAlgebra.js";
import { PRESET_IDS, PRESETS, type PresetId } from "./Presets.js";

export class MatrixModel {
  public readonly aProperty: NumberProperty;
  public readonly bProperty: NumberProperty;
  public readonly cProperty: NumberProperty;
  public readonly dProperty: NumberProperty;
  public readonly presetProperty: StringUnionProperty<PresetId>;
  public readonly matrixProperty: TReadOnlyProperty<Mat2>;

  private readonly disposeLinks: () => void;
  private syncing = false;

  public constructor(initial: PresetId | Mat2) {
    const preset = typeof initial === "string" ? initial : "custom";
    const entries = typeof initial === "string" ? (initial === "custom" ? IDENTITY : PRESETS[initial]) : initial;
    const entryProperty = (value: number) =>
      new NumberProperty(ENTRY_RANGE.constrainValue(value), { range: ENTRY_RANGE });
    this.aProperty = entryProperty(entries[0]);
    this.bProperty = entryProperty(entries[1]);
    this.cProperty = entryProperty(entries[2]);
    this.dProperty = entryProperty(entries[3]);
    this.presetProperty = new StringUnionProperty<PresetId>(preset, { validValues: [...PRESET_IDS] });

    const properties = [this.aProperty, this.bProperty, this.cProperty, this.dProperty] as const;
    const matrixProperty = new DerivedProperty(properties, mat);
    this.matrixProperty = matrixProperty;

    this.presetProperty.lazyLink((next) => {
      if (!this.syncing && next !== "custom") {
        this.syncing = true;
        try {
          this.setMatrix(PRESETS[next]);
        } finally {
          this.syncing = false;
        }
      }
    });

    const presetMultilink = Multilink.multilink(properties, (a, b, c, d) => {
      const current = this.presetProperty.value;
      if (!this.syncing && current !== "custom") {
        const [pa, pb, pc, pd] = PRESETS[current];
        if (!(nearlyEqual(a, pa) && nearlyEqual(b, pb) && nearlyEqual(c, pc) && nearlyEqual(d, pd))) {
          this.syncing = true;
          try {
            this.presetProperty.value = "custom";
          } finally {
            this.syncing = false;
          }
        }
      }
    });
    this.disposeLinks = () => {
      presetMultilink.dispose();
      matrixProperty.dispose();
    };
  }

  public setMatrix([a, b, c, d]: Mat2): void {
    this.aProperty.value = ENTRY_RANGE.constrainValue(a);
    this.bProperty.value = ENTRY_RANGE.constrainValue(b);
    this.cProperty.value = ENTRY_RANGE.constrainValue(c);
    this.dProperty.value = ENTRY_RANGE.constrainValue(d);
  }

  public reset(): void {
    this.syncing = true;
    try {
      this.aProperty.reset();
      this.bProperty.reset();
      this.cProperty.reset();
      this.dProperty.reset();
      this.presetProperty.reset();
    } finally {
      this.syncing = false;
    }
  }

  public dispose(): void {
    this.disposeLinks();
    this.presetProperty.dispose();
    this.aProperty.dispose();
    this.bProperty.dispose();
    this.cProperty.dispose();
    this.dProperty.dispose();
  }
}
