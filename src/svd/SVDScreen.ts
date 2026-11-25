/**
 * SVDScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createSVDIcon() in src/common/LinearTransformationsScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createSVDIcon } from "../common/LinearTransformationsScreenIcons.js";
import LinearTransformationsColors from "../LinearTransformationsColors.js";
import { SVDModel } from "./model/SVDModel.js";
import { SVDKeyboardHelpContent } from "./view/SVDKeyboardHelpContent.js";
import { SVDScreenView } from "./view/SVDScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type SVDScreenOptions = ScreenOptions & { tandem: Tandem };

export class SVDScreen extends Screen<SVDModel, SVDScreenView> {
  public constructor(options: SVDScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new SVDModel(),
      // View factory — receives the model instance
      (model) =>
        new SVDScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<SVDScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: LinearTransformationsColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new SVDKeyboardHelpContent(),
          homeScreenIcon: createSVDIcon(),
          navigationBarIcon: createSVDIcon(),
        },
        options,
      ),
    );
  }
}
