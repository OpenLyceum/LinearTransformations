/**
 * ChangeOfBasisScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createChangeOfBasisIcon() in src/common/LinearTransformationsScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createChangeOfBasisIcon } from "../common/LinearTransformationsScreenIcons.js";
import LinearTransformationsColors from "../LinearTransformationsColors.js";
import { ChangeOfBasisModel } from "./model/ChangeOfBasisModel.js";
import { ChangeOfBasisKeyboardHelpContent } from "./view/ChangeOfBasisKeyboardHelpContent.js";
import { ChangeOfBasisScreenView } from "./view/ChangeOfBasisScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type ChangeOfBasisScreenOptions = ScreenOptions & { tandem: Tandem };

export class ChangeOfBasisScreen extends Screen<ChangeOfBasisModel, ChangeOfBasisScreenView> {
  public constructor(options: ChangeOfBasisScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new ChangeOfBasisModel(),
      // View factory — receives the model instance
      (model) =>
        new ChangeOfBasisScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<ChangeOfBasisScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: LinearTransformationsColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new ChangeOfBasisKeyboardHelpContent(),
          homeScreenIcon: createChangeOfBasisIcon(),
          navigationBarIcon: createChangeOfBasisIcon(),
        },
        options,
      ),
    );
  }
}
