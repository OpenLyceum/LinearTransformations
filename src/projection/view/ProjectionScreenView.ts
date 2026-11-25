import type { ScreenViewOptions } from "scenerystack/sim";
import { LabView, Plane, PlotCanvas } from "../../common/LabView.js";
import { StringManager } from "../../i18n/StringManager.js";
import { X_RANGE, Y_RANGE } from "../../LinearTransformationsConstants.js";
import type { ProjectionModel } from "../model/ProjectionModel.js";

/** Placeholder layout for the Projection screen. */
export class ProjectionScreenView extends LabView {
  public constructor(model: ProjectionModel, options?: ScreenViewOptions) {
    const strings = StringManager.getInstance();
    const title = strings.getScreenNames().projectionStringProperty;
    const a11y = strings.getProjectionA11yStrings();
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
