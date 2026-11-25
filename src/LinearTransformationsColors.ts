/**
 * LinearTransformationsColors.ts
 *
 * Defines all dynamic colors for the simulation using ProfileColorProperty.
 *
 * Each color has two profiles:
 *   - "default"   — used in standard (dark) mode
 *   - "projector" — used when the user enables Projector Mode in Preferences
 *
 * SceneryStack switches profiles automatically; no manual toggling is needed.
 *
 * ── Usage ─────────────────────────────────────────────────────────────────────
 * Import LinearTransformationsColors and pass properties directly to Node's fillProperty or
 * strokeProperty options:
 *
 *   import LinearTransformationsColors from "../../LinearTransformationsColors.js";
 *
 *   new Rectangle( 0, 0, 100, 50, {
 *     fillProperty: LinearTransformationsColors.backgroundColorProperty,
 *   });
 *
 * ── How to add a color ────────────────────────────────────────────────────────
 * Add a new ProfileColorProperty entry to the LinearTransformationsColors object below.
 * Always provide both "default" and "projector" values.
 */
import { ProfileColorProperty } from "scenerystack/scenery";
import LinearTransformationsNamespace from "./LinearTransformationsNamespace.js";

const LinearTransformationsColors = {
  /**
   * Background color for the simulation screen.
   * Deep navy in default mode; white in projector mode.
   */
  backgroundColorProperty: new ProfileColorProperty(LinearTransformationsNamespace, "background", {
    default: "#1a1a2e",
    projector: "#ffffff",
  }),

  /**
   * Primary accent color for highlights, selected items, and key UI elements.
   * Sky blue in default mode; dark navy in projector mode.
   */
  accentColorProperty: new ProfileColorProperty(LinearTransformationsNamespace, "accent", {
    default: "#4fc3f7",
    projector: "#1a1a2e",
  }),

  /**
   * Background fill for control panels and dialogs.
   * Deep blue in default mode; light gray in projector mode.
   */
  panelBackgroundColorProperty: new ProfileColorProperty(LinearTransformationsNamespace, "panelBackground", {
    default: "#16213e",
    projector: "#f5f5f5",
  }),

  /**
   * Border/stroke color for control panels and dialogs.
   * Teal-navy in default mode; medium gray in projector mode.
   */
  panelBorderColorProperty: new ProfileColorProperty(LinearTransformationsNamespace, "panelBorder", {
    default: "#0f3460",
    projector: "#999999",
  }),

  /**
   * Text color for labels, readouts, and general UI text.
   * Near-white in default mode; near-black in projector mode.
   */
  textColorProperty: new ProfileColorProperty(LinearTransformationsNamespace, "text", {
    default: "#e0e0e0",
    projector: "#1a1a1a",
  }),

  /** Contrasting marks for comparisons in a plot. */
  secondaryPlotColorProperty: new ProfileColorProperty(LinearTransformationsNamespace, "secondaryPlot", {
    default: "#ffbc75",
    projector: "#985021",
  }),

  // ── Light control surfaces ───────────────────────────────────────────────────
  // White chrome (combo boxes, flat push buttons, editable input fields) stays light
  // in both profiles; its text stays dark. Same values in default and projector mode,
  // but defined here so every color lives in one themeable place.

  /** Fill of light control surfaces: combo-box button/list, editable input fields. */
  controlSurfaceColorProperty: new ProfileColorProperty(LinearTransformationsNamespace, "controlSurface", {
    default: "#ffffff",
    projector: "#ffffff",
  }),

  /** Fill of a disabled control surface (grayed-out editable input field). */
  controlSurfaceDisabledColorProperty: new ProfileColorProperty(
    LinearTransformationsNamespace,
    "controlSurfaceDisabled",
    {
      default: "#cccccc",
      projector: "#cccccc",
    },
  ),

  /** Text on light control surfaces: combo items, flat-button labels, field values, preferences. */
  controlSurfaceTextColorProperty: new ProfileColorProperty(LinearTransformationsNamespace, "controlSurfaceText", {
    default: "#1a1a1a",
    projector: "#1a1a1a",
  }),

  column1ColorProperty: new ProfileColorProperty(LinearTransformationsNamespace, "column1", {
    default: "#ff7a7a",
    projector: "#b3261e",
  }),
  column2ColorProperty: new ProfileColorProperty(LinearTransformationsNamespace, "column2", {
    default: "#7ad7ff",
    projector: "#0b5cad",
  }),
  inputVectorColorProperty: new ProfileColorProperty(LinearTransformationsNamespace, "inputVector", {
    default: "#ffd54f",
    projector: "#8a6d00",
  }),
  outputVectorColorProperty: new ProfileColorProperty(LinearTransformationsNamespace, "outputVector", {
    default: "#b388ff",
    projector: "#5e35b1",
  }),
  eigenColorProperty: new ProfileColorProperty(LinearTransformationsNamespace, "eigen", {
    default: "#69f0ae",
    projector: "#1b7a43",
  }),
  positiveAreaColorProperty: new ProfileColorProperty(LinearTransformationsNamespace, "positiveArea", {
    default: "rgba(79,195,247,0.25)",
    projector: "rgba(11,92,173,0.18)",
  }),
  negativeAreaColorProperty: new ProfileColorProperty(LinearTransformationsNamespace, "negativeArea", {
    default: "rgba(255,188,117,0.3)",
    projector: "rgba(152,80,33,0.2)",
  }),
  transformedGridColorProperty: new ProfileColorProperty(LinearTransformationsNamespace, "transformedGrid", {
    default: "rgba(79,195,247,0.45)",
    projector: "rgba(11,92,173,0.4)",
  }),
  faintGridColorProperty: new ProfileColorProperty(LinearTransformationsNamespace, "faintGrid", {
    default: "#2a3a5e",
    projector: "#dddddd",
  }),
};

export default LinearTransformationsColors;
