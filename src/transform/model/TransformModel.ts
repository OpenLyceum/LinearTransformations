import { BooleanProperty, DerivedProperty, NumberProperty, StringUnionProperty } from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import { IDENTITY, lerp, multiply } from "../../common/model/LinearAlgebra.js";
import { MatrixModel } from "../../common/model/MatrixModel.js";

export class TransformModel implements TModel {
  public readonly matrix = new MatrixModel("shear");
  public readonly second = new MatrixModel("rotation90");
  public readonly morphProperty = new NumberProperty(1, { range: new Range(0, 1) });
  public readonly showFProperty = new BooleanProperty(true);
  public readonly showGridProperty = new BooleanProperty(true);
  public readonly composeProperty = new BooleanProperty(false);
  public readonly orderProperty = new StringUnionProperty<"BA" | "AB">("BA", { validValues: ["BA", "AB"] });

  private readonly properties = [
    this.morphProperty,
    this.showFProperty,
    this.showGridProperty,
    this.composeProperty,
    this.orderProperty,
  ];

  public readonly productProperty = new DerivedProperty(
    [this.matrix.matrixProperty, this.second.matrixProperty, this.orderProperty],
    (a, b, order) => (order === "BA" ? multiply(b, a) : multiply(a, b)),
  );

  public readonly effectiveMatrixProperty = new DerivedProperty(
    [this.matrix.matrixProperty, this.productProperty, this.composeProperty, this.morphProperty],
    (a, product, compose, morph) => lerp(IDENTITY, compose ? product : a, morph),
  );

  public reset(): void {
    this.matrix.reset();
    this.second.reset();
    for (const property of this.properties) {
      property.reset();
    }
  }

  public dispose(): void {
    this.effectiveMatrixProperty.dispose();
    this.productProperty.dispose();
    for (const property of this.properties) {
      property.dispose();
    }
    this.second.dispose();
    this.matrix.dispose();
  }
}
