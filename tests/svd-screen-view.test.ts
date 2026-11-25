import { enableAssert } from "scenerystack/assert";
import { HBox, PressListener, VBox } from "scenerystack/scenery";
import { HSlider, RectangularPushButton } from "scenerystack/sun";
import { describe, expect, it } from "vitest";
import { PlotCanvas } from "../src/common/LabView.js";
import { MatrixReadout } from "../src/common/view/MatrixReadout.js";
import { SVD_PLAY_SECONDS } from "../src/LinearTransformationsConstants.js";
import { SVDModel } from "../src/svd/model/SVDModel.js";
import { SVDKeyboardHelpContent } from "../src/svd/view/SVDKeyboardHelpContent.js";
import { SVDScreenView } from "../src/svd/view/SVDScreenView.js";

enableAssert();

describe("SVDScreenView", () => {
  it("scrubs three stages for regular, reflecting, and singular matrices and restarts playback", () => {
    const model = new SVDModel();
    const view = new SVDScreenView(model);
    const help = new SVDKeyboardHelpContent();
    try {
      const content = view.children.find((node) => node.children.some((child) => child instanceof PlotCanvas));
      const [plot, panel, belowPlot] = content?.pdomOrder ?? [];
      const [, stageControl, playButton] = panel?.children.find((child) => child instanceof VBox)?.children ?? [];
      const context = document.createElement("canvas").getContext("2d");
      if (
        !(
          plot instanceof PlotCanvas &&
          panel &&
          belowPlot instanceof HBox &&
          stageControl &&
          playButton instanceof RectangularPushButton &&
          context
        )
      ) {
        throw new Error("SVD must construct its plot, matrices, slider, and playback button");
      }
      expect(stageControl.children.some((child) => child instanceof HSlider)).toBe(true);
      expect(view.layoutBounds.height).toBe(655);
      expect(panel.height).toBeLessThanOrEqual(530);
      expect(belowPlot.bottom).toBeLessThan(view.layoutBounds.maxY);
      expect(belowPlot.children.filter((child) => child instanceof MatrixReadout)).toHaveLength(3);

      model.showGridProperty.value = true;
      for (const preset of ["custom", "reflectX", "singular"] as const) {
        model.matrix.presetProperty.value = preset;
        expect(model.stageProperty.value).toBe(0);
        expect(model.stageMatrixProperty.value).toEqual([1, 0, 0, 1]);
        for (const [stage, name] of ["Unit circle", "Rotate by Vᵀ", "Stretch by Σ", "Rotate by U"].entries()) {
          model.stageProperty.value = stage;
          const details = String(view.getVoicingDetailsContent());
          expect(details).toContain(name);
          expect(details.includes("one axis flips")).toBe(preset === "reflectX" && stage === 2);
          expect(details.includes("∞ (singular)")).toBe(preset === "singular");
          plot.paintCanvas(context);
        }
        for (const [index, value] of model.matrix.matrixProperty.value.entries()) {
          expect(model.stageMatrixProperty.value[index]).toBeCloseTo(value, 9);
        }
      }

      const listener = playButton.getInputListeners().find((entry) => entry instanceof PressListener);
      if (!listener) {
        throw new Error("The playback button must have a PressListener");
      }
      model.stageProperty.value = 0;
      listener.click(null);
      expect(model.playingProperty.value).toBe(true);
      view.step(SVD_PLAY_SECONDS / 3);
      expect(model.stageProperty.value).toBeCloseTo(1);
      listener.click(null);
      view.step(SVD_PLAY_SECONDS);
      expect(model.stageProperty.value).toBeCloseTo(1);
      listener.click(null);
      view.step((2 * SVD_PLAY_SECONDS) / 3);
      expect(model.stageProperty.value).toBe(3);
      expect(model.playingProperty.value).toBe(false);
      listener.click(null);
      expect(model.stageProperty.value).toBe(0);
      expect(model.playingProperty.value).toBe(true);
      view.step(SVD_PLAY_SECONDS / 2);
      expect(model.stageProperty.value).toBeCloseTo(1.5);

      model.matrix.aProperty.value = 2;
      expect(model.stageProperty.value).toBe(0);
      expect(model.playingProperty.value).toBe(false);
      model.reset();
      expect(model.showGridProperty.value).toBe(false);
      expect(model.matrix.matrixProperty.value).toEqual([1.5, 1, 0, 1]);
    } finally {
      help.disposeSubtree();
      view.dispose();
      model.dispose();
    }
    expect(view.isDisposed).toBe(true);
  });
});
