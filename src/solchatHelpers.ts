import {
  createSignerFromKeypair,
  keypairIdentity,
  PublicKey,
  publicKeyBytes,
  Signer,
  sol,
  Umi,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  addUserToGroup,
  createGroup,
  fetchAllUser,
  fetchGroup,
  fetchUser,
  initializeUser,
  sendMessage,
  SOLCHAT_PROGRAM_ID,
  upgradeGroupVersion,
} from "./clients/ts/src/generated";
import {
  addPublicKeyPrefixAndSuffix,
  decryptWithAES,
  encryptWithAES,
  generateRandomU64,
  generateRsaKeypairFromSeed,
  getGroupVersion,
  getMemberIndex,
  getUserRsaKeypair,
  stripPrefixAndSuffix,
} from "./utils";
import crypto from "crypto";
import { base58 } from "@metaplex-foundation/umi/serializers";
import type { Option } from "@metaplex-foundation/umi";

export const getGroupPda = (umi: Umi, groupId: Buffer) => {
  return umi.eddsa.findPda(SOLCHAT_PROGRAM_ID, [
    Buffer.from("group", "utf8"),
    groupId,
  ]);
};

export const getUserPda = (umi: Umi, publicKey: PublicKey) => {
  return umi.eddsa.findPda(SOLCHAT_PROGRAM_ID, [
    Buffer.from("user", "utf8"),
    publicKeyBytes(publicKey),
  ]);
};

export const fetchGroupById = async (umi: Umi, groupId: Buffer) => {
  return await fetchGroup(umi, getGroupPda(umi, groupId));
};

export const unwrapOr = <T>(option: Option<T>, defaultValue: T): T => {
  if (option.__option === "Some") {
    return option.value;
  }

  return defaultValue;
};

export const sendMessageToGroup = async (
  umi: Umi,
  groupId: Buffer,
  user: Signer,
  message: string
) => {
  const rsaKeypair = await getUserRsaKeypair(user);

  const groupInfo = await fetchGroupById(umi, groupId);

  const encryptedAesKey =
    groupInfo.encryptedUserKeys[getGroupVersion(groupInfo)][
      getMemberIndex(user.publicKey, groupInfo)
    ];

  const aesKey = crypto.privateDecrypt(
    {
      key: rsaKeypair.rsaPrivateKey,
    },
    Buffer.from(encryptedAesKey)
  );

  const iv = crypto.randomBytes(16);

  const encryptedMessage = encryptWithAES(Buffer.from(message), aesKey, iv);

  const sendMessageTxn = await sendMessage(umi, {
    groupId: groupId.readBigUInt64BE(),
    encryptedMessage: encryptedMessage,
    iv: [...iv],
    group: getGroupPda(umi, groupId),
    signer: user,
  }).sendAndConfirm(umi);

  console.log("Send Message", base58.deserialize(sendMessageTxn.signature));
};

export const fetchDecryptedMessages = async (
  umi: Umi,
  groupId: Buffer,
  user: Signer
) => {
  const groupInfo = await fetchGroupById(umi, groupId);

  const encryptedAesKey =
    groupInfo.encryptedUserKeys[getGroupVersion(groupInfo)][
      getMemberIndex(user.publicKey, groupInfo)
    ];

  const rsaKeypair = await getUserRsaKeypair(user);

  const aesKey = crypto.privateDecrypt(
    {
      key: rsaKeypair.rsaPrivateKey,
    },
    Buffer.from(encryptedAesKey)
  );

  const messages = groupInfo.messages.map((message) => {
    return {
      ...message,
      message: unwrapOr(
        decryptWithAES(
          Buffer.from(message.encryptedMessage),
          aesKey,
          Buffer.from(message.iv)
        ),
        "Failed to decrypt message"
      ),
    };
  });

  return messages;
};

export const createGroupWithUser = async (
  umi: Umi,
  signer: Signer,
  firstMember: PublicKey,
  isDm: boolean = false
) => {
  const groupId = generateRandomU64();
  const groupKey = crypto.randomBytes(32);

  const users = [signer.publicKey, firstMember];

  const usersPdas = users.map((user) => {
    return umi.eddsa.findPda(SOLCHAT_PROGRAM_ID, [
      new TextEncoder().encode("user"),
      publicKeyBytes(user),
    ]);
  });

  const userPdas = await fetchAllUser(umi, usersPdas);

  const encryptedUserKeys = userPdas.map((userPda) => {
    const rsaPublicKey = crypto.createPublicKey(
      addPublicKeyPrefixAndSuffix(
        Buffer.from(userPda.rsaPublicKey).toString("utf-8")
      )
    );

    return crypto.publicEncrypt(rsaPublicKey, groupKey);
  });

  const createGroupTxn = await createGroup(umi, {
    groupId: groupId.readBigUInt64BE(),
    groupName: "Test Group",
    isDm,
    owner: signer,
    encryptedUserKeys: encryptedUserKeys.map((key) => [...key]),
    members: users,
    group: getGroupPda(umi, groupId),
    user0: usersPdas[0],
    user1: usersPdas[1],
  }).sendAndConfirm(umi);

  console.log("Create Group", base58.deserialize(createGroupTxn.signature));

  return groupId;
};

export const addUser = async (
  umi: Umi,
  group: PublicKey,
  user: Signer,
  userToAdd: PublicKey
) => {
  const groupInfo = await fetchGroup(umi, group);

  const userToAddPda = getUserPda(umi, userToAdd)[0];

  const userToAddPdaInfo = await fetchUser(umi, userToAddPda);

  const rsaKeypair = await getUserRsaKeypair(user);

  const aesKey = crypto.privateDecrypt(
    {
      key: rsaKeypair.rsaPrivateKey,
    },
    Buffer.from(
      groupInfo.encryptedUserKeys[getGroupVersion(groupInfo)][
        getMemberIndex(user.publicKey, groupInfo)
      ]
    )
  );

  const rsaPublicKey = crypto.createPublicKey(
    addPublicKeyPrefixAndSuffix(
      Buffer.from(userToAddPdaInfo.rsaPublicKey).toString("utf-8")
    )
  );

  const encryptedAesKey = crypto.publicEncrypt(
    {
      key: rsaPublicKey,
    },
    aesKey
  );

  const addUserTxn = await addUserToGroup(umi, {
    groupId: groupInfo.groupId,
    user: userToAdd,
    encryptedUserKey: [...encryptedAesKey],
    group,
    signer: user,
    userAcc: getUserPda(umi, userToAdd),
  }).sendAndConfirm(umi);

  console.log("Add User", base58.deserialize(addUserTxn.signature));
};

export const upgradeGroupEncryption = async (
  umi: Umi,
  group: PublicKey,
  owner: Signer
) => {
  const newGroupKey = crypto.randomBytes(32);
  const groupInfo = await fetchGroup(umi, group);

  const users = groupInfo.members;

  const usersPdas = users.map((user) => {
    return umi.eddsa.findPda(SOLCHAT_PROGRAM_ID, [
      new TextEncoder().encode("user"),
      publicKeyBytes(user),
    ]);
  });

  const userPdas = await fetchAllUser(umi, usersPdas);

  const encryptedUserKeys = userPdas.map((userPda) => {
    const rsaPublicKey = crypto.createPublicKey(
      addPublicKeyPrefixAndSuffix(
        Buffer.from(userPda.rsaPublicKey).toString("utf-8")
      )
    );

    return crypto.publicEncrypt(rsaPublicKey, newGroupKey);
  });

  const upgradeGroupTxn = await upgradeGroupVersion(umi, {
    groupId: groupInfo.groupId,
    owner,
    encryptedUserKeys: encryptedUserKeys.map((key) => [...key]),
    group,
  }).sendAndConfirm(umi);

  console.log("Upgrade Group", base58.deserialize(upgradeGroupTxn.signature));
};
