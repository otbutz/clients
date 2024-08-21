import { importProvidersFrom } from "@angular/core";
import { FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
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

const sampleMembers = itemsFactory(10, AccessItemType.Member);
const sampleGroups = itemsFactory(6, AccessItemType.Group);

const fb = new FormBuilder();

const ReactiveFormAccessSelectorTemplate: Story<AccessSelectorComponent> = (
  args: AccessSelectorComponent,
) => ({
  props: {
    items: [],
    onSubmit: actionsData.onSubmit,
    ...args,
  },
  template: `
    <form [formGroup]="formObj" (ngSubmit)="onSubmit(formObj.controls.formItems.value)">
            <bit-access-selector
              formControlName="formItems"
              [items]="items"
              [columnHeader]="columnHeader"
              [selectorLabelText]="selectorLabelText"
              [selectorHelpText]="selectorHelpText"
              [emptySelectionText]="emptySelectionText"
              [permissionMode]="permissionMode"
              [showMemberRoles]="showMemberRoles"
            ></bit-access-selector>
            <button type="submit" bitButton buttonType="primary" class="tw-mt-5">Submit</button>
    </form>
`,
});

export const ReactiveForm = ReactiveFormAccessSelectorTemplate.bind({});
ReactiveForm.args = {
  formObj: fb.group({ formItems: [[{ id: "1g" }]] }),
  permissionMode: "edit",
  showMemberRoles: false,
  columnHeader: "Groups/Members",
  selectorLabelText: "Select groups and members",
  selectorHelpText:
    "Permissions set for a member will replace permissions set by that member's group",
  emptySelectionText: "No members or groups added",
  items: sampleGroups.concat(sampleMembers),
};
