# Implementation notes — Linear Transformations

Developer-facing architecture notes for `linear-transformations`.

## Architecture

Screens: src/span/, src/transform/, src/systems/, src/eigen/, src/projection/, src/basis/, src/svd/

- Models own state and `step` / `reset`; views observe Properties and never integrate physics.
- Colors live in `src/LinearTransformationsColors.ts`; strings in `src/i18n/` via `StringManager`.
- Preferences shell: `src/preferences/` (empty until sim-specific prefs are added).

## Notes

*Record design decisions, performance constraints, and known limitations here.*
