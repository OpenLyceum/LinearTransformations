import type { ScreenViewOptions } from "scenerystack/sim";
import { LabView, Plane, PlotCanvas } from "../../common/LabView.js";
import { StringManager } from "../../i18n/StringManager.js";
import { X_RANGE, Y_RANGE } from "../../LinearTransformationsConstants.js";
import type { SystemsModel } from "../model/SystemsModel.js";

/** Placeholder layout for the Systems screen. */
export class SystemsScreenView extends LabView {
  public constructor(model: SystemsModel, options?: ScreenViewOptions) {
    const strings = StringManager.getInstance();
    const title = strings.getScreenNames().systemsStringProperty;
    const a11y = strings.getSystemsA11yStrings();
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
