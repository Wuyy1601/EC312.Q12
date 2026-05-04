import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const privateKeyPath = path.join(__dirname, "../keys/private_key.pem");
const publicKeyPath = path.join(__dirname, "../keys/public_key.pem");

let privateKey, publicKey;
try {
  privateKey = fs.readFileSync(privateKeyPath, "utf8");
  publicKey = fs.readFileSync(publicKeyPath, "utf8");
} catch (error) {
  console.error("Failed to load RSA keys. Please run 'node src/shared/keys/generateKeys.js' first.");
  process.exit(1);
}

export const generateToken = (payload, expiresIn = "7d") => {
  // Sign using RS256 and the private key
  return jwt.sign(payload, privateKey, { algorithm: "RS256", expiresIn });
};

export const verifyToken = (token) => {
  try {
    // VULNERABLE: We explicitly allow both RS256 and HS256 to simulate an older, vulnerable JWT library.
    // This allows the attacker to switch the alg to HS256, and the library will use publicKey as the HMAC secret.
    // return jwt.verify(token, publicKey, { algorithms: ["RS256", "HS256"] });
    return jwt.verify(token, publicKey, { algorithms: ["RS256"] });
  } catch (error) {
    return null;
  }
};

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

export default { generateToken, verifyToken, hashPassword, comparePassword };
