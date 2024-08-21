import { importProvidersFrom } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { applicationConfig, Meta, moduleMetadata, Story } from "@storybook/angular";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import {
  AvatarModule,
  BadgeModule,
  ButtonModule,
  DialogModule,
  FormFieldModule,
  IconButtonModule,
  TableModule,
  TabsModule,
} from "@bitwarden/components";

import { PreloadedEnglishI18nModule } from "../../../../../../core/tests";
import { AccessSelectorComponent } from "../access-selector.component";
import { AccessItemType } from "../access-selector.models";
import { UserTypePipe } from "../user-type.pipe";

import { itemsFactory, actionsData } from "./storybook-helpers";

export default {
  title: "Web/Organizations/Access Selector",
  decorators: [
    moduleMetadata({
      declarations: [AccessSelectorComponent, UserTypePipe],
      imports: [
        DialogModule,
        ButtonModule,
        FormFieldModule,
        AvatarModule,
        BadgeModule,
        ReactiveFormsModule,
        FormsModule,
        TabsModule,
        TableModule,
        JslibModule,
        IconButtonModule,
      ],
      providers: [],
    }),
    applicationConfig({
      providers: [importProvidersFrom(PreloadedEnglishI18nModule)],
    }),
  ],
  parameters: {},
  argTypes: {
    formObj: { table: { disable: true } },
  },
} as Meta;

const DialogAccessSelectorTemplate: Story<AccessSelectorComponent> = (
  args: AccessSelectorComponent,
) => ({
  props: {
    items: [],
    valueChanged: actionsData.onValueChanged,
    initialValue: [],
    ...args,
  },
  template: `
    <bit-dialog [dialogSize]="dialogSize" [disablePadding]="disablePadding">
      <span bitDialogTitle>Access selector</span>
      <span bitDialogContent>
        <bit-access-selector
          (ngModelChange)="valueChanged($event)"
          [ngModel]="initialValue"
          [items]="items"
          [disabled]="disabled"
          [columnHeader]="columnHeader"
          [showGroupColumn]="showGroupColumn"
          [selectorLabelText]="selectorLabelText"
          [selectorHelpText]="selectorHelpText"
          [emptySelectionText]="emptySelectionText"
          [permissionMode]="permissionMode"
          [showMemberRoles]="showMemberRoles"
        ></bit-access-selector>
      </span>
      <ng-container bitDialogFooter>
        <button bitButton buttonType="primary">Save</button>
        <button bitButton buttonType="secondary">Cancel</button>
        <button
          class="tw-ml-auto"
          bitIconButton="bwi-trash"
          buttonType="danger"
          size="default"
          title="Delete"
          aria-label="Delete"></button>
      </ng-container>
    </bit-dialog>
`,
});

const dialogAccessItems = itemsFactory(10, AccessItemType.Collection);

export const Dialog = DialogAccessSelectorTemplate.bind({});
Dialog.args = {
  permissionMode: "edit",
  showMemberRoles: false,
  showGroupColumn: true,
  columnHeader: "Collection",
  selectorLabelText: "Select Collections",
  selectorHelpText: "Some helper text describing what this does",
  emptySelectionText: "No collections added",
  disabled: false,
  initialValue: [],
  items: dialogAccessItems,
};
Dialog.story = {
  parameters: {
    docs: {
      storyDescription: `
        Example of an access selector for modifying the collections a member has access to inside of a dialog.
      `,
    },
  },
};
