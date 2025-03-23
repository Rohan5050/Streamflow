import express from "express";
import bs58 from "bs58";
import { PublicKey } from "@solana/web3.js";
import * as nacl from "tweetnacl";

const router = express.Router();

router.post("/verify", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Expose-Headers", "Authorization");
  try {
    const { signature, message, walletAddress } = req.body;

    if (!signature || !message || !walletAddress) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const publicKey = new PublicKey(walletAddress);
    const encodedMessage = new TextEncoder().encode(message);
    const decodedSignature = bs58.decode(signature);
    const isValid = nacl.sign.detached.verify(encodedMessage, decodedSignature, publicKey.toBytes());

    if (isValid) {
      // Generate a simple auth token (Replace this with JWT or session handling)
      const authToken = Buffer.from(walletAddress).toString("base64");

      res.setHeader("Authorization", authToken);
      return res.status(200).json({ success: true, message: "Signature verified!", token: authToken });
    } else {
      return res.status(401).json({ success: false, error: "Signature verification failed" });
    }
  } catch (error) {
    console.error("Error verifying signature:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
