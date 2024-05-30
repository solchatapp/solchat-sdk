import { none, PublicKey, Signer, some } from "@metaplex-foundation/umi";
import crypto from "crypto";
import forge from "node-forge";
import { Group } from "./clients/ts/src/generated";

export function encryptWithAES(
  text: crypto.BinaryLike,
  key: crypto.BinaryLike,
  iv: crypto.BinaryLike
) {
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted;
}

export function generateRsaKeypairFromSeed(userInput: Uint8Array) {
  const md = forge.md.sha256.create();
  md.update(Buffer.from(userInput).toString("hex"));
  const seed = md.digest().toHex();

  const prng = forge.random.createInstance();
  prng.seedFileSync = () => seed;

  // Deterministic key generation
  const keypair = forge.pki.rsa.generateKeyPair({
    bits: 1024,
    prng,
  });

  return {
    rsaPublicKey: crypto
      .createPublicKey(forge.pki.publicKeyToPem(keypair.publicKey))
      .export({ type: "spki", format: "pem" })
      .toString("utf8"),
    rsaPrivateKey: crypto
      .createPrivateKey(forge.pki.privateKeyToPem(keypair.privateKey))
      .export({ type: "pkcs8", format: "pem" })
      .toString("utf8"),
  };
}

export function decryptWithAES(
  encryptedText: NodeJS.ArrayBufferView,
  key: ArrayBuffer | SharedArrayBuffer,
  iv: ArrayBuffer | SharedArrayBuffer
) {
  try {
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(key),
      Buffer.from(iv)
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return some(decrypted.toString());
  } catch (error) {
    return none();
  }
}

export async function getUserRsaKeypair(signer: Signer) {
  const message = new TextEncoder().encode("Hello, World!");

  const signature = await signer.signMessage(message);

  return generateRsaKeypairFromSeed(signature);
}

export const stripPrefixAndSuffix = (key: string) => {
  // Assuming the key is PEM formatted (e.g., -----BEGIN PUBLIC KEY----- ... -----END PUBLIC KEY-----)
  const lines = key.split("\n");
  // Remove the first and last lines (prefix and suffix)
  return lines.slice(1, -2).join("");
};

export const addPrivateKeyPrefixAndSuffix = (key: string) => {
  return `
-----BEGIN PRIVATE KEY-----
${key}
-----END PRIVATE KEY-----
`;
};

export const addPublicKeyPrefixAndSuffix = (key: string) => {
  return `
-----BEGIN PUBLIC KEY-----
${key}
-----END PUBLIC KEY-----
`;
};

export function generateRandomU64() {
  // Generate 8 random bytes
  const buffer = crypto.randomBytes(8);

  return buffer;
}

export function getGroupVersion(group: Group) {
  return group.encryptedUserKeys.length - 1;
}

export function getMemberIndex(publicKey: PublicKey, group: Group) {
  return group.members.findIndex((member) => member === publicKey);
}
