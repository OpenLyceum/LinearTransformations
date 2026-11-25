import { describe, expect, it, vi } from "vitest";
import { format, Plane } from "../src/common/LabView.js";
import { IDENTITY } from "../src/common/model/LinearAlgebra.js";
import {
  drawCircleImage,
  drawLineThroughOrigin,
  drawParallelogram,
  drawPolygon,
  drawRightAngle,
  drawTransformedGrid,
  F_SHAPE,
} from "../src/common/view/PlotDrawing.js";
import { GRID_LINES, X_RANGE, Y_RANGE } from "../src/LinearTransformationsConstants.js";

const plane = new Plane(X_RANGE, Y_RANGE);

function canvasContext(): CanvasRenderingContext2D {
  const context = document.createElement("canvas").getContext("2d");
  if (!context) {
    throw new Error("Expected the test canvas context");
  }
  return context;
}

describe("Transform drawing", () => {
  it("inverts plot coordinates with upward model y and square units", () => {
    const origin = plane.project([0, 0]);
    const [x, y] = plane.project([1, 1]);
    expect(x - origin[0]).toBeCloseTo(origin[1] - y);
    const [modelX, modelY] = plane.unproject(plane.project([-2.25, 3.15]));
    expect(modelX).toBeCloseTo(-2.25);
    expect(modelY).toBeCloseTo(3.15);
    expect(format(-0.0001, 2)).toBe("0");
  });

  it("transforms both grid families", () => {
    const context = canvasContext();
    const moveTo = vi.spyOn(context, "moveTo");
    const lineTo = vi.spyOn(context, "lineTo");
    drawTransformedGrid(context, plane, [1, 1, 0, 1], "grid");
    expect(moveTo).toHaveBeenCalledTimes(2 * (2 * GRID_LINES + 1));
    expect(moveTo).toHaveBeenNthCalledWith(1, ...plane.project([-28, -20]));
    expect(lineTo).toHaveBeenNthCalledWith(1, ...plane.project([12, 20]));
    expect(moveTo).toHaveBeenNthCalledWith(2, ...plane.project([-28, -8]));
    expect(lineTo).toHaveBeenNthCalledWith(2, ...plane.project([12, -8]));
    expect(context.lineWidth).toBe(1);
  });

  it("fills a square image with area and draws its full rank-one span when collapsed", () => {
    const context = canvasContext();
    const fill = vi.spyOn(context, "fill");
    const moveTo = vi.spyOn(context, "moveTo");
    const lineTo = vi.spyOn(context, "lineTo");
    const arc = vi.spyOn(context, "arc");
    drawParallelogram(context, plane, [1, 2], [-1, 1], "area", "border");
    expect(fill).toHaveBeenCalledOnce();
    expect(context.fillStyle).toBe("area");
    expect(lineTo).toHaveBeenNthCalledWith(2, ...plane.project([0, 3]));

    lineTo.mockClear();
    drawParallelogram(context, plane, [0, -2], [0, 1], "area", "border");
    expect(fill).toHaveBeenCalledOnce();
    expect(moveTo).toHaveBeenLastCalledWith(...plane.project([0, -2]));
    expect(lineTo).toHaveBeenCalledExactlyOnceWith(...plane.project([0, 1]));
    expect(context.lineWidth).toBe(3);

    drawParallelogram(context, plane, [0, 0], [0, 0], "area", "border");
    expect(arc).toHaveBeenCalledExactlyOnceWith(...plane.project([0, 0]), 1.5, 0, 2 * Math.PI);
  });

  it("closes the transformed letter and sampled circle", () => {
    const context = canvasContext();
    const moveTo = vi.spyOn(context, "moveTo");
    const lineTo = vi.spyOn(context, "lineTo");
    drawPolygon(context, plane, [2, 0, 0, 0.5], F_SHAPE, "letter");
    expect(lineTo).toHaveBeenNthCalledWith(2, ...plane.project([2.4, 1]));
    expect(lineTo).toHaveBeenLastCalledWith(...plane.project([0, 0]));
    lineTo.mockClear();
    drawCircleImage(context, plane, [2, 0, 0, 0.5], "ellipse");
    expect(lineTo).toHaveBeenCalledTimes(128);
    expect(lineTo).toHaveBeenNthCalledWith(32, ...plane.project([0, 0.5]));
    expect(moveTo).toHaveBeenLastCalledWith(...plane.project([2, 0]));
    expect(lineTo).toHaveBeenLastCalledWith(...plane.project([2, 0]));
    drawPolygon(context, plane, IDENTITY, [], "empty");
    expect(lineTo).toHaveBeenCalledTimes(128);
  });

  it("draws direction and right-angle markers only for nonzero vectors", () => {
    const context = canvasContext();
    const moveTo = vi.spyOn(context, "moveTo");
    const lineTo = vi.spyOn(context, "lineTo");
    const setLineDash = vi.spyOn(context, "setLineDash");
    const restore = vi.spyOn(context, "restore");
    drawLineThroughOrigin(context, plane, [0, 0], "direction");
    drawRightAngle(context, plane, [1, 1], [0, 0], [0, 1], "angle");
    expect(moveTo).not.toHaveBeenCalled();
    drawLineThroughOrigin(context, plane, [0, 4], "direction");
    expect(setLineDash).toHaveBeenCalledExactlyOnceWith([6, 5]);
    expect(restore).toHaveBeenCalledOnce();
    expect(moveTo).toHaveBeenCalledExactlyOnceWith(...plane.project([0, -20]));
    expect(lineTo).toHaveBeenCalledExactlyOnceWith(...plane.project([0, 20]));
    drawRightAngle(context, plane, [1, 1], [3, 0], [0, -2], "angle");
    expect(moveTo).toHaveBeenLastCalledWith(...plane.project([1.25, 1]));
    expect(lineTo).toHaveBeenNthCalledWith(2, ...plane.project([1.25, 0.75]));
    expect(lineTo).toHaveBeenLastCalledWith(...plane.project([1, 0.75]));
  });
});
