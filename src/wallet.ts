// ── Local Wallet Management ──
// Generates or loads a Solana ed25519 keypair, stored at ~/.fantopy/wallet.json

import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import nacl from "tweetnacl";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import type { StoredWallet } from "./types.js";

const FANTOPY_DIR = path.join(os.homedir(), ".fantopy");
const WALLET_PATH = path.join(FANTOPY_DIR, "wallet.json");

function ensureDir(): void {
  if (!fs.existsSync(FANTOPY_DIR)) {
    fs.mkdirSync(FANTOPY_DIR, { recursive: true, mode: 0o700 });
  }
}

/** Load existing wallet or generate a new one */
export function loadOrCreateWallet(): { keypair: Keypair; isNew: boolean } {
  ensureDir();

  if (fs.existsSync(WALLET_PATH)) {
    const data = JSON.parse(fs.readFileSync(WALLET_PATH, "utf-8")) as StoredWallet;
    const secretBytes = bs58.decode(data.secretKey);
    const keypair = Keypair.fromSecretKey(secretBytes);
    return { keypair, isNew: false };
  }

  const keypair = Keypair.generate();
  const wallet: StoredWallet = {
    publicKey: keypair.publicKey.toBase58(),
    secretKey: bs58.encode(Buffer.from(keypair.secretKey)),
    createdAt: new Date().toISOString(),
  };

  fs.writeFileSync(WALLET_PATH, JSON.stringify(wallet, null, 2), { mode: 0o600 });
  return { keypair, isNew: true };
}

/** Sign a message string with the keypair, return base58-encoded signature */
export function signMessage(message: string, keypair: Keypair): string {
  const messageBytes = new TextEncoder().encode(message);
  const signature = nacl.sign.detached(messageBytes, keypair.secretKey);
  return bs58.encode(Buffer.from(signature));
}

/** Get wallet address (public key in base58) */
export function getWalletAddress(keypair: Keypair): string {
  return keypair.publicKey.toBase58();
}
