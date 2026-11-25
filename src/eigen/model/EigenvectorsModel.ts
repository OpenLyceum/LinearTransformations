import { BooleanProperty, DerivedProperty, NumberProperty, Property } from "scenerystack/axon";
import { Range, roundSymmetric } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import { characteristic, eigen } from "../../common/model/Eigen.js";
import { apply, cross, dotProduct, norm, type Vec } from "../../common/model/LinearAlgebra.js";
import { MatrixModel } from "../../common/model/MatrixModel.js";
import {
  EPS,
  HANDLE_X_RANGE,
  HANDLE_Y_RANGE,
  ITERATIONS,
  PARALLEL_SIN,
  SWEEP_SECONDS,
} from "../../LinearTransformationsConstants.js";

const FULL_TURN = 360;
const DIRECTION_LENGTH = 2;

function direction(angle: number): Vec {
  const radians = (angle * Math.PI) / 180;
  return [DIRECTION_LENGTH * Math.cos(radians), DIRECTION_LENGTH * Math.sin(radians)];
}

export class EigenvectorsModel implements TModel {
  public readonly matrix = new MatrixModel("symmetric");
  public readonly angleProperty = new NumberProperty(30, { range: new Range(0, FULL_TURN - EPS) });
  public readonly sweepingProperty = new BooleanProperty(false);
  public readonly traceProperty = new Property<Vec[]>([]);
  public readonly showEigenProperty = new BooleanProperty(false);
  public readonly iterateProperty = new BooleanProperty(false);
  public readonly x0Property = new NumberProperty(1, { range: HANDLE_X_RANGE });
  public readonly y0Property = new NumberProperty(0.5, { range: HANDLE_Y_RANGE });

  private readonly properties = [
    this.angleProperty,
    this.sweepingProperty,
    this.traceProperty,
    this.showEigenProperty,
    this.iterateProperty,
    this.x0Property,
    this.y0Property,
  ];
  private sweepElapsed = 0;

  public readonly vProperty = new DerivedProperty([this.angleProperty], direction);
  public readonly avProperty = new DerivedProperty([this.matrix.matrixProperty, this.vProperty], apply);
  public readonly alignmentProperty = new DerivedProperty([this.vProperty, this.avProperty], (v, av) => {
    const length = norm(av);
    return {
      aligned: length <= EPS || Math.abs(cross(v, av)) <= PARALLEL_SIN * norm(v) * length,
      lambda: dotProduct(av, v) / dotProduct(v, v),
    };
  });
  public readonly characteristicProperty = new DerivedProperty([this.matrix.matrixProperty], characteristic);
  public readonly eigenProperty = new DerivedProperty([this.matrix.matrixProperty], eigen);
  public readonly orbitProperty = new DerivedProperty(
    [this.iterateProperty, this.matrix.matrixProperty, this.x0Property, this.y0Property],
    (iterate, matrix, x, y) => {
      const orbit: Vec[] = [[x, y]];
      if (iterate) {
        let position: Vec = [x, y];
        for (let n = 0; n < ITERATIONS; n++) {
          position = apply(matrix, position);
          orbit.push(position);
        }
      }
      return orbit;
    },
  );

  public constructor() {
    this.matrix.matrixProperty.lazyLink(this.onMatrixChange);
  }

  private readonly onMatrixChange = () => {
    this.sweepingProperty.value = false;
    this.clearTrace();
  };

  public setDirection([x, y]: Vec): void {
    if (Math.hypot(x, y) > EPS) {
      const degrees = roundSymmetric((Math.atan2(y, x) * 180) / Math.PI);
      this.angleProperty.value = (degrees + FULL_TURN) % FULL_TURN;
    }
  }

  public startSweep(): void {
    this.sweepElapsed = 0;
    this.angleProperty.value = 0;
    this.traceProperty.value = [this.avProperty.value];
    this.sweepingProperty.value = true;
  }

  public clearTrace(): void {
    this.traceProperty.reset();
  }

  // LabView owns the frame callback. A TModel.step would also run in Joist.
  public stepSweep(dt: number): void {
    if (!this.sweepingProperty.value || dt <= 0) {
      return;
    }

    this.sweepElapsed = Math.min(this.sweepElapsed + dt, SWEEP_SECONDS);
    const complete = SWEEP_SECONDS - this.sweepElapsed <= EPS;
    const angle = complete ? 0 : (FULL_TURN * this.sweepElapsed) / SWEEP_SECONDS;
    this.angleProperty.value = this.angleProperty.range.constrainValue(angle);
    this.traceProperty.value = [...this.traceProperty.value, this.avProperty.value];
    if (complete) {
      this.sweepingProperty.value = false;
    }
  }

  public reset(): void {
    this.matrix.reset();
    this.sweepElapsed = 0;
    for (const property of this.properties) {
      property.reset();
    }
  }

  public dispose(): void {
    this.matrix.matrixProperty.unlink(this.onMatrixChange);
    this.orbitProperty.dispose();
    this.eigenProperty.dispose();
    this.characteristicProperty.dispose();
    this.alignmentProperty.dispose();
    this.avProperty.dispose();
    this.vProperty.dispose();
    for (const property of this.properties) {
      property.dispose();
    }
    this.matrix.dispose();
  }
}
