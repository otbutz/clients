import { importProvidersFrom } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { applicationConfig, Meta, moduleMetadata, Story } from "@storybook/angular";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import {
  OrganizationUserStatusType,
  OrganizationUserType,
} from "@bitwarden/common/admin-console/enums";
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

import { PreloadedEnglishI18nModule } from "../../../../../core/tests";

import { AccessSelectorComponent } from "./access-selector.component";
import { AccessItemType, CollectionPermission } from "./access-selector.models";
import { itemsFactory, actionsData } from "./storybook-helpers";
import { UserTypePipe } from "./user-type.pipe";

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

const StandaloneAccessSelectorTemplate: Story<AccessSelectorComponent> = (
  args: AccessSelectorComponent,
) => ({
  props: {
    items: [],
    valueChanged: actionsData.onValueChanged,
    initialValue: [],
    ...args,
  },
  template: `
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
`,
});

const memberCollectionAccessItems = itemsFactory(3, AccessItemType.Collection).concat([
  {
    id: "c1-group1",
    type: AccessItemType.Collection,
    labelName: "Collection 1",
    listName: "Collection 1",
    viaGroupName: "Group 1",
    readonlyPermission: CollectionPermission.View,
    readonly: true,
  },
  {
    id: "c1-group2",
    type: AccessItemType.Collection,
    labelName: "Collection 1",
    listName: "Collection 1",
    viaGroupName: "Group 2",
    readonlyPermission: CollectionPermission.ViewExceptPass,
    readonly: true,
  },
]);

export const MemberCollectionAccess = StandaloneAccessSelectorTemplate.bind({});
MemberCollectionAccess.args = {
  permissionMode: "edit",
  showMemberRoles: false,
  showGroupColumn: true,
  columnHeader: "Collection",
  selectorLabelText: "Select Collections",
  selectorHelpText: "Some helper text describing what this does",
  emptySelectionText: "No collections added",
  disabled: false,
  initialValue: [],
  items: memberCollectionAccessItems,
};
MemberCollectionAccess.story = {
  parameters: {
    docs: {
      storyDescription: `
        Example of an access selector for modifying the collections a member has access to.
        Includes examples of a readonly group and member that cannot be edited.
      `,
    },
  },
};

export const MemberGroupAccess = StandaloneAccessSelectorTemplate.bind({});
MemberGroupAccess.args = {
  permissionMode: "readonly",
  showMemberRoles: false,
  columnHeader: "Groups",
  selectorLabelText: "Select Groups",
  selectorHelpText: "Some helper text describing what this does",
  emptySelectionText: "No groups added",
  disabled: false,
  initialValue: [{ id: "3g" }, { id: "0g" }],
  items: itemsFactory(4, AccessItemType.Group).concat([
    {
      id: "admin",
      type: AccessItemType.Group,
      listName: "Admin Group",
      labelName: "Admin Group",
    },
  ]),
};
MemberGroupAccess.story = {
  parameters: {
    docs: {
      storyDescription: `
        Example of an access selector for selecting which groups an individual member belongs too.
      `,
    },
  },
};

export const GroupMembersAccess = StandaloneAccessSelectorTemplate.bind({});
GroupMembersAccess.args = {
  permissionMode: "hidden",
  showMemberRoles: true,
  columnHeader: "Members",
  selectorLabelText: "Select Members",
  selectorHelpText: "Some helper text describing what this does",
  emptySelectionText: "No members added",
  disabled: false,
  initialValue: [{ id: "2m" }, { id: "0m" }],
  items: sampleMembers,
};
GroupMembersAccess.story = {
  parameters: {
    docs: {
      storyDescription: `
        Example of an access selector for selecting which members belong to an specific group.
      `,
    },
  },
};

export const CollectionAccess = StandaloneAccessSelectorTemplate.bind({});
CollectionAccess.args = {
  permissionMode: "edit",
  showMemberRoles: false,
  columnHeader: "Groups/Members",
  selectorLabelText: "Select groups and members",
  selectorHelpText:
    "Permissions set for a member will replace permissions set by that member's group",
  emptySelectionText: "No members or groups added",
  disabled: false,
  initialValue: [
    { id: "3g", permission: CollectionPermission.EditExceptPass },
    { id: "0m", permission: CollectionPermission.View },
  ],
  items: sampleGroups.concat(sampleMembers).concat([
    {
      id: "admin-group",
      type: AccessItemType.Group,
      listName: "Admin Group",
      labelName: "Admin Group",
      readonly: true,
    },
    {
      id: "admin-member",
      type: AccessItemType.Member,
      listName: "Admin Member (admin@email.com)",
      labelName: "Admin Member",
      status: OrganizationUserStatusType.Confirmed,
      role: OrganizationUserType.Admin,
      email: "admin@email.com",
      readonly: true,
    },
  ]),
};
GroupMembersAccess.story = {
  parameters: {
    docs: {
      storyDescription: `
        Example of an access selector for selecting which members/groups have access to a specific collection.
      `,
    },
  },
};
