import { BooleanProperty, DerivedProperty, NumberProperty, StringUnionProperty } from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import { fitLine, projectionMatrix, projectOntoLine, sse } from "../../common/model/LeastSquares.js";
import type { Vec } from "../../common/model/LinearAlgebra.js";
import { HANDLE_X_RANGE, HANDLE_Y_RANGE } from "../../LinearTransformationsConstants.js";

const INITIAL_POINTS: readonly Vec[] = [
  [-3, -1.5],
  [-1.5, -1],
  [0, 0.5],
  [1.5, 0.8],
  [3, 2.5],
];
const LINE_PARAMETER_RANGE = new Range(-3, 3);

function coordinateProperties([x, y]: Vec) {
  return [new NumberProperty(x, { range: HANDLE_X_RANGE }), new NumberProperty(y, { range: HANDLE_Y_RANGE })] as const;
}

export class ProjectionModel implements TModel {
  public readonly modeProperty = new StringUnionProperty<"project" | "leastSquares">("project", {
    validValues: ["project", "leastSquares"],
  });
  public readonly aCoordinates = coordinateProperties([3, 1]);
  public readonly bCoordinates = coordinateProperties([1, 2.5]);
  public readonly pointsProperties = INITIAL_POINTS.map(coordinateProperties);
  public readonly tryLineProperty = new BooleanProperty(false);
  public readonly userSlopeProperty = new NumberProperty(0.5, { range: LINE_PARAMETER_RANGE });
  public readonly userInterceptProperty = new NumberProperty(0, { range: LINE_PARAMETER_RANGE });

  public readonly aProperty = new DerivedProperty(this.aCoordinates, (x, y): Vec => [x, y]);
  public readonly bProperty = new DerivedProperty(this.bCoordinates, (x, y): Vec => [x, y]);
  public readonly pointsProperty = DerivedProperty.deriveAny(this.pointsProperties.flat(), () =>
    this.pointsProperties.map(([x, y]): Vec => [x.value, y.value]),
  );
  public readonly projectionProperty = new DerivedProperty([this.aProperty, this.bProperty], projectOntoLine);
  public readonly projectionMatrixProperty = new DerivedProperty([this.aProperty], projectionMatrix);
  public readonly fitProperty = new DerivedProperty([this.pointsProperty], fitLine);
  public readonly userSSEProperty = new DerivedProperty(
    [this.pointsProperty, this.userSlopeProperty, this.userInterceptProperty],
    sse,
  );

  private readonly properties = [
    this.modeProperty,
    ...this.aCoordinates,
    ...this.bCoordinates,
    ...this.pointsProperties.flat(),
    this.tryLineProperty,
    this.userSlopeProperty,
    this.userInterceptProperty,
  ];

  public reset(): void {
    for (const property of this.properties) {
      property.reset();
    }
  }

  public dispose(): void {
    this.userSSEProperty.dispose();
    this.fitProperty.dispose();
    this.projectionMatrixProperty.dispose();
    this.projectionProperty.dispose();
    this.pointsProperty.dispose();
    this.bProperty.dispose();
    this.aProperty.dispose();
    for (const property of this.properties) {
      property.dispose();
    }
  }
}
