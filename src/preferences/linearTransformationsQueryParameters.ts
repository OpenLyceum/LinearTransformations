/**
 * linearTransformationsQueryParameters.ts
 *
 * Sim-specific startup query parameters. Declare each public parameter here and
 * initialize matching preference Properties from them when needed.
 *
 * Side-effect module while empty: imported from the preferences model so Knip
 * keeps the file without an unused default export.
 */
import { logGlobal } from "scenerystack/phet-core";
import { QueryStringMachine } from "scenerystack/query-string-machine";
import LinearTransformationsNamespace from "../LinearTransformationsNamespace.js";

const linearTransformationsQueryParameters = QueryStringMachine.getAll({
  // Pattern (skill: scenerystack-query-parameters): one typed entry per parameter.
  // Mark it public only if users may set it from the URL. When the first entry is
  // added, make linearTransformationsQueryParameters the module's default export and import it by
  // name from LinearTransformationsPreferencesModel.
  //
  //   showGrid: { type: "boolean", defaultValue: false, public: true },
});

LinearTransformationsNamespace.register("linearTransformationsQueryParameters", linearTransformationsQueryParameters);

logGlobal("phet.chipper.queryParameters");
