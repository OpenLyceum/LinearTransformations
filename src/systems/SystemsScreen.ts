/**
 * SystemsScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createSystemsIcon() in src/common/LinearTransformationsScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createSystemsIcon } from "../common/LinearTransformationsScreenIcons.js";
import LinearTransformationsColors from "../LinearTransformationsColors.js";
import { SystemsModel } from "./model/SystemsModel.js";
import { SystemsKeyboardHelpContent } from "./view/SystemsKeyboardHelpContent.js";
import { SystemsScreenView } from "./view/SystemsScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type SystemsScreenOptions = ScreenOptions & { tandem: Tandem };

export class SystemsScreen extends Screen<SystemsModel, SystemsScreenView> {
  public constructor(options: SystemsScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new SystemsModel(),
      // View factory — receives the model instance
      (model) =>
        new SystemsScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<SystemsScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: LinearTransformationsColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new SystemsKeyboardHelpContent(),
          homeScreenIcon: createSystemsIcon(),
          navigationBarIcon: createSystemsIcon(),
        },
        options,
      ),
    );
  }
}
