/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import {
  Account,
  Context,
  Pda,
  PublicKey,
  RpcAccount,
  RpcGetAccountOptions,
  RpcGetAccountsOptions,
  assertAccountExists,
  deserializeAccount,
  gpaBuilder,
  publicKey as toPublicKey,
} from '@metaplex-foundation/umi';
import {
  Serializer,
  array,
  bool,
  mapSerializer,
  publicKey as publicKeySerializer,
  string,
  struct,
  u64,
  u8,
} from '@metaplex-foundation/umi/serializers';
import {
  Message,
  MessageArgs,
  UserPermissions,
  UserPermissionsArgs,
  getMessageSerializer,
  getUserPermissionsSerializer,
} from '../types';

export type Group = Account<GroupAccountData>;

export type GroupAccountData = {
  discriminator: Array<number>;
  owner: PublicKey;
  isDm: boolean;
  groupName: string;
  groupId: bigint;
  members: Array<PublicKey>;
  messageIdCounter: bigint;
  defaultPermissions: UserPermissions;
  userPermissions: Array<UserPermissions>;
  encryptedUserKeys: Array<Array<Array<number>>>;
  messages: Array<Message>;
};

export type GroupAccountDataArgs = {
  owner: PublicKey;
  isDm: boolean;
  groupName: string;
  groupId: number | bigint;
  members: Array<PublicKey>;
  messageIdCounter: number | bigint;
  defaultPermissions: UserPermissionsArgs;
  userPermissions: Array<UserPermissionsArgs>;
  encryptedUserKeys: Array<Array<Array<number>>>;
  messages: Array<MessageArgs>;
};

export function getGroupAccountDataSerializer(): Serializer<
  GroupAccountDataArgs,
  GroupAccountData
> {
  return mapSerializer<GroupAccountDataArgs, any, GroupAccountData>(
    struct<GroupAccountData>(
      [
        ['discriminator', array(u8(), { size: 8 })],
        ['owner', publicKeySerializer()],
        ['isDm', bool()],
        ['groupName', string()],
        ['groupId', u64()],
        ['members', array(publicKeySerializer())],
        ['messageIdCounter', u64()],
        ['defaultPermissions', getUserPermissionsSerializer()],
        ['userPermissions', array(getUserPermissionsSerializer())],
        ['encryptedUserKeys', array(array(array(u8(), { size: 128 })))],
        ['messages', array(getMessageSerializer())],
      ],
      { description: 'GroupAccountData' }
    ),
    (value) => ({
      ...value,
      discriminator: [209, 249, 208, 63, 182, 89, 186, 254],
    })
  ) as Serializer<GroupAccountDataArgs, GroupAccountData>;
}

export function deserializeGroup(rawAccount: RpcAccount): Group {
  return deserializeAccount(rawAccount, getGroupAccountDataSerializer());
}

export async function fetchGroup(
  context: Pick<Context, 'rpc'>,
  publicKey: PublicKey | Pda,
  options?: RpcGetAccountOptions
): Promise<Group> {
  const maybeAccount = await context.rpc.getAccount(
    toPublicKey(publicKey, false),
    options
  );
  assertAccountExists(maybeAccount, 'Group');
  return deserializeGroup(maybeAccount);
}

export async function safeFetchGroup(
  context: Pick<Context, 'rpc'>,
  publicKey: PublicKey | Pda,
  options?: RpcGetAccountOptions
): Promise<Group | null> {
  const maybeAccount = await context.rpc.getAccount(
    toPublicKey(publicKey, false),
    options
  );
  return maybeAccount.exists ? deserializeGroup(maybeAccount) : null;
}

export async function fetchAllGroup(
  context: Pick<Context, 'rpc'>,
  publicKeys: Array<PublicKey | Pda>,
  options?: RpcGetAccountsOptions
): Promise<Group[]> {
  const maybeAccounts = await context.rpc.getAccounts(
    publicKeys.map((key) => toPublicKey(key, false)),
    options
  );
  return maybeAccounts.map((maybeAccount) => {
    assertAccountExists(maybeAccount, 'Group');
    return deserializeGroup(maybeAccount);
  });
}

export async function safeFetchAllGroup(
  context: Pick<Context, 'rpc'>,
  publicKeys: Array<PublicKey | Pda>,
  options?: RpcGetAccountsOptions
): Promise<Group[]> {
  const maybeAccounts = await context.rpc.getAccounts(
    publicKeys.map((key) => toPublicKey(key, false)),
    options
  );
  return maybeAccounts
    .filter((maybeAccount) => maybeAccount.exists)
    .map((maybeAccount) => deserializeGroup(maybeAccount as RpcAccount));
}

export function getGroupGpaBuilder(context: Pick<Context, 'rpc' | 'programs'>) {
  const programId = context.programs.getPublicKey(
    'solchat',
    '9dBYNp2M6waWyDhpXptBAALAEuV5MHCZUUB9eTpufbbS'
  );
  return gpaBuilder(context, programId)
    .registerFields<{
      discriminator: Array<number>;
      owner: PublicKey;
      isDm: boolean;
      groupName: string;
      groupId: number | bigint;
      members: Array<PublicKey>;
      messageIdCounter: number | bigint;
      defaultPermissions: UserPermissionsArgs;
      userPermissions: Array<UserPermissionsArgs>;
      encryptedUserKeys: Array<Array<Array<number>>>;
      messages: Array<MessageArgs>;
    }>({
      discriminator: [0, array(u8(), { size: 8 })],
      owner: [8, publicKeySerializer()],
      isDm: [40, bool()],
      groupName: [41, string()],
      groupId: [null, u64()],
      members: [null, array(publicKeySerializer())],
      messageIdCounter: [null, u64()],
      defaultPermissions: [null, getUserPermissionsSerializer()],
      userPermissions: [null, array(getUserPermissionsSerializer())],
      encryptedUserKeys: [null, array(array(array(u8(), { size: 128 })))],
      messages: [null, array(getMessageSerializer())],
    })
    .deserializeUsing<Group>((account) => deserializeGroup(account))
    .whereField('discriminator', [209, 249, 208, 63, 182, 89, 186, 254]);
}
