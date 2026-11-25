import { DerivedProperty } from "scenerystack/axon";
import { StringUtils } from "scenerystack/phetcommon";
import { HBox, Node } from "scenerystack/scenery";
import type { ScreenViewOptions } from "scenerystack/sim";
import {
  arrow,
  button,
  checkbox,
  comboBox,
  computed,
  dot,
  format,
  LabView,
  Plane,
  PlotCanvas,
  plotLabel,
  slider,
} from "../../common/LabView.js";
import { apply, column1, column2, diag, norm, rotation, transpose } from "../../common/model/LinearAlgebra.js";
import { PRESET_IDS } from "../../common/model/Presets.js";
import { MatrixEditor } from "../../common/view/MatrixEditor.js";
import { MatrixReadout } from "../../common/view/MatrixReadout.js";
import { drawCircleImage, drawTransformedGrid } from "../../common/view/PlotDrawing.js";
import { StringManager } from "../../i18n/StringManager.js";
import { EPS, X_RANGE, Y_RANGE } from "../../LinearTransformationsConstants.js";
import type { SVDModel } from "../model/SVDModel.js";

export class SVDScreenView extends LabView {
  public constructor(model: SVDModel, options?: ScreenViewOptions) {
    const strings = StringManager.getInstance();
    const a11y = strings.getSVDA11yStrings();
    const s = a11y.controls;
    const presets = strings.getPresetStrings();
    const {
      matrix,
      stageProperty,
      playingProperty,
      showGridProperty,
      svdProperty,
      animationProperty,
      stageMatrixProperty,
    } = model;
    const plane = new Plane(X_RANGE, Y_RANGE);
    const origin = plane.project([0, 0]);
    const unitRadius = plane.project([1, 0])[0] - origin[0];
    const plot = new PlotCanvas(
      [
        stageMatrixProperty,
        stageProperty,
        animationProperty,
        showGridProperty,
        s.image1StringProperty,
        s.image2StringProperty,
      ],
      (ctx, colors) => {
        plane.axes(ctx, colors);
        ctx.beginPath();
        ctx.arc(...origin, unitRadius, 0, 2 * Math.PI);
        ctx.strokeStyle = colors.faintGrid;
        ctx.lineWidth = 1;
        ctx.stroke();

        const m = stageMatrixProperty.value;
        if (showGridProperty.value) {
          drawTransformedGrid(ctx, plane, m, colors.transformedGrid);
        }
        drawCircleImage(ctx, plane, m, colors.output);

        const v = rotation(animationProperty.value.theta);
        const images = [
          { vector: apply(m, column1(v)), color: colors.column1, label: s.image1StringProperty.value, dy: -9 },
          { vector: apply(m, column2(v)), color: colors.column2, label: s.image2StringProperty.value, dy: 16 },
        ];
        for (const { vector, color, label, dy } of images) {
          const tip = plane.project(vector);
          if (norm(vector) <= EPS) {
            dot(ctx, origin, color, 3);
          } else {
            arrow(ctx, origin, tip, color, 3);
          }
          if (stageProperty.value === stageProperty.range.max) {
            plotLabel(ctx, label, [tip[0] + 9, tip[1] + dy], color);
          }
        }
      },
    );

    const listParent = new Node();
    const presetControl = comboBox(
      matrix.presetProperty,
      PRESET_IDS.map((value) => ({ value, label: presets[`${value}StringProperty`] })),
      listParent,
      strings.getMatrixStrings().presetStringProperty,
    );
    const stageSlider = slider(s.stageStringProperty, stageProperty, 0.01, {
      majorTicks: [
        { value: 0, label: s.startStringProperty },
        { value: 1, label: s.vTransposeStringProperty },
        { value: 2, label: s.sigmaStringProperty },
        { value: 3, label: s.uStringProperty },
      ],
    });
    const playbackLabel = computed([playingProperty, s.playStringProperty, s.pauseStringProperty], () =>
      playingProperty.value ? s.pauseStringProperty.value : s.playStringProperty.value,
    );

    const uProperty = new DerivedProperty([svdProperty], (result) => result.u);
    const sigmaProperty = new DerivedProperty([svdProperty], (result) => diag(...result.sigma));
    const vTransposeProperty = new DerivedProperty([svdProperty], (result) => transpose(result.v));
    const belowPlot = new HBox({
      align: "center",
      spacing: 14,
      children: [
        new MatrixEditor(matrix, s.matrixAStringProperty, { showDet: true }),
        new MatrixReadout(uProperty, s.uStringProperty),
        new MatrixReadout(sigmaProperty, s.sigmaStringProperty),
        new MatrixReadout(vTransposeProperty, s.vTransposeStringProperty),
      ],
    });

    const stageName = computed(
      [
        stageProperty,
        animationProperty,
        s.unitCircleStringProperty,
        s.rotateVStringProperty,
        s.stretchStringProperty,
        s.rotateUStringProperty,
        s.flipStringProperty,
      ],
      () => {
        const stage = stageProperty.value;
        if (stage === 0) {
          return s.unitCircleStringProperty.value;
        }
        if (stage <= 1) {
          return s.rotateVStringProperty.value;
        }
        if (stage <= 2) {
          return animationProperty.value.s2 < 0
            ? `${s.stretchStringProperty.value} ${s.flipStringProperty.value}`
            : s.stretchStringProperty.value;
        }
        return s.rotateUStringProperty.value;
      },
    );
    const values = computed([svdProperty, s.singularValuesStringProperty], () =>
      StringUtils.fillIn(s.singularValuesStringProperty, {
        first: format(svdProperty.value.sigma[0]),
        second: format(svdProperty.value.sigma[1]),
      }),
    );
    const rank = computed([svdProperty, s.rankStringProperty], () =>
      StringUtils.fillIn(s.rankStringProperty, { value: format(svdProperty.value.rank) }),
    );
    const condition = computed([svdProperty, s.conditionStringProperty, s.singularStringProperty], () =>
      StringUtils.fillIn(s.conditionStringProperty, {
        value: Number.isFinite(svdProperty.value.condition)
          ? format(svdProperty.value.condition)
          : s.singularStringProperty.value,
      }),
    );
    const spectralNorm = computed([svdProperty, s.normStringProperty], () =>
      StringUtils.fillIn(s.normStringProperty, { value: format(svdProperty.value.sigma[0]) }),
    );
    const readouts = [stageName, values, rank, condition, spectralNorm];
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
        title: strings.getScreenNames().svdStringProperty,
        summary: a11y.screenSummary,
        details,
        plot,
        listParent,
        controls: [
          presetControl,
          stageSlider,
          button(playbackLabel, () => model.togglePlayback()),
          checkbox(s.gridStringProperty, showGridProperty),
        ],
        readouts,
        wrapReadouts: true,
        belowPlot,
        reset: () => model.reset(),
        step: (dt) => model.stepPlayback(dt),
      },
      options,
    );
    this.addDisposable(details, ...readouts, playbackLabel, uProperty, sigmaProperty, vTransposeProperty);
  }
}
