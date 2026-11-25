import { enableAssert } from "scenerystack/assert";
import { describe, expect, it } from "vitest";
import { PlotCanvas } from "../src/common/LabView.js";
import { IDENTITY } from "../src/common/model/LinearAlgebra.js";
import { MatrixEditor } from "../src/common/view/MatrixEditor.js";
import { MatrixReadout } from "../src/common/view/MatrixReadout.js";
import { VectorHandle } from "../src/common/view/VectorHandle.js";
import { TransformModel } from "../src/transform/model/TransformModel.js";
import { TransformKeyboardHelpContent } from "../src/transform/view/TransformKeyboardHelpContent.js";
import { TransformScreenView } from "../src/transform/view/TransformScreenView.js";

enableAssert();

describe("TransformScreenView", () => {
  it("constructs, redraws and disposes after composition, morph and preset changes", () => {
    const model = new TransformModel();
    const view = new TransformScreenView(model);
    const help = new TransformKeyboardHelpContent();
    try {
      const content = view.children.find((node) => node.children.some((child) => child instanceof PlotCanvas));
      const plot = content?.children.find((node) => node instanceof PlotCanvas);
      const editors = content?.children.find((node) => node.children.some((child) => child instanceof MatrixEditor));
      const product = editors?.children.find((node) => node instanceof MatrixReadout);
      const handles = plot?.children.filter((node) => node instanceof VectorHandle);
      const context = document.createElement("canvas").getContext("2d");
      if (!(content && plot && editors && product && handles && context)) {
        throw new Error("Transform must construct a plot, handles, and a product readout");
      }
      const panel = content.pdomOrder?.[1];
      expect(panel?.height).toBeLessThanOrEqual(530);
      expect(handles.map((handle) => handle.visible)).toEqual([true, true]);
      expect(plot.pdomOrder).toEqual(handles);
      expect(product.visible).toBe(false);
      expect(model.effectiveMatrixProperty.value).toEqual([1, 1, 0, 1]);
      expect(view.getVoicingDetailsContent()).toContain("Orientation preserved");
      plot.paintCanvas(context);

      model.composeProperty.value = true;
      expect(handles.every((handle) => !handle.visible)).toBe(true);
      expect(product.visible).toBe(true);
      expect(model.effectiveMatrixProperty.value).toEqual([0, -1, 1, 1]);
      expect(view.getVoicingDetailsContent()).toContain("det(BA) = det B · det A = 1. AB ≠ BA here.");
      expect(panel?.height).toBeLessThanOrEqual(530);
      expect(editors.bottom).toBeLessThan(view.layoutBounds.maxY);
      plot.paintCanvas(context);

      model.orderProperty.value = "AB";
      expect(model.productProperty.value).toEqual([1, -1, 1, 0]);
      expect(view.getVoicingDetailsContent()).toContain("det(AB) = det A · det B = 1.");
      model.morphProperty.value = 0.5;
      expect(model.effectiveMatrixProperty.value).toEqual([1, -0.5, 0.5, 0.5]);
      model.morphProperty.value = 0;
      expect(model.effectiveMatrixProperty.value).toEqual(IDENTITY);
      plot.paintCanvas(context);

      model.composeProperty.value = false;
      expect(product.visible).toBe(false);
      expect(handles.every((handle) => !handle.visible)).toBe(true);
      model.matrix.presetProperty.value = "reflectX";
      expect(view.getVoicingDetailsContent()).toContain("det A = -1.");
      expect(view.getVoicingDetailsContent()).toContain("Orientation preserved");
      model.morphProperty.value = 0.5;
      expect(view.getVoicingDetailsContent()).toContain("Plane collapsed onto a line or a point");
      plot.paintCanvas(context);
      model.morphProperty.value = 1;
      expect(view.getVoicingDetailsContent()).toContain("Orientation reversed");
      plot.paintCanvas(context);

      model.matrix.presetProperty.value = "singular";
      model.matrix.aProperty.value = 1.25;
      expect(model.matrix.presetProperty.value).toBe("custom");
      expect(view.getVoicingDetailsContent()).toContain("Area scale factor |det| = 0.25.");
      model.reset();
      expect(model.matrix.presetProperty.value).toBe("shear");
      expect(handles.every((handle) => handle.visible)).toBe(true);
    } finally {
      help.disposeSubtree();
      view.dispose();
      model.dispose();
    }
    expect(view.isDisposed).toBe(true);
  });
});
