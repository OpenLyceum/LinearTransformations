import { enableAssert } from "scenerystack/assert";
import { FireListener, VBox } from "scenerystack/scenery";
import { AquaRadioButtonGroup, Checkbox, HSlider } from "scenerystack/sun";
import { describe, expect, it } from "vitest";
import { PlotCanvas } from "../src/common/LabView.js";
import { MatrixReadout } from "../src/common/view/MatrixReadout.js";
import { VectorHandle } from "../src/common/view/VectorHandle.js";
import { ProjectionModel } from "../src/projection/model/ProjectionModel.js";
import { ProjectionKeyboardHelpContent } from "../src/projection/view/ProjectionKeyboardHelpContent.js";
import { ProjectionScreenView } from "../src/projection/view/ProjectionScreenView.js";

enableAssert();

describe("ProjectionScreenView", () => {
  it("switches between vector projection and line fitting with their degenerate cases", () => {
    const model = new ProjectionModel();
    const view = new ProjectionScreenView(model);
    const help = new ProjectionKeyboardHelpContent();
    try {
      const content = view.children.find((node) => node.children.some((child) => child instanceof PlotCanvas));
      const [plot, panel, matrix] = content?.pdomOrder ?? [];
      const [mode, tryLine, sliders] = panel?.children.find((child) => child instanceof VBox)?.children ?? [];
      const context = document.createElement("canvas").getContext("2d");
      if (
        !(
          plot instanceof PlotCanvas &&
          panel &&
          matrix instanceof MatrixReadout &&
          mode instanceof AquaRadioButtonGroup &&
          tryLine instanceof Checkbox &&
          sliders instanceof VBox &&
          context
        )
      ) {
        throw new Error("Projection must construct its plot, controls, and matrix readout");
      }
      const handles = plot.children.filter((child) => child instanceof VectorHandle);
      expect(view.layoutBounds.height).toBe(655);
      expect(matrix.bottom).toBeLessThan(view.layoutBounds.maxY);
      expect(plot.pdomOrder).toEqual(handles);
      expect(handles.map((handle) => handle.visible)).toEqual([true, true, false, false, false, false, false]);
      expect(matrix.visible).toBe(true);
      expect(tryLine.visible).toBe(false);
      expect(sliders.visible).toBe(false);
      expect(view.getVoicingDetailsContent()).toContain("p = (1.65, 0.55)");
      expect(view.getVoicingDetailsContent()).toContain("a · e = 0");
      plot.paintCanvas(context);

      for (const coordinate of model.aCoordinates) {
        coordinate.value = 0;
      }
      expect(matrix.visible).toBe(false);
      expect(view.getVoicingDetailsContent()).toContain("a = 0: choose a nonzero a");
      plot.paintCanvas(context);
      model.reset();

      const fitButton = mode
        .getButton("leastSquares")
        .getInputListeners()
        .find((entry) => entry instanceof FireListener);
      expect(fitButton).toBeInstanceOf(FireListener);
      fitButton?.fire(null);
      expect(model.modeProperty.value).toBe("leastSquares");
      expect(handles.map((handle) => handle.visible)).toEqual([false, false, true, true, true, true, true]);
      expect(matrix.visible).toBe(false);
      expect(tryLine.visible).toBe(true);
      expect(sliders.visible).toBe(false);
      expect(view.getVoicingDetailsContent()).toContain("Best fit y = m x + k");
      expect(view.getVoicingDetailsContent()).toContain("projection of y onto Col(X)");
      plot.paintCanvas(context);

      const tryButton = tryLine.getInputListeners().find((entry) => entry instanceof FireListener);
      expect(tryButton).toBeInstanceOf(FireListener);
      tryButton?.fire(null);
      expect(sliders.visible).toBe(true);
      expect(sliders.children.every((slider) => slider.children.some((child) => child instanceof HSlider))).toBe(true);
      expect(panel.height).toBeLessThanOrEqual(530);
      expect(view.getVoicingDetailsContent()).toContain("(≥ best)");
      plot.paintCanvas(context);
      const fit = model.fitProperty.value;
      if (!fit) {
        throw new Error("Default data must have a unique best fit");
      }
      model.userSlopeProperty.value = fit.slope;
      model.userInterceptProperty.value = fit.intercept;
      expect(view.getVoicingDetailsContent()).toContain("(matches best)");

      for (const [xProperty] of model.pointsProperties) {
        xProperty.value = 1;
      }
      expect(model.fitProperty.value).toBeNull();
      expect(view.getVoicingDetailsContent()).toContain("All x equal: no unique line");
      expect(view.getVoicingDetailsContent()).toContain("Your line SSE");
      expect(view.getVoicingDetailsContent()).toContain("projection of y onto Col(X)");
      plot.paintCanvas(context);

      model.reset();
      expect(model.aProperty.value).toEqual([3, 1]);
      expect(model.pointsProperty.value).toHaveLength(5);
      expect(matrix.visible).toBe(true);
      expect(sliders.visible).toBe(false);
    } finally {
      help.disposeSubtree();
      view.dispose();
      model.dispose();
    }
    expect(view.isDisposed).toBe(true);
  });
});
