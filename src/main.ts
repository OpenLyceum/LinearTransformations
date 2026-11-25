/**
 * main.ts
 *
 * Entry point for the simulation. Initializes SceneryStack, creates the
 * screens, and starts the main event loop.
 *
 * !! CRITICAL IMPORT ORDER !!
 * brand.js MUST be the first import. Each module imports the next, so the import nesting is
 *
 *   main → brand → splash → assert → init
 *
 * and therefore the actual EXECUTION order (deepest import runs first) is the reverse:
 *
 *   init → assert → splash → brand → main
 *
 * SceneryStack requires this exact load order. Never reorder these imports.
 */

// brand.js MUST be first; importing it runs the whole chain (init→assert→splash→brand) before main.
import "./brand.js";

import { onReadyToLaunch, PreferencesModel, Sim } from "scenerystack/sim";
import { Tandem } from "scenerystack/tandem";
import { ChangeOfBasisScreen } from "./basis/ChangeOfBasisScreen.js";
import { EigenvectorsScreen } from "./eigen/EigenvectorsScreen.js";
import { StringManager } from "./i18n/StringManager.js";
import LinearTransformationsColors from "./LinearTransformationsColors.js";
import { LinearTransformationsPreferencesModel } from "./preferences/LinearTransformationsPreferencesModel.js";
import { LinearTransformationsPreferencesNode } from "./preferences/LinearTransformationsPreferencesNode.js";
import { ProjectionScreen } from "./projection/ProjectionScreen.js";
import { SpanScreen } from "./span/SpanScreen.js";
import { SVDScreen } from "./svd/SVDScreen.js";
import { SystemsScreen } from "./systems/SystemsScreen.js";
import { TransformScreen } from "./transform/TransformScreen.js";

onReadyToLaunch(() => {
  const stringManager = StringManager.getInstance();

  // Simulation-specific preferences; initial values come from linearTransformationsQueryParameters.
  const simPreferences = new LinearTransformationsPreferencesModel(Tandem.ROOT.createTandem("preferences"));

  const screens = [
    new SpanScreen({
      name: stringManager.getScreenNames().spanStringProperty,
      tandem: Tandem.ROOT.createTandem("spanScreen"),
      backgroundColorProperty: LinearTransformationsColors.backgroundColorProperty,
    }),
    new TransformScreen({
      name: stringManager.getScreenNames().transformStringProperty,
      tandem: Tandem.ROOT.createTandem("transformScreen"),
      backgroundColorProperty: LinearTransformationsColors.backgroundColorProperty,
    }),
    new SystemsScreen({
      name: stringManager.getScreenNames().systemsStringProperty,
      tandem: Tandem.ROOT.createTandem("systemsScreen"),
      backgroundColorProperty: LinearTransformationsColors.backgroundColorProperty,
    }),
    new EigenvectorsScreen({
      name: stringManager.getScreenNames().eigenStringProperty,
      tandem: Tandem.ROOT.createTandem("eigenScreen"),
      backgroundColorProperty: LinearTransformationsColors.backgroundColorProperty,
    }),
    new ProjectionScreen({
      name: stringManager.getScreenNames().projectionStringProperty,
      tandem: Tandem.ROOT.createTandem("projectionScreen"),
      backgroundColorProperty: LinearTransformationsColors.backgroundColorProperty,
    }),
    new ChangeOfBasisScreen({
      name: stringManager.getScreenNames().basisStringProperty,
      tandem: Tandem.ROOT.createTandem("basisScreen"),
      backgroundColorProperty: LinearTransformationsColors.backgroundColorProperty,
    }),
    new SVDScreen({
      name: stringManager.getScreenNames().svdStringProperty,
      tandem: Tandem.ROOT.createTandem("svdScreen"),
      backgroundColorProperty: LinearTransformationsColors.backgroundColorProperty,
    }),
  ];

  const sim = new Sim(stringManager.getTitleStringProperty(), screens, {
    preferencesModel: new PreferencesModel({
      visualOptions: {
        // Adds a "Projector Mode" toggle in Preferences → Visual
        supportsProjectorMode: true,
        // Enables keyboard-navigation highlight outlines
        supportsInteractiveHighlights: true,
      },
      simulationOptions: {
        customPreferences: [
          {
            createContent: (tandem: Tandem) => new LinearTransformationsPreferencesNode(simPreferences, tandem),
          },
        ],
      },
      localizationOptions: {
        // Adds a language picker in Preferences → Language
        supportsDynamicLocale: true,
      },
    }),

    // Optional: fill in credits shown in Help → About
    credits: {
      leadDesign: "",
      softwareDevelopment: "",
      team: "",
      qualityAssurance: "",
    },
  });

  sim.start();
});
