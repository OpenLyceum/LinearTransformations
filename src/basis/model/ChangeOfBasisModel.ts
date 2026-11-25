import { BooleanProperty, DerivedProperty, NumberProperty } from "scenerystack/axon";
import type { TModel } from "scenerystack/joist";
import { eigen } from "../../common/model/Eigen.js";
import { apply, fromColumns, inverse, multiply, scale, type Vec } from "../../common/model/LinearAlgebra.js";
import { MatrixModel } from "../../common/model/MatrixModel.js";
import { EPS, HANDLE_X_RANGE, HANDLE_Y_RANGE } from "../../LinearTransformationsConstants.js";

function coordinateProperties([x, y]: Vec) {
  return [new NumberProperty(x, { range: HANDLE_X_RANGE }), new NumberProperty(y, { range: HANDLE_Y_RANGE })] as const;
}

export class ChangeOfBasisModel implements TModel {
  public readonly b1Coordinates = coordinateProperties([2, 1]);
  public readonly b2Coordinates = coordinateProperties([-0.5, 1.5]);
  public readonly xCoordinates = coordinateProperties([2, 2]);
  public readonly showDecompositionProperty = new BooleanProperty(true);
  public readonly matrix = new MatrixModel("symmetric");

  public readonly b1Property = new DerivedProperty(this.b1Coordinates, (x, y): Vec => [x, y]);
  public readonly b2Property = new DerivedProperty(this.b2Coordinates, (x, y): Vec => [x, y]);
  public readonly xProperty = new DerivedProperty(this.xCoordinates, (x, y): Vec => [x, y]);
  public readonly basisProperty = new DerivedProperty([this.b1Property, this.b2Property], fromColumns);
  public readonly inverseBasisProperty = new DerivedProperty([this.basisProperty], inverse);
  public readonly basisCoordinatesProperty = new DerivedProperty(
    [this.inverseBasisProperty, this.xProperty],
    (pInverse, x) => (pInverse ? apply(pInverse, x) : null),
  );
  public readonly basisMatrixProperty = new DerivedProperty(
    [this.inverseBasisProperty, this.matrix.matrixProperty, this.basisProperty],
    (pInverse, a, p) => (pInverse ? multiply(pInverse, multiply(a, p)) : null),
  );
  public readonly diagonalProperty = new DerivedProperty(
    [this.basisMatrixProperty],
    (matrix) => matrix !== null && Math.abs(matrix[1]) <= EPS && Math.abs(matrix[2]) <= EPS,
  );
  public readonly eigenProperty = new DerivedProperty([this.matrix.matrixProperty], eigen);

  private readonly properties = [
    ...this.b1Coordinates,
    ...this.b2Coordinates,
    ...this.xCoordinates,
    this.showDecompositionProperty,
  ];

  private readonly derivedProperties = [
    this.eigenProperty,
    this.diagonalProperty,
    this.basisMatrixProperty,
    this.basisCoordinatesProperty,
    this.inverseBasisProperty,
    this.basisProperty,
    this.xProperty,
    this.b2Property,
    this.b1Property,
  ];

  public useEigenvectors(): void {
    const result = this.eigenProperty.value;
    if (result.kind === "distinct") {
      const b1 = scale(2, result.vectors[0]);
      const b2 = scale(2, result.vectors[1]);
      this.b1Coordinates[0].value = HANDLE_X_RANGE.constrainValue(b1[0]);
      this.b1Coordinates[1].value = HANDLE_Y_RANGE.constrainValue(b1[1]);
      this.b2Coordinates[0].value = HANDLE_X_RANGE.constrainValue(b2[0]);
      this.b2Coordinates[1].value = HANDLE_Y_RANGE.constrainValue(b2[1]);
    }
  }

  public reset(): void {
    for (const property of this.properties) {
      property.reset();
    }
    this.matrix.reset();
  }

  public dispose(): void {
    for (const property of [...this.derivedProperties, ...this.properties]) {
      property.dispose();
    }
    this.matrix.dispose();
  }
}
