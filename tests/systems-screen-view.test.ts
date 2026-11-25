import { enableAssert } from "scenerystack/assert";
import { FireListener, HBox, VBox } from "scenerystack/scenery";
import { AquaRadioButtonGroup, RectangularPushButton } from "scenerystack/sun";
import { describe, expect, it } from "vitest";
import { PlotCanvas } from "../src/common/LabView.js";
import { AugmentedMatrixReadout } from "../src/common/view/AugmentedMatrixReadout.js";
import { VectorHandle } from "../src/common/view/VectorHandle.js";
import { SystemsModel } from "../src/systems/model/SystemsModel.js";
import { SystemsKeyboardHelpContent } from "../src/systems/view/SystemsKeyboardHelpContent.js";
import { SystemsScreenView } from "../src/systems/view/SystemsScreenView.js";

enableAssert();

describe("SystemsScreenView", () => {
  it("switches pictures, navigates elimination, and describes all four solution sets", () => {
    const model = new SystemsModel();
    const view = new SystemsScreenView(model);
    const help = new SystemsKeyboardHelpContent();
    try {
      const content = view.children.find((node) => node.children.some((child) => child instanceof PlotCanvas));
      const [plot, panel, belowPlot] = content?.pdomOrder ?? [];
      const controls = panel?.children.find((child) => child instanceof VBox)?.children;
      const picture = controls?.find((child) => child instanceof AquaRadioButtonGroup);
      const [back, next] = controls?.find((child) => child instanceof HBox)?.children ?? [];
      const restart = controls?.find((child) => child instanceof RectangularPushButton);
      const augmented = belowPlot?.children.find((child) => child instanceof AugmentedMatrixReadout);
      const context = document.createElement("canvas").getContext("2d");
      if (
        !(
          plot instanceof PlotCanvas &&
          panel &&
          belowPlot &&
          augmented &&
          picture &&
          restart &&
          context &&
          back instanceof RectangularPushButton &&
          next instanceof RectangularPushButton
        )
      ) {
        throw new Error("Systems must construct its plot, controls, and augmented matrix");
      }
      const handles = plot.children.filter((child) => child instanceof VectorHandle);
      expect(view.layoutBounds.height).toBe(655);
      expect(panel.height).toBeLessThanOrEqual(530);
      expect(belowPlot.bottom).toBeLessThan(view.layoutBounds.maxY);
      expect(plot.pdomOrder).toEqual(handles);
      expect(handles).toHaveLength(3);
      expect(handles.every((handle) => !handle.visible)).toBe(true);
      for (const value of ["column", "row"] as const) {
        const listener = picture
          .getButton(value)
          .getInputListeners()
          .find((entry) => entry instanceof FireListener);
        expect(listener).toBeInstanceOf(FireListener);
        listener?.fire(null);
        expect(model.pictureProperty.value).toBe(value);
        expect(handles.every((handle) => handle.visible === (value === "column"))).toBe(true);
        plot.paintCanvas(context);
      }

      expect(back.enabled).toBe(false);
      expect(next.enabled).toBe(true);
      expect(view.getVoicingDetailsContent()).toContain("Original system");
      const { steps, original } = model.rrefProperty.value;
      for (const [index, step] of steps.entries()) {
        next.pdomClick();
        expect(model.stepProperty.value).toBe(index + 1);
        expect(model.currentProperty.value).toEqual(step.after);
        expect(view.getVoicingDetailsContent()).toContain("Unique solution x = (2, 1)");
        plot.paintCanvas(context);
      }
      expect(model.currentProperty.value).toEqual([
        [1, 0, 2],
        [0, 1, 1],
      ]);
      expect(view.getVoicingDetailsContent()).toContain("Reduced row echelon form");
      expect(next.enabled).toBe(false);
      for (let index = steps.length - 1; index >= 0; index--) {
        back.pdomClick();
        expect(model.stepProperty.value).toBe(index);
        expect(model.currentProperty.value).toEqual(steps[index - 1]?.after ?? original);
      }
      next.pdomClick();
      restart.pdomClick();
      expect(model.stepProperty.value).toBe(0);
      expect(back.enabled).toBe(false);

      next.pdomClick();
      model.matrix.setMatrix([1, 1, 1, 1]);
      expect(model.stepProperty.value).toBe(0);
      expect(model.stepProperty.range.max).toBe(model.rrefProperty.value.steps.length);
      expect(view.getVoicingDetailsContent()).toContain("No solution: the lines are parallel");
      plot.paintCanvas(context);
      next.pdomClick();
      model.byProperty.value = 3;
      expect(model.stepProperty.value).toBe(0);
      expect(view.getVoicingDetailsContent()).toContain("Infinitely many");
      plot.paintCanvas(context);

      model.matrix.setMatrix([0, 0, 0, 0]);
      expect(view.getVoicingDetailsContent()).toContain("a row gives a contradiction");
      model.bxProperty.value = model.byProperty.value = 0;
      expect(model.stepProperty.range.max).toBe(0);
      expect(next.enabled).toBe(false);
      expect(view.getVoicingDetailsContent()).toContain("Every x is a solution");
      plot.paintCanvas(context);

      model.reset();
      expect(model.currentProperty.value).toEqual(original);
      expect(model.stepProperty.range.max).toBe(steps.length);
    } finally {
      help.disposeSubtree();
      view.dispose();
      model.dispose();
    }
    expect(view.isDisposed).toBe(true);
  });
});
