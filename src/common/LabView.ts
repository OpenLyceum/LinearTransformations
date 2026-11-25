// Fork of ContourExplorer/src/common/LabView.ts. Adds `belowPlot` and extra plot colours; does not sync back.
import type { Property, TReadOnlyProperty } from "scenerystack/axon";
import { Bounds2, type Range } from "scenerystack/dot";
import { localeProperty } from "scenerystack/joist";
import { CanvasNode, Node, RichText, Text, VBox } from "scenerystack/scenery";
import { ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenSummaryContent, ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { AquaRadioButtonGroup, ComboBox, RectangularPushButton } from "scenerystack/sun";
import Colors from "../LinearTransformationsColors.js";
import {
  PANEL_GAP,
  PANEL_MIN_WIDTH,
  PLOT_HEIGHT,
  PLOT_MARGIN,
  PLOT_WIDTH,
  SCREEN_VIEW_MARGIN,
  TITLE_TO_PLOT_GAP,
} from "../LinearTransformationsConstants.js";
import {
  LINEAR_TRANSFORMATIONS_COMBO_BOX_OPTIONS as COMBO_BOX_OPTIONS,
  FLAT_PANEL_PUSH_BUTTON_OPTIONS,
  FLAT_RESET_ALL_BUTTON_OPTIONS,
  LIGHT_SURFACE_TEXT_FILL,
} from "./LinearTransformationsButtonOptions.js";
import { LinearTransformationsPanel as LabPanel } from "./LinearTransformationsPanel.js";

type StringSource = string | TReadOnlyProperty<string>;
type Dependencies = readonly TReadOnlyProperty<unknown>[];
type Point = readonly [number, number];

function format(value: number, digits = 2): string {
  return new Intl.NumberFormat(localeProperty.value, {
    maximumFractionDigits: digits,
  }).format(Math.abs(value) < 10 ** -digits / 2 ? 0 : value);
}

function text(value: StringSource, size: number, width: number, bold = false): Text {
  return new Text(value, {
    font: `${bold ? "bold " : ""}${size}px sans-serif`,
    maxWidth: width,
    fill: Colors.textColorProperty,
  });
}

/**
 * A drop-down list for choosing one of several named items (surfaces, fields, regions). Labels may
 * carry RichText markup. The open list is drawn in `listParent`, which LabView keeps on top.
 *
 * @public
 */
export function comboBox<T>(
  property: ConstructorParameters<typeof ComboBox<T>>[0],
  choices: readonly { value: T; label: StringSource; name?: StringSource }[],
  listParent: Node,
  accessibleName: TReadOnlyProperty<string>,
): ComboBox<T> {
  return new ComboBox(
    property,
    choices.map((item) => ({
      value: item.value,
      createNode: () =>
        new RichText(item.label, { font: "15px sans-serif", fill: LIGHT_SURFACE_TEXT_FILL, maxWidth: 255 }),
      accessibleName: item.name ?? item.label,
    })),
    listParent,
    { ...COMBO_BOX_OPTIONS, accessibleName, xMargin: 10, yMargin: 5, cornerRadius: 4 },
  );
}

/**
 * A push button with a text label.
 *
 * @public
 */
export function button(label: TReadOnlyProperty<string>, listener: () => void): RectangularPushButton {
  return new RectangularPushButton({
    ...FLAT_PANEL_PUSH_BUTTON_OPTIONS,
    accessibleName: label,
    content: new Text(label, { font: "bold 15px sans-serif", maxWidth: 270, fill: LIGHT_SURFACE_TEXT_FILL }),
    xMargin: 10,
    yMargin: 7,
    listener,
  });
}

/** @public */
export function choice(label: TReadOnlyProperty<string>, caption: TReadOnlyProperty<string>, listener: () => void) {
  return new RectangularPushButton({
    ...FLAT_PANEL_PUSH_BUTTON_OPTIONS,
    accessibleName: label,
    accessibleHelpText: caption,
    content: new Text(caption, { font: "bold 15px sans-serif", maxWidth: 270, fill: LIGHT_SURFACE_TEXT_FILL }),
    xMargin: 10,
    yMargin: 7,
    listener,
  });
}

/** Radio groups for the screen controls specified in later phases. @public */
export function radioButtons<T>(
  property: Property<T>,
  items: readonly { value: T; label: TReadOnlyProperty<string> }[],
  accessibleName: TReadOnlyProperty<string>,
): AquaRadioButtonGroup<T> {
  return new AquaRadioButtonGroup(
    property,
    items.map(({ value, label }) => ({
      value,
      createNode: () => text(label, 15, 270),
      accessibleName: label,
    })),
    { accessibleName, orientation: "vertical", spacing: 6 },
  );
}

type SummaryStrings = {
  playAreaStringProperty: TReadOnlyProperty<string>;
  controlAreaStringProperty: TReadOnlyProperty<string>;
  interactionHintStringProperty: TReadOnlyProperty<string>;
};

type LabViewConfig = {
  title: TReadOnlyProperty<string>;
  summary: SummaryStrings;
  details: TReadOnlyProperty<string>;
  plot: PlotCanvas;
  controls: Node[];
  readouts: StringSource[];
  reset: () => void;
  /** Parent for open combo-box lists, created by the view and added here on top of everything. */
  listParent?: Node;
  belowPlot?: Node;
  step?: (dt: number) => void;
};

export class LabView extends ScreenView {
  private readonly stepCallback: LabViewConfig["step"];

  public constructor(config: LabViewConfig, options?: ScreenViewOptions) {
    super({
      ...options,
      screenSummaryContent: new ScreenSummaryContent({
        playAreaContent: config.summary.playAreaStringProperty,
        controlAreaContent: config.summary.controlAreaStringProperty,
        interactionHintContent: config.summary.interactionHintStringProperty,
        currentDetailsContent: config.details,
      }),
    });

    this.stepCallback = config.step;

    const bounds = this.layoutBounds;
    const left = bounds.minX + SCREEN_VIEW_MARGIN;
    const title = text(config.title, 28, bounds.width - 2 * SCREEN_VIEW_MARGIN, true);
    title.left = left;
    title.top = bounds.minY + SCREEN_VIEW_MARGIN;
    config.plot.setTranslation(left, title.bottom + TITLE_TO_PLOT_GAP);
    const column = new VBox({
      align: "left",
      spacing: 8,
      children: [
        ...config.controls,
        ...config.readouts.map(
          (value, index) =>
            new RichText(value, {
              font: `${index === 0 ? "bold " : ""}15px sans-serif`,
              maxWidth: 300,
              fill: Colors.textColorProperty,
            }),
        ),
      ],
    });
    const panel = new LabPanel(column, { xMargin: 15, yMargin: 13, minWidth: PANEL_MIN_WIDTH });
    panel.left = config.plot.left + PLOT_WIDTH + PANEL_GAP;
    panel.top = title.bottom + TITLE_TO_PLOT_GAP;
    const reset = new ResetAllButton({
      ...FLAT_RESET_ALL_BUTTON_OPTIONS,
      listener: config.reset,
      right: bounds.maxX - SCREEN_VIEW_MARGIN,
      bottom: bounds.maxY - SCREEN_VIEW_MARGIN,
    });
    if (config.belowPlot) {
      config.belowPlot.left = config.plot.left;
      config.belowPlot.top = config.plot.bottom + 10;
    }
    const belowPlotNodes = config.belowPlot ? [config.belowPlot] : [];
    const content = new Node({
      children: [
        title,
        config.plot,
        panel,
        ...belowPlotNodes,
        reset,
        ...(config.listParent ? [config.listParent] : []),
      ],
      pdomOrder: [config.plot, panel, ...belowPlotNodes, reset],
    });
    this.addChild(content);
  }

  public override step(dt: number): void {
    this.stepCallback?.(dt);
  }
}

type PlotColors = {
  background: string;
  ink: string;
  grid: string;
  accent: string;
  alternate: string;
  column1: string;
  column2: string;
  input: string;
  output: string;
  eigen: string;
  positiveArea: string;
  negativeArea: string;
  faintGrid: string;
};

export class PlotCanvas extends CanvasNode {
  private readonly draw: (context: CanvasRenderingContext2D, colors: PlotColors) => void;
  public constructor(
    dependencies: Dependencies,
    draw: (context: CanvasRenderingContext2D, colors: PlotColors) => void,
  ) {
    super({ canvasBounds: new Bounds2(0, 0, PLOT_WIDTH, PLOT_HEIGHT) });
    this.draw = draw;
    const paintDependencies = [
      ...dependencies,
      Colors.panelBackgroundColorProperty,
      Colors.textColorProperty,
      Colors.panelBorderColorProperty,
      Colors.accentColorProperty,
      Colors.secondaryPlotColorProperty,
      Colors.column1ColorProperty,
      Colors.column2ColorProperty,
      Colors.inputVectorColorProperty,
      Colors.outputVectorColorProperty,
      Colors.eigenColorProperty,
      Colors.positiveAreaColorProperty,
      Colors.negativeAreaColorProperty,
      Colors.faintGridColorProperty,
      localeProperty,
    ];
    for (const dependency of paintDependencies) {
      dependency.lazyLink(this.repaint);
    }
    this.addDisposable({
      dispose: () => {
        for (const dependency of paintDependencies) {
          dependency.unlink(this.repaint);
        }
      },
    });
  }

  private readonly repaint = () => this.invalidatePaint();

  public override paintCanvas(context: CanvasRenderingContext2D): void {
    const colors = {
      background: Colors.panelBackgroundColorProperty.value.toCSS(),
      ink: Colors.textColorProperty.value.toCSS(),
      grid: Colors.panelBorderColorProperty.value.toCSS(),
      accent: Colors.accentColorProperty.value.toCSS(),
      alternate: Colors.secondaryPlotColorProperty.value.toCSS(),
      column1: Colors.column1ColorProperty.value.toCSS(),
      column2: Colors.column2ColorProperty.value.toCSS(),
      input: Colors.inputVectorColorProperty.value.toCSS(),
      output: Colors.outputVectorColorProperty.value.toCSS(),
      eigen: Colors.eigenColorProperty.value.toCSS(),
      positiveArea: Colors.positiveAreaColorProperty.value.toCSS(),
      negativeArea: Colors.negativeAreaColorProperty.value.toCSS(),
      faintGrid: Colors.faintGridColorProperty.value.toCSS(),
    };
    context.fillStyle = colors.background;
    context.fillRect(0, 0, PLOT_WIDTH, PLOT_HEIGHT);
    context.save();
    context.beginPath();
    context.rect(1, 1, PLOT_WIDTH - 2, PLOT_HEIGHT - 2);
    context.clip();
    this.draw(context, colors);
    context.restore();
  }
}

export class Plane {
  private readonly scale: number;
  private readonly origin: Point;

  private readonly xRange: Range;
  private readonly yRange: Range;

  public constructor(xRange: Range, yRange: Range) {
    this.xRange = xRange;
    this.yRange = yRange;
    this.scale = Math.min(
      (PLOT_WIDTH - 2 * PLOT_MARGIN) / xRange.getLength(),
      (PLOT_HEIGHT - 2 * PLOT_MARGIN) / yRange.getLength(),
    );
    this.origin = [PLOT_WIDTH / 2 - this.scale * xRange.getCenter(), PLOT_HEIGHT / 2 + this.scale * yRange.getCenter()];
  }

  public project = ([x, y]: Point): Point => [this.origin[0] + x * this.scale, this.origin[1] - y * this.scale];

  public axes(context: CanvasRenderingContext2D, colors: PlotColors): void {
    const { min: x0, max: x1 } = this.xRange;
    const { min: y0, max: y1 } = this.yRange;
    for (let x = Math.ceil(x0); x < x1; x++) {
      const p = this.project([x, 0]);
      line(context, [this.project([x, y0]), this.project([x, y1])], x ? colors.grid : colors.ink);
      if (x !== 0) {
        plotLabel(context, format(x), [p[0] + 4, p[1] + 15], colors.ink);
      }
    }
    for (let y = Math.ceil(y0); y < y1; y++) {
      const p = this.project([0, y]);
      line(context, [this.project([x0, y]), this.project([x1, y])], y ? colors.grid : colors.ink);
      if (y !== 0) {
        plotLabel(context, format(y), [p[0] + 5, p[1] - 4], colors.ink);
      }
    }
    plotLabel(context, "x", this.project([x1, 0]), colors.ink);
    plotLabel(context, "y", this.project([0, y1]), colors.ink);
  }
}

function line(
  context: CanvasRenderingContext2D,
  points: readonly Point[],
  stroke: string,
  width = 1,
  fill?: string,
): void {
  const first = points[0];
  if (!first) {
    return;
  }
  context.beginPath();
  context.moveTo(...first);
  for (const point of points.slice(1)) {
    context.lineTo(...point);
  }
  if (fill) {
    context.closePath();
    context.fillStyle = fill;
    context.fill();
  }
  context.lineWidth = width;
  context.strokeStyle = stroke;
  context.stroke();
}

function plotLabel(context: CanvasRenderingContext2D, value: string, point: Point, color: string): void {
  context.font = "13px sans-serif";
  context.fillStyle = color;
  context.fillText(value, ...point);
}
