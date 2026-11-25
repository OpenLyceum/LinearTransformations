/**
 * LinearTransformationsConstants.ts
 *
 * Central repository for every named numeric constant used across the
 * simulation. Bare numbers that carry semantic meaning (sizes, margins,
 * physics defaults, ranges) belong here rather than inline in model or view
 * code, so they are named, documented, and changed in one place.
 *
 * Conventions
 * ───────────
 *  - Model / math values note their unit in a comment on each value.
 *  - Layout / chrome values are in screen pixels.
 *  - Colour strings live in LinearTransformationsColors.ts, not here.
 *  - Computed expressions (e.g. `2 * Math.PI`) may stay inline.
 *
 */

import { Range } from "scenerystack/dot";
import LinearTransformationsNamespace from "./LinearTransformationsNamespace.js";

// ── Layout / chrome (screen pixels) ───────────────────────────────────────────

/** Margin between the screen edge and edge-anchored controls (e.g. Reset All). */
export const SCREEN_VIEW_MARGIN = 20;

/** Corner radius shared by control panels and dialogs. */
export const PANEL_CORNER_RADIUS = 6;

/** Lab plot canvas width (px). */
export const PLOT_WIDTH = 590;

/** Lab plot canvas height (px). */
export const PLOT_HEIGHT = 420;

/** Inner margin from plot edge to axis content (px). */
export const PLOT_MARGIN = 23;

/** Control panel minimum width (px). */
export const PANEL_MIN_WIDTH = 325;

/** Gap between plot and control panel (px). */
export const PANEL_GAP = 18;

/** Gap between title and plot/panel row (px). */
export const TITLE_TO_PLOT_GAP = 14;

/** Shared lab design height (px), including space for matrix editors. */
export const LAYOUT_HEIGHT = 655;

/** Display width (px) for each of the seven navigation bar icons. */
export const NAVIGATION_ICON_WIDTH = 30;

/** Visible model window, in units. Plane keeps square units at 46.75 px per unit. */
export const X_RANGE = new Range(-5.5, 5.5);
export const Y_RANGE = new Range(-4, 4);

/** Handle limits in model units keep vector tips on screen. */
export const HANDLE_X_RANGE = new Range(-5, 5);
export const HANDLE_Y_RANGE = new Range(-3.6, 3.6);

/** Limits of every editable matrix entry. */
export const ENTRY_RANGE = new Range(-3.5, 3.5);

/** Pointer snap and arrow-key step in model units. */
export const DRAG_SNAP = 0.1;
export const KEYBOARD_STEP = 0.1;

/** Exact-zero tolerance for snapped inputs. */
export const EPS = 1e-9;

/** Sine of the angular tolerance for testing parallel eigenvectors. */
export const PARALLEL_SIN = Math.sin((1.5 * Math.PI) / 180);

/** The transformed grid uses integer lines from minus this value to plus it. */
export const GRID_LINES = 8;

/** Duration of a complete eigenvector sweep (seconds). */
export const SWEEP_SECONDS = 6;
export const SVD_PLAY_SECONDS = 4.5;

/** Number of matrix applications shown in the iteration orbit. */
export const ITERATIONS = 10;

LinearTransformationsNamespace.register("LinearTransformationsConstants", {
  SCREEN_VIEW_MARGIN,
  PANEL_CORNER_RADIUS,
  PLOT_WIDTH,
  PLOT_HEIGHT,
  PLOT_MARGIN,
  PANEL_MIN_WIDTH,
  PANEL_GAP,
  TITLE_TO_PLOT_GAP,
  LAYOUT_HEIGHT,
  NAVIGATION_ICON_WIDTH,
  X_RANGE,
  Y_RANGE,
  HANDLE_X_RANGE,
  HANDLE_Y_RANGE,
  ENTRY_RANGE,
  DRAG_SNAP,
  KEYBOARD_STEP,
  EPS,
  PARALLEL_SIN,
  GRID_LINES,
  SWEEP_SECONDS,
  SVD_PLAY_SECONDS,
  ITERATIONS,
});
