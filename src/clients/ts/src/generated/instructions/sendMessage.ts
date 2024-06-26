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
  bytes,
  mapSerializer,
  struct,
  u32,
  u64,
  u8,
} from '@metaplex-foundation/umi/serializers';
import {
  ResolvedAccount,
  ResolvedAccountsWithIndices,
  getAccountMetasAndSigners,
} from '../shared';

// Accounts.
export type SendMessageInstructionAccounts = {
  group: PublicKey | Pda;
  signer: Signer;
  systemProgram?: PublicKey | Pda;
};

// Data.
export type SendMessageInstructionData = {
  discriminator: Array<number>;
  groupId: bigint;
  encryptedMessage: Uint8Array;
  iv: Array<number>;
};

export type SendMessageInstructionDataArgs = {
  groupId: number | bigint;
  encryptedMessage: Uint8Array;
  iv: Array<number>;
};

export function getSendMessageInstructionDataSerializer(): Serializer<
  SendMessageInstructionDataArgs,
  SendMessageInstructionData
> {
  return mapSerializer<
    SendMessageInstructionDataArgs,
    any,
    SendMessageInstructionData
  >(
    struct<SendMessageInstructionData>(
      [
        ['discriminator', array(u8(), { size: 8 })],
        ['groupId', u64()],
        ['encryptedMessage', bytes({ size: u32() })],
        ['iv', array(u8(), { size: 16 })],
      ],
      { description: 'SendMessageInstructionData' }
    ),
    (value) => ({ ...value, discriminator: [57, 40, 34, 178, 189, 10, 65, 26] })
  ) as Serializer<SendMessageInstructionDataArgs, SendMessageInstructionData>;
}

// Args.
export type SendMessageInstructionArgs = SendMessageInstructionDataArgs;

// Instruction.
export function sendMessage(
  context: Pick<Context, 'programs'>,
  input: SendMessageInstructionAccounts & SendMessageInstructionArgs
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
    signer: {
      index: 1,
      isWritable: true as boolean,
      value: input.signer ?? null,
    },
    systemProgram: {
      index: 2,
      isWritable: false as boolean,
      value: input.systemProgram ?? null,
    },
  } satisfies ResolvedAccountsWithIndices;

  // Arguments.
  const resolvedArgs: SendMessageInstructionArgs = { ...input };

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
  const data = getSendMessageInstructionDataSerializer().serialize(
    resolvedArgs as SendMessageInstructionDataArgs
  );

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
