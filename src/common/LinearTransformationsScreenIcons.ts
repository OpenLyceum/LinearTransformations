import { Shape } from "scenerystack/kite";
import { Node, Path, Rectangle } from "scenerystack/scenery";
import { ScreenIcon } from "scenerystack/sim";
import Colors from "../LinearTransformationsColors.js";

const WIDTH = 548;
const HEIGHT = 373;

function iconFrom(...paths: string[]): ScreenIcon {
  const background = new Rectangle(0, 0, WIDTH, HEIGHT, { fill: Colors.panelBackgroundColorProperty });
  const graphic = paths.map(
    (path, index) =>
      new Path(new Shape(path), {
        stroke: index === 0 ? Colors.accentColorProperty : Colors.secondaryPlotColorProperty,
        lineWidth: 12,
        lineJoin: "round",
        lineCap: "round",
      }),
  );
  return new ScreenIcon(new Node({ children: [background, ...graphic] }), {
    maxIconWidthProportion: 1,
    maxIconHeightProportion: 1,
    fill: Colors.backgroundColorProperty,
  });
}

export function createSpanIcon(): ScreenIcon {
  return iconFrom("M274 300 L420 230", "M274 300 L210 170", "M420 230 L356 100 M210 170 L356 100", "M274 300 L356 100");
}

export function createTransformIcon(): ScreenIcon {
  return iconFrom("M150 300 L330 300 L430 120 L250 120 Z", "M150 300 L330 300", "M150 300 L250 120");
}

export function createSystemsIcon(): ScreenIcon {
  return iconFrom("M80 320 L470 60", "M80 80 L470 300", "M262 196 m-12 0 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0");
}

export function createEigenIcon(): ScreenIcon {
  return iconFrom("M80 300 L470 70", "M274 186 L380 124", "M274 186 L440 88");
}

export function createProjectionIcon(): ScreenIcon {
  return iconFrom("M80 300 L470 160", "M150 275 L300 80", "M300 80 L300 220");
}

export function createBasisIcon(): ScreenIcon {
  return iconFrom("M120 300 L470 200 M60 200 L410 100", "M120 300 L180 80 M300 250 L360 30", "M120 300 L330 170");
}

export function createSvdIcon(): ScreenIcon {
  return iconFrom("M274 186 m-150 0 a150 70 25 1 0 300 0 a150 70 25 1 0 -300 0", "M274 186 L410 120");
}
