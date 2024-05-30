/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import {
  ClusterFilter,
  Context,
  Program,
  PublicKey,
} from '@metaplex-foundation/umi';
import { getSolchatErrorFromCode, getSolchatErrorFromName } from '../errors';

export const SOLCHAT_PROGRAM_ID =
  '9dBYNp2M6waWyDhpXptBAALAEuV5MHCZUUB9eTpufbbS' as PublicKey<'9dBYNp2M6waWyDhpXptBAALAEuV5MHCZUUB9eTpufbbS'>;

export function createSolchatProgram(): Program {
  return {
    name: 'solchat',
    publicKey: SOLCHAT_PROGRAM_ID,
    getErrorFromCode(code: number, cause?: Error) {
      return getSolchatErrorFromCode(code, this, cause);
    },
    getErrorFromName(name: string, cause?: Error) {
      return getSolchatErrorFromName(name, this, cause);
    },
    isOnCluster() {
      return true;
    },
  };
}

export function getSolchatProgram<T extends Program = Program>(
  context: Pick<Context, 'programs'>,
  clusterFilter?: ClusterFilter
): T {
  return context.programs.get<T>('solchat', clusterFilter);
}

export function getSolchatProgramId(
  context: Pick<Context, 'programs'>,
  clusterFilter?: ClusterFilter
): PublicKey {
  return context.programs.getPublicKey(
    'solchat',
    SOLCHAT_PROGRAM_ID,
    clusterFilter
  );
}