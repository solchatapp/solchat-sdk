/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import {
  Context,
  Pda,
  PublicKey,
  Signer,
  TransactionBuilder,
  transactionBuilder,
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
  ResolvedAccount,
  ResolvedAccountsWithIndices,
  getAccountMetasAndSigners,
} from '../shared';

// Accounts.
export type CreateGroupInstructionAccounts = {
  group: PublicKey | Pda;
  owner: Signer;
  user0: PublicKey | Pda;
  user1: PublicKey | Pda;
  systemProgram?: PublicKey | Pda;
};

// Data.
export type CreateGroupInstructionData = {
  discriminator: Array<number>;
  groupId: bigint;
  groupName: string;
  isDm: boolean;
  members: Array<PublicKey>;
  encryptedUserKeys: Array<Array<number>>;
};

export type CreateGroupInstructionDataArgs = {
  groupId: number | bigint;
  groupName: string;
  isDm: boolean;
  members: Array<PublicKey>;
  encryptedUserKeys: Array<Array<number>>;
};

export function getCreateGroupInstructionDataSerializer(): Serializer<
  CreateGroupInstructionDataArgs,
  CreateGroupInstructionData
> {
  return mapSerializer<
    CreateGroupInstructionDataArgs,
    any,
    CreateGroupInstructionData
  >(
    struct<CreateGroupInstructionData>(
      [
        ['discriminator', array(u8(), { size: 8 })],
        ['groupId', u64()],
        ['groupName', string()],
        ['isDm', bool()],
        ['members', array(publicKeySerializer())],
        ['encryptedUserKeys', array(array(u8(), { size: 128 }))],
      ],
      { description: 'CreateGroupInstructionData' }
    ),
    (value) => ({
      ...value,
      discriminator: [79, 60, 158, 134, 61, 199, 56, 248],
    })
  ) as Serializer<CreateGroupInstructionDataArgs, CreateGroupInstructionData>;
}

// Args.
export type CreateGroupInstructionArgs = CreateGroupInstructionDataArgs;

// Instruction.
export function createGroup(
  context: Pick<Context, 'programs'>,
  input: CreateGroupInstructionAccounts & CreateGroupInstructionArgs
): TransactionBuilder {
  // Program ID.
  const programId = context.programs.getPublicKey(
    'solchat',
    '9dBYNp2M6waWyDhpXptBAALAEuV5MHCZUUB9eTpufbbS'
  );

  // Accounts.
  const resolvedAccounts = {
    group: {
      index: 0,
      isWritable: true as boolean,
      value: input.group ?? null,
    },
    owner: {
      index: 1,
      isWritable: true as boolean,
      value: input.owner ?? null,
    },
    user0: {
      index: 2,
      isWritable: true as boolean,
      value: input.user0 ?? null,
    },
    user1: {
      index: 3,
      isWritable: true as boolean,
      value: input.user1 ?? null,
    },
    systemProgram: {
      index: 4,
      isWritable: false as boolean,
      value: input.systemProgram ?? null,
    },
  } satisfies ResolvedAccountsWithIndices;

  // Arguments.
  const resolvedArgs: CreateGroupInstructionArgs = { ...input };

  // Default values.
  if (!resolvedAccounts.systemProgram.value) {
    resolvedAccounts.systemProgram.value = context.programs.getPublicKey(
      'splSystem',
      '11111111111111111111111111111111'
    );
    resolvedAccounts.systemProgram.isWritable = false;
  }

  // Accounts in order.
  const orderedAccounts: ResolvedAccount[] = Object.values(
    resolvedAccounts
  ).sort((a, b) => a.index - b.index);

  // Keys and Signers.
  const [keys, signers] = getAccountMetasAndSigners(
    orderedAccounts,
    'programId',
    programId
  );

  // Data.
  const data = getCreateGroupInstructionDataSerializer().serialize(
    resolvedArgs as CreateGroupInstructionDataArgs
  );

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
