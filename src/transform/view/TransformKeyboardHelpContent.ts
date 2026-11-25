import {
  BasicActionsKeyboardHelpSection,
  ComboBoxKeyboardHelpSection,
  MoveDraggableItemsKeyboardHelpSection,
  SliderControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";

export class TransformKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    super(
      [new BasicActionsKeyboardHelpSection(), new ComboBoxKeyboardHelpSection()],
      [new MoveDraggableItemsKeyboardHelpSection(), new SliderControlsKeyboardHelpSection()],
    );
  }
}
