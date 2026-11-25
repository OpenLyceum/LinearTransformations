import { enableAssert } from "scenerystack/assert";
import { HBox, PressListener, VBox } from "scenerystack/scenery";
import { RectangularPushButton } from "scenerystack/sun";
import { describe, expect, it } from "vitest";
import { ChangeOfBasisModel } from "../src/basis/model/ChangeOfBasisModel.js";
import { ChangeOfBasisKeyboardHelpContent } from "../src/basis/view/ChangeOfBasisKeyboardHelpContent.js";
import { ChangeOfBasisScreenView } from "../src/basis/view/ChangeOfBasisScreenView.js";
import { PlotCanvas } from "../src/common/LabView.js";
import { MatrixReadout } from "../src/common/view/MatrixReadout.js";
import { VectorHandle } from "../src/common/view/VectorHandle.js";

enableAssert();

describe("ChangeOfBasisScreenView", () => {
  it("updates coordinates as handles move, hides invalid results, and switches to an eigenbasis", () => {
    const model = new ChangeOfBasisModel();
    const view = new ChangeOfBasisScreenView(model);
    const help = new ChangeOfBasisKeyboardHelpContent();
    try {
      const content = view.children.find((node) => node.children.some((child) => child instanceof PlotCanvas));
      const [plot, panel, belowPlot] = content?.pdomOrder ?? [];
      const eigenButton = panel?.children.find((child) => child instanceof VBox)?.children[1];
      const context = document.createElement("canvas").getContext("2d");
      if (
        !(
          plot instanceof PlotCanvas &&
          panel &&
          belowPlot instanceof HBox &&
          eigenButton instanceof RectangularPushButton &&
          context
        )
      ) {
        throw new Error("Change of Basis must construct its plot, matrices, and eigenvector button");
      }
      const matrices = belowPlot.children.filter((child) => child instanceof MatrixReadout);
      const handles = plot.children.filter((child) => child instanceof VectorHandle);
      expect(handles).toHaveLength(3);
      expect(plot.pdomOrder).toEqual(handles);
      expect(matrices).toHaveLength(3);
      expect(view.layoutBounds.height).toBe(655);
      expect(belowPlot.bottom).toBeLessThan(view.layoutBounds.maxY);
      expect(panel.height).toBeLessThanOrEqual(530);
      expect(view.getVoicingDetailsContent()).toContain("[x]_B = (1.14, 0.57)");
      plot.paintCanvas(context);

      model.xCoordinates[0].value = 3.5;
      model.xCoordinates[1].value = 0.6;
      model.b1Coordinates[1].value = -0.5;
      expect(model.xProperty.value).toEqual([3.5, 0.6]);
      expect(view.getVoicingDetailsContent()).toContain("[x]_std = (3.5, 0.6)");
      expect(view.getVoicingDetailsContent()).toContain("[x]_B = (2.02, 1.07)");
      plot.paintCanvas(context);

      model.b2Coordinates[0].value = 4;
      model.b2Coordinates[1].value = -1;
      expect(model.inverseBasisProperty.value).toBeNull();
      expect(matrices.map((matrix) => matrix.visible)).toEqual([true, false, false]);
      expect(view.getVoicingDetailsContent()).toContain("b₁ and b₂ are parallel");
      plot.paintCanvas(context);

      const listener = eigenButton.getInputListeners().find((entry) => entry instanceof PressListener);
      if (!listener) {
        throw new Error("The eigenvector button must have a PressListener");
      }
      expect(eigenButton.enabled).toBe(true);
      listener.click(null);
      expect(model.basisMatrixProperty.value?.[0]).toBeCloseTo(3, 9);
      expect(model.basisMatrixProperty.value?.[3]).toBeCloseTo(1, 9);
      expect(model.diagonalProperty.value).toBe(true);
      expect(matrices.every((matrix) => matrix.visible)).toBe(true);
      expect(view.getVoicingDetailsContent()).toContain("[A]_B is diagonal");
      plot.paintCanvas(context);

      model.matrix.presetProperty.value = "rotation90";
      expect(eigenButton.enabled).toBe(false);
      const eigenbasis = model.basisProperty.value;
      model.useEigenvectors();
      expect(model.basisProperty.value).toBe(eigenbasis);
      expect(view.getVoicingDetailsContent()).not.toContain("is diagonal");
      model.reset();
      expect(model.b1Property.value).toEqual([2, 1]);
      expect(model.matrix.presetProperty.value).toBe("symmetric");
    } finally {
      help.disposeSubtree();
      view.dispose();
      model.dispose();
    }
    expect(view.isDisposed).toBe(true);
  });
});
