import { DerivedProperty, Multilink } from "scenerystack/axon";
import { StringUtils } from "scenerystack/phetcommon";
import { HBox, Node, VBox } from "scenerystack/scenery";
import type { ScreenViewOptions } from "scenerystack/sim";
import {
  arrow,
  button,
  comboBox,
  computed,
  dot,
  format,
  LabView,
  line,
  Plane,
  PlotCanvas,
  plotLabel,
  radioButtons,
} from "../../common/LabView.js";
import { column1, column2, dotProduct, scale, type Vec } from "../../common/model/LinearAlgebra.js";
import { PRESET_IDS } from "../../common/model/Presets.js";
import { type Augmented, formatOp } from "../../common/model/RowReduction.js";
import { AugmentedMatrixReadout } from "../../common/view/AugmentedMatrixReadout.js";
import { MatrixEditor, matrixEntrySpinner } from "../../common/view/MatrixEditor.js";
import { labeledMatrix } from "../../common/view/MatrixReadout.js";
import { VectorHandle } from "../../common/view/VectorHandle.js";
import { StringManager } from "../../i18n/StringManager.js";
import Colors from "../../LinearTransformationsColors.js";
import { ENTRY_RANGE, EPS, X_RANGE, Y_RANGE } from "../../LinearTransformationsConstants.js";
import type { SystemsModel } from "../model/SystemsModel.js";

function drawRow(ctx: CanvasRenderingContext2D, plane: Plane, [p, q, r]: Augmented[0], color: string, width: number) {
  if (Math.abs(q) > EPS) {
    line(
      ctx,
      [X_RANGE.min, X_RANGE.max].map((x) => plane.project([x, (r - p * x) / q])),
      color,
      width,
    );
  } else if (Math.abs(p) > EPS) {
    line(
      ctx,
      [Y_RANGE.min, Y_RANGE.max].map((y) => plane.project([r / p, y])),
      color,
      width,
    );
  }
}

export class SystemsScreenView extends LabView {
  public constructor(model: SystemsModel, options?: ScreenViewOptions) {
    const strings = StringManager.getInstance();
    const a11y = strings.getSystemsA11yStrings();
    const s = a11y.controls;
    const {
      matrix,
      bProperty,
      pictureProperty,
      stepProperty,
      rrefProperty,
      currentStepProperty,
      currentProperty,
      solutionProperty,
    } = model;
    const plane = new Plane(X_RANGE, Y_RANGE);
    const origin = plane.project([0, 0]);
    const plot = new PlotCanvas(
      [
        pictureProperty,
        currentProperty,
        solutionProperty,
        matrix.matrixProperty,
        bProperty,
        s.column1StringProperty,
        s.column2StringProperty,
        s.vectorBStringProperty,
      ],
      (ctx, colors) => {
        plane.axes(ctx, colors);
        const solution = solutionProperty.value;
        if (pictureProperty.value === "row") {
          if (solution.kind === "infinite") {
            const normal: Vec = [-solution.direction[1], solution.direction[0]];
            ctx.save();
            ctx.globalAlpha = 0.4;
            drawRow(ctx, plane, [...normal, dotProduct(normal, solution.particular)], colors.eigen, 6);
            ctx.restore();
          }
          const [first, second] = currentProperty.value;
          drawRow(ctx, plane, first, colors.column1, 3);
          drawRow(ctx, plane, second, colors.column2, 3);
          if (solution.kind === "unique") {
            dot(ctx, plane.project(solution.x), colors.output, 6);
          }
        } else {
          const first = column1(matrix.matrixProperty.value);
          const second = column2(matrix.matrixProperty.value);
          const firstTip = plane.project(first);
          const secondTip = plane.project(second);
          const bTip = plane.project(bProperty.value);
          arrow(ctx, origin, firstTip, colors.column1);
          arrow(ctx, origin, secondTip, colors.column2);
          if (solution.kind === "unique") {
            const corner = plane.project(scale(solution.x[0], first));
            ctx.save();
            ctx.setLineDash([6, 5]);
            arrow(ctx, origin, corner, colors.column1, 3);
            arrow(ctx, corner, bTip, colors.column2, 3);
            ctx.restore();
          }
          arrow(ctx, origin, bTip, colors.input, 3);
          plotLabel(ctx, s.column1StringProperty.value, [firstTip[0] + 11, firstTip[1] + 15], colors.column1);
          plotLabel(ctx, s.column2StringProperty.value, [secondTip[0] + 11, secondTip[1] + 16], colors.column2);
          plotLabel(ctx, s.vectorBStringProperty.value, [bTip[0] + 11, bTip[1] - 10], colors.input);
        }
      },
    );
    const handles = [
      new VectorHandle({
        plot,
        plane,
        xProperty: matrix.aProperty,
        yProperty: matrix.cProperty,
        xRange: ENTRY_RANGE,
        yRange: ENTRY_RANGE,
        colorProperty: Colors.column1ColorProperty,
        accessibleName: s.handle1StringProperty,
      }),
      new VectorHandle({
        plot,
        plane,
        xProperty: matrix.bProperty,
        yProperty: matrix.dProperty,
        xRange: ENTRY_RANGE,
        yRange: ENTRY_RANGE,
        colorProperty: Colors.column2ColorProperty,
        accessibleName: s.handle2StringProperty,
      }),
      new VectorHandle({
        plot,
        plane,
        xProperty: model.bxProperty,
        yProperty: model.byProperty,
        colorProperty: Colors.inputVectorColorProperty,
        accessibleName: s.handleBStringProperty,
      }),
    ];
    plot.pdomOrder = handles;
    const updateHandles = Multilink.multilink([pictureProperty], (picture) => {
      for (const handle of handles) {
        handle.visible = picture === "column";
      }
    });

    const listParent = new Node();
    const presets = strings.getPresetStrings();
    const presetControl = comboBox(
      matrix.presetProperty,
      PRESET_IDS.map((value) => ({ value, label: presets[`${value}StringProperty`] })),
      listParent,
      strings.getMatrixStrings().presetStringProperty,
    );
    const pictureControl = radioButtons(
      pictureProperty,
      [
        { value: "row", label: s.rowStringProperty },
        { value: "column", label: s.columnStringProperty },
      ],
      s.pictureStringProperty,
    );
    const back = button(s.backStringProperty, () => {
      stepProperty.value--;
    });
    const next = button(s.nextStringProperty, () => {
      stepProperty.value++;
    });
    const restart = button(s.restartStringProperty, () => {
      stepProperty.value = 0;
    });
    const stepButtons = new HBox({ spacing: 8, children: [back, next] });
    const updateButtons = Multilink.multilink([stepProperty, stepProperty.rangeProperty], (step, range) => {
      back.enabled = step > 0;
      next.enabled = step < range.max;
    });

    // Elimination uses the pivot in the source row; for a swap the incoming pivot is in row one.
    const pivotProperty = new DerivedProperty([currentStepProperty], (step) => {
      if (!step) {
        return null;
      }
      const { op, after } = step;
      const row = op.kind === "replace" ? op.source : op.kind === "scale" ? op.row : 0;
      return [row, Math.abs(after[row][0]) > EPS ? 0 : 1] as const;
    });
    const bEditor = labeledMatrix(
      new VBox({
        spacing: 4,
        children: [
          matrixEntrySpinner(model.bxProperty, s.b1StringProperty),
          matrixEntrySpinner(model.byProperty, s.b2StringProperty),
        ],
      }),
      s.bLabelStringProperty,
      s.vectorBStringProperty,
    );
    const belowPlot = new HBox({
      spacing: 18,
      align: "center",
      children: [
        new MatrixEditor(matrix, s.matrixAStringProperty),
        bEditor,
        new AugmentedMatrixReadout(currentProperty, pivotProperty, s.augmentedStringProperty),
      ],
    });

    const status = computed(
      [
        stepProperty,
        currentStepProperty,
        rrefProperty,
        s.originalStringProperty,
        s.reducedStringProperty,
        s.stepStringProperty,
      ],
      () => {
        const step = currentStepProperty.value;
        const count = rrefProperty.value.steps.length;
        if (!step) {
          return s.originalStringProperty.value;
        }
        return stepProperty.value === count
          ? s.reducedStringProperty.value
          : StringUtils.fillIn(s.stepStringProperty, {
              index: stepProperty.value,
              count,
              operation: formatOp(step.op, format),
            });
      },
    );
    const solutionReadout = computed(
      [
        solutionProperty,
        rrefProperty,
        s.uniqueStringProperty,
        s.noneStringProperty,
        s.contradictionStringProperty,
        s.infiniteStringProperty,
        s.allStringProperty,
      ],
      () => {
        const solution = solutionProperty.value;
        switch (solution.kind) {
          case "unique":
            return StringUtils.fillIn(s.uniqueStringProperty, { x: format(solution.x[0]), y: format(solution.x[1]) });
          case "infinite":
            return StringUtils.fillIn(s.infiniteStringProperty, {
              px: format(solution.particular[0]),
              py: format(solution.particular[1]),
              nx: format(solution.direction[0]),
              ny: format(solution.direction[1]),
            });
          case "none":
            return rrefProperty.value.original.some(([x, y]) => Math.abs(x) <= EPS && Math.abs(y) <= EPS)
              ? s.contradictionStringProperty.value
              : s.noneStringProperty.value;
          case "all":
            return s.allStringProperty.value;
        }
      },
    );
    const readouts = [status, solutionReadout];
    const details = computed(readouts, () => `${status.value}. ${solutionReadout.value}.`);
    super(
      {
        title: strings.getScreenNames().systemsStringProperty,
        summary: a11y.screenSummary,
        details,
        plot,
        controls: [presetControl, pictureControl, stepButtons, restart],
        readouts,
        wrapReadouts: true,
        belowPlot,
        listParent,
        reset: () => model.reset(),
      },
      options,
    );
    this.addDisposable(updateHandles, updateButtons, pivotProperty, details, ...readouts);
  }
}
