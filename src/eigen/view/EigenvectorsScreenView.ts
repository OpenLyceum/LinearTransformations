import { Multilink } from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { StringUtils } from "scenerystack/phetcommon";
import { Circle, DragListener, HBox, Node } from "scenerystack/scenery";
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
  line,
  Plane,
  PlotCanvas,
  plotLabel,
  slider,
} from "../../common/LabView.js";
import { norm } from "../../common/model/LinearAlgebra.js";
import { PRESET_IDS } from "../../common/model/Presets.js";
import { MatrixEditor } from "../../common/view/MatrixEditor.js";
import { drawLineThroughOrigin } from "../../common/view/PlotDrawing.js";
import { VectorHandle } from "../../common/view/VectorHandle.js";
import { StringManager } from "../../i18n/StringManager.js";
import Colors from "../../LinearTransformationsColors.js";
import { EPS, X_RANGE, Y_RANGE } from "../../LinearTransformationsConstants.js";
import type { EigenvectorsModel } from "../model/EigenvectorsModel.js";

const DIRECTION_SLIDER_RANGE = new Range(0, 359);
const GRIP_RADIUS = 8;
const GRIP_HIT_RADIUS = 16;

function signedTerm(coefficient: number, variable = ""): string {
  const magnitude = format(Math.abs(coefficient));
  if (magnitude === "0") {
    return "";
  }
  const factor = variable && magnitude === "1" ? "" : magnitude;
  return ` ${coefficient < 0 ? "−" : "+"} ${factor}${variable}`;
}

export class EigenvectorsScreenView extends LabView {
  public constructor(model: EigenvectorsModel, options?: ScreenViewOptions) {
    const strings = StringManager.getInstance();
    const a11y = strings.getEigenvectorsA11yStrings();
    const s = a11y.controls;
    const presets = strings.getPresetStrings();
    const {
      matrix,
      angleProperty,
      sweepingProperty,
      traceProperty,
      showEigenProperty,
      iterateProperty,
      vProperty,
      avProperty,
      alignmentProperty,
      characteristicProperty,
      eigenProperty,
      orbitProperty,
    } = model;
    const plane = new Plane(X_RANGE, Y_RANGE);
    const origin = plane.project([0, 0]);
    const plot = new PlotCanvas(
      [
        vProperty,
        avProperty,
        alignmentProperty,
        traceProperty,
        showEigenProperty,
        eigenProperty,
        iterateProperty,
        orbitProperty,
        s.vStringProperty,
        s.avStringProperty,
      ],
      (ctx, colors) => {
        plane.axes(ctx, colors);
        const vTip = plane.project(vProperty.value);
        const avTip = plane.project(avProperty.value);
        const aligned = alignmentProperty.value.aligned;

        ctx.beginPath();
        ctx.arc(...origin, Math.hypot(vTip[0] - origin[0], vTip[1] - origin[1]), 0, 2 * Math.PI);
        ctx.strokeStyle = colors.faintGrid;
        ctx.lineWidth = 1;
        ctx.stroke();
        line(ctx, traceProperty.value.map(plane.project), colors.output);

        if (showEigenProperty.value) {
          const result = eigenProperty.value;
          if (result.kind === "distinct") {
            for (const vector of result.vectors) {
              drawLineThroughOrigin(ctx, plane, vector, colors.eigen);
            }
          } else if (result.kind === "defective") {
            drawLineThroughOrigin(ctx, plane, result.vector, colors.eigen);
          }
        }

        const vColor = aligned ? colors.eigen : colors.input;
        const avColor = aligned ? colors.eigen : colors.output;
        const width = aligned ? 4 : 2;
        arrow(ctx, origin, vTip, vColor, width);
        arrow(ctx, origin, avTip, avColor, width);
        if (norm(avProperty.value) <= EPS) {
          dot(ctx, origin, avColor, 4);
        }
        plotLabel(ctx, s.vStringProperty.value, [vTip[0] - 14, vTip[1] + 16], vColor);
        plotLabel(ctx, s.avStringProperty.value, [avTip[0] + 12, avTip[1] - 10], avColor);

        if (iterateProperty.value) {
          const orbit = orbitProperty.value.map(plane.project);
          line(ctx, orbit, colors.alternate);
          for (const point of orbit) {
            dot(ctx, point, colors.alternate, 4);
          }
        }
      },
    );

    // Like the ContourExplorer direction grip, this drag target uses the slider for keyboard input.
    const hitArea = Shape.circle(0, 0, GRIP_HIT_RADIUS);
    const directionGrip = new Circle(GRIP_RADIUS, {
      fill: Colors.inputVectorColorProperty,
      stroke: Colors.textColorProperty,
      lineWidth: 1.5,
      accessibleName: s.directionHandleStringProperty,
      cursor: "pointer",
      mouseArea: hitArea,
      touchArea: hitArea,
    });
    const dragDirection = new DragListener({
      applyOffset: false,
      drag: (event) => {
        const local = plot.globalToLocalPoint(event.pointer.point);
        model.setDirection(plane.unproject([local.x, local.y]));
      },
    });
    directionGrip.addInputListener(dragDirection);
    plot.addChild(directionGrip);
    const updateGrip = Multilink.multilink([vProperty, alignmentProperty], (v, currentAlignment) => {
      directionGrip.setTranslation(...plane.project(v));
      directionGrip.fill = currentAlignment.aligned ? Colors.eigenColorProperty : Colors.inputVectorColorProperty;
    });
    directionGrip.addDisposable(updateGrip, {
      dispose: () => {
        directionGrip.removeInputListener(dragDirection);
        dragDirection.dispose();
      },
    });

    const seedHandle = new VectorHandle({
      plot,
      plane,
      xProperty: model.x0Property,
      yProperty: model.y0Property,
      colorProperty: Colors.secondaryPlotColorProperty,
      accessibleName: s.seedHandleStringProperty,
    });
    plot.pdomOrder = [seedHandle];
    const seedVisibility = iterateProperty.linkAttribute(seedHandle, "visible");
    const listParent = new Node();
    const matrixStrings = strings.getMatrixStrings();
    const presetControl = comboBox(
      matrix.presetProperty,
      PRESET_IDS.map((value) => ({ value, label: presets[`${value}StringProperty`] })),
      listParent,
      matrixStrings.presetStringProperty,
    );
    const sweepButton = button(s.sweepStringProperty, () => model.startSweep());
    const sweepButtons = new HBox({
      spacing: 8,
      children: [sweepButton, button(s.clearTraceStringProperty, () => model.clearTrace())],
    });
    const updateSweepButton = (sweeping: boolean) => {
      sweepButton.enabled = !sweeping;
    };
    sweepingProperty.link(updateSweepButton);

    const image = computed([avProperty, s.imageStringProperty], () => {
      const [x, y] = avProperty.value;
      return StringUtils.fillIn(s.imageStringProperty, { x: format(x), y: format(y) });
    });
    const alignment = computed([alignmentProperty, s.alignedStringProperty, s.unalignedStringProperty], () => {
      const { aligned, lambda } = alignmentProperty.value;
      return aligned
        ? StringUtils.fillIn(s.alignedStringProperty, { value: format(lambda) })
        : s.unalignedStringProperty.value;
    });
    const equation = computed([characteristicProperty, s.equationStringProperty], () => {
      const { trace, det } = characteristicProperty.value;
      return StringUtils.fillIn(s.equationStringProperty, {
        linear: signedTerm(-trace, "λ"),
        constant: signedTerm(det),
      });
    });
    const values = computed(
      [
        eigenProperty,
        s.distinctStringProperty,
        s.defectiveStringProperty,
        s.scalarStringProperty,
        s.complexStringProperty,
      ],
      () => {
        const result = eigenProperty.value;
        switch (result.kind) {
          case "distinct":
            return StringUtils.fillIn(s.distinctStringProperty, {
              first: format(result.values[0]),
              second: format(result.values[1]),
            });
          case "defective":
            return StringUtils.fillIn(s.defectiveStringProperty, { value: format(result.value) });
          case "scalar":
            return StringUtils.fillIn(s.scalarStringProperty, { value: format(result.value) });
          case "complex":
            return StringUtils.fillIn(s.complexStringProperty, {
              real: format(result.real),
              imaginary: format(result.imaginary),
            });
        }
      },
    );
    const iterate = computed([iterateProperty, orbitProperty, s.iterationNormStringProperty], () => {
      const last = orbitProperty.value.at(-1);
      return iterateProperty.value && last
        ? StringUtils.fillIn(s.iterationNormStringProperty, { value: format(norm(last)) })
        : "";
    });
    const readouts = [image, alignment, equation, values, iterate];
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
        title: strings.getScreenNames().eigenStringProperty,
        summary: a11y.screenSummary,
        details,
        plot,
        listParent,
        controls: [
          presetControl,
          slider(s.directionStringProperty, angleProperty, 1, { suffix: "°", range: DIRECTION_SLIDER_RANGE }),
          sweepButtons,
          checkbox(s.showEigenStringProperty, showEigenProperty),
          checkbox(s.iterateStringProperty, iterateProperty),
        ],
        readouts,
        belowPlot: new MatrixEditor(matrix, s.matrixAStringProperty, { showDet: true }),
        reset: () => model.reset(),
        step: (dt) => model.stepSweep(dt),
      },
      options,
    );
    this.addDisposable(
      {
        dispose: () => {
          iterateProperty.unlink(seedVisibility);
          sweepingProperty.unlink(updateSweepButton);
        },
      },
      details,
      ...readouts,
    );
  }
}
