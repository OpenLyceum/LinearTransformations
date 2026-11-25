import { DerivedProperty, Multilink, NumberProperty, StringUnionProperty } from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import type { Vec } from "../../common/model/LinearAlgebra.js";
import { MatrixModel } from "../../common/model/MatrixModel.js";
import { type Augmented, classify, rref } from "../../common/model/RowReduction.js";
import { HANDLE_X_RANGE, HANDLE_Y_RANGE } from "../../LinearTransformationsConstants.js";

export class SystemsModel implements TModel {
  public readonly matrix = new MatrixModel([1, 1, 1, -1]);
  public readonly bxProperty = new NumberProperty(3, { range: HANDLE_X_RANGE });
  public readonly byProperty = new NumberProperty(1, { range: HANDLE_Y_RANGE });
  public readonly pictureProperty = new StringUnionProperty<"row" | "column">("row", {
    validValues: ["row", "column"],
  });

  public readonly bProperty = new DerivedProperty([this.bxProperty, this.byProperty], (x, y): Vec => [x, y]);
  public readonly rrefProperty = new DerivedProperty(
    [this.matrix.matrixProperty, this.bProperty],
    ([a, b, c, d], [x, y]) => {
      const original: Augmented = [
        [a, b, x],
        [c, d, y],
      ];
      return { original, ...rref(original) };
    },
  );
  public readonly stepProperty = new NumberProperty(0, {
    numberType: "Integer",
    range: new Range(0, this.rrefProperty.value.steps.length),
  });

  private readonly restartOnEdit = Multilink.lazyMultilink([this.rrefProperty], ({ steps }) => {
    this.stepProperty.setValueAndRange(0, new Range(0, steps.length));
  });

  public readonly currentStepProperty = new DerivedProperty(
    [this.rrefProperty, this.stepProperty],
    ({ steps }, index) => steps[index - 1],
  );
  public readonly currentProperty = new DerivedProperty(
    [this.rrefProperty, this.currentStepProperty],
    ({ original }, step) => step?.after ?? original,
  );
  public readonly solutionProperty = new DerivedProperty([this.rrefProperty], ({ result }) => classify(result));

  private readonly properties = [this.bxProperty, this.byProperty, this.pictureProperty];

  public reset(): void {
    this.matrix.reset();
    for (const property of this.properties) {
      property.reset();
    }
    this.stepProperty.reset();
  }

  public dispose(): void {
    this.solutionProperty.dispose();
    this.currentProperty.dispose();
    this.currentStepProperty.dispose();
    this.restartOnEdit.dispose();
    this.stepProperty.dispose();
    this.rrefProperty.dispose();
    this.bProperty.dispose();
    for (const property of this.properties) {
      property.dispose();
    }
    this.matrix.dispose();
  }
}
