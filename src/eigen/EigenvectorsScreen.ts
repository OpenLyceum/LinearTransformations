/**
 * EigenvectorsScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createEigenvectorsIcon() in src/common/LinearTransformationsScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createEigenvectorsIcon } from "../common/LinearTransformationsScreenIcons.js";
import LinearTransformationsColors from "../LinearTransformationsColors.js";
import { EigenvectorsModel } from "./model/EigenvectorsModel.js";
import { EigenvectorsKeyboardHelpContent } from "./view/EigenvectorsKeyboardHelpContent.js";
import { EigenvectorsScreenView } from "./view/EigenvectorsScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type EigenvectorsScreenOptions = ScreenOptions & { tandem: Tandem };

export class EigenvectorsScreen extends Screen<EigenvectorsModel, EigenvectorsScreenView> {
  public constructor(options: EigenvectorsScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new EigenvectorsModel(),
      // View factory — receives the model instance
      (model) =>
        new EigenvectorsScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<EigenvectorsScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: LinearTransformationsColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new EigenvectorsKeyboardHelpContent(),
          homeScreenIcon: createEigenvectorsIcon(),
          navigationBarIcon: createEigenvectorsIcon(),
        },
        options,
      ),
    );
  }
}
