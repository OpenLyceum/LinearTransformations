# AGENTS.md — Linear Transformations

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenLyceum/.github/AGENTS.md](https://github.com/OpenLyceum/.github/blob/main/AGENTS.md).

## Project

Linear Transformations (`linear-transformations`) teaches linear algebra in the plane through seven interactive screens.

- **Span** — Drag two vectors and vary their coefficients to form a linear combination. The span display distinguishes the origin, a line, and the whole plane. In target mode, Solve computes coefficients for an independent pair and reports when they fall outside the slider range.
- **Transform** — Edit the columns of a matrix and morph from identity to its action on the grid, unit square, and letter F. The determinant tracks orientation and collapse. Composition lets students switch between BA and AB and shows the intermediate F at full morph when F is visible.
- **Systems** — Edit A and b, step through recorded row operations, and switch between the current equations and the original column vectors. Editing restarts reduction. The readout distinguishes a unique point, a line of solutions, the whole plane, and no solution.
- **Eigenvectors** — Turn a fixed-length v to compare it with Av, sweep a full turn to trace its image, or plot ten applications of A to a movable starting point. The readout distinguishes distinct real, scalar, defective, and complex cases. A zero image counts as aligned, and editing A stops the sweep and clears its trace.
- **Projection** — Project b onto the line through a and display the perpendicular residual, or drag five data points and compare a trial line's squared error with the least-squares fit. A zero direction leaves the projection undefined, and equal x-coordinates leave the slope-intercept fit undetermined.
- **Change of Basis** — Move the basis vectors and x to compare standard and basis coordinates and inspect P⁻¹AP. Dependent basis vectors leave the inverse-dependent readouts undefined. Use Eigenvectors is enabled for two distinct real eigenvalues.
- **SVD** — Play or scrub the two rotations and intervening stretch of the unit circle, with a flip during the stretch for negative determinants. The screen reports singular values, numerical rank, and condition number. Matrix edits stop playback and return to the first stage.

## Key files

| File | Purpose |
|---|---|
| `src/LinearTransformationsColors.ts` | All `ProfileColorProperty` instances |
| `src/LinearTransformationsConstants.ts` | Named numeric constants |
| `src/LinearTransformationsNamespace.ts` | Namespace for color property names |
| `src/i18n/StringManager.ts` | Singleton localized string accessor |
| `src/common/LinearTransformationsPanel.ts` | Pre-themed `Panel` wrapper |
| `src/common/LinearTransformationsButtonOptions.ts` | Flat button / combo-box option bundles |
| `src/common/LabView.ts` | Shared layout, summaries, controls, canvas, coordinate mapping, and frame callbacks |
| `src/common/model/LinearAlgebra.ts` | Vector operations and row-major 2×2 matrix helpers |
| `src/common/model/Eigen.ts` | Characteristic data, eigenvalues, and real eigendirections |
| `src/common/model/LeastSquares.ts` | Orthogonal projection, line fitting, and squared error |
| `src/common/model/MatrixModel.ts` | Editable entries, derived matrix, and preset synchronization |
| `src/common/model/Presets.ts` | Named matrix presets and their IDs |
| `src/common/model/RowReduction.ts` | Recorded Gauss–Jordan steps and solution classification |
| `src/common/model/Svd.ts` | Singular values, orthogonal factors, numerical rank, and animation stages |
| `src/common/view/AugmentedMatrixReadout.ts` | Augmented matrix display with pivot highlighting |
| `src/common/view/MatrixEditor.ts` | Labeled entry spinners and optional determinant |
| `src/common/view/MatrixReadout.ts` | Bracketed matrix displays and shared accessible descriptions |
| `src/common/view/PlotDrawing.ts` | Canvas helpers for transformed grids and shapes, lines, and right-angle markers |
| `src/common/view/VectorHandle.ts` | Pointer and keyboard dragging for Cartesian vector tips |
| `src/span/SpanScreen.ts` | Screen wrapper |
| `src/span/model/SpanModel.ts` | Simulation state and logic |
| `src/span/view/SpanScreenView.ts` | Visual nodes, layout, a11y wiring |
| `src/transform/TransformScreen.ts` | Screen wrapper |
| `src/transform/model/TransformModel.ts` | Simulation state and logic |
| `src/transform/view/TransformScreenView.ts` | Visual nodes, layout, a11y wiring |
| `src/systems/SystemsScreen.ts` | Screen wrapper |
| `src/systems/model/SystemsModel.ts` | Simulation state and logic |
| `src/systems/view/SystemsScreenView.ts` | Visual nodes, layout, a11y wiring |
| `src/eigen/EigenvectorsScreen.ts` | Screen wrapper |
| `src/eigen/model/EigenvectorsModel.ts` | Simulation state and logic |
| `src/eigen/view/EigenvectorsScreenView.ts` | Visual nodes, layout, a11y wiring |
| `src/projection/ProjectionScreen.ts` | Screen wrapper |
| `src/projection/model/ProjectionModel.ts` | Simulation state and logic |
| `src/projection/view/ProjectionScreenView.ts` | Visual nodes, layout, a11y wiring |
| `src/basis/ChangeOfBasisScreen.ts` | Screen wrapper |
| `src/basis/model/ChangeOfBasisModel.ts` | Simulation state and logic |
| `src/basis/view/ChangeOfBasisScreenView.ts` | Visual nodes, layout, a11y wiring |
| `src/svd/SVDScreen.ts` | Screen wrapper |
| `src/svd/model/SVDModel.ts` | Simulation state and logic |
| `src/svd/view/SVDScreenView.ts` | Visual nodes, layout, a11y wiring |

## Compliance carve-outs

- `src/common/LabView.ts` is a local fork of ContourExplorer's `LabView`. Changes stay in this repository. The shared view constructs the screen summaries. Disposal allows the base `Node` to clear its PDOM order because `ScreenView` rejects that call.

## Testing

- `npm test` runs Vitest. See `tests/linear-algebra.test.ts` and `tests/plot-drawing.test.ts` for unit coverage and `tests/*-screen-view.test.ts` for construction, interaction, and redraw coverage across all seven screens.
- `tests/memory-leak.test.ts` checks that all seven models and views, plus the shared matrix model and controls, are collected after disposal.
- `npm run test:fuzz:quick` runs Playwright pointer and keyboard fuzz with assertions enabled. To reproduce a run, use its seed, for example `FUZZ_SEED=12345 npm run test:fuzz:quick`.

## Accessibility

Follow the shared guidance for PDOM names, screen summaries, and keyboard help. [Baton accessibility guidance](https://github.com/OpenLyceum/Baton/blob/main/ACCESSIBILITY.md)

- The Eigenvectors v-handle is pointer-only. The Direction slider is its keyboard path.
- Keep live matrix descriptions in the `innerContent` of a leaf `<p>`. In `labeledMatrix` in `src/common/view/MatrixReadout.ts`, this updates the PDOM in place and avoids rebuilding the matrix layout's PDOM subtree while a nearby spinner has focus.
