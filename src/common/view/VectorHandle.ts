import { Multilink, type NumberProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { type Range, roundSymmetric, toFixedNumber, Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { StringUtils } from "scenerystack/phetcommon";
import { Circle, type Color, DragListener, KeyboardDragListener, Node } from "scenerystack/scenery";
import { StringManager } from "../../i18n/StringManager.js";
import Colors from "../../LinearTransformationsColors.js";
import { DRAG_SNAP, HANDLE_X_RANGE, HANDLE_Y_RANGE, KEYBOARD_STEP } from "../../LinearTransformationsConstants.js";
import { format, type Plane, type PlotCanvas } from "../LabView.js";

type VectorHandleOptions = {
  plot: PlotCanvas;
  plane: Plane;
  xProperty: NumberProperty;
  yProperty: NumberProperty;
  colorProperty: TReadOnlyProperty<Color>;
  accessibleName: TReadOnlyProperty<string>;
  xRange?: Range;
  yRange?: Range;
  snap?: number;
};

export class VectorHandle extends Node {
  public constructor({
    plot,
    plane,
    xProperty,
    yProperty,
    colorProperty,
    accessibleName,
    xRange = HANDLE_X_RANGE,
    yRange = HANDLE_Y_RANGE,
    snap = DRAG_SNAP,
  }: VectorHandleOptions) {
    const circle = new Circle(8, { fill: colorProperty, stroke: Colors.textColorProperty, lineWidth: 1.5 });
    const hitArea = Shape.circle(0, 0, 16);
    super({
      children: [circle],
      cursor: "pointer",
      touchArea: hitArea,
      mouseArea: hitArea,
      tagName: "div",
      focusable: true,
      ariaRole: "application",
      accessibleName,
      accessibleNameBehavior: (_node, options, name) => ({ ...options, ariaLabel: name }),
    });
    const positionLink = Multilink.multilink([xProperty, yProperty], (x, y) => {
      this.center = new Vector2(...plane.project([x, y]));
    });

    const setPosition = (x: number, y: number) => {
      xProperty.value = xProperty.range.constrainValue(xRange.constrainValue(toFixedNumber(x, 2)));
      yProperty.value = yProperty.range.constrainValue(yRange.constrainValue(toFixedNumber(y, 2)));
    };
    const move = (drag: DragListener) => {
      if (drag.pointer) {
        const point = plot.globalToLocalPoint(drag.pointer.point);
        const [x, y] = plane.unproject([point.x, point.y]);
        setPosition(roundSymmetric(x / snap) * snap, roundSymmetric(y / snap) * snap);
      }
    };
    const coordinates = StringManager.getInstance().getVectorStrings().coordinatesStringProperty;
    const announce = () => {
      this.addAccessibleContextResponse(
        StringUtils.fillIn(coordinates.value, {
          x: format(xProperty.value),
          y: format(yProperty.value),
        }),
      );
    };
    const pointerListener = new DragListener({
      applyOffset: false,
      start: (_, drag) => move(drag),
      drag: (_, drag) => move(drag),
      end: announce,
    });
    const keyboardListener = new KeyboardDragListener({
      dragDelta: KEYBOARD_STEP,
      shiftDragDelta: 0.01,
      positionProperty: {
        get value() {
          return new Vector2(xProperty.value, -yProperty.value);
        },
        set value(position: Vector2) {
          setPosition(position.x, -position.y);
        },
      },
      end: announce,
    });
    this.addInputListener(pointerListener);
    this.addInputListener(keyboardListener);
    this.addDisposable({
      dispose: () => {
        this.removeInputListener(keyboardListener);
        this.removeInputListener(pointerListener);
        keyboardListener.dispose();
        pointerListener.dispose();
        positionLink.dispose();
        circle.dispose();
      },
    });
    plot.addChild(this);
  }
}
