/**
 * TransformScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createTransformIcon() in src/common/LinearTransformationsScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createTransformIcon } from "../common/LinearTransformationsScreenIcons.js";
import LinearTransformationsColors from "../LinearTransformationsColors.js";
import { TransformModel } from "./model/TransformModel.js";
import { TransformKeyboardHelpContent } from "./view/TransformKeyboardHelpContent.js";
import { TransformScreenView } from "./view/TransformScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type TransformScreenOptions = ScreenOptions & { tandem: Tandem };

export class TransformScreen extends Screen<TransformModel, TransformScreenView> {
  public constructor(options: TransformScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new TransformModel(),
      // View factory — receives the model instance
      (model) =>
        new TransformScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<TransformScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: LinearTransformationsColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new TransformKeyboardHelpContent(),
          homeScreenIcon: createTransformIcon(),
          navigationBarIcon: createTransformIcon(),
        },
        options,
      ),
    );
  }
}
