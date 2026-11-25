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

import { Property } from "scenerystack/axon";
import { ChangeOfBasisModel } from "../src/basis/model/ChangeOfBasisModel.js";
import { ChangeOfBasisScreenView } from "../src/basis/view/ChangeOfBasisScreenView.js";
import { MatrixModel } from "../src/common/model/MatrixModel.js";
import { AugmentedMatrixReadout } from "../src/common/view/AugmentedMatrixReadout.js";
import { MatrixEditor } from "../src/common/view/MatrixEditor.js";
import { MatrixReadout } from "../src/common/view/MatrixReadout.js";
import { EigenvectorsModel } from "../src/eigen/model/EigenvectorsModel.js";
import { EigenvectorsScreenView } from "../src/eigen/view/EigenvectorsScreenView.js";
import { ProjectionModel } from "../src/projection/model/ProjectionModel.js";
import { ProjectionScreenView } from "../src/projection/view/ProjectionScreenView.js";
import { SpanModel } from "../src/span/model/SpanModel.js";
import { SpanScreenView } from "../src/span/view/SpanScreenView.js";
import { SVDModel } from "../src/svd/model/SVDModel.js";
import { SVDScreenView } from "../src/svd/view/SVDScreenView.js";
import { SystemsModel } from "../src/systems/model/SystemsModel.js";
import { SystemsScreenView } from "../src/systems/view/SystemsScreenView.js";
import { TransformModel } from "../src/transform/model/TransformModel.js";
import { TransformScreenView } from "../src/transform/view/TransformScreenView.js";
import { describeDisposalLeaks } from "./helpers/memoryLeak.js";

describeDisposalLeaks([
  { name: "MatrixModel", create: () => new MatrixModel("identity") },
  {
    name: "MatrixEditor",
    create: () => {
      const model = new MatrixModel("shear");
      const editor = new MatrixEditor(model, new Property("A"), { showDet: true });
      editor.addDisposable(model);
      return editor;
    },
  },
  {
    name: "MatrixReadout",
    create: () => {
      const matrix = new Property<readonly [number, number, number, number] | null>([1, 2, 3, 4]);
      const readout = new MatrixReadout(matrix, new Property("P"));
      readout.addDisposable(matrix);
      return readout;
    },
  },
  {
    name: "AugmentedMatrixReadout",
    create: () => {
      const matrix = new Property([
        [1, 1, 3],
        [1, -1, 1],
      ] as const);
      const pivot = new Property(null);
      const readout = new AugmentedMatrixReadout(matrix, pivot, new Property("[A | b]"));
      readout.addDisposable(matrix);
      readout.addDisposable(pivot);
      return readout;
    },
  },
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
  {
    name: "SystemsScreenView",
    create: () => {
      const model = new SystemsModel();
      const view = new SystemsScreenView(model);
      model.pictureProperty.value = "column";
      view.addDisposable(model);
      return view;
    },
  },
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
  {
    name: "ProjectionScreenView",
    create: () => {
      const model = new ProjectionModel();
      const view = new ProjectionScreenView(model);
      model.modeProperty.value = "leastSquares";
      view.addDisposable(model);
      return view;
    },
  },
  { name: "ChangeOfBasisModel", create: () => new ChangeOfBasisModel() },
  {
    name: "ChangeOfBasisScreenView",
    create: () => {
      const model = new ChangeOfBasisModel();
      const view = new ChangeOfBasisScreenView(model);
      model.useEigenvectors();
      view.addDisposable(model);
      return view;
    },
  },
  { name: "SVDModel", create: () => new SVDModel() },
  {
    name: "SVDScreenView",
    create: () => {
      const model = new SVDModel();
      const view = new SVDScreenView(model);
      model.togglePlayback();
      view.addDisposable(model);
      return view;
    },
  },
]);
