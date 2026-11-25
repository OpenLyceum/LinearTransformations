import { BooleanProperty, DerivedProperty, Multilink, NumberProperty, Property } from "scenerystack/axon";
import { dotRandom, Range } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import { add, cross, norm, scale, type Vec } from "../../common/model/LinearAlgebra.js";
import { EPS, HANDLE_X_RANGE, HANDLE_Y_RANGE } from "../../LinearTransformationsConstants.js";

const COEFFICIENT_RANGE = new Range(-3, 3);
const TARGET_MAX_X = 4;
const TARGET_MAX_Y = 3;

export class SpanModel implements TModel {
  public readonly uxProperty = new NumberProperty(2, { range: HANDLE_X_RANGE });
  public readonly uyProperty = new NumberProperty(1, { range: HANDLE_Y_RANGE });
  public readonly wxProperty = new NumberProperty(-1, { range: HANDLE_X_RANGE });
  public readonly wyProperty = new NumberProperty(1.5, { range: HANDLE_Y_RANGE });
  public readonly c1Property = new NumberProperty(1, { range: COEFFICIENT_RANGE });
  public readonly c2Property = new NumberProperty(1, { range: COEFFICIENT_RANGE });
  public readonly showSpanProperty = new BooleanProperty(false);
  public readonly targetModeProperty = new BooleanProperty(false);
  public readonly targetProperty = new Property<Vec>([3, 2]);
  public readonly solveFailedProperty = new BooleanProperty(false);

  private readonly properties = [
    this.uxProperty,
    this.uyProperty,
    this.wxProperty,
    this.wyProperty,
    this.c1Property,
    this.c2Property,
    this.showSpanProperty,
    this.targetModeProperty,
    this.targetProperty,
  ] as const;

  public readonly uProperty = new DerivedProperty([this.uxProperty, this.uyProperty], (x, y): Vec => [x, y]);
  public readonly wProperty = new DerivedProperty([this.wxProperty, this.wyProperty], (x, y): Vec => [x, y]);
  public readonly determinantProperty = new DerivedProperty([this.uProperty, this.wProperty], cross);
  public readonly spanDimensionProperty = new DerivedProperty(
    [this.uProperty, this.wProperty, this.determinantProperty],
    (u, w, determinant) => {
      if (Math.abs(determinant) > EPS) {
        return 2;
      }
      return Math.max(norm(u), norm(w)) > EPS ? 1 : 0;
    },
  );
  public readonly resultProperty = new DerivedProperty(
    [this.uProperty, this.wProperty, this.c1Property, this.c2Property],
    (u, w, c1, c2) => add(scale(c1, u), scale(c2, w)),
  );

  private readonly clearFailureLink = Multilink.lazyMultilink(this.properties, () => {
    this.solveFailedProperty.value = false;
  });

  public newTarget(): void {
    const [previousX, previousY] = this.targetProperty.value;
    let x: number;
    let y: number;
    do {
      x = dotRandom.nextIntBetween(-TARGET_MAX_X, TARGET_MAX_X);
      y = dotRandom.nextIntBetween(-TARGET_MAX_Y, TARGET_MAX_Y);
    } while ((x === 0 && y === 0) || (x === previousX && y === previousY));
    this.targetProperty.value = [x, y];
  }

  public solve(): void {
    const determinant = this.determinantProperty.value;
    if (Math.abs(determinant) <= EPS) {
      return;
    }
    const target = this.targetProperty.value;
    const c1 = cross(target, this.wProperty.value) / determinant;
    const c2 = cross(this.uProperty.value, target) / determinant;
    // Allow roundoff at the bounds of the coefficient range.
    if ([c1, c2].some((value) => Math.abs(value - COEFFICIENT_RANGE.constrainValue(value)) > EPS)) {
      this.solveFailedProperty.value = true;
      return;
    }

    this.solveFailedProperty.value = false;
    this.c1Property.value = COEFFICIENT_RANGE.constrainValue(c1);
    this.c2Property.value = COEFFICIENT_RANGE.constrainValue(c2);
  }

  public reset(): void {
    for (const property of this.properties) {
      property.reset();
    }
    this.solveFailedProperty.reset();
  }

  public dispose(): void {
    this.clearFailureLink.dispose();
    this.resultProperty.dispose();
    this.spanDimensionProperty.dispose();
    this.determinantProperty.dispose();
    this.wProperty.dispose();
    this.uProperty.dispose();
    this.solveFailedProperty.dispose();
    for (const property of this.properties) {
      property.dispose();
    }
  }
}
