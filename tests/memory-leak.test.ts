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
import { EigenvectorsModel } from "../src/eigen/model/EigenvectorsModel.js";
import { ProjectionModel } from "../src/projection/model/ProjectionModel.js";
import { SpanModel } from "../src/span/model/SpanModel.js";
import { SVDModel } from "../src/svd/model/SVDModel.js";
import { SystemsModel } from "../src/systems/model/SystemsModel.js";
import { TransformModel } from "../src/transform/model/TransformModel.js";
import { describeDisposalLeaks } from "./helpers/memoryLeak.js";

describeDisposalLeaks([
  { name: "SpanModel", create: () => new SpanModel() },
  { name: "TransformModel", create: () => new TransformModel() },
  { name: "SystemsModel", create: () => new SystemsModel() },
  { name: "EigenvectorsModel", create: () => new EigenvectorsModel() },
  { name: "ProjectionModel", create: () => new ProjectionModel() },
  { name: "ChangeOfBasisModel", create: () => new ChangeOfBasisModel() },
  { name: "SVDModel", create: () => new SVDModel() },
]);
