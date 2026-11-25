/**
 * By-hand headless soak: npm run test:soak:headless (never in CI).
 *
 * List the screens exactly as main.ts builds them. The harness in
 * tests/helpers/headlessSoak.ts (template-owned) presses every control, sets every slider,
 * steps, switches screens, flips the color profile and locale, presses Reset All, and
 * fails when listener counts, node counts or retained heap rise after every round.
 *
 * Add `actions` for what only this sim can do (record/clear, add/remove objects) and
 * `exclude` for controls that must not be pressed headless.
 */

import { StringProperty } from "scenerystack/axon";
import { Tandem } from "scenerystack/tandem";
import { ChangeOfBasisScreen } from "../../src/basis/ChangeOfBasisScreen.js";
import { EigenvectorsScreen } from "../../src/eigen/EigenvectorsScreen.js";
import LinearTransformationsColors from "../../src/LinearTransformationsColors.js";
import { ProjectionScreen } from "../../src/projection/ProjectionScreen.js";
import { SpanScreen } from "../../src/span/SpanScreen.js";
import { SVDScreen } from "../../src/svd/SVDScreen.js";
import { SystemsScreen } from "../../src/systems/SystemsScreen.js";
import { TransformScreen } from "../../src/transform/TransformScreen.js";
import { describeHeadlessSoak } from "../helpers/headlessSoak.js";

describeHeadlessSoak({
  screens: () => [
    new SpanScreen({ name: new StringProperty("Span"), tandem: Tandem.OPT_OUT }),
    new TransformScreen({ name: new StringProperty("Transform"), tandem: Tandem.OPT_OUT }),
    new SystemsScreen({ name: new StringProperty("Systems"), tandem: Tandem.OPT_OUT }),
    new EigenvectorsScreen({ name: new StringProperty("Eigenvectors"), tandem: Tandem.OPT_OUT }),
    new ProjectionScreen({ name: new StringProperty("Projection"), tandem: Tandem.OPT_OUT }),
    new ChangeOfBasisScreen({ name: new StringProperty("Change of Basis"), tandem: Tandem.OPT_OUT }),
    new SVDScreen({ name: new StringProperty("SVD"), tandem: Tandem.OPT_OUT }),
  ],
  tracked: () => ({ LinearTransformationsColors }),
});
