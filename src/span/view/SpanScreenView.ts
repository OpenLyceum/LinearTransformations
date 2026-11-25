import { StringUtils } from "scenerystack/phetcommon";
import { HBox } from "scenerystack/scenery";
import type { ScreenViewOptions } from "scenerystack/sim";
import {
  arrow,
  button,
  checkbox,
  computed,
  format,
  LabView,
  line,
  Plane,
  PlotCanvas,
  plotLabel,
  slider,
} from "../../common/LabView.js";
import { add, norm, normalize, scale, sub, type Vec } from "../../common/model/LinearAlgebra.js";
import { drawLineThroughOrigin } from "../../common/view/PlotDrawing.js";
import { VectorHandle } from "../../common/view/VectorHandle.js";
import { StringManager } from "../../i18n/StringManager.js";
import Colors from "../../LinearTransformationsColors.js";
import { GRID_LINES, PLOT_HEIGHT, PLOT_WIDTH, X_RANGE, Y_RANGE } from "../../LinearTransformationsConstants.js";
import type { SpanModel } from "../model/SpanModel.js";

const LATTICE_EXTENT = 20;
const TARGET_RADIUS = 10;
const TARGET_TOLERANCE = 0.05;

function drawLatticeFamily(ctx: CanvasRenderingContext2D, plane: Plane, direction: Vec, spacing: Vec, color: string) {
  const unit = normalize(direction);
  if (unit) {
    const extent = scale(LATTICE_EXTENT, unit);
    for (let k = -GRID_LINES; k <= GRID_LINES; k++) {
      const point = scale(k, spacing);
      line(ctx, [plane.project(sub(point, extent)), plane.project(add(point, extent))], color);
    }
  }
}

export class SpanScreenView extends LabView {
  public constructor(model: SpanModel, options?: ScreenViewOptions) {
    const strings = StringManager.getInstance();
    const a11y = strings.getSpanA11yStrings();
    const s = a11y.controls;
    const {
      uProperty,
      wProperty,
      c1Property,
      c2Property,
      resultProperty,
      determinantProperty,
      spanDimensionProperty,
      showSpanProperty,
      targetModeProperty,
      targetProperty,
      solveFailedProperty,
    } = model;
    const plane = new Plane(X_RANGE, Y_RANGE);
    const origin = plane.project([0, 0]);
    const plot = new PlotCanvas(
      [
        uProperty,
        wProperty,
        c1Property,
        resultProperty,
        spanDimensionProperty,
        showSpanProperty,
        targetModeProperty,
        targetProperty,
        s.uStringProperty,
        s.wStringProperty,
      ],
      (ctx, colors) => {
        plane.axes(ctx, colors);
        const u = uProperty.value;
        const w = wProperty.value;
        if (showSpanProperty.value) {
          if (spanDimensionProperty.value === 2) {
            ctx.fillStyle = colors.positiveArea;
            ctx.fillRect(0, 0, PLOT_WIDTH, PLOT_HEIGHT);
            drawLatticeFamily(ctx, plane, u, w, colors.faintGrid);
            drawLatticeFamily(ctx, plane, w, u, colors.faintGrid);
          } else if (spanDimensionProperty.value === 1) {
            drawLineThroughOrigin(ctx, plane, norm(u) >= norm(w) ? u : w, colors.column1);
          }
        }

        const uTip = plane.project(u);
        const wTip = plane.project(w);
        const scaledUTip = plane.project(scale(c1Property.value, u));
        const resultTip = plane.project(resultProperty.value);
        arrow(ctx, origin, uTip, colors.column1);
        arrow(ctx, origin, wTip, colors.column2);
        ctx.save();
        ctx.setLineDash([6, 5]);
        arrow(ctx, origin, scaledUTip, colors.column1);
        arrow(ctx, scaledUTip, resultTip, colors.column2);
        ctx.restore();
        arrow(ctx, origin, resultTip, colors.output, 3);
        plotLabel(ctx, s.uStringProperty.value, [uTip[0] + 17, uTip[1] + 15], colors.column1);
        plotLabel(ctx, s.wStringProperty.value, [wTip[0] - 18, wTip[1] - 10], colors.column2);

        if (targetModeProperty.value) {
          ctx.beginPath();
          ctx.arc(...plane.project(targetProperty.value), TARGET_RADIUS, 0, 2 * Math.PI);
          ctx.strokeStyle = colors.input;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      },
    );
    plot.pdomOrder = [
      new VectorHandle({
        plot,
        plane,
        xProperty: model.uxProperty,
        yProperty: model.uyProperty,
        colorProperty: Colors.column1ColorProperty,
        accessibleName: s.handleUStringProperty,
      }),
      new VectorHandle({
        plot,
        plane,
        xProperty: model.wxProperty,
        yProperty: model.wyProperty,
        colorProperty: Colors.column2ColorProperty,
        accessibleName: s.handleWStringProperty,
      }),
    ];

    const targetButtons = new HBox({
      spacing: 8,
      children: [
        button(s.newTargetStringProperty, () => model.newTarget()),
        button(s.solveStringProperty, () => model.solve()),
      ],
    });
    const targetVisibility = targetModeProperty.linkAttribute(targetButtons, "visible");

    const result = computed([resultProperty, s.resultStringProperty], () => {
      const [x, y] = resultProperty.value;
      return StringUtils.fillIn(s.resultStringProperty, { x: format(x), y: format(y) });
    });
    const determinant = computed([determinantProperty, s.determinantStringProperty], () =>
      StringUtils.fillIn(s.determinantStringProperty, { value: format(determinantProperty.value) }),
    );
    const dimensionStrings = [s.zeroStringProperty, s.dependentStringProperty, s.independentStringProperty] as const;
    const status = computed(
      [spanDimensionProperty, ...dimensionStrings],
      () => dimensionStrings[spanDimensionProperty.value].value,
    );
    const target = computed(
      [targetModeProperty, targetProperty, resultProperty, s.targetPointStringProperty, s.targetHitStringProperty],
      () => {
        if (!targetModeProperty.value) {
          return "";
        }
        const [x, y] = targetProperty.value;
        const hit = norm(sub(targetProperty.value, resultProperty.value)) < TARGET_TOLERANCE;
        return StringUtils.fillIn(hit ? s.targetHitStringProperty : s.targetPointStringProperty, {
          x: format(x),
          y: format(y),
        });
      },
    );
    const failure = computed([targetModeProperty, solveFailedProperty, s.solveFailedStringProperty], () =>
      targetModeProperty.value && solveFailedProperty.value ? s.solveFailedStringProperty.value : "",
    );
    const readouts = [result, determinant, status, target, failure];
    const details = computed(
      readouts,
      () =>
        `${readouts
          .map((readout) => readout.value)
          .filter(Boolean)
          .join(". ")}.`,
    );
    super(
      {
        title: strings.getScreenNames().spanStringProperty,
        summary: a11y.screenSummary,
        details,
        plot,
        controls: [
          slider(s.c1StringProperty, c1Property, 0.1),
          slider(s.c2StringProperty, c2Property, 0.1),
          checkbox(s.showSpanStringProperty, showSpanProperty),
          checkbox(s.targetModeStringProperty, targetModeProperty),
          targetButtons,
        ],
        readouts,
        reset: () => model.reset(),
      },
      options,
    );
    this.addDisposable({ dispose: () => targetModeProperty.unlink(targetVisibility) }, details, ...readouts);
  }
}
