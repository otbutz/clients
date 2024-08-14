import { EncString } from "@bitwarden/common/platform/models/domain/enc-string";

export type MemberAccessDetails = {
  collectionId: string;
  groupId: string;
  groupName: string;
  collectionName: EncString;
  itemCount: number;
  readOnly: boolean;
  hidePasswords: boolean;
  manage: boolean;
};
