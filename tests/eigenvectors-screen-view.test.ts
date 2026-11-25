import { enableAssert } from "scenerystack/assert";
import { describe, expect, it } from "vitest";
import { PlotCanvas } from "../src/common/LabView.js";
import { MatrixEditor } from "../src/common/view/MatrixEditor.js";
import { VectorHandle } from "../src/common/view/VectorHandle.js";
import { EigenvectorsModel } from "../src/eigen/model/EigenvectorsModel.js";
import { EigenvectorsKeyboardHelpContent } from "../src/eigen/view/EigenvectorsKeyboardHelpContent.js";
import { EigenvectorsScreenView } from "../src/eigen/view/EigenvectorsScreenView.js";
import { ITERATIONS, SWEEP_SECONDS } from "../src/LinearTransformationsConstants.js";

enableAssert();

describe("EigenvectorsScreenView", () => {
  it("redraws eigen-directions, traces a sweep through LabView and shows the iteration orbit", () => {
    const model = new EigenvectorsModel();
    const view = new EigenvectorsScreenView(model);
    const help = new EigenvectorsKeyboardHelpContent();
    try {
      const content = view.children.find((node) => node.children.some((child) => child instanceof PlotCanvas));
      const plot = content?.children.find((node) => node instanceof PlotCanvas);
      const editor = content?.children.find((node) => node instanceof MatrixEditor);
      const seed = plot?.children.find((node) => node instanceof VectorHandle);
      const context = document.createElement("canvas").getContext("2d");
      if (!(content && plot && editor && seed && context)) {
        throw new Error("Eigenvectors must construct a plot, seed handle, and matrix editor");
      }

      expect(view.layoutBounds.height).toBe(655);
      expect(content.pdomOrder?.[1]?.height).toBeLessThanOrEqual(530);
      expect(content.pdomOrder?.[2]).toBe(editor);
      expect(editor.bottom).toBeLessThan(view.layoutBounds.maxY);
      expect(plot.pdomOrder).toEqual([seed]);
      expect(seed.visible).toBe(false);
      expect(view.getVoicingDetailsContent()).toContain("λ² − 4λ + 3 = 0");
      expect(view.getVoicingDetailsContent()).toContain("λ₁ = 3, λ₂ = 1");

      model.showEigenProperty.value = true;
      model.angleProperty.value = 45;
      expect(view.getVoicingDetailsContent()).toContain("λ ≈ 3");
      model.angleProperty.value = 135;
      expect(view.getVoicingDetailsContent()).toContain("λ ≈ 1");
      plot.paintCanvas(context);

      model.startSweep();
      const initialTrace = model.traceProperty.value;
      view.step(0);
      expect(model.traceProperty.value).toBe(initialTrace);
      for (let i = 0; i < 4; i++) {
        view.step(SWEEP_SECONDS / 4);
        plot.paintCanvas(context);
      }
      expect(initialTrace).toHaveLength(1);
      expect(model.traceProperty.value).toHaveLength(5);
      expect(model.traceProperty.value[0]).toEqual(model.traceProperty.value.at(-1));
      expect(model.sweepingProperty.value).toBe(false);
      expect(model.angleProperty.value).toBe(0);

      model.matrix.presetProperty.value = "rotation90";
      expect(model.traceProperty.value).toEqual([]);
      expect(view.getVoicingDetailsContent()).toContain("λ² + 1 = 0");
      expect(view.getVoicingDetailsContent()).toContain("no real eigenvectors");
      plot.paintCanvas(context);

      model.matrix.presetProperty.value = "shear";
      expect(view.getVoicingDetailsContent()).toContain("one eigen-direction");
      plot.paintCanvas(context);

      model.matrix.presetProperty.value = "identity";
      expect(view.getVoicingDetailsContent()).toContain("every vector is an eigenvector");
      model.iterateProperty.value = true;
      expect(seed.visible).toBe(true);
      expect(model.orbitProperty.value).toHaveLength(ITERATIONS + 1);
      expect(view.getVoicingDetailsContent()).toContain("‖A¹⁰x₀‖ = 1.12");
      plot.paintCanvas(context);

      model.matrix.presetProperty.value = "projectX";
      model.angleProperty.value = 90;
      expect(view.getVoicingDetailsContent()).toContain("λ ≈ 0");
      model.setDirection([1, -1]);
      expect(model.angleProperty.value).toBe(315);
      model.startSweep();
      view.step(SWEEP_SECONDS / 4);
      expect(model.angleProperty.value).toBe(90);
      view.step((269.5 / 360) * SWEEP_SECONDS);
      expect(model.angleProperty.value).toBeCloseTo(359.5);
      expect(model.traceProperty.value.at(-1)).toEqual(model.avProperty.value);
      model.clearTrace();
      expect(model.traceProperty.value).toEqual([]);

      model.reset();
      expect(model.angleProperty.value).toBe(30);
      expect(model.matrix.presetProperty.value).toBe("symmetric");
      expect(model.traceProperty.value).toEqual([]);
      expect(model.showEigenProperty.value).toBe(false);
      expect(seed.visible).toBe(false);
    } finally {
      help.disposeSubtree();
      view.dispose();
      model.dispose();
    }
    expect(view.isDisposed).toBe(true);
  });
});
