import { enableAssert } from "scenerystack/assert";
import { describe, expect, it } from "vitest";
import { PlotCanvas } from "../src/common/LabView.js";
import { VectorHandle } from "../src/common/view/VectorHandle.js";
import { SpanModel } from "../src/span/model/SpanModel.js";
import { SpanKeyboardHelpContent } from "../src/span/view/SpanKeyboardHelpContent.js";
import { SpanScreenView } from "../src/span/view/SpanScreenView.js";

enableAssert();

describe("SpanScreenView", () => {
  it("redraws and updates details for each span dimension and the target controls", () => {
    const model = new SpanModel();
    const view = new SpanScreenView(model);
    const help = new SpanKeyboardHelpContent();
    try {
      const content = view.children.find((node) => node.children.some((child) => child instanceof PlotCanvas));
      const plot = content?.children.find((node) => node instanceof PlotCanvas);
      const context = document.createElement("canvas").getContext("2d");
      if (!(content && plot && context)) {
        throw new Error("Span must construct a plot");
      }
      const panel = content.pdomOrder?.[1];
      expect(view.layoutBounds.width).toBe(1024);
      expect(view.layoutBounds.height).toBe(655);
      expect(plot.pdomOrder).toEqual(plot.children.filter((node) => node instanceof VectorHandle));
      expect(view.getVoicingDetailsContent()).toContain("Independent");
      expect(view.getVoicingDetailsContent()).not.toContain("Target");
      plot.paintCanvas(context);

      model.showSpanProperty.value = true;
      model.targetModeProperty.value = true;
      expect(panel?.height).toBeLessThanOrEqual(530);
      expect(view.getVoicingDetailsContent()).toContain("Target (3, 2)");
      plot.paintCanvas(context);

      model.solve();
      expect(model.c1Property.value).toBe(1.625);
      expect(model.c2Property.value).toBe(0.25);
      expect(view.getVoicingDetailsContent()).toContain("Target (3, 2): hit!");
      model.newTarget();
      const [x, y] = model.targetProperty.value;
      expect([x, y]).not.toEqual([3, 2]);
      expect([x, y]).not.toEqual([0, 0]);
      expect(Number.isInteger(x) && Math.abs(x) <= 4).toBe(true);
      expect(Number.isInteger(y) && Math.abs(y) <= 3).toBe(true);
      expect(view.getVoicingDetailsContent()).not.toContain("hit!");
      plot.paintCanvas(context);

      model.targetProperty.value = [4, 0];
      model.uxProperty.value = 0.1;
      model.uyProperty.value = 0;
      const coefficients = [model.c1Property.value, model.c2Property.value];
      model.solve();
      expect([model.c1Property.value, model.c2Property.value]).toEqual(coefficients);
      expect(view.getVoicingDetailsContent()).toContain("outside ±3");
      model.c1Property.value = 1;
      expect(model.solveFailedProperty.value).toBe(false);

      model.wyProperty.value = 0;
      expect(view.getVoicingDetailsContent()).toContain("the span is a line");
      plot.paintCanvas(context);
      model.uxProperty.value = 0;
      model.wxProperty.value = 0;
      expect(view.getVoicingDetailsContent()).toContain("The span is {0}");
      plot.paintCanvas(context);

      model.reset();
      expect(model.resultProperty.value).toEqual([1, 2.5]);
      expect(model.showSpanProperty.value).toBe(false);
      expect(view.getVoicingDetailsContent()).not.toContain("Target");
    } finally {
      help.disposeSubtree();
      view.dispose();
      model.dispose();
    }
    expect(view.isDisposed).toBe(true);
  });
});
