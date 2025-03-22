import express from "express";
import { SolanaService} from "./SolanaService";

const app = express();
app.use(express.json());

app.post("/auth/verify", async (req, res) => {
  const { signature, message, walletAddress } = req.body;

  if (!signature || !message || !walletAddress) {
    return res.status(400).json({ success: false, error: "Missing parameters" });
  }

  const isValid = await SolanaService.verifySignature(signature, message, walletAddress);
  if (isValid) {
    return res.json({ success: true });
  } else {
    return res.status(401).json({ success: false, error: "Invalid signature" });
  }
});


