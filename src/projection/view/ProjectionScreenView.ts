import { Multilink } from "scenerystack/axon";
import { StringUtils } from "scenerystack/phetcommon";
import { VBox } from "scenerystack/scenery";
import type { ScreenViewOptions } from "scenerystack/sim";
import {
  arrow,
  checkbox,
  computed,
  dot,
  format,
  LabView,
  line,
  Plane,
  PlotCanvas,
  plotLabel,
  radioButtons,
  slider,
} from "../../common/LabView.js";
import { dotProduct, norm, scale, type Vec } from "../../common/model/LinearAlgebra.js";
import { MatrixReadout } from "../../common/view/MatrixReadout.js";
import { drawLineThroughOrigin, drawRightAngle } from "../../common/view/PlotDrawing.js";
import { VectorHandle } from "../../common/view/VectorHandle.js";
import { StringManager } from "../../i18n/StringManager.js";
import Colors from "../../LinearTransformationsColors.js";
import { EPS, X_RANGE, Y_RANGE } from "../../LinearTransformationsConstants.js";
import type { ProjectionModel } from "../model/ProjectionModel.js";

const LINE_PARAMETER_STEP = 0.05;
const SSE_MATCH_TOLERANCE = 1e-6;

function drawFit(
  ctx: CanvasRenderingContext2D,
  plane: Plane,
  points: readonly Vec[],
  slope: number,
  intercept: number,
  lineColor: string,
  residualColor: string,
) {
  const onLine = (x: number) => plane.project([x, slope * x + intercept]);
  line(ctx, [onLine(X_RANGE.min), onLine(X_RANGE.max)], lineColor, 3);
  for (const point of points) {
    line(ctx, [plane.project(point), onLine(point[0])], residualColor, 2);
  }
}

export class ProjectionScreenView extends LabView {
  public constructor(model: ProjectionModel, options?: ScreenViewOptions) {
    const strings = StringManager.getInstance();
    const a11y = strings.getProjectionA11yStrings();
    const s = a11y.controls;
    const {
      modeProperty,
      aProperty,
      bProperty,
      pointsProperty,
      projectionProperty,
      projectionMatrixProperty,
      fitProperty,
      tryLineProperty,
      userSlopeProperty,
      userInterceptProperty,
      userSSEProperty,
    } = model;
    const plane = new Plane(X_RANGE, Y_RANGE);
    const origin = plane.project([0, 0]);
    const plot = new PlotCanvas(
      [
        modeProperty,
        aProperty,
        bProperty,
        projectionProperty,
        pointsProperty,
        fitProperty,
        tryLineProperty,
        userSlopeProperty,
        userInterceptProperty,
        s.aStringProperty,
        s.bStringProperty,
        s.pStringProperty,
        s.eStringProperty,
      ],
      (ctx, colors) => {
        plane.axes(ctx, colors);
        if (modeProperty.value === "project") {
          const a = aProperty.value;
          const aTip = plane.project(a);
          const bTip = plane.project(bProperty.value);
          drawLineThroughOrigin(ctx, plane, a, colors.column1);
          arrow(ctx, origin, aTip, colors.column1);
          arrow(ctx, origin, bTip, colors.input);
          const projection = projectionProperty.value;
          if (projection) {
            const { p, e } = projection;
            const pTip = plane.project(p);
            arrow(ctx, origin, pTip, colors.output, 3);
            if (norm(p) <= EPS) {
              dot(ctx, pTip, colors.output, 4);
            }
            plotLabel(ctx, s.pStringProperty.value, [pTip[0] + 8, pTip[1] + 17], colors.output);
            ctx.save();
            ctx.setLineDash([6, 5]);
            arrow(ctx, pTip, bTip, colors.eigen);
            ctx.restore();
            if (norm(e) > EPS) {
              plotLabel(
                ctx,
                s.eStringProperty.value,
                [(pTip[0] + bTip[0]) / 2 + 9, (pTip[1] + bTip[1]) / 2],
                colors.eigen,
              );
              if (norm(p) > EPS) {
                drawRightAngle(ctx, plane, p, scale(-1, p), e, colors.eigen);
              }
            }
          }
          plotLabel(ctx, s.aStringProperty.value, [aTip[0] + 11, aTip[1] + 15], colors.column1);
          plotLabel(ctx, s.bStringProperty.value, [bTip[0] + 11, bTip[1] - 9], colors.input);
        } else {
          const points = pointsProperty.value;
          const fit = fitProperty.value;
          if (fit) {
            drawFit(ctx, plane, points, fit.slope, fit.intercept, colors.output, colors.eigen);
          }
          if (tryLineProperty.value) {
            ctx.save();
            ctx.setLineDash([6, 5]);
            drawFit(
              ctx,
              plane,
              points,
              userSlopeProperty.value,
              userInterceptProperty.value,
              colors.column2,
              colors.column2,
            );
            ctx.restore();
          }
        }
      },
    );
    const [axProperty, ayProperty] = model.aCoordinates;
    const [bxProperty, byProperty] = model.bCoordinates;
    const vectorHandles = [
      new VectorHandle({
        plot,
        plane,
        xProperty: axProperty,
        yProperty: ayProperty,
        colorProperty: Colors.column1ColorProperty,
        accessibleName: s.handleAStringProperty,
      }),
      new VectorHandle({
        plot,
        plane,
        xProperty: bxProperty,
        yProperty: byProperty,
        colorProperty: Colors.inputVectorColorProperty,
        accessibleName: s.handleBStringProperty,
      }),
    ];
    const pointHandles = model.pointsProperties.map(([xProperty, yProperty], index) => {
      const name = computed([s.dataPointStringProperty], () =>
        StringUtils.fillIn(s.dataPointStringProperty, { index: index + 1 }),
      );
      const handle = new VectorHandle({
        plot,
        plane,
        xProperty,
        yProperty,
        colorProperty: Colors.inputVectorColorProperty,
        accessibleName: name,
      });
      handle.addDisposable(name);
      return handle;
    });
    plot.pdomOrder = [...vectorHandles, ...pointHandles];

    const tryLine = checkbox(s.tryLineStringProperty, tryLineProperty);
    const userControls = new VBox({
      align: "left",
      spacing: 8,
      children: [
        slider(s.slopeStringProperty, userSlopeProperty, LINE_PARAMETER_STEP),
        slider(s.interceptStringProperty, userInterceptProperty, LINE_PARAMETER_STEP),
      ],
    });
    const matrixReadout = new MatrixReadout(projectionMatrixProperty, s.matrixStringProperty);
    const visibilityLink = Multilink.multilink(
      [modeProperty, tryLineProperty, projectionMatrixProperty],
      (mode, trying, matrix) => {
        const projecting = mode === "project";
        for (const handle of vectorHandles) {
          handle.visible = projecting;
        }
        for (const handle of pointHandles) {
          handle.visible = !projecting;
        }
        tryLine.visible = !projecting;
        userControls.visible = !projecting && trying;
        matrixReadout.visible = projecting && matrix !== null;
      },
    );

    const result = computed(
      [
        modeProperty,
        projectionProperty,
        fitProperty,
        s.projectedStringProperty,
        s.zeroStringProperty,
        s.bestFitStringProperty,
        s.allXEqualStringProperty,
      ],
      () => {
        if (modeProperty.value === "project") {
          const projection = projectionProperty.value;
          return projection
            ? StringUtils.fillIn(s.projectedStringProperty, { x: format(projection.p[0]), y: format(projection.p[1]) })
            : s.zeroStringProperty.value;
        }
        const fit = fitProperty.value;
        return fit
          ? StringUtils.fillIn(s.bestFitStringProperty, { slope: format(fit.slope), intercept: format(fit.intercept) })
          : s.allXEqualStringProperty.value;
      },
    );
    const errorOrSSE = computed(
      [modeProperty, projectionProperty, fitProperty, s.errorStringProperty, s.sseStringProperty],
      () => {
        if (modeProperty.value === "project") {
          const projection = projectionProperty.value;
          return projection
            ? StringUtils.fillIn(s.errorStringProperty, { x: format(projection.e[0]), y: format(projection.e[1]) })
            : "";
        }
        const fit = fitProperty.value;
        return fit ? StringUtils.fillIn(s.sseStringProperty, { value: format(fit.sse) }) : "";
      },
    );
    const orthogonalityOrUserSSE = computed(
      [
        modeProperty,
        projectionProperty,
        aProperty,
        tryLineProperty,
        fitProperty,
        userSSEProperty,
        s.dotStringProperty,
        s.userSSEStringProperty,
        s.matchesStringProperty,
        s.aboveStringProperty,
      ],
      () => {
        if (modeProperty.value === "project") {
          const projection = projectionProperty.value;
          return projection
            ? StringUtils.fillIn(s.dotStringProperty, { value: format(dotProduct(aProperty.value, projection.e)) })
            : "";
        }
        if (!tryLineProperty.value) {
          return "";
        }
        const fit = fitProperty.value;
        const value = userSSEProperty.value;
        const userSSE = StringUtils.fillIn(s.userSSEStringProperty, { value: format(value) });
        if (!fit) {
          return userSSE;
        }
        const comparison =
          Math.abs(value - fit.sse) <= SSE_MATCH_TOLERANCE ? s.matchesStringProperty : s.aboveStringProperty;
        return `${userSSE} ${comparison.value}`;
      },
    );
    const distanceOrNote = computed(
      [modeProperty, projectionProperty, s.distanceStringProperty, s.projectionNoteStringProperty],
      () => {
        if (modeProperty.value === "leastSquares") {
          return s.projectionNoteStringProperty.value;
        }
        const projection = projectionProperty.value;
        return projection ? StringUtils.fillIn(s.distanceStringProperty, { value: format(norm(projection.e)) }) : "";
      },
    );
    const readouts = [result, errorOrSSE, orthogonalityOrUserSSE, distanceOrNote];
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
        title: strings.getScreenNames().projectionStringProperty,
        summary: a11y.screenSummary,
        details,
        plot,
        controls: [
          radioButtons(
            modeProperty,
            [
              { value: "project", label: s.projectStringProperty },
              { value: "leastSquares", label: s.leastSquaresStringProperty },
            ],
            s.modeStringProperty,
          ),
          tryLine,
          userControls,
        ],
        readouts,
        wrapReadouts: true,
        belowPlot: matrixReadout,
        reset: () => model.reset(),
      },
      options,
    );
    this.addDisposable(visibilityLink, details, ...readouts);
  }
}
