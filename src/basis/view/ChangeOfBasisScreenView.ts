import { StringUtils } from "scenerystack/phetcommon";
import { HBox, Node } from "scenerystack/scenery";
import type { ScreenViewOptions } from "scenerystack/sim";
import {
  arrow,
  button,
  checkbox,
  comboBox,
  computed,
  format,
  LabView,
  Plane,
  PlotCanvas,
  plotLabel,
} from "../../common/LabView.js";
import { scale } from "../../common/model/LinearAlgebra.js";
import { PRESET_IDS } from "../../common/model/Presets.js";
import { MatrixEditor } from "../../common/view/MatrixEditor.js";
import { MatrixReadout } from "../../common/view/MatrixReadout.js";
import { drawTransformedGrid } from "../../common/view/PlotDrawing.js";
import { VectorHandle } from "../../common/view/VectorHandle.js";
import { StringManager } from "../../i18n/StringManager.js";
import Colors from "../../LinearTransformationsColors.js";
import { X_RANGE, Y_RANGE } from "../../LinearTransformationsConstants.js";
import type { ChangeOfBasisModel } from "../model/ChangeOfBasisModel.js";

export class ChangeOfBasisScreenView extends LabView {
  public constructor(model: ChangeOfBasisModel, options?: ScreenViewOptions) {
    const strings = StringManager.getInstance();
    const a11y = strings.getChangeOfBasisA11yStrings();
    const s = a11y.controls;
    const presets = strings.getPresetStrings();
    const {
      matrix,
      b1Property,
      b2Property,
      xProperty,
      basisProperty,
      inverseBasisProperty,
      basisCoordinatesProperty,
      basisMatrixProperty,
      diagonalProperty,
      eigenProperty,
      showDecompositionProperty,
    } = model;
    const plane = new Plane(X_RANGE, Y_RANGE);
    const origin = plane.project([0, 0]);
    const plot = new PlotCanvas(
      [
        basisProperty,
        basisCoordinatesProperty,
        xProperty,
        showDecompositionProperty,
        s.b1StringProperty,
        s.b2StringProperty,
        s.xStringProperty,
      ],
      (ctx, colors) => {
        plane.axes(ctx, colors);
        const coordinates = basisCoordinatesProperty.value;
        if (coordinates) {
          ctx.save();
          ctx.globalAlpha = 0.6;
          drawTransformedGrid(ctx, plane, basisProperty.value, colors.alternate);
          ctx.restore();
        }

        const target = plane.project(xProperty.value);
        const vectors = [
          { tip: plane.project(b1Property.value), label: s.b1StringProperty.value, color: colors.column1, dy: 18 },
          { tip: plane.project(b2Property.value), label: s.b2StringProperty.value, color: colors.column2, dy: -10 },
          { tip: target, label: s.xStringProperty.value, color: colors.input, dy: -10 },
        ];
        for (const { tip, label, color, dy } of vectors) {
          arrow(ctx, origin, tip, color);
          plotLabel(ctx, label, [tip[0] + 11, tip[1] + dy], color);
        }

        if (coordinates && showDecompositionProperty.value) {
          const corner = plane.project(scale(coordinates[0], b1Property.value));
          ctx.save();
          ctx.setLineDash([6, 5]);
          arrow(ctx, origin, corner, colors.output, 3);
          arrow(ctx, corner, target, colors.output, 3);
          ctx.restore();
        }
      },
    );

    const handles = [
      { coordinates: model.b1Coordinates, color: Colors.column1ColorProperty, name: s.b1HandleStringProperty },
      { coordinates: model.b2Coordinates, color: Colors.column2ColorProperty, name: s.b2HandleStringProperty },
      { coordinates: model.xCoordinates, color: Colors.inputVectorColorProperty, name: s.xHandleStringProperty },
    ].map(
      ({ coordinates: [handleXProperty, handleYProperty], color, name }) =>
        new VectorHandle({
          plot,
          plane,
          xProperty: handleXProperty,
          yProperty: handleYProperty,
          colorProperty: color,
          accessibleName: name,
        }),
    );
    plot.pdomOrder = handles;

    const listParent = new Node();
    const presetControl = comboBox(
      matrix.presetProperty,
      PRESET_IDS.map((value) => ({ value, label: presets[`${value}StringProperty`] })),
      listParent,
      strings.getMatrixStrings().presetStringProperty,
    );
    const eigenButton = button(s.useEigenvectorsStringProperty, () => model.useEigenvectors());
    const updateEigenButton = () => {
      eigenButton.enabled = eigenProperty.value.kind === "distinct";
    };
    eigenProperty.link(updateEigenButton);

    const inverseReadout = new MatrixReadout(inverseBasisProperty, s.inverseMatrixStringProperty);
    const similarityReadout = new MatrixReadout(basisMatrixProperty, s.similarityMatrixStringProperty);
    const updateMatrixVisibility = () => {
      const valid = inverseBasisProperty.value !== null;
      inverseReadout.visible = valid;
      similarityReadout.visible = valid;
    };
    inverseBasisProperty.link(updateMatrixVisibility);
    const belowPlot = new HBox({
      align: "center",
      spacing: 14,
      children: [
        new MatrixReadout(basisProperty, s.basisMatrixStringProperty),
        inverseReadout,
        new MatrixEditor(matrix, s.matrixAStringProperty),
        similarityReadout,
      ],
    });

    const standardCoordinates = computed([xProperty, s.standardCoordinatesStringProperty], () => {
      const [x, y] = xProperty.value;
      return StringUtils.fillIn(s.standardCoordinatesStringProperty, { x: format(x), y: format(y) });
    });
    const basisCoordinates = computed(
      [basisCoordinatesProperty, s.basisCoordinatesStringProperty, s.parallelStringProperty],
      () => {
        const coordinates = basisCoordinatesProperty.value;
        return coordinates
          ? StringUtils.fillIn(s.basisCoordinatesStringProperty, {
              c1: format(coordinates[0]),
              c2: format(coordinates[1]),
            })
          : s.parallelStringProperty.value;
      },
    );
    const coordinateRule = computed([inverseBasisProperty, s.coordinateRuleStringProperty], () =>
      inverseBasisProperty.value ? s.coordinateRuleStringProperty.value : "",
    );
    const diagonal = computed([diagonalProperty, s.diagonalStringProperty], () =>
      diagonalProperty.value ? s.diagonalStringProperty.value : "",
    );
    const readouts = [standardCoordinates, basisCoordinates, coordinateRule, diagonal];
    const details = computed(
      readouts,
      () =>
        `${readouts
          .map((readout) => readout.value.replace(/<sub>([^<]*)<\/sub>/g, "_$1").replace(/<[^>]+>/g, ""))
          .filter(Boolean)
          .join(". ")}.`,
    );
    super(
      {
        title: strings.getScreenNames().basisStringProperty,
        summary: a11y.screenSummary,
        details,
        plot,
        listParent,
        controls: [checkbox(s.showDecompositionStringProperty, showDecompositionProperty), eigenButton, presetControl],
        readouts,
        wrapReadouts: true,
        belowPlot,
        reset: () => model.reset(),
      },
      options,
    );
    this.addDisposable(
      {
        dispose: () => {
          inverseBasisProperty.unlink(updateMatrixVisibility);
          eigenProperty.unlink(updateEigenButton);
        },
      },
      details,
      ...readouts,
    );
  }
}
