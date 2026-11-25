import type { TReadOnlyProperty } from "scenerystack/axon";
import { StringUtils } from "scenerystack/phetcommon";
import { HBox, Line, Node, RichText, VBox } from "scenerystack/scenery";
import { StringManager } from "../../i18n/StringManager.js";
import Colors from "../../LinearTransformationsColors.js";
import { computed, format } from "../LabView.js";
import type { Augmented } from "../model/RowReduction.js";
import { labeledMatrix } from "./MatrixReadout.js";

type Pivot = readonly [row: 0 | 1, column: 0 | 1];

export class AugmentedMatrixReadout extends Node {
  private readonly disposeReadout: () => void;

  public constructor(
    matrix: TReadOnlyProperty<Augmented>,
    pivot: TReadOnlyProperty<Pivot | null>,
    label: TReadOnlyProperty<string>,
  ) {
    const values: ReturnType<typeof computed>[] = [];
    const column = (index: 0 | 1 | 2) =>
      new VBox({
        align: "right",
        spacing: 6,
        children: ([0, 1] as const).map((row) => {
          const text = computed([matrix, pivot], () => {
            const value = format(matrix.value[row][index]);
            const active = pivot.value?.[0] === row && pivot.value[1] === index;
            return active ? `<b>${value}</b>` : value;
          });
          values.push(text);
          return new RichText(text, { font: "15px sans-serif", fill: Colors.textColorProperty, maxWidth: 60 });
        }),
      });
    const first = column(0);
    const separator = new Line(0, 0, 0, first.height + 6, { stroke: Colors.textColorProperty, lineWidth: 1 });
    const grid = new HBox({ spacing: 12, children: [first, column(1), separator, column(2)] });
    const template = StringManager.getInstance().getMatrixStrings().augmentedReadoutStringProperty;
    const name = computed([template, matrix], () => {
      const [[a, b, c], [d, e, f]] = matrix.value;
      return StringUtils.fillIn(template, {
        a: format(a),
        b: format(b),
        c: format(c),
        d: format(d),
        e: format(e),
        f: format(f),
      });
    });
    const content = labeledMatrix(grid, label, name);
    super({ children: [content] });
    this.disposeReadout = () => {
      content.disposeSubtree();
      name.dispose();
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
