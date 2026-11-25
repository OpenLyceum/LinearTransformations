/**
 * LinearTransformationsPanel.ts
 *
 * A pre-themed Panel that automatically uses LinearTransformationsColors for background and
 * border. Use this for all control panels and info boxes in the sim so that
 * default / projector mode switching is handled automatically.
 *
 * ── Basic usage ───────────────────────────────────────────────────────────────
 *
 *   import { LinearTransformationsPanel } from "../../common/LinearTransformationsPanel.js";
 *   import { VBox, Text } from "scenerystack/scenery";
 *
 *   const content = new VBox({
 *     children: [ new Text("label"), slider ],
 *     spacing: 8,
 *   });
 *   const panel = new LinearTransformationsPanel(content);
 *
 * ── Overriding defaults ───────────────────────────────────────────────────────
 *
 *   // Wider margins, sharper corners, custom stroke
 *   const panel = new LinearTransformationsPanel(content, { xMargin: 20, cornerRadius: 0 });
 *
 *   // Transparent background (decorative border only)
 *   const panel = new LinearTransformationsPanel(content, { fill: "transparent" });
 */

import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { Node } from "scenerystack/scenery";
import { Panel, type PanelOptions } from "scenerystack/sun";
import LinearTransformationsColors from "../LinearTransformationsColors.js";
import { PANEL_CORNER_RADIUS } from "../LinearTransformationsConstants.js";

/** @public */
export type LinearTransformationsPanelOptions = PanelOptions;

/** Pre-themed Panel wrapper for control panels and info boxes. @public */
export class LinearTransformationsPanel extends Panel {
  public constructor(content: Node, providedOptions?: LinearTransformationsPanelOptions) {
    const options = optionize<LinearTransformationsPanelOptions, EmptySelfOptions, PanelOptions>()(
      {
        fill: LinearTransformationsColors.panelBackgroundColorProperty,
        stroke: LinearTransformationsColors.panelBorderColorProperty,
        cornerRadius: PANEL_CORNER_RADIUS,
        xMargin: 12,
        yMargin: 10,
      },
      providedOptions,
    );
    super(content, options);
  }
}
