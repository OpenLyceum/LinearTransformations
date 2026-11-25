import type { ScreenViewOptions } from "scenerystack/sim";
import { LabView, Plane, PlotCanvas } from "../../common/LabView.js";
import { StringManager } from "../../i18n/StringManager.js";
import { X_RANGE, Y_RANGE } from "../../LinearTransformationsConstants.js";
import type { SpanModel } from "../model/SpanModel.js";

/** Placeholder layout for the Span screen. */
export class SpanScreenView extends LabView {
  public constructor(model: SpanModel, options?: ScreenViewOptions) {
    const strings = StringManager.getInstance();
    const title = strings.getScreenNames().spanStringProperty;
    const a11y = strings.getSpanA11yStrings();
    const plane = new Plane(X_RANGE, Y_RANGE);
    super(
      {
        title,
        summary: a11y.screenSummary,
        details: title,
        plot: new PlotCanvas([], (context, colors) => plane.axes(context, colors)),
        controls: [],
        readouts: [],
        reset: () => model.reset(),
      },
      options,
    );
  }
}
