/**
 * ProjectionScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createProjectionIcon() in src/common/LinearTransformationsScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createProjectionIcon } from "../common/LinearTransformationsScreenIcons.js";
import LinearTransformationsColors from "../LinearTransformationsColors.js";
import { ProjectionModel } from "./model/ProjectionModel.js";
import { ProjectionKeyboardHelpContent } from "./view/ProjectionKeyboardHelpContent.js";
import { ProjectionScreenView } from "./view/ProjectionScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type ProjectionScreenOptions = ScreenOptions & { tandem: Tandem };

export class ProjectionScreen extends Screen<ProjectionModel, ProjectionScreenView> {
  public constructor(options: ProjectionScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new ProjectionModel(),
      // View factory — receives the model instance
      (model) =>
        new ProjectionScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<ProjectionScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: LinearTransformationsColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new ProjectionKeyboardHelpContent(),
          homeScreenIcon: createProjectionIcon(),
          navigationBarIcon: createProjectionIcon(),
        },
        options,
      ),
    );
  }
}
