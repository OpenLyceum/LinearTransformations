# AGENTS.md — Linear Transformations

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenLyceum/.github/AGENTS.md](https://github.com/OpenLyceum/.github/blob/main/AGENTS.md).

## Project

Linear Transformations (`linear-transformations`) is a SceneryStack simulation scaffolded from SceneryStackTemplate.

## Key files

| File | Purpose |
|---|---|
| `src/LinearTransformationsColors.ts` | All `ProfileColorProperty` instances |
| `src/LinearTransformationsConstants.ts` | Named numeric constants |
| `src/LinearTransformationsNamespace.ts` | Namespace for color property names |
| `src/i18n/StringManager.ts` | Singleton localized string accessor |
| `src/common/LinearTransformationsPanel.ts` | Pre-themed `Panel` wrapper |
| `src/common/LinearTransformationsButtonOptions.ts` | Flat button / combo-box option bundles |
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

- `src/common/LabView.ts`: Forked from ContourExplorer, with screen summaries constructed in the shared view. Disposal allows the base Node to clear its PDOM order because ScreenView rejects that call.
