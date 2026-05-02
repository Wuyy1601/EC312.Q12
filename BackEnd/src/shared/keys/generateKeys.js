/**
 * ===================================================================
 * RSA Key Pair Generator for JWT RS256 Signing
 * ===================================================================
 * 
 * Run this script ONCE to generate the static RSA keypair:
 *   node src/shared/keys/generateKeys.js
 * 
 * The keys will be saved to:
 *   - src/shared/keys/private_key.pem  (RSA private key — KEEP SECRET)
 *   - src/shared/keys/public_key.pem   (RSA public key — used for verification)
 * 
 * IMPORTANT: These keys must remain consistent across server restarts
 * so that existing tokens remain valid and offline analysis works.
 * Do NOT regenerate unless you want to invalidate all existing tokens.
 * ===================================================================
 */

import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const privateKeyPath = path.join(__dirname, "private_key.pem");
const publicKeyPath = path.join(__dirname, "public_key.pem");

// Check if keys already exist
if (fs.existsSync(privateKeyPath) && fs.existsSync(publicKeyPath)) {
  console.log("⚠️  Keys already exist. Delete them first if you want to regenerate.");
  console.log(`   Private: ${privateKeyPath}`);
  console.log(`   Public:  ${publicKeyPath}`);
  process.exit(0);
}

// Generate 2048-bit RSA keypair
console.log("🔑 Generating 2048-bit RSA keypair...");

const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: "spki",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem",
  },
});

fs.writeFileSync(privateKeyPath, privateKey);
fs.writeFileSync(publicKeyPath, publicKey);

console.log("✅ RSA keypair generated successfully!");
console.log(`   Private key: ${privateKeyPath}`);
console.log(`   Public key:  ${publicKeyPath}`);
console.log("\n⚠️  NEVER expose the private key. Add keys/ to .gitignore in production.");
