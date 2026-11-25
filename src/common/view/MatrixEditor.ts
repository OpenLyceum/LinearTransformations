import type { NumberProperty, TReadOnlyProperty } from "scenerystack/axon";
import { toFixedNumber } from "scenerystack/dot";
import { StringUtils } from "scenerystack/phetcommon";
import { HBox, Node, Rectangle, Text, VBox } from "scenerystack/scenery";
import { NumberSpinner } from "scenerystack/sun";
import { StringManager } from "../../i18n/StringManager.js";
import Colors from "../../LinearTransformationsColors.js";
import { computed, format } from "../LabView.js";
import { det } from "../model/LinearAlgebra.js";
import type { MatrixModel } from "../model/MatrixModel.js";
import { labeledMatrix } from "./MatrixReadout.js";

export function matrixEntrySpinner(property: NumberProperty, accessibleName: TReadOnlyProperty<string>): NumberSpinner {
  const delta = 0.1;
  // NumberSpinner checks the next value against the range to disable its arrows.
  // From a fractional entry near an endpoint, allow one final step to the endpoint.
  const nextEntry = (value: number, step: number, limit: number) => {
    const next = toFixedNumber(value + step, 2);
    return value === limit ? next : property.range.constrainValue(next);
  };
  return new NumberSpinner(property, property.rangeProperty, {
    accessibleName,
    arrowsPosition: "bothBottom",
    deltaValue: delta,
    incrementFunction: (value) => nextEntry(value, delta, property.range.max),
    decrementFunction: (value) => nextEntry(value, -delta, property.range.min),
    numberDisplayOptions: {
      decimalPlaces: 2,
      textOptions: { font: "15px sans-serif", fill: Colors.controlSurfaceTextColorProperty },
      backgroundFill: Colors.controlSurfaceColorProperty,
      minBackgroundWidth: 52,
    },
  });
}

export class MatrixEditor extends Node {
  private readonly disposeEditor: () => void;

  public constructor(model: MatrixModel, label: TReadOnlyProperty<string>, options?: { showDet?: boolean }) {
    const strings = StringManager.getInstance().getMatrixStrings();
    const ownedProperties: ReturnType<typeof computed>[] = [];
    const entry = (property: NumberProperty, row: number, column: 1 | 2) => {
      const entryLabel = computed([strings.entryStringProperty, label], () =>
        StringUtils.fillIn(strings.entryStringProperty, { label: label.value, row, column }),
      );
      ownedProperties.push(entryLabel);
      const spinner = matrixEntrySpinner(property, entryLabel);
      const underline = new Rectangle(0, 0, spinner.width, 3, {
        fill: column === 1 ? Colors.column1ColorProperty : Colors.column2ColorProperty,
      });
      return new VBox({ spacing: 2, children: [spinner, underline] });
    };
    const grid = new VBox({
      spacing: 4,
      children: [
        new HBox({ spacing: 6, children: [entry(model.aProperty, 1, 1), entry(model.bProperty, 1, 2)] }),
        new HBox({ spacing: 6, children: [entry(model.cProperty, 2, 1), entry(model.dProperty, 2, 2)] }),
      ],
    });
    const displayLabel = computed([strings.labelStringProperty, label], () =>
      StringUtils.fillIn(strings.labelStringProperty, { label: label.value }),
    );
    ownedProperties.push(displayLabel);
    const children: Node[] = [labeledMatrix(grid, displayLabel, label)];
    if (options?.showDet) {
      const determinant = computed([strings.detStringProperty, label, model.matrixProperty], () =>
        StringUtils.fillIn(strings.detStringProperty, {
          label: label.value,
          value: format(det(model.matrixProperty.value)),
        }),
      );
      ownedProperties.push(determinant);
      children.push(
        new Text(determinant, {
          font: "15px sans-serif",
          maxWidth: 160,
          fill: Colors.textColorProperty,
        }),
      );
    }
    const content = new VBox({ align: "left", spacing: 4, children });
    super({ children: [content] });
    this.disposeEditor = () => {
      content.disposeSubtree();
      for (const property of ownedProperties) {
        property.dispose();
      }
    };
  }

  public override dispose(): void {
    this.disposeEditor();
    super.dispose();
  }
}
