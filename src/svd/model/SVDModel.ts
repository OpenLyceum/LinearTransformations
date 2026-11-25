import { BooleanProperty, DerivedProperty, NumberProperty } from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import { MatrixModel } from "../../common/model/MatrixModel.js";
import { svd, svdAnimation, svdStageMatrix } from "../../common/model/Svd.js";
import { EPS, SVD_PLAY_SECONDS } from "../../LinearTransformationsConstants.js";

const LAST_STAGE = 3;

export class SVDModel implements TModel {
  public readonly matrix = new MatrixModel([1.5, 1, 0, 1]);
  public readonly stageProperty = new NumberProperty(0, { range: new Range(0, LAST_STAGE) });
  public readonly playingProperty = new BooleanProperty(false);
  public readonly showGridProperty = new BooleanProperty(false);

  public readonly svdProperty = new DerivedProperty([this.matrix.matrixProperty], svd);
  public readonly animationProperty = new DerivedProperty([this.matrix.matrixProperty], svdAnimation);
  public readonly stageMatrixProperty = new DerivedProperty(
    [this.animationProperty, this.stageProperty],
    svdStageMatrix,
  );

  private readonly properties = [this.stageProperty, this.playingProperty, this.showGridProperty];

  public constructor() {
    this.matrix.matrixProperty.lazyLink(this.restart);
  }

  private readonly restart = (): void => {
    this.playingProperty.reset();
    this.stageProperty.reset();
  };

  public togglePlayback(): void {
    if (!this.playingProperty.value && this.stageProperty.value === LAST_STAGE) {
      this.stageProperty.reset();
    }
    this.playingProperty.value = !this.playingProperty.value;
  }

  // LabView advances playback when this screen is active.
  public stepPlayback(dt: number): void {
    if (this.playingProperty.value && dt > 0) {
      const next = this.stageProperty.value + (LAST_STAGE * dt) / SVD_PLAY_SECONDS;
      if (next >= LAST_STAGE - EPS) {
        this.stageProperty.value = LAST_STAGE;
        this.playingProperty.value = false;
      } else {
        this.stageProperty.value = next;
      }
    }
  }

  public reset(): void {
    this.matrix.reset();
    for (const property of this.properties) {
      property.reset();
    }
  }

  public dispose(): void {
    this.matrix.matrixProperty.unlink(this.restart);
    this.stageMatrixProperty.dispose();
    this.animationProperty.dispose();
    this.svdProperty.dispose();
    for (const property of this.properties) {
      property.dispose();
    }
    this.matrix.dispose();
  }
}
