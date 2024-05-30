/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import { Serializer, bool, struct } from '@metaplex-foundation/umi/serializers';

export type UserPermissions = {
  sendMessages: boolean;
  addUsers: boolean;
  removeUsers: boolean;
  changePermissions: boolean;
  changeName: boolean;
  deleteMessages: boolean;
};

export type UserPermissionsArgs = UserPermissions;

export function getUserPermissionsSerializer(): Serializer<
  UserPermissionsArgs,
  UserPermissions
> {
  return struct<UserPermissions>(
    [
      ['sendMessages', bool()],
      ['addUsers', bool()],
      ['removeUsers', bool()],
      ['changePermissions', bool()],
      ['changeName', bool()],
      ['deleteMessages', bool()],
    ],
    { description: 'UserPermissions' }
  ) as Serializer<UserPermissionsArgs, UserPermissions>;
}
