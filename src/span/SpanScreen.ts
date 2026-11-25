/**
 * SpanScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createSpanIcon() in src/common/LinearTransformationsScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createSpanIcon } from "../common/LinearTransformationsScreenIcons.js";
import LinearTransformationsColors from "../LinearTransformationsColors.js";
import { SpanModel } from "./model/SpanModel.js";
import { SpanKeyboardHelpContent } from "./view/SpanKeyboardHelpContent.js";
import { SpanScreenView } from "./view/SpanScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type SpanScreenOptions = ScreenOptions & { tandem: Tandem };

export class SpanScreen extends Screen<SpanModel, SpanScreenView> {
  public constructor(options: SpanScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new SpanModel(),
      // View factory — receives the model instance
      (model) =>
        new SpanScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<SpanScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: LinearTransformationsColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new SpanKeyboardHelpContent(),
          homeScreenIcon: createSpanIcon(),
          navigationBarIcon: createSpanIcon(),
        },
        options,
      ),
    );
  }
}
