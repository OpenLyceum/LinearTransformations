import type { TReadOnlyProperty } from "scenerystack/axon";
import { Shape } from "scenerystack/kite";
import { StringUtils } from "scenerystack/phetcommon";
import { HBox, Node, Path, RichText, Text, VBox } from "scenerystack/scenery";
import { StringManager } from "../../i18n/StringManager.js";
import Colors from "../../LinearTransformationsColors.js";
import { computed, format } from "../LabView.js";
import type { Mat2 } from "../model/LinearAlgebra.js";

/**
 * Give the editor and readout the same bracket and label treatment. The live description is the
 * innerContent of a separate leaf paragraph: changing innerContent updates the PDOM in place, whereas
 * changing accessibleParagraph on the HBox rebuilds its PDOM subtree and trips Scenery's focus-order
 * assertion when a spinner inside (or beside) it has keyboard focus.
 */
export function labeledMatrix(grid: Node, label: TReadOnlyProperty<string>, name: TReadOnlyProperty<string>): Node {
  const height = grid.height + 6;
  const bracket = (inside: number, outside: number) =>
    new Path(new Shape().moveTo(inside, 0).lineTo(outside, 0).lineTo(outside, height).lineTo(inside, height), {
      stroke: Colors.textColorProperty,
      lineWidth: 2,
    });

  const description = new Node({ tagName: "p", innerContent: name });
  const layout = new HBox({
    spacing: 5,
    children: [
      new RichText(label, { font: "15px sans-serif", fill: Colors.textColorProperty, maxWidth: 80 }),
      bracket(6, 0),
      grid,
      bracket(0, 6),
    ],
  });
  return new Node({ children: [description, layout] });
}

export class MatrixReadout extends Node {
  private readonly disposeReadout: () => void;

  public constructor(matrix: TReadOnlyProperty<Mat2 | null>, label: TReadOnlyProperty<string>) {
    const entryValue = (index: 0 | 1 | 2 | 3) =>
      computed([matrix], () => (matrix.value ? format(matrix.value[index], 2) : "—"));
    const values = [entryValue(0), entryValue(1), entryValue(2), entryValue(3)] as const;
    const cell = (index: 0 | 1 | 2 | 3) =>
      new Text(values[index], { font: "15px sans-serif", fill: Colors.textColorProperty, maxWidth: 45 });
    const grid = new HBox({
      spacing: 14,
      children: [
        new VBox({ align: "right", spacing: 6, children: [cell(0), cell(2)] }),
        new VBox({ align: "right", spacing: 6, children: [cell(1), cell(3)] }),
      ],
    });
    const template = StringManager.getInstance().getMatrixStrings().readoutStringProperty;
    const name = computed([template, label, ...values], () =>
      StringUtils.fillIn(template, {
        label: label.value,
        a: values[0].value,
        b: values[1].value,
        c: values[2].value,
        d: values[3].value,
      }),
    );
    const labelTemplate = StringManager.getInstance().getMatrixStrings().labelStringProperty;
    const displayLabel = computed([labelTemplate, label], () =>
      StringUtils.fillIn(labelTemplate, { label: label.value }),
    );
    const content = labeledMatrix(grid, displayLabel, name);
    super({ children: [content] });
    this.disposeReadout = () => {
      content.disposeSubtree();
      name.dispose();
      displayLabel.dispose();
      for (const value of values) {
        value.dispose();
      }
    };
  }

  public override dispose(): void {
    this.disposeReadout();
    super.dispose();
  }
}
