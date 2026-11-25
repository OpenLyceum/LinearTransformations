import { Multilink } from "scenerystack/axon";
import { Bounds2 } from "scenerystack/dot";
import { StringUtils } from "scenerystack/phetcommon";
import { HBox, Node } from "scenerystack/scenery";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import {
  arrow,
  checkbox,
  comboBox,
  computed,
  format,
  LabView,
  Plane,
  PlotCanvas,
  plotLabel,
  radioButtons,
  slider,
} from "../../common/LabView.js";
import { column1, column2, det, IDENTITY, multiply, nearlyEqual } from "../../common/model/LinearAlgebra.js";
import { PRESET_IDS } from "../../common/model/Presets.js";
import { MatrixEditor } from "../../common/view/MatrixEditor.js";
import { MatrixReadout } from "../../common/view/MatrixReadout.js";
import { drawParallelogram, drawPolygon, drawTransformedGrid, F_SHAPE } from "../../common/view/PlotDrawing.js";
import { VectorHandle } from "../../common/view/VectorHandle.js";
import { StringManager } from "../../i18n/StringManager.js";
import Colors from "../../LinearTransformationsColors.js";
import { ENTRY_RANGE, EPS, TRANSFORM_LAYOUT_HEIGHT, X_RANGE, Y_RANGE } from "../../LinearTransformationsConstants.js";
import type { TransformModel } from "../model/TransformModel.js";

export class TransformScreenView extends LabView {
  public constructor(model: TransformModel, options?: ScreenViewOptions) {
    const strings = StringManager.getInstance();
    const a11y = strings.getTransformA11yStrings();
    const s = a11y.controls;
    const matrixStrings = strings.getMatrixStrings();
    const presets = strings.getPresetStrings();
    const {
      matrix,
      second,
      morphProperty,
      composeProperty,
      orderProperty,
      showFProperty,
      showGridProperty,
      effectiveMatrixProperty,
      productProperty,
    } = model;
    const aProperty = matrix.matrixProperty;
    const bProperty = second.matrixProperty;
    const plane = new Plane(X_RANGE, Y_RANGE);
    const plot = new PlotCanvas(
      [
        effectiveMatrixProperty,
        aProperty,
        bProperty,
        composeProperty,
        morphProperty,
        orderProperty,
        showFProperty,
        showGridProperty,
        s.arrow1StringProperty,
        s.arrow2StringProperty,
      ],
      (ctx, colors) => {
        const m = effectiveMatrixProperty.value;
        const determinant = det(m);
        const u = column1(m);
        const w = column2(m);
        plane.axes(ctx, { ...colors, grid: colors.faintGrid });
        if (showGridProperty.value) {
          drawTransformedGrid(ctx, plane, m, colors.grid);
        }
        drawParallelogram(
          ctx,
          plane,
          u,
          w,
          determinant < -EPS ? colors.negativeArea : colors.positiveArea,
          colors.output,
        );
        if (showFProperty.value) {
          drawPolygon(ctx, plane, IDENTITY, F_SHAPE, colors.faintGrid, 1);
          drawPolygon(ctx, plane, m, F_SHAPE, colors.output);
          if (composeProperty.value && morphProperty.value === 1) {
            ctx.save();
            ctx.setLineDash([6, 5]);
            drawPolygon(
              ctx,
              plane,
              orderProperty.value === "BA" ? aProperty.value : bProperty.value,
              F_SHAPE,
              colors.alternate,
              2,
            );
            ctx.restore();
          }
        }
        const origin = plane.project([0, 0]);
        const columns = [
          { end: plane.project(u), color: colors.column1, label: s.arrow1StringProperty.value, dy: -11 },
          { end: plane.project(w), color: colors.column2, label: s.arrow2StringProperty.value, dy: 18 },
        ];
        for (const { end, color, label, dy } of columns) {
          arrow(ctx, origin, end, color);
          plotLabel(ctx, label, [end[0] + 11, end[1] + dy], color);
        }
      },
    );
    const handleOptions = { plot, plane, xRange: ENTRY_RANGE, yRange: ENTRY_RANGE };
    const firstHandle = new VectorHandle({
      ...handleOptions,
      xProperty: matrix.aProperty,
      yProperty: matrix.cProperty,
      colorProperty: Colors.column1ColorProperty,
      accessibleName: s.handle1StringProperty,
    });
    const secondHandle = new VectorHandle({
      ...handleOptions,
      xProperty: matrix.bProperty,
      yProperty: matrix.dProperty,
      colorProperty: Colors.column2ColorProperty,
      accessibleName: s.handle2StringProperty,
    });
    plot.pdomOrder = [firstHandle, secondHandle];
    const listParent = new Node();
    const presetControl = comboBox(
      matrix.presetProperty,
      PRESET_IDS.map((value) => ({ value, label: presets[`${value}StringProperty`] })),
      listParent,
      matrixStrings.presetStringProperty,
    );
    const orderControl = radioButtons(
      orderProperty,
      [
        { value: "BA", label: s.orderBAStringProperty },
        { value: "AB", label: s.orderABStringProperty },
      ],
      s.orderStringProperty,
    );
    const productLabel = computed([orderProperty, s.productBAStringProperty, s.productABStringProperty], () =>
      orderProperty.value === "BA" ? s.productBAStringProperty.value : s.productABStringProperty.value,
    );
    const secondEditor = new MatrixEditor(second, s.matrixBStringProperty);
    const productReadout = new MatrixReadout(productProperty, productLabel);
    const belowPlot = new HBox({
      spacing: 14,
      align: "top",
      children: [new MatrixEditor(matrix, s.matrixAStringProperty, { showDet: true }), secondEditor, productReadout],
    });
    const visibilityLink = Multilink.multilink([composeProperty, morphProperty], (compose, morph) => {
      firstHandle.visible = secondHandle.visible = !compose && morph === 1;
      orderControl.visible = secondEditor.visible = productReadout.visible = compose;
    });

    const determinant = computed([aProperty, matrixStrings.detStringProperty, s.matrixAStringProperty], () =>
      StringUtils.fillIn(matrixStrings.detStringProperty, {
        label: s.matrixAStringProperty.value,
        value: format(det(aProperty.value)),
      }),
    );
    const area = computed([effectiveMatrixProperty, s.areaScaleStringProperty], () =>
      StringUtils.fillIn(s.areaScaleStringProperty, { value: format(Math.abs(det(effectiveMatrixProperty.value))) }),
    );
    const orientation = computed(
      [effectiveMatrixProperty, s.preservedStringProperty, s.reversedStringProperty, s.collapsedStringProperty],
      () => {
        const value = det(effectiveMatrixProperty.value);
        if (Math.abs(value) <= EPS) {
          return s.collapsedStringProperty.value;
        }
        return value > 0 ? s.preservedStringProperty.value : s.reversedStringProperty.value;
      },
    );
    const productDet = computed(
      [
        composeProperty,
        productProperty,
        productLabel,
        orderProperty,
        s.matrixAStringProperty,
        s.matrixBStringProperty,
        s.productDetStringProperty,
      ],
      () => {
        if (!composeProperty.value) {
          return "";
        }
        const [left, right] =
          orderProperty.value === "BA"
            ? [s.matrixBStringProperty.value, s.matrixAStringProperty.value]
            : [s.matrixAStringProperty.value, s.matrixBStringProperty.value];
        return StringUtils.fillIn(s.productDetStringProperty, {
          product: productLabel.value,
          left,
          right,
          value: format(det(productProperty.value)),
        });
      },
    );
    const noncommuting = computed([composeProperty, aProperty, bProperty, s.noncommutingStringProperty], () => {
      if (composeProperty.value) {
        const ab = multiply(aProperty.value, bProperty.value);
        const ba = multiply(bProperty.value, aProperty.value);
        if (([0, 1, 2, 3] as const).some((index) => !nearlyEqual(ab[index], ba[index]))) {
          return s.noncommutingStringProperty.value;
        }
      }
      return "";
    });
    const readouts = [determinant, area, orientation, productDet, noncommuting];
    const details = computed(readouts, () => {
      const sentences = readouts.map((readout) => readout.value).filter(Boolean);
      return `${sentences.join(". ")}.`;
    });
    super(
      {
        title: strings.getScreenNames().transformStringProperty,
        summary: a11y.screenSummary,
        details,
        plot,
        controls: [
          presetControl,
          slider(s.morphStringProperty, morphProperty, 0.05),
          checkbox(s.gridStringProperty, showGridProperty),
          checkbox(s.letterFStringProperty, showFProperty),
          checkbox(s.composeStringProperty, composeProperty),
          orderControl,
        ],
        readouts,
        belowPlot,
        listParent,
        reset: () => model.reset(),
      },
      {
        layoutBounds: new Bounds2(0, 0, ScreenView.DEFAULT_LAYOUT_BOUNDS.width, TRANSFORM_LAYOUT_HEIGHT),
        ...options,
      },
    );
    this.addDisposable(visibilityLink, details, ...readouts, productLabel);
  }
}
