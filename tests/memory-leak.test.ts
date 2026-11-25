/**
 * Memory-leak regression suite (fleet standard).
 *
 * List every model/view object that links Properties, adds listeners, or owns child
 * nodes, with a factory that builds a fresh instance. The shared harness in
 * tests/helpers/memoryLeak.ts (template-owned) checks that each one is garbage
 * collected after dispose() and leaves no survivors across repeated cycles
 * (idempotentDispose: true also checks a second dispose()). Add sim-specific leak
 * tests below using forceGC().
 */

import { ChangeOfBasisModel } from "../src/basis/model/ChangeOfBasisModel.js";
import { MatrixModel } from "../src/common/model/MatrixModel.js";
import { EigenvectorsModel } from "../src/eigen/model/EigenvectorsModel.js";
import { EigenvectorsScreenView } from "../src/eigen/view/EigenvectorsScreenView.js";
import { ProjectionModel } from "../src/projection/model/ProjectionModel.js";
import { SpanModel } from "../src/span/model/SpanModel.js";
import { SpanScreenView } from "../src/span/view/SpanScreenView.js";
import { SVDModel } from "../src/svd/model/SVDModel.js";
import { SystemsModel } from "../src/systems/model/SystemsModel.js";
import { TransformModel } from "../src/transform/model/TransformModel.js";
import { TransformScreenView } from "../src/transform/view/TransformScreenView.js";
import { describeDisposalLeaks } from "./helpers/memoryLeak.js";

describeDisposalLeaks([
  { name: "MatrixModel", create: () => new MatrixModel("identity") },
  { name: "SpanModel", create: () => new SpanModel() },
  {
    name: "SpanScreenView",
    create: () => {
      const model = new SpanModel();
      const view = new SpanScreenView(model);
      model.targetModeProperty.value = true;
      view.addDisposable(model);
      return view;
    },
  },
  { name: "TransformModel", create: () => new TransformModel() },
  {
    name: "TransformScreenView",
    create: () => {
      const model = new TransformModel();
      const view = new TransformScreenView(model);
      model.composeProperty.value = true;
      view.addDisposable(model);
      return view;
    },
  },
  { name: "SystemsModel", create: () => new SystemsModel() },
  { name: "EigenvectorsModel", create: () => new EigenvectorsModel() },
  {
    name: "EigenvectorsScreenView",
    create: () => {
      const model = new EigenvectorsModel();
      const view = new EigenvectorsScreenView(model);
      model.iterateProperty.value = true;
      view.addDisposable(model);
      return view;
    },
  },
  { name: "ProjectionModel", create: () => new ProjectionModel() },
  { name: "ChangeOfBasisModel", create: () => new ChangeOfBasisModel() },
  { name: "SVDModel", create: () => new SVDModel() },
]);
