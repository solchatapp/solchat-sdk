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
  acceptChat,
  addUserToGroup,
  createGroup,
  fetchAllGroup,
  fetchAllUser,
  fetchGroup,
  fetchUser,
  initializeUser,
  leaveChat,
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
import {
  addUser,
  createGroupWithUser,
  fetchDecryptedMessages,
  getGroupPda,
  getUserPda,
  sendMessageToGroup,
  upgradeGroupEncryption,
} from "./solchatHelpers";

const umi = createUmi("http://localhost:8899", {
  commitment: "processed",
});
umi.use(keypairIdentity(umi.eddsa.generateKeypair(), true));

(async () => {
  await umi.rpc.airdrop(umi.identity.publicKey, sol(1));
  const users = [
    umi.eddsa.generateKeypair(),
    umi.eddsa.generateKeypair(),
    umi.eddsa.generateKeypair(),
  ];

  for (const user of users) {
    const signer = createSignerFromKeypair(umi, user);

    await umi.rpc.airdrop(user.publicKey, sol(1));

    const keypair = await getUserRsaKeypair(signer);

    const txn = await initializeUser(umi, {
      username: `user-${user.publicKey.slice(0, 5)}`,
      rsaPublicKey: [
        ...Buffer.from(stripPrefixAndSuffix(keypair.rsaPublicKey)),
      ],
      owner: signer,
      user: getUserPda(umi, user.publicKey),
    }).sendAndConfirm(umi);

    console.log("Create User", base58.deserialize(txn.signature));
  }

  // Send a message from user1

  const groupId = await createGroupWithUser(
    umi,
    createSignerFromKeypair(umi, users[0]),
    users[1].publicKey,
    false // Just change this to true for DMs, makes it so you can't add or kick people
  );

  await acceptChat(umi, {
    //Only used for UI
    group: getGroupPda(umi, groupId)[0],
    signer: createSignerFromKeypair(umi, users[1]),
    userAcc: getUserPda(umi, users[1].publicKey),
  }).sendAndConfirm(umi);

  await sendMessageToGroup(
    umi,
    groupId,
    createSignerFromKeypair(umi, users[0]),
    "Hello, World!"
  );

  // Fetch decrypted messages from user2
  console.log(
    (
      await fetchDecryptedMessages(
        umi,
        groupId,
        createSignerFromKeypair(umi, users[1])
      )
    ).map((message) => message.message)
  );

  // Skip this cause it's not required for beta
  /*
  console.log("Upgrade group encryption");

  await upgradeGroupEncryption(
    // Not required and doesn't work for groups above like 6 people, this is only used to make previous messages unreadable by new members
    umi,
    getGroupPda(umi, groupId)[0],
    createSignerFromKeypair(umi, users[0])
  );
  */

  // Add user3 to the group
  console.log("Add user3 to the group");

  await addUser(
    umi,
    getGroupPda(umi, groupId)[0],
    createSignerFromKeypair(umi, users[0]),
    users[2].publicKey
  );

  await acceptChat(umi, {
    group: getGroupPda(umi, groupId)[0],
    signer: createSignerFromKeypair(umi, users[2]),
    userAcc: getUserPda(umi, users[2].publicKey),
  }).sendAndConfirm(umi);

  // User 2 sends a message

  await sendMessageToGroup(
    umi,
    groupId,
    createSignerFromKeypair(umi, users[1]),
    "Hello, User 3!"
  );

  console.log("Fetch all groups from user3");

  const user3 = await fetchUser(umi, getUserPda(umi, users[2].publicKey));

  const groups = await fetchAllGroup(umi, user3.acceptedChats);

  console.log(groups);

  console.log("Fetch decrypted messages from user3");
  // Fetch decrypted messages from user3

  const groupId1 = Buffer.alloc(8); // 8 bytes for u64
  groupId1.writeBigUInt64BE(groups[0].groupId);

  console.log(
    (
      await fetchDecryptedMessages(
        umi,
        groupId1,
        createSignerFromKeypair(umi, users[2])
      )
    ).map((message) => message.message)
  );

  await leaveChat(umi, {
    // UI only, leave with user 2, doesn't actually do anything except modify the accepted chats array
    group: getGroupPda(umi, groupId)[0],
    signer: createSignerFromKeypair(umi, users[1]),
    userAcc: getUserPda(umi, users[1].publicKey),
  }).sendAndConfirm(umi);
})();
